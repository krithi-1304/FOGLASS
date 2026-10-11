import type { Renderer } from "./renderer";
import { OneEuro } from "./filters";
export function glassContact(
  p: { x: number; y: number; z: number },
  width: number,
  height: number,
  touching = false,
) {
  const x = 0.5 + p.x / width,
    y = 0.5 - (p.y + 0.05) / height;
  return {
    x,
    y,
    down:
      x >= 0 &&
      x <= 1 &&
      y >= 0 &&
      y <= 1 &&
      Math.abs(p.z + 0.55) < (touching ? 0.045 : 0.025),
  };
}
export async function supportsVR() {
  try {
    return !!(await navigator.xr?.isSessionSupported("immersive-vr"));
  } catch {
    return false;
  }
}
export class XRGlass {
  private session: XRSession | undefined;
  async start(renderer: Renderer, onEnd: () => void) {
    if (!navigator.xr)
      throw new Error("VR needs a compatible headset browser over HTTPS.");
    const session = await navigator.xr.requestSession("immersive-vr", {
      requiredFeatures: ["hand-tracking"],
      optionalFeatures: ["local-floor"],
    });
    this.session = session;
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2", {
      xrCompatible: true,
      alpha: false,
    });
    if (!gl) {
      await session.end();
      throw new Error("The headset could not create a WebGL mirror.");
    }
    try {
      await gl.makeXRCompatible();
      const layer = new XRWebGLLayer(session, gl);
      session.updateRenderState({ baseLayer: layer });
      const base = await session.requestReferenceSpace("local");
      let space: XRReferenceSpace | undefined;
      const compile = (type: number, source: string) => {
        const s = gl.createShader(type)!;
        gl.shaderSource(s, source);
        gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS))
          throw new Error(gl.getShaderInfoLog(s) || "VR shader error");
        return s;
      };
      const vs = compile(
        gl.VERTEX_SHADER,
        `#version 300 es
        uniform mat4 projection; uniform mat4 view; uniform vec2 size; out vec2 uv;
        void main(){vec2 p=vec2((gl_VertexID==1||gl_VertexID==2||gl_VertexID==4)?1.:0.,(gl_VertexID==2||gl_VertexID==4||gl_VertexID==5)?1.:0.);uv=p;gl_Position=projection*view*vec4((p.x-.5)*size.x,(p.y-.5)*size.y-.05,-.55,1.);}`,
      );
      const fs = compile(
        gl.FRAGMENT_SHADER,
        `#version 300 es
        precision highp float; in vec2 uv; out vec4 color; uniform sampler2D mirror; uniform sampler2D toolbar; uniform vec2 cursor; uniform float ratio;
        void main(){vec3 c=texture(mirror,uv).rgb;if(uv.y<.12)c=texture(toolbar,vec2(uv.x,uv.y/.12)).rgb;float d=length((uv-cursor)*vec2(ratio,1.));c+=vec3(.35)*exp(-pow((d-.013)*450.,2.));color=vec4(c,1.);}`,
      );
      const program = gl.createProgram()!;
      gl.attachShader(program, vs);
      gl.attachShader(program, fs);
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS))
        throw new Error("VR shader link failed");
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      const texture = (unit: number) => {
        const t = gl.createTexture()!;
        gl.activeTexture(gl.TEXTURE0 + unit);
        gl.bindTexture(gl.TEXTURE_2D, t);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        return t;
      };
      const mirror = texture(0),
        toolbar = texture(1);
      const labels = document.createElement("canvas");
      labels.width = 900;
      labels.height = 80;
      const ctx = labels.getContext("2d")!;
      ctx.fillStyle = "#eee4e6";
      ctx.fillRect(0, 0, 900, 80);
      ctx.fillStyle = "#604758";
      ctx.font = "24px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("+ steam", 150, 48);
      ctx.fillText("clear", 450, 48);
      ctx.fillText("exit VR", 750, 48);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        labels,
      );
      const vao = gl.createVertexArray()!;
      gl.bindVertexArray(vao);
      const loc = (name: string) => gl.getUniformLocation(program, name);
      let touching = false,
        cooldown = 0;
      let source: XRInputSource | undefined;
      const fx = new OneEuro(),
        fy = new OneEuro();
      renderer.setExternalFrame(true);
      session.addEventListener(
        "end",
        () => {
          renderer.fog.finger(0, 0, false);
          renderer.setExternalFrame(false);
          gl.deleteTexture(mirror);
          gl.deleteTexture(toolbar);
          gl.deleteProgram(program);
          gl.deleteVertexArray(vao);
          this.session = undefined;
          onEnd();
        },
        { once: true },
      );
      const draw: XRFrameRequestCallback = (now, frame) => {
        if (!this.session) return;
        session.requestAnimationFrame(draw);
        if (!space) {
          const initial = frame.getViewerPose(base);
          if (!initial) return;
          space = base.getOffsetReferenceSpace(
            new XRRigidTransform(
              initial.transform.position,
              initial.transform.orientation,
            ),
          );
        }
        const pose = frame.getViewerPose(space);
        if (!pose) return;
        const width = 0.9,
          height = width / (renderer.canvas.width / renderer.canvas.height);
        source =
          Array.from(session.inputSources).find(
            (s) => s === source && s.hand,
          ) || Array.from(session.inputSources).find((s) => s.hand);
        const joint = source?.hand?.get("index-finger-tip");
        const tip = joint ? frame.getJointPose?.(joint, space) : null;
        let cursor = { x: -2, y: -2 };
        if (tip) {
          const point = glassContact(
            tip.transform.position,
            width,
            height,
            touching,
          );
          cursor = { x: fx.filter(point.x, now), y: fy.filter(point.y, now) };
          if (point.down && point.y > 0.88) {
            renderer.fog.finger(0, 0, false);
            if (!touching && now > cooldown) {
              cooldown = now + 700;
              if (point.x < 1 / 3) renderer.fog.injectBreath(1, 1800);
              else if (point.x < 2 / 3) renderer.fog.clear();
              else void session.end();
            }
          } else renderer.fog.finger(cursor.x, cursor.y, point.down, 0.011);
          touching = point.down;
        } else {
          renderer.fog.finger(0, 0, false);
          touching = false;
          fx.reset();
          fy.reset();
        }
        renderer.renderExternal(performance.now());
        gl.bindFramebuffer(gl.FRAMEBUFFER, layer.framebuffer);
        gl.clearColor(0.06, 0.05, 0.07, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.useProgram(program);
        gl.bindVertexArray(vao);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, mirror);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          renderer.canvas,
        );
        gl.uniform1i(loc("mirror"), 0);
        gl.uniform1i(loc("toolbar"), 1);
        gl.uniform2f(loc("size"), width, height);
        gl.uniform1f(loc("ratio"), width / height);
        gl.uniform2f(loc("cursor"), cursor.x, 1 - cursor.y);
        for (const view of pose.views) {
          const viewport = layer.getViewport(view);
          if (!viewport) continue;
          gl.viewport(viewport.x, viewport.y, viewport.width, viewport.height);
          gl.uniformMatrix4fv(loc("projection"), false, view.projectionMatrix);
          gl.uniformMatrix4fv(
            loc("view"),
            false,
            view.transform.inverse.matrix,
          );
          gl.drawArrays(gl.TRIANGLES, 0, 6);
        }
      };
      session.requestAnimationFrame(draw);
    } catch (error) {
      await session.end();
      this.session = undefined;
      throw error;
    }
  }
  stop() {
    void this.session?.end();
  }
}
