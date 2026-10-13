import { BrushRenderer } from "./brushRenderer";
import type { BrushSegment } from "./brush";
import vertex from "./shaders/fullscreen.vert.glsl?raw";
import fragment from "./shaders/fog.frag.glsl?raw";
export class FogSim {
  private textures: WebGLTexture[] = [];
  private buffers: WebGLFramebuffer[] = [];
  private program: WebGLProgram;
  private index = 0;
  private operations: { segments: BrushSegment[]; begin: boolean }[] = [];
  private last: { x: number; y: number } | null = null;
  private locations = new Map<string, WebGLUniformLocation | null>();
  private snapshotBuffer: WebGLFramebuffer;
  private brushes: BrushRenderer;
  private held = false;
  private history: WebGLTexture[] = [];
  private future: WebGLTexture[] = [];
  paused = false;
  density = 1;
  private strength = 0;
  private until = 0;
  private bloomAge = 0;
  readonly size = 512;
  private speed = Math.min(
    30,
    Math.max(
      0.1,
      Number(new URLSearchParams(location.search).get("speed")) || 1,
    ),
  );
  constructor(private gl: WebGL2RenderingContext) {
    if (!gl.getExtension("EXT_color_buffer_float"))
      throw new Error(
        "Floating-point glass textures are unavailable in this browser.",
      );
    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
        throw new Error(gl.getShaderInfoLog(shader) || "Fog shader failed");
      return shader;
    };
    const vs = compile(gl.VERTEX_SHADER, vertex),
      fs = compile(gl.FRAGMENT_SHADER, fragment);
    this.program = gl.createProgram()!;
    gl.attachShader(this.program, vs);
    gl.attachShader(this.program, fs);
    gl.linkProgram(this.program);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS))
      throw new Error("Fog shader linking failed");
    for (let i = 0; i < 2; i++) {
      const texture = gl.createTexture()!,
        buffer = gl.createFramebuffer()!;
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texStorage2D(gl.TEXTURE_2D, 1, gl.RGBA16F, this.size, this.size);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.bindFramebuffer(gl.FRAMEBUFFER, buffer);
      gl.framebufferTexture2D(
        gl.FRAMEBUFFER,
        gl.COLOR_ATTACHMENT0,
        gl.TEXTURE_2D,
        texture,
        0,
      );
      if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE)
        throw new Error("Fog framebuffer unavailable");
      this.textures.push(texture);
      this.buffers.push(buffer);
    }
    this.snapshotBuffer = gl.createFramebuffer()!;
    this.brushes = new BrushRenderer(gl, this.size);
    this.clear();
  }
  setTimeScale(value: number) {
    if (Number.isFinite(value)) this.speed = Math.max(0, Math.min(30, value));
  }
  get texture() {
    return this.textures[this.index];
  }
  injectBreath(strength: number, ms: number) {
    this.strength = Math.min(1, Math.max(0, strength));
    this.until = performance.now() + Math.max(0, ms);
  }
  setBreathing(value: boolean) {
    this.held = value;
  }
  finger(x: number, y: number, down: boolean, radius = 0.028, palm = false) {
    if (!down) {
      this.last = null;
      return;
    }
    const point = { x, y };
    this.operations.push({
      begin: !this.last,
      segments: [{ from: this.last || point, to: point, radius, palm }],
    });
    this.last = point;
  }
  wipe(segments: BrushSegment[], begin: boolean) {
    if (segments.length) this.operations.push({ segments, begin });
  }
  private drop(snapshots: WebGLTexture[]) {
    for (const texture of snapshots) this.gl.deleteTexture(texture);
    snapshots.length = 0;
  }
  private snapshot() {
    const gl = this.gl,
      texture = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texStorage2D(gl.TEXTURE_2D, 1, gl.RGBA16F, this.size, this.size);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.buffers[this.index]);
    gl.copyTexSubImage2D(gl.TEXTURE_2D, 0, 0, 0, 0, 0, this.size, this.size);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return texture;
  }
  update(dt: number, aspect: number) {
    const gl = this.gl;
    const breathing = this.held || performance.now() < this.until;
    if (!this.paused)
      this.bloomAge = breathing ? this.bloomAge + dt * this.speed : 0;
    const groups: { segments: BrushSegment[]; begin: boolean }[] = [];
    for (const operation of this.operations.splice(0)) {
      if (operation.begin || !groups.length)
        groups.push({ segments: [], begin: operation.begin });
      groups[groups.length - 1].segments.push(...operation.segments);
    }
    if (!groups.length) groups.push({ segments: [], begin: false });
    const steps = groups.length;
    const loc = (name: string) => {
      if (!this.locations.has(name))
        this.locations.set(name, gl.getUniformLocation(this.program, name));
      return this.locations.get(name)!;
    };
    for (const group of groups) {
      if (group.begin) {
        this.history.push(this.snapshot());
        if (this.history.length > 8) gl.deleteTexture(this.history.shift()!);
        this.drop(this.future);
      }
      {
        this.brushes.render(group.segments, aspect);
        const target = 1 - this.index;
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.buffers[target]);
        gl.viewport(0, 0, this.size, this.size);
        gl.useProgram(this.program);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.uniform1i(loc("previous"), 0);
        gl.uniform1f(
          loc("bloomRadius"),
          Math.min(1.5, 0.18 + this.bloomAge * 1.1),
        );
        gl.uniform1f(loc("dt"), this.paused ? 0 : (dt * this.speed) / steps);
        gl.uniform1f(
          loc("breath"),
          this.paused
            ? 0
            : this.held
              ? this.density
              : breathing
                ? this.strength * this.density
                : 0,
        );
        gl.uniform1f(loc("aspect"), aspect);
        gl.activeTexture(gl.TEXTURE3);
        gl.bindTexture(gl.TEXTURE_2D, this.brushes.texture);
        gl.uniform1i(loc("wipeMask"), 3);
        gl.bindVertexArray(null);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        this.index = target;
      }
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }
  private pixels() {
    const gl = this.gl,
      data = new Float32Array(this.size * this.size * 4);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.buffers[this.index]);
    gl.readPixels(0, 0, this.size, this.size, gl.RGBA, gl.FLOAT, data);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return data;
  }
  seedCoverage(value: number) {
    this.clear();
    const data = new Float32Array(this.size * this.size * 4);
    for (let i = 0; i < data.length; i += 4) {
      data[i] = data[i + 1] = Math.max(0, Math.min(1, value));
      data[i + 3] = 1;
    }
    this.restorePixels(data);
  }
  waterStats() {
    const data = this.pixels();
    let mass = 0,
      weightedY = 0;
    for (let i = 0; i < data.length; i += 4) {
      const water = data[i + 2];
      mass += water;
      weightedY += (water * (Math.floor(i / 4 / this.size) + 0.5)) / this.size;
    }
    return { mass, y: mass ? weightedY / mass : 0 };
  }
  coverage() {
    const data = this.pixels();
    let sum = 0;
    for (let i = 0; i < data.length; i += 4) sum += data[i];
    return sum / (this.size * this.size);
  }
  sample(x: number, y: number) {
    const data = this.pixels(),
      px = Math.max(0, Math.min(this.size - 1, Math.floor(x * this.size))),
      py = Math.max(
        0,
        Math.min(this.size - 1, Math.floor((1 - y) * this.size)),
      );
    return data[(py * this.size + px) * 4];
  }
  undo() {
    const snapshot = this.history.pop();
    if (!snapshot) return false;
    this.future.push(this.snapshot());
    this.restoreSnapshot(snapshot);
    this.gl.deleteTexture(snapshot);
    return true;
  }
  redo() {
    const snapshot = this.future.pop();
    if (!snapshot) return false;
    this.history.push(this.snapshot());
    this.restoreSnapshot(snapshot);
    this.gl.deleteTexture(snapshot);
    return true;
  }
  get canUndo() {
    return this.history.length > 0;
  }
  get canRedo() {
    return this.future.length > 0;
  }
  private restoreSnapshot(texture: WebGLTexture) {
    this.operations = [];
    this.last = null;
    const gl = this.gl;
    gl.bindFramebuffer(gl.READ_FRAMEBUFFER, this.snapshotBuffer);
    gl.framebufferTexture2D(
      gl.READ_FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      texture,
      0,
    );
    gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, this.buffers[this.index]);
    gl.blitFramebuffer(
      0,
      0,
      this.size,
      this.size,
      0,
      0,
      this.size,
      this.size,
      gl.COLOR_BUFFER_BIT,
      gl.NEAREST,
    );
    gl.framebufferTexture2D(
      gl.READ_FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      null,
      0,
    );
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }
  private restorePixels(data: Float32Array) {
    this.operations = [];
    this.last = null;
    const gl = this.gl;
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.texSubImage2D(
      gl.TEXTURE_2D,
      0,
      0,
      0,
      this.size,
      this.size,
      gl.RGBA,
      gl.FLOAT,
      data,
    );
  }
  clear() {
    const gl = this.gl;
    for (const buffer of this.buffers) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, buffer);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    this.last = null;
    this.drop(this.history);
    this.drop(this.future);
    this.operations = [];
    this.until = 0;
    this.held = false;
  }
  dispose() {
    this.brushes.dispose();
    this.drop(this.history);
    this.drop(this.future);
    this.gl.deleteFramebuffer(this.snapshotBuffer);
    for (const t of this.textures) this.gl.deleteTexture(t);
    for (const b of this.buffers) this.gl.deleteFramebuffer(b);
    this.gl.deleteProgram(this.program);
  }
}
