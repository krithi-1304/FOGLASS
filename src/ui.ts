export function createUI() {
  document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
    <canvas id="mirror" aria-label="Live mirror, or a dusk scene when camera is unavailable"></canvas>
    <div class="edge" aria-hidden="true"></div>
    <header><span>FOGLASS</span><span id="camera-state">CAMERA OFF</span></header>
    <main id="welcome">
      <h1>FOGLASS</h1>
      <p class="invitation">Leave a little of yourself.<br>Let it disappear.</p>
      <p class="instructions">Move your palm to wipe the glass.<br>Point a finger to leave a trace.</p>
      <button id="start">Start <span aria-hidden="true">↗</span></button>
      <p class="privacy">Your camera is processed locally. Video is never uploaded.</p>
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
      <button id="pause">Pause</button>
      <button id="exit">Close mirror</button>
    </nav>
    <section id="tools" hidden aria-label="Mirror tools">
      <button id="recalibrate">Calibrate hand</button>
      <button id="clear">Clear</button>
      <button id="undo">Undo</button>
      <button id="redo">Redo</button>
    </section>
    <p id="status" role="status" aria-live="polite"></p>
    <div id="cursor" aria-hidden="true"></div>
    <footer><span>Take a breath. Stay a while.</span><span id="footer-note">MADE TO DISAPPEAR</span></footer>`;
  return {
    canvas: document.querySelector<HTMLCanvasElement>("#mirror")!,
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
