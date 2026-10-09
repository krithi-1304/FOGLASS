export function createUI() {
  document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
    <canvas id="mirror" aria-label="Live mirror, or a dusk scene when camera is unavailable"></canvas>
    <div class="edge" aria-hidden="true"></div>
    <header><span>FOGLASS</span><span>A MOMENT ON GLASS</span></header>
    <main id="welcome">
      <h1>FOGLASS</h1>
      <p class="invitation">Leave a little of yourself.<br>Let it disappear.</p>
      <p class="instructions">Hold B to fog the glass.<br>Drag to leave a trace.</p>
      <button id="start">Start <span aria-hidden="true">↗</span></button>
      <p class="privacy">Camera & microphone stay on your device.</p>
      <button id="fallback" class="text-button">Try without camera</button>
    </main>
    <p id="status" role="status" aria-live="polite"></p>
    <div id="cursor" aria-hidden="true"></div>
    <footer><span>Take a breath. Stay a while.</span><span id="footer-note">MADE TO DISAPPEAR</span></footer>`;
  return {
    canvas: document.querySelector<HTMLCanvasElement>("#mirror")!,
    fallback: document.querySelector<HTMLButtonElement>("#fallback")!,
    start: document.querySelector<HTMLButtonElement>("#start")!,
    status: document.querySelector<HTMLParagraphElement>("#status")!,
    welcome: document.querySelector<HTMLElement>("#welcome")!,
    cursor: document.querySelector<HTMLDivElement>("#cursor")!,
  };
}
