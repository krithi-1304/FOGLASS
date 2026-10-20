import { LetterEffects } from "./letters/effects";
import { installLetters } from "./letters/ui";
import { installHud } from "./hud";
import "./style.css";
import { RoomSound } from "./sound";
import { installDebug } from "./debug";
import { installLab } from "./lab";
import { XRGlass, supportsVR } from "./xr";
import { MirrorRecorder, savePhoto } from "./capture";
import { BreathMonitor } from "./breath";
import { Camera } from "./camera";
import { Renderer } from "./renderer";
import { createUI } from "./ui";
import { messageLayer, imageLayer } from "./reveal";
import { Interaction } from "./interaction";
import { HandController } from "./hand";
import { calibrationSteps } from "./calibration";
import type { GestureRecording } from "./tracking/types";
const params = new URLSearchParams(location.search);
const isTest = params.get("test") === "1";
const ui = createUI();
const hud = installHud();
const camera = new Camera();
const recorder = new MirrorRecorder();
const sound = new RoomSound();
const toggleSound = async () => {
  try {
    const enabled = await sound.toggle();
    ui.sound.textContent = enabled ? "Mute sound" : "Enable sound";
    ui.sound.setAttribute("aria-pressed", String(enabled));
  } catch {
    ui.status.textContent = "Sound is unavailable in this browser.";
  }
};
ui.sound.addEventListener("click", () => void toggleSound());
const photo = () =>
  void savePhoto(ui.canvas).catch((e) => {
    ui.status.textContent = e.message;
  });
ui.photo.addEventListener("click", photo);
ui.record.addEventListener("click", () => {
  try {
    if (recorder.active) recorder.stop();
    else {
      recorder.start(ui.canvas, () => {
        ui.record.textContent = "Record 10s";
      });
      ui.record.textContent = "Stop recording";
    }
  } catch (e) {
    ui.status.textContent = (e as Error).message;
  }
});
let renderer: Renderer | undefined;
let mode = "onboarding";
let hand: HandController | undefined;
let pointer = { x: 0.5, y: 0.5, down: false };
let hintInteracted = false;
function clearGlass() {
  renderer?.fog.clear();
  breath?.detector.suppressUntilQuiet();
}
function successfulStroke() {
  sound.stroke();
  renderer?.fog.cancelBreath();
  breath?.detector.suppressUntilQuiet();
  if (hintInteracted) return;
  hintInteracted = true;
  const text = ui.status.textContent;
  setTimeout(() => {
    if (ui.status.textContent === text) ui.status.style.opacity = "0";
  }, 4000);
}
new MutationObserver(() => {
  ui.status.style.opacity = "1";
  if (
    /unavailable|stalled|denied|could not|disconnected/i.test(
      ui.status.textContent || "",
    )
  )
    hud.reveal();
}).observe(ui.status, { childList: true, characterData: true, subtree: true });
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
const letterEffects = renderer ? new LetterEffects(renderer) : undefined;
let letters: ReturnType<typeof installLetters> | undefined;
ui.restartMirror.addEventListener("click", () => location.reload());
const interaction = new Interaction(
  {
    finger: (x, y, down, radius, palm) => {
      renderer?.fog.finger(x, y, down, radius, palm);
      if (down) successfulStroke();
    },
    wipe: (segments, begin) => {
      renderer?.fog.wipe(segments, begin);
      successfulStroke();
    },
    clear: clearGlass,
    injectBreath: (strength, ms) => renderer?.fog.injectBreath(strength, ms),
  },
  () => {
    if (renderer) {
      renderer.fog.paused = interaction.paused;
      renderer.fog.density = interaction.density;
    }
    ui.pause.textContent = interaction.paused ? "Resume" : "Pause";
    ui.density.value = String(Math.round(interaction.density * 100));
    ui.tools.hidden = !interaction.palette;
    ui.toolToggle.setAttribute("aria-expanded", String(interaction.palette));
  },
);
ui.writingGrip.addEventListener("change", () => {
  interaction.lift();
  interaction.writingGrip =
    ui.writingGrip.value === "pinch" ? "pinch" : "point";
  if (interaction.writingGrip === "pinch") {
    interaction.setMode("writing");
    ui.modeSelect.value = "writing";
    if (renderer) renderer.reveal = false;
    ui.revealEditor.hidden = true;
  }
});
ui.handShortcuts.addEventListener("change", () => {
  interaction.gestureCommands = ui.handShortcuts.checked;
});
ui.restartTracking.addEventListener("click", async () => {
  if (mode !== "camera") {
    ui.status.textContent =
      "Start with a camera to use hand tracking. Drag to draw here.";
    return;
  }
  hand?.stop();
  hand = undefined;
  interaction.lift();
  if (interaction.paused) interaction.togglePause();
  await startHand();
});
let breath: BreathMonitor | undefined;
let microphoneContext: AudioContext | undefined;
let microphoneStream: MediaStream | undefined;
let micState = "off",
  micAttempt = 0;
let micPoll: ReturnType<typeof setInterval> | undefined;
function disableMicrophone() {
  micAttempt++;
  clearInterval(micPoll);
  breath?.stop();
  breath = undefined;
  microphoneStream?.getTracks().forEach((track) => track.stop());
  microphoneStream = undefined;
  if (microphoneContext && microphoneContext.state !== "closed")
    void microphoneContext.close().catch(() => {});
  microphoneContext = undefined;
  micState = "off";
  ui.breathFeedback.hidden = true;
  ui.microphone.textContent = "Enable breath";
  ui.microphone.setAttribute("aria-pressed", "false");
}
ui.microphone.addEventListener("click", async () => {
  if (micState !== "off" && microphoneContext?.state === "suspended") {
    await microphoneContext.resume().catch(() => {
      ui.status.textContent =
        "Microphone could not resume. Disable and enable it again.";
    });
    return;
  }
  if (micState !== "off") {
    disableMicrophone();
    return;
  }
  const attempt = ++micAttempt;
  micState = "requesting";
  ui.microphone.textContent = "Cancel microphone";
  try {
    microphoneContext = new AudioContext();
    await microphoneContext.resume();
    const stream = await camera.microphone(ui.microphoneDevice.value);
    if (attempt !== micAttempt) {
      stream.getTracks().forEach((t) => t.stop());
      return;
    }
    microphoneStream = stream;
    const track = stream.getAudioTracks()[0];
    const settings = track?.getSettings();
    ui.microphoneSource.textContent = `Using ${track?.label || "system microphone"}.${settings?.noiseSuppression || settings?.autoGainControl ? " Browser audio processing is enabled; try another microphone if breath is suppressed." : " Audio stays on this device."}`;
    track?.addEventListener(
      "ended",
      () => {
        if (attempt !== micAttempt) return;
        disableMicrophone();
        ui.status.textContent =
          "Microphone disconnected. Select a microphone and enable breath again.";
      },
      { once: true },
    );
    void navigator.mediaDevices
      .enumerateDevices()
      .then((devices) => {
        if (attempt !== micAttempt) return;
        const selected = settings?.deviceId || ui.microphoneDevice.value;
        ui.microphoneDevice.replaceChildren(new Option("System default", ""));
        for (const device of devices.filter((d) => d.kind === "audioinput"))
          ui.microphoneDevice.add(
            new Option(device.label || "Microphone", device.deviceId),
          );
        if (
          Array.from(ui.microphoneDevice.options).some(
            (o) => o.value === selected,
          )
        )
          ui.microphoneDevice.value = selected;
      })
      .catch(() => {});
    breath = new BreathMonitor(microphoneContext, stream, (strength) =>
      renderer?.fog.injectBreath(strength, 120),
    );
    micState = "calibrating";
    breath.detector.sensitivity = Number(ui.breathSensitivity.value);
    ui.breathFeedback.hidden = false;
    ui.microphone.textContent = "Calibrating…";
    ui.microphone.setAttribute("aria-pressed", "true");
    if (hand?.metrics().status !== "unavailable")
      ui.status.textContent =
        "Stay quiet briefly while the microphone learns the room.";
    micPoll = setInterval(() => {
      if (!breath) return;
      if (microphoneContext?.state === "suspended") {
        ui.microphone.textContent = "Resume breath";
        ui.breathMessage.textContent = "Microphone paused · tap Resume breath";
        micState = "suspended";
        return;
      }
      const detector = breath.detector;
      ui.breathMeter.value = Math.min(
        3,
        detector.energy / Math.max(detector.threshold, 1e-8),
      );
      ui.breathMessage.textContent = !detector.calibrated
        ? "Stay quiet for a moment…"
        : detector.waitingForQuiet
          ? "Pause sound briefly, then blow again · recalibrate if needed"
          : detector.active
            ? "Breath detected"
            : detector.energy < 0.00001
              ? "No sound reaching the microphone"
              : "Listening · blow toward your microphone";
      if (detector.calibrated && micState !== "on") {
        micState = "on";
        ui.microphone.textContent = "Breath on · disable";
        if (hand?.metrics().status !== "unavailable")
          ui.status.textContent =
            "Blow gently toward your microphone to add steam. B also works.";
      }
    }, 100);
  } catch {
    if (attempt !== micAttempt) return;
    disableMicrophone();
    ui.status.textContent =
      "Microphone unavailable or permission denied. Hold B or choose Add steam.";
  }
});
ui.microphoneDevice.addEventListener("change", () => {
  if (micState === "off") return;
  disableMicrophone();
  ui.microphone.click();
});
ui.fogReturn.addEventListener("change", () => {
  if (renderer) renderer.fog.autoRegrow = ui.fogReturn.value === "natural";
});
ui.testBreath.addEventListener("click", () => {
  hud.reveal();
  if (interaction.paused) interaction.togglePause();
  ui.fogReturn.value = "breath";
  if (renderer) {
    renderer.fog.autoRegrow = false;
    renderer.fog.clear();
  }
  if (micState === "off") ui.microphone.click();
  else {
    breath?.detector.recalibrate();
    micState = "calibrating";
    if (microphoneContext?.state === "suspended")
      void microphoneContext.resume();
  }
  ui.status.textContent =
    "Breath test: stay quiet for a moment, then blow toward your microphone. Automatic regrowth is off.";
});
ui.breathSensitivity.addEventListener("input", () => {
  if (breath) breath.detector.sensitivity = Number(ui.breathSensitivity.value);
});
ui.recalibrateBreath.addEventListener("click", () => {
  if (!breath) {
    ui.status.textContent = "Enable breath first, then stay quiet briefly.";
    return;
  }
  breath.detector.recalibrate();
  micState = "calibrating";
  ui.microphone.textContent = "Calibrating…";
});
let revealFile: File | undefined;
let revealGeneration = 0;
async function refreshReveal() {
  const generation = ++revealGeneration;
  const width = Math.round((720 * innerWidth) / innerHeight),
    height = 720;
  try {
    const layer = revealFile
      ? await imageLayer(revealFile, width, height)
      : await messageLayer(ui.revealMessage.value, width, height);
    if (generation === revealGeneration) renderer?.setReveal(layer);
  } catch (e) {
    ui.status.textContent = (e as Error).message;
  }
}
ui.modeSelect.addEventListener("change", () => {
  const mode = ui.modeSelect.value as "mirror" | "writing" | "reveal";
  interaction.setMode(mode);
  if (renderer) renderer.reveal = mode === "reveal";
  ui.revealEditor.hidden = mode !== "reveal";
  if (mode === "reveal") {
    void refreshReveal();
    renderer?.fog.injectBreath(1, 1500);
  }
});
ui.density.addEventListener("input", () => {
  interaction.density = Number(ui.density.value) / 100;
  if (renderer) renderer.fog.density = interaction.density;
});
ui.applyMessage.addEventListener("click", () => {
  revealFile = undefined;
  void refreshReveal();
});
ui.revealFile.addEventListener("change", () => {
  revealFile = ui.revealFile.files?.[0];
  if (revealFile) void refreshReveal();
});
let revealResize: ReturnType<typeof setTimeout>;
addEventListener("resize", () => {
  interaction.lift();
  release();
  clearTimeout(revealResize);
  if (interaction.mode === "reveal")
    revealResize = setTimeout(() => void refreshReveal(), 150);
});
ui.pause.addEventListener("click", () => interaction.togglePause());
ui.clear.addEventListener("click", clearGlass);
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
  ui.toolToggle.setAttribute("aria-expanded", String(interaction.palette));
});
function updateCalibration() {
  if (!hand) return;
  ui.calibration.hidden = !hand.calibration.active;
  ui.calibrationStep.textContent = calibrationSteps[hand.calibration.step];
}
async function startHand(mock = false) {
  if (hand) return hand;
  ui.trackingFeedback.textContent =
    "Loading hand tracking… Keep your whole hand in the camera view.";
  hand = new HandController(camera.video, (state, point) => {
    if (document.querySelector("dialog[open]")) {
      interaction.lift();
      return;
    }
    updateCalibration();
    interaction.update(
      state,
      point,
      hand?.calibration.active,
      hand?.joints,
      innerWidth / innerHeight,
    );
    const trackingError = hand?.metrics().error;
    ui.trackingFeedback.textContent = trackingError
      ? "Tracking unavailable · choose Restart tracking. Mouse and touch still work."
      : !state.hand
        ? "No hand detected · show your whole hand in good light."
        : state.gesture === "none"
          ? "Hand detected · straighten your index to write, or open your palm to wipe."
          : `Hand detected · ${state.gesture === "palm" || state.gesture === "two-palms" ? "palm wipe" : state.gesture === "point" ? "finger writing" : state.gesture}`;
    if (trackingError)
      ui.status.textContent = trackingError + " Drag to draw; B adds steam.";
    ui.cameraState.textContent =
      mode === "camera"
        ? "CAMERA ON · " +
          (state.hand ? state.gesture.toUpperCase() : "SHOW YOUR HAND")
        : "REPLAY · " + state.gesture.toUpperCase();
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
  if (hand.status === "unavailable") {
    ui.status.textContent =
      "Hand tracking unavailable. Hold B to fog; drag to draw.";
    ui.trackingFeedback.textContent =
      "Hand tracking unavailable · choose Restart tracking.";
  } else if (!isTest) {
    ui.status.textContent =
      "Point to write · open palm to wipe · Enable breath to fog.";
  }
  return hand;
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
  recorder.dispose();
  sound.dispose();
  camera.stop();
  disableMicrophone();
  hand?.stop();
  renderer?.dispose();
  location.reload();
});
function enter() {
  document.body.classList.add("started");
  hud.enter();
  ui.welcome.inert = true;
  mode = "fallback";
  ui.dock.hidden = false;
  if (!letterEffects?.letter) renderer?.fog.injectBreath(0.85, 1200);
  if (isTest && params.get("mock") === "1") void startHand(true);
  ui.status.textContent = "Hold B to fog · drag to draw · C clear · S save";
}
ui.fallback.addEventListener("click", enter);
ui.start.addEventListener("click", async () => {
  if (ui.start.disabled) return;
  ui.start.disabled = ui.startCamera.disabled = true;
  enter();
  if (ui.breathOnStart.checked) ui.microphone.click();
  ui.status.textContent =
    "Allow camera access, or use B and drag while you wait.";
  const message = await camera.start();
  mode = camera.video.srcObject ? "camera" : "fallback";
  ui.status.textContent = message;
  ui.cameraState.textContent =
    mode === "camera" ? "CAMERA ON" : "CAMERA OFF · FALLBACK";
  ui.start.disabled = ui.startCamera.disabled = false;
  ui.startCamera.textContent = mode === "camera" ? "Camera on" : "Start camera";
  if (mode !== "camera") ui.trackingFeedback.textContent = message;
  if (mode === "camera" && (!isTest || params.get("vision") === "1"))
    void startHand();
});
ui.startCamera.addEventListener("click", () => ui.start.click());
if (letterEffects)
  letters = installLetters(
    letterEffects,
    enter,
    () => {
      interaction.setMode("writing");
      ui.modeSelect.value = "writing";
      if (renderer) {
        renderer.reveal = false;
        renderer.fog.injectBreath(0.85, 1000);
      }
    },
    import.meta.env.DEV && isTest && params.get("letters") === "local"
      ? "http://127.0.0.1:8787"
      : undefined,
    () => {
      ui.breathOnStart.checked = false;
      ui.start.click();
    },
    () => hud.reveal(),
  );
const move = (e: PointerEvent) => {
  pointer = {
    x: e.clientX / innerWidth,
    y: e.clientY / innerHeight,
    down: pointer.down,
  };
  if (pointer.down && !interaction.paused) successfulStroke();
  ui.cursor.style.transform = `translate(${e.clientX}px,${e.clientY}px)`;
  ui.cursor.classList.toggle("visible", pointer.down);
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
  if (!interaction.paused) successfulStroke();
  renderer?.fog.finger(pointer.x, pointer.y, !interaction.paused);
  ui.canvas.setPointerCapture(e.pointerId);
  ui.cursor.classList.add("down", "visible");
});
const release = () => {
  pointer.down = false;
  renderer?.fog.finger(pointer.x, pointer.y, false);
  ui.cursor.classList.remove("down", "visible");
};
ui.canvas.addEventListener("pointerup", release);
ui.canvas.addEventListener("pointercancel", release);
ui.canvas.addEventListener("pointerleave", () =>
  ui.cursor.classList.remove("visible"),
);
ui.canvas.addEventListener("webglcontextlost", (e) => {
  e.preventDefault();
  mode = "context-lost";
  recorder.dispose();
  sound.dispose();
  camera.stop();
  disableMicrophone();
  hand?.stop();
  renderer?.dispose();
  ui.graphicsRecovery.hidden = false;
  ui.status.textContent =
    "The glass needs a fresh start. Choose Restart mirror.";
});
addEventListener("keydown", (e) => {
  if (
    e.repeat ||
    (e.target instanceof HTMLElement &&
      e.target.matches("input,textarea,select"))
  )
    return;
  const key = e.key.toLowerCase();
  // Preserve native Space activation for buttons and disclosure controls.
  if (
    key === " " &&
    e.target instanceof HTMLElement &&
    e.target.closest("button,summary,a")
  )
    return;
  if (key === "m") void toggleSound();
  if (key === "h") {
    ui.status.style.opacity = "1";
    ui.status.hidden = !ui.status.hidden;
  }
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
  if (key === "c") clearGlass();
  if (key === "s") {
    e.preventDefault();
    photo();
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
  recorder.dispose();
  sound.dispose();
  camera.stop();
  disableMicrophone();
  hand?.stop();
  renderer?.dispose();
});
if (new URLSearchParams(location.search).get("test") === "1") {
  Object.assign(window, {
    __foglass: {
      injectBreath: (strength: number, ms: number) =>
        renderer?.fog.injectBreath(strength, ms),
      injectFinger: (x: number, y: number, down: boolean) =>
        renderer?.fog.finger(x, y, down, 0.011),
      getFogCoverage: () => renderer?.fog.coverage() || 0,
      sampleMask: (x: number, y: number) => renderer?.fog.sample(x, y) || 0,
      replay: (recording: GestureRecording, realtime = false) =>
        hand?.replay(recording, realtime),
      getWater: () => renderer?.fog.waterStats(),
      seedCoverage: (value: number) => renderer?.fog.seedCoverage(value),
      setTimeScale: (value: number) => renderer?.fog.setTimeScale(value),
      getFps: () => renderer?.fps || 0,
      getState: () => ({
        milestone: "V1 writing",
        paused: interaction.paused,
        mirrorMode: interaction.mode,
        microphone: micState,
        autoRegrow: renderer?.fog.autoRegrow,
        breathStrength: breath?.detector.strength || 0,
        breathSignal: breath
          ? {
              energy: breath.detector.energy,
              waitingForQuiet: breath.detector.waitingForQuiet,
              floor: breath.detector.floor,
              threshold: breath.detector.threshold,
              flatness: breath.detector.flatness,
              noiseLike: breath.detector.noiseLike,
            }
          : null,
        revealReady: revealGeneration,
        palette: interaction.palette,
        canUndo: renderer?.fog.canUndo,
        canRedo: renderer?.fog.canRedo,
        history: renderer?.fog.historyUsage(),
        mediaPhase: camera.phase,
        tracking: hand?.metrics() || { status: "off" },
        gesture: hand?.state?.gesture || "none",
        calibration: hand
          ? { active: hand.calibration.active, step: hand.calibration.step }
          : null,
        videoReady: camera.video.readyState,
        mode,
        frames: renderer?.frames || 0,
        quality: renderer?.quality || 1,
        letters: letters?.state,
        frameMs: renderer?.frameMs || 0,
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

const xr = new XRGlass();
void supportsVR().then((supported) => {
  ui.vr.hidden = !supported;
  ui.vr.disabled = !supported;
  ui.vr.textContent = "Optional headset mode";
});
ui.vr.addEventListener("click", async () => {
  if (!renderer) return;
  try {
    await xr.start(renderer, () => {
      if (mode === "camera") void startHand();
    });
    hand?.stop();
    hand = undefined;
    ui.calibration.hidden = true;
    interaction.lift();
  } catch (error) {
    ui.status.textContent = (error as Error).message;
  }
});
const disposeDebug = renderer ? installDebug(renderer, () => breath) : () => {};
const disposeLab = location.pathname.replace(/\/$/, "").endsWith("/lab")
  ? installLab(
      () => hand,
      async (record) => {
        enter();
        hand?.stop();
        hand = undefined;
        const replayHand = await startHand(true);
        replayHand?.skipCalibration();
        updateCalibration();
        await replayHand?.replay(record as GestureRecording, true);
      },
    )
  : () => {};
addEventListener("pagehide", () => {
  xr.stop();
  disposeLab();
  disposeDebug();
});
