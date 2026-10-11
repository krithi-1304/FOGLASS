export function createUI() {
  document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
    <canvas id="mirror" aria-label="Live mirror, or a dusk scene when camera is unavailable"></canvas>
    <div class="edge" aria-hidden="true"></div>
    <header><span>FOGLASS</span><span id="camera-state">CAMERA OFF</span></header>
    <main id="welcome">
      <span class="little-star" aria-hidden="true">✧</span><h1>FOGLASS</h1>
      <p class="invitation">a little space to leave a trace.</p>
      <p class="instructions">Breathe. Draw. Let it disappear.</p>
      <button id="start">Start <span aria-hidden="true">↗</span></button>
      <p class="privacy">Just you and the glass. Camera stays on your device.</p>
      <button id="fallback" class="text-button">Try without camera</button>
    </main>
    <section id="calibration" hidden aria-label="Hand calibration">
      <p id="calibration-step">Show an open palm</p>
      <p class="calibration-detail">Keep your hand in the camera view. We’ll learn your comfortable range.</p>
      <button id="skip-calibration">Skip calibration</button>
    </section>
    <nav id="dock" aria-label="Mirror controls" hidden>
      <button id="refog">Add steam</button>
      <button id="tool-toggle" aria-controls="tools">Tools</button>
      
    </nav>
    <section id="tools" hidden aria-label="Mirror tools">
      <label class="field">Mode<select id="mirror-mode" aria-label="Mode"><option value="mirror">Real Mirror</option><option value="writing">Fog Writing</option><option value="reveal">Magic Reveal</option></select></label>
      <label class="field">Steam strength<input aria-label="Steam strength" id="density" type="range" min="10" max="100" value="75"></label>
      <div id="reveal-editor" hidden>
        <label class="field">Hidden message<textarea aria-label="Hidden message" id="reveal-message" maxlength="180" rows="2">You are here. That is enough.</textarea></label>
        <button id="apply-message">Use message</button>
        <label class="file-label">Use a photo<input id="reveal-file" type="file" accept="image/png,image/jpeg,image/webp"></label>
      </div>
      <button id="microphone" aria-pressed="false">Enable breath</button>
      <p class="microphone-note">Experimental audio trigger. Microphone stays off until enabled.</p>
      <button id="recalibrate">Calibrate hand</button>
      <button id="sound" aria-pressed="false">Enable sound</button>
      <button id="vr" disabled>VR unavailable</button>
      <button id="photo">Save photo</button>
      <button id="record">Record 10s</button>
      <button id="pause">Pause</button>
      <button id="exit">Close mirror</button>
      <button id="clear">Clear</button>
      <button id="undo">Undo</button>
      <button id="redo">Redo</button>
    </section>
    <p id="status" role="status" aria-live="polite"></p>
    <div id="cursor" aria-hidden="true"></div>
    <footer><span>nothing to keep. unless you want to.</span><span id="footer-note"></span></footer>`;
  return {
    sound: document.querySelector<HTMLButtonElement>("#sound")!,
    vr: document.querySelector<HTMLButtonElement>("#vr")!,
    photo: document.querySelector<HTMLButtonElement>("#photo")!,
    record: document.querySelector<HTMLButtonElement>("#record")!,
    canvas: document.querySelector<HTMLCanvasElement>("#mirror")!,
    microphone: document.querySelector<HTMLButtonElement>("#microphone")!,
    modeSelect: document.querySelector<HTMLSelectElement>("#mirror-mode")!,
    density: document.querySelector<HTMLInputElement>("#density")!,
    revealEditor: document.querySelector<HTMLElement>("#reveal-editor")!,
    revealMessage:
      document.querySelector<HTMLTextAreaElement>("#reveal-message")!,
    applyMessage: document.querySelector<HTMLButtonElement>("#apply-message")!,
    revealFile: document.querySelector<HTMLInputElement>("#reveal-file")!,
    refog: document.querySelector<HTMLButtonElement>("#refog")!,
    toolToggle: document.querySelector<HTMLButtonElement>("#tool-toggle")!,
    pause: document.querySelector<HTMLButtonElement>("#pause")!,
    clear: document.querySelector<HTMLButtonElement>("#clear")!,
    undo: document.querySelector<HTMLButtonElement>("#undo")!,
    redo: document.querySelector<HTMLButtonElement>("#redo")!,
    tools: document.querySelector<HTMLElement>("#tools")!,
    cameraState: document.querySelector<HTMLElement>("#camera-state")!,
    calibration: document.querySelector<HTMLElement>("#calibration")!,
    calibrationStep: document.querySelector<HTMLElement>("#calibration-step")!,
    skipCalibration:
      document.querySelector<HTMLButtonElement>("#skip-calibration")!,
    recalibrate: document.querySelector<HTMLButtonElement>("#recalibrate")!,
    exit: document.querySelector<HTMLButtonElement>("#exit")!,
    dock: document.querySelector<HTMLElement>("#dock")!,
    fallback: document.querySelector<HTMLButtonElement>("#fallback")!,
    start: document.querySelector<HTMLButtonElement>("#start")!,
    status: document.querySelector<HTMLParagraphElement>("#status")!,
    welcome: document.querySelector<HTMLElement>("#welcome")!,
    cursor: document.querySelector<HTMLDivElement>("#cursor")!,
  };
}
