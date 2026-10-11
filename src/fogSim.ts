import vertex from "./shaders/fullscreen.vert.glsl?raw";
import fragment from "./shaders/fog.frag.glsl?raw";
export class FogSim {
  private textures: WebGLTexture[] = [];
  private buffers: WebGLFramebuffer[] = [];
  private program: WebGLProgram;
  private index = 0;
  private points: {
    x: number;
    y: number;
    down: boolean;
    radius: number;
    palm: boolean;
  }[] = [];
  private last: { x: number; y: number } | null = null;
  private held = false;
  private history: Float32Array[] = [];
  private future: Float32Array[] = [];
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
    this.points.push({
      x: Math.max(0, Math.min(1, x)),
      y: 1 - Math.max(0, Math.min(1, y)),
      down,
      radius,
      palm,
    });
  }
  update(dt: number, aspect: number) {
    const gl = this.gl;
    const breathing = this.held || performance.now() < this.until;
    if (!this.paused)
      this.bloomAge = breathing ? this.bloomAge + dt * this.speed : 0;
    const points = this.points.splice(0);
    const steps = Math.max(1, points.length);
    for (let i = 0; i < steps; i++) {
      const point = points[i];
      if (point?.down && !this.last) {
        this.history.push(this.pixels());
        if (this.history.length > 8) this.history.shift();
        this.future = [];
      }
      const start = this.last || point || { x: 0, y: 0 };
      const end = point || start;
      const target = 1 - this.index;
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.buffers[target]);
      gl.viewport(0, 0, this.size, this.size);
      gl.useProgram(this.program);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.texture);
      const loc = (name: string) => gl.getUniformLocation(this.program, name);
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
            : performance.now() < this.until
              ? this.strength * this.density
              : 0,
      );
      gl.uniform2f(loc("from"), start.x, start.y);
      gl.uniform2f(loc("to"), end.x, end.y);
      gl.uniform1f(loc("drawing"), point?.down ? 1 : 0);
      gl.uniform1f(loc("aspect"), aspect);
      gl.uniform1f(loc("radius"), point?.radius || 0.028);
      gl.uniform1f(loc("palm"), point?.palm ? 1 : 0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      this.index = target;
      if (point) this.last = point.down ? point : null;
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
    this.future.push(this.pixels());
    this.restore(snapshot);
    return true;
  }
  redo() {
    const snapshot = this.future.pop();
    if (!snapshot) return false;
    this.history.push(this.pixels());
    this.restore(snapshot);
    return true;
  }
  get canUndo() {
    return this.history.length > 0;
  }
  get canRedo() {
    return this.future.length > 0;
  }
  private restore(data: Float32Array) {
    this.points = [];
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
    this.history = [];
    this.future = [];
    this.points = [];
    this.until = 0;
    this.held = false;
  }
  dispose() {
    for (const t of this.textures) this.gl.deleteTexture(t);
    for (const b of this.buffers) this.gl.deleteFramebuffer(b);
    this.gl.deleteProgram(this.program);
  }
}
