import vertex from "./shaders/fullscreen.vert.glsl?raw";
import fragment from "./shaders/composite.frag.glsl?raw";
import { FogSim } from "./fogSim";
export class Renderer {
  readonly fog: FogSim;
  readonly gl: WebGL2RenderingContext;
  private program: WebGLProgram;
  private texture: WebGLTexture;
  private vao: WebGLVertexArrayObject;
  private revealTexture: WebGLTexture;
  reveal = false;
  private locations = new Map<string, WebGLUniformLocation>();
  private frame = 0;
  private previous = 0;
  private cameraMix = 0;
  frames = 0;
  uploads = 0;
  fps = 60;
  quality = 1;
  frameMs = 16.67;
  private qualitySince = 0;
  private lastVideoTime = -1;
  constructor(
    readonly canvas: HTMLCanvasElement,
    private video: HTMLVideoElement,
    private seed = 1,
  ) {
    const gl = canvas.getContext("webgl2", {
      alpha: false,
      antialias: false,
      preserveDrawingBuffer: true,
    });
    if (!gl)
      throw new Error(
        "WebGL2 is unavailable. Try a recent browser with hardware acceleration.",
      );
    this.gl = gl;
    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
        throw new Error(
          gl.getShaderInfoLog(shader) || "Shader compilation failed",
        );
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
      throw new Error("Could not link mirror shader");
    this.vao = gl.createVertexArray()!;
    gl.bindVertexArray(this.vao);
    this.texture = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      1,
      1,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      new Uint8Array([0, 0, 0, 255]),
    );
    this.revealTexture = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, this.revealTexture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      1,
      1,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      new Uint8Array([0, 0, 0, 255]),
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    for (const name of [
      "camera",
      "resolution",
      "videoSize",
      "cameraMix",
      "time",
      "seed",
      "fogMask",
      "revealImage",
      "revealMode",
    ])
      this.locations.set(name, gl.getUniformLocation(this.program, name)!);
    this.fog = new FogSim(gl);
    this.frame = requestAnimationFrame(this.render);
  }
  private render = (now: number) => {
    const gl = this.gl;
    const dt = this.previous
      ? Math.min((now - this.previous) / 1000, 0.1)
      : 1 / 60;
    this.previous = now;
    const elapsed = this.previous ? dt * 1000 : 16.67;
    this.frameMs += (elapsed - this.frameMs) * 0.03;
    this.fps = 1000 / this.frameMs;
    if (now - this.qualitySince > 2500 && !document.hidden) {
      if (this.frameMs > 20) this.quality = Math.max(0.6, this.quality - 0.1);
      else if (this.frameMs < 17.5)
        this.quality = Math.min(1, this.quality + 0.05);
      this.qualitySince = now;
    }
    const dpr = Math.min(devicePixelRatio, 1.5) * this.quality;
    const w = Math.max(1, Math.round(this.canvas.clientWidth * dpr)),
      h = Math.max(1, Math.round(this.canvas.clientHeight * dpr));
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
    }
    this.fog.update(dt, w / h);
    gl.viewport(0, 0, w, h);
    gl.useProgram(this.program);
    gl.bindVertexArray(this.vao);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    const ready = this.video.readyState >= 2 && this.video.videoWidth > 0;
    if (ready && this.video.currentTime !== this.lastVideoTime) {
      this.lastVideoTime = this.video.currentTime;
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        this.video,
      );
      this.uploads++;
    }
    this.cameraMix +=
      ((ready ? 1 : 0) - this.cameraMix) * (1 - Math.exp(-dt * 3));
    gl.uniform1i(this.locations.get("camera")!, 0);
    gl.uniform2f(this.locations.get("resolution")!, w, h);
    gl.uniform2f(
      this.locations.get("videoSize")!,
      this.video.videoWidth || 1,
      this.video.videoHeight || 1,
    );
    gl.uniform1f(this.locations.get("cameraMix")!, this.cameraMix);
    gl.uniform1f(
      this.locations.get("time")!,
      new URLSearchParams(location.search).has("seed") ? 0 : now / 1000,
    );
    gl.uniform1f(this.locations.get("seed")!, this.seed);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.fog.texture);
    gl.uniform1i(this.locations.get("fogMask")!, 1);
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, this.revealTexture);
    gl.uniform1i(this.locations.get("revealImage")!, 2);
    gl.uniform1f(this.locations.get("revealMode")!, this.reveal ? 1 : 0);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    this.frames++;
    this.frame = requestAnimationFrame(this.render);
  };
  setReveal(source: HTMLCanvasElement) {
    const gl = this.gl;
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, this.revealTexture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
  }
  sample(x: number, y: number) {
    const pixel = new Uint8Array(4);
    this.gl.readPixels(
      Math.floor(x * (this.canvas.width - 1)),
      Math.floor(y * (this.canvas.height - 1)),
      1,
      1,
      this.gl.RGBA,
      this.gl.UNSIGNED_BYTE,
      pixel,
    );
    return Array.from(pixel);
  }
  dispose() {
    cancelAnimationFrame(this.frame);
    this.fog.dispose();
    this.gl.deleteTexture(this.texture);
    this.gl.deleteTexture(this.revealTexture);
    this.gl.deleteVertexArray(this.vao);
    this.gl.deleteProgram(this.program);
  }
}
