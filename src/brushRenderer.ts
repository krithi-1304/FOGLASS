import vertex from "./shaders/brush.vert.glsl?raw";
import fragment from "./shaders/brush.frag.glsl?raw";
import type { BrushSegment } from "./brush";
export class BrushRenderer {
  readonly texture: WebGLTexture;
  private framebuffer: WebGLFramebuffer;
  private program: WebGLProgram;
  private vao: WebGLVertexArrayObject;
  private buffer: WebGLBuffer;
  private aspect: WebGLUniformLocation | null;
  private data = new Float32Array(256 * 6);
  constructor(
    private gl: WebGL2RenderingContext,
    private size: number,
  ) {
    this.program = gl.createProgram()!;
    for (const [type, source] of [
      [gl.VERTEX_SHADER, vertex],
      [gl.FRAGMENT_SHADER, fragment],
    ] as const) {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
        throw new Error(gl.getShaderInfoLog(shader) || "Brush shader failed");
      gl.attachShader(this.program, shader);
      gl.deleteShader(shader);
    }
    gl.linkProgram(this.program);
    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS))
      throw new Error("Brush linking failed");
    this.aspect = gl.getUniformLocation(this.program, "aspect");
    this.texture = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texStorage2D(gl.TEXTURE_2D, 1, gl.RGBA8, size, size);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    this.framebuffer = gl.createFramebuffer()!;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      this.texture,
      0,
    );
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE)
      throw new Error("Brush buffer unavailable");
    this.vao = gl.createVertexArray()!;
    gl.bindVertexArray(this.vao);
    this.buffer = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 24, 0);
    gl.vertexAttribDivisor(0, 1);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 24, 16);
    gl.vertexAttribDivisor(1, 1);
    gl.bindVertexArray(null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }
  render(segments: BrushSegment[], aspect: number) {
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
    gl.viewport(0, 0, this.size, this.size);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    if (!segments.length) return;
    if (this.data.length < segments.length * 6)
      this.data = new Float32Array(segments.length * 6);
    segments.forEach((s, i) =>
      this.data.set(
        [s.from.x, 1 - s.from.y, s.to.x, 1 - s.to.y, s.radius, s.palm ? 1 : 0],
        i * 6,
      ),
    );
    gl.bindVertexArray(this.vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      this.data.subarray(0, segments.length * 6),
      gl.STREAM_DRAW,
    );
    gl.useProgram(this.program);
    gl.uniform1f(this.aspect, aspect);
    gl.enable(gl.BLEND);
    gl.blendEquation(gl.MAX);
    gl.blendFunc(gl.ONE, gl.ONE);
    gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, segments.length);
    gl.disable(gl.BLEND);
    gl.blendEquation(gl.FUNC_ADD);
    gl.bindVertexArray(null);
  }
  dispose() {
    const gl = this.gl;
    gl.deleteTexture(this.texture);
    gl.deleteFramebuffer(this.framebuffer);
    gl.deleteProgram(this.program);
    gl.deleteVertexArray(this.vao);
    gl.deleteBuffer(this.buffer);
  }
}
