export function createUI() {
  document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
    <canvas id="mirror" aria-label="Live mirror, or a dusk scene when camera is unavailable"></canvas>
    <div class="edge" aria-hidden="true"></div>
    <header><span>FOGLASS</span><span id="camera-state">CAMERA OFF</span></header>
    <main id="welcome">
      <svg class="little-star" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 2c1 7 3 9 10 10-7 1-9 3-10 10-1-7-3-9-10-10 7-1 9-3 10-10Z" stroke="currentColor" stroke-width="1"/></svg><h1 aria-label="FOGLASS">foglass</h1>
      <p class="invitation">a moment, written in mist.</p>
      <p class="instructions">Breathe on the glass. Leave a little of yourself.</p>
      <button id="start">Start <span aria-hidden="true">↗</span></button>
      <label class="start-option"><input id="breath-on-start" type="checkbox" checked> Enable breath with my microphone</label>
      <p class="privacy">Camera &amp; sound stay on your device.</p>
      <button id="fallback" class="text-button">Try without camera</button>
    </main>
    <section id="calibration" hidden aria-label="Hand calibration">
      <p id="calibration-step">Show an open palm</p>
      <p class="calibration-detail">Keep your hand in the camera view. We’ll learn your comfortable range.</p>
      <button id="skip-calibration">Skip calibration</button>
    </section>
    <nav id="dock" aria-label="Mirror controls" hidden>
      <button id="microphone" aria-pressed="false">Enable breath</button>
      <button id="refog">Add steam</button>
      <button id="tool-toggle" aria-controls="tools">Tools</button>
      
    </nav>
    <section id="tools" hidden aria-label="Mirror tools">
      <label class="field">Mode<select id="mirror-mode" aria-label="Mode"><option value="mirror">Real Mirror</option><option value="writing">Fog Writing</option><option value="reveal">Magic Reveal</option></select></label>
      <label class="field">Writing gesture<select id="writing-grip" aria-label="Writing gesture"><option value="point">Point with index finger</option><option value="pinch">Pinch to write · release to lift</option></select></label>
      <label class="field">Steam strength<input aria-label="Steam strength" id="density" type="range" min="10" max="100" value="75"></label>
      <div id="reveal-editor" hidden>
        <label class="field">Hidden message<textarea aria-label="Hidden message" id="reveal-message" maxlength="180" rows="2">You are here. That is enough.</textarea></label>
        <button id="apply-message">Use message</button>
        <label class="file-label">Use a photo<input id="reveal-file" type="file" accept="image/png,image/jpeg,image/webp"></label>
      </div>
      <label class="field">Breath sensitivity<input id="breath-sensitivity" aria-label="Breath sensitivity" type="range" min="0.5" max="4" step="0.1" value="1"></label>
      <button id="recalibrate-breath">Recalibrate breath</button>
      <p class="microphone-note">Blow toward your microphone. Audio stays on this device.</p>
      <label class="shortcut-option"><input id="hand-shortcuts" type="checkbox"> Extra hand shortcuts <span>Fist to pause · two palms to clear</span></label>
      <button id="recalibrate">Calibrate hand</button>
      <button id="restart-tracking">Restart tracking</button>
      <button id="sound" aria-pressed="false">Enable sound</button>
      <button id="vr" hidden disabled>Optional headset mode</button>
      <button id="photo">Save photo</button>
      <button id="record">Record 10s</button>
      <button id="pause">Pause</button>
      <button id="exit">Close mirror</button>
      <button id="clear">Clear</button>
      <button id="undo">Undo</button>
      <button id="redo">Redo</button>
    </section>
    <div id="breath-feedback" hidden><meter id="breath-meter" aria-label="Microphone input relative to trigger" min="0" max="3" value="0"></meter><span id="breath-message">Listening</span></div>
    <p id="status" role="status" aria-live="polite"></p>
    <section id="graphics-recovery" hidden aria-label="Graphics recovery"><p>The glass needs a fresh start.</p><button id="restart-mirror">Restart mirror</button></section>
    <div id="cursor" aria-hidden="true"></div>
    <footer><span>nothing to keep. unless you want to.</span><span id="footer-note"></span></footer>`;
  return {
    writingGrip: document.querySelector<HTMLSelectElement>("#writing-grip")!,
    graphicsRecovery:
      document.querySelector<HTMLElement>("#graphics-recovery")!,
    restartMirror:
      document.querySelector<HTMLButtonElement>("#restart-mirror")!,
    breathOnStart:
      document.querySelector<HTMLInputElement>("#breath-on-start")!,
    handShortcuts: document.querySelector<HTMLInputElement>("#hand-shortcuts")!,
    restartTracking:
      document.querySelector<HTMLButtonElement>("#restart-tracking")!,
    sound: document.querySelector<HTMLButtonElement>("#sound")!,
    vr: document.querySelector<HTMLButtonElement>("#vr")!,
    photo: document.querySelector<HTMLButtonElement>("#photo")!,
    record: document.querySelector<HTMLButtonElement>("#record")!,
    canvas: document.querySelector<HTMLCanvasElement>("#mirror")!,
    breathFeedback: document.querySelector<HTMLElement>("#breath-feedback")!,
    breathMeter: document.querySelector<HTMLMeterElement>("#breath-meter")!,
    breathMessage: document.querySelector<HTMLElement>("#breath-message")!,
    breathSensitivity: document.querySelector<HTMLInputElement>(
      "#breath-sensitivity",
    )!,
    recalibrateBreath: document.querySelector<HTMLButtonElement>(
      "#recalibrate-breath",
    )!,
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
