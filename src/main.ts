import "./style.css";
import { Camera } from "./camera";
import { Renderer } from "./renderer";
import { createUI } from "./ui";
const ui = createUI();
const camera = new Camera();
let renderer: Renderer | undefined;
let mode = "onboarding";
let pointer = { x: 0.5, y: 0.5, down: false };
try {
  renderer = new Renderer(
    ui.canvas,
    camera.video,
    Number(new URLSearchParams(location.search).get("seed")) || 1,
  );
} catch (e) {
  ui.status.textContent = (e as Error).message;
  ui.start.disabled = true;
  mode = "unsupported";
}
ui.start.addEventListener("click", async () => {
  ui.start.disabled = true;
  ui.start.textContent = "Opening…";
  ui.status.textContent = "Allow camera and microphone to enter your mirror.";
  const message = await camera.start();
  mode = camera.video.srcObject ? "camera" : "fallback";
  document.body.classList.add("started");
  ui.welcome.inert = true;
  ui.status.textContent = message;
});
const move = (e: PointerEvent) => {
  pointer = {
    x: e.clientX / innerWidth,
    y: e.clientY / innerHeight,
    down: pointer.down,
  };
  ui.cursor.style.transform = `translate(${e.clientX}px,${e.clientY}px)`;
  ui.cursor.classList.add("visible");
};
ui.canvas.addEventListener("pointermove", move);
ui.canvas.addEventListener("pointerdown", (e) => {
  move(e);
  pointer.down = true;
  ui.canvas.setPointerCapture(e.pointerId);
  ui.cursor.classList.add("down");
});
const release = () => {
  pointer.down = false;
  ui.cursor.classList.remove("down");
};
ui.canvas.addEventListener("pointerup", release);
ui.canvas.addEventListener("pointercancel", release);
ui.canvas.addEventListener("pointerleave", () =>
  ui.cursor.classList.remove("visible"),
);
ui.canvas.addEventListener("webglcontextlost", (e) => {
  e.preventDefault();
  mode = "context-lost";
  camera.stop();
  renderer?.dispose();
  ui.status.textContent = "The mirror paused. Reload this page to restore it.";
});
addEventListener("keydown", (e) => {
  if (e.key.toLowerCase() === "h") ui.status.hidden = !ui.status.hidden;
});
addEventListener("pagehide", () => {
  camera.stop();
  renderer?.dispose();
});
if (new URLSearchParams(location.search).get("test") === "1") {
  Object.assign(window, {
    __foglass: {
      getFps: () => renderer?.fps || 0,
      getState: () => ({
        milestone: 1,
        mediaPhase: camera.phase,
        videoReady: camera.video.readyState,
        mode,
        frames: renderer?.frames || 0,
        uploads: renderer?.uploads || 0,
        width: ui.canvas.width,
        height: ui.canvas.height,
        pointer,
        mirrored: true,
      }),
      samplePixel: (x: number, y: number) => renderer?.sample(x, y),
    },
  });
}
