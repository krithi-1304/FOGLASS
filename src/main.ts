import "./style.css";
import { Camera } from "./camera";
import { Renderer } from "./renderer";
import { createUI } from "./ui";
import { Interaction } from "./interaction";
import { HandController } from "./hand";
import { calibrationSteps } from "./calibration";
import type { GestureRecording } from "./tracking/types";
const params = new URLSearchParams(location.search);
const isTest = params.get("test") === "1";
const ui = createUI();
const camera = new Camera();
let renderer: Renderer | undefined;
let mode = "onboarding";
let hand: HandController | undefined;
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
const interaction = new Interaction(
  {
    finger: (x, y, down, radius, palm) =>
      renderer?.fog.finger(x, y, down, radius, palm),
    clear: () => renderer?.fog.clear(),
    injectBreath: (strength, ms) => renderer?.fog.injectBreath(strength, ms),
  },
  () => {
    if (renderer) {
      renderer.fog.paused = interaction.paused;
      renderer.fog.density = interaction.density;
    }
    ui.pause.textContent = interaction.paused ? "Resume" : "Pause";
    ui.tools.hidden = !interaction.palette;
  },
);
ui.pause.addEventListener("click", () => interaction.togglePause());
ui.clear.addEventListener("click", () => renderer?.fog.clear());
ui.refog.addEventListener("click", () => renderer?.fog.injectBreath(1, 1800));
ui.undo.addEventListener("click", () => {
  interaction.lift();
  renderer?.fog.undo();
});
ui.redo.addEventListener("click", () => {
  interaction.lift();
  renderer?.fog.redo();
});
ui.toolToggle.addEventListener("click", () => {
  interaction.palette = !interaction.palette;
  ui.tools.hidden = !interaction.palette;
});
function updateCalibration() {
  if (!hand) return;
  ui.calibration.hidden = !hand.calibration.active;
  ui.calibrationStep.textContent = calibrationSteps[hand.calibration.step];
}
async function startHand(mock = false) {
  if (hand) return;
  hand = new HandController(camera.video, (state, point) => {
    updateCalibration();
    interaction.update(state, point, hand?.calibration.active);
    if (!point) {
      ui.cursor.classList.remove("visible");
      return;
    }
    ui.cursor.style.transform = `translate(${point.x * innerWidth}px,${point.y * innerHeight}px)`;
    ui.cursor.classList.add("visible");
    ui.cameraState.textContent =
      mode === "camera"
        ? "CAMERA ON · " + state.gesture.toUpperCase()
        : "REPLAY · " + state.gesture.toUpperCase();
  });
  await hand.start(mock);
  if (hand.status === "unavailable")
    ui.status.textContent =
      "Hand tracking unavailable. Hold B to fog; drag to draw.";
  else if (!isTest) {
    hand.beginCalibration();
    updateCalibration();
  }
}
ui.recalibrate.addEventListener("click", () => {
  hand?.beginCalibration();
  updateCalibration();
});
ui.skipCalibration.addEventListener("click", () => {
  hand?.skipCalibration();
  updateCalibration();
});
ui.exit.addEventListener("click", () => {
  camera.stop();
  hand?.stop();
  renderer?.dispose();
  location.reload();
});
function enter() {
  document.body.classList.add("started");
  ui.welcome.inert = true;
  mode = "fallback";
  ui.dock.hidden = false;
  if (isTest && params.get("mock") === "1") void startHand(true);
  ui.status.textContent = "Hold B to fog · drag to draw · C clear · S save";
}
ui.fallback.addEventListener("click", enter);
ui.start.addEventListener("click", async () => {
  enter();
  ui.status.textContent =
    "Allow camera access, or use B and drag while you wait.";
  const message = await camera.start();
  mode = camera.video.srcObject ? "camera" : "fallback";
  ui.status.textContent = message;
  ui.cameraState.textContent =
    mode === "camera" ? "CAMERA ON" : "CAMERA OFF · FALLBACK";
  if (mode === "camera" && (!isTest || params.get("vision") === "1"))
    void startHand();
});
const move = (e: PointerEvent) => {
  pointer = {
    x: e.clientX / innerWidth,
    y: e.clientY / innerHeight,
    down: pointer.down,
  };
  ui.cursor.style.transform = `translate(${e.clientX}px,${e.clientY}px)`;
  ui.cursor.classList.add("visible");
  renderer?.fog.finger(
    pointer.x,
    pointer.y,
    pointer.down && !interaction.paused,
  );
};
ui.canvas.addEventListener("pointermove", move);
ui.canvas.addEventListener("pointerdown", (e) => {
  move(e);
  pointer.down = true;
  renderer?.fog.finger(pointer.x, pointer.y, !interaction.paused);
  ui.canvas.setPointerCapture(e.pointerId);
  ui.cursor.classList.add("down");
});
const release = () => {
  pointer.down = false;
  renderer?.fog.finger(pointer.x, pointer.y, false);
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
  hand?.stop();
  renderer?.dispose();
  ui.status.textContent = "The mirror paused. Reload this page to restore it.";
});
addEventListener("keydown", (e) => {
  if (e.repeat) return;
  const key = e.key.toLowerCase();
  if (key === "h") ui.status.hidden = !ui.status.hidden;
  if (key === " ") {
    e.preventDefault();
    interaction.togglePause();
  }
  if ((e.ctrlKey || e.metaKey) && key === "z") {
    e.preventDefault();
    interaction.lift();
    if (e.shiftKey) renderer?.fog.redo();
    else renderer?.fog.undo();
  }
  if ((e.ctrlKey || e.metaKey) && key === "y") {
    e.preventDefault();
    interaction.lift();
    renderer?.fog.redo();
  }
  if (key === "b") renderer?.fog.setBreathing(true);
  if (key === "c") renderer?.fog.clear();
  if (key === "s") {
    e.preventDefault();
    ui.canvas.toBlob((blob) => {
      if (!blob) return;
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "foglass.png";
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    });
  }
});
addEventListener("keyup", (e) => {
  if (e.key.toLowerCase() === "b") renderer?.fog.setBreathing(false);
});
addEventListener("blur", () => {
  renderer?.fog.setBreathing(false);
  release();
});
addEventListener("pagehide", () => {
  camera.stop();
  hand?.stop();
  renderer?.dispose();
});
if (new URLSearchParams(location.search).get("test") === "1") {
  Object.assign(window, {
    __foglass: {
      injectBreath: (strength: number, ms: number) =>
        renderer?.fog.injectBreath(strength, ms),
      injectFinger: (x: number, y: number, down: boolean) =>
        renderer?.fog.finger(x, y, down),
      getFogCoverage: () => renderer?.fog.coverage() || 0,
      sampleMask: (x: number, y: number) => renderer?.fog.sample(x, y) || 0,
      replay: (recording: GestureRecording, realtime = false) =>
        hand?.replay(recording, realtime),
      setTimeScale: (value: number) => renderer?.fog.setTimeScale(value),
      getFps: () => renderer?.fps || 0,
      getState: () => ({
        milestone: "V1 writing",
        paused: interaction.paused,
        palette: interaction.palette,
        canUndo: renderer?.fog.canUndo,
        canRedo: renderer?.fog.canRedo,
        mediaPhase: camera.phase,
        tracking: hand?.metrics() || { status: "off" },
        gesture: hand?.state?.gesture || "none",
        calibration: hand
          ? { active: hand.calibration.active, step: hand.calibration.step }
          : null,
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
