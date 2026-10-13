import type { HandFrame, HandTrackingProvider } from "./types";
export class MediaPipeHandProvider implements HandTrackingProvider {
  private worker: Worker | undefined;
  private listeners = new Set<(f: HandFrame) => void>();
  private timer: ReturnType<typeof setTimeout> | undefined;
  private video: HTMLVideoElement | undefined;
  private callback = 0;
  private initTimeout: ReturnType<typeof setTimeout> | undefined;
  private watchdog: ReturnType<typeof setInterval> | undefined;
  private hasHand = false;
  private stopped = false;
  private busy = false;
  private lastVideo = -1;
  private lastSent = -Infinity;
  private lastResult = 0;
  private rejectInit: ((reason: Error) => void) | undefined;
  inferenceMs = 0;
  deliveryMs = 0;
  fps = 0;
  frames = 0;
  handCount = 0;
  error = "";
  stage = "loading";
  delegate = "GPU";
  interval = 33;
  initialize() {
    return new Promise<void>((resolve, reject) => {
      this.rejectInit = reject;
      this.worker = new Worker(new URL("./hand.worker.ts", import.meta.url), {
        type: "module",
      });
      this.initTimeout = setTimeout(
        () => this.fail("Hand model took too long to load"),
        30000,
      );
      this.worker.onerror = () => {
        clearTimeout(this.initTimeout);
        this.fail("Hand tracking worker could not start");
      };
      this.worker.onmessage = ({ data }) => {
        if (this.stopped) return;
        if (data.type === "ready") {
          clearTimeout(this.initTimeout);
          this.rejectInit = undefined;
          resolve();
        }
        if (data.type === "error") {
          clearTimeout(this.initTimeout);
          this.fail(data.message);
        }
        if (data.type === "frame") {
          this.busy = false;
          this.stage = "waiting";
          const now = performance.now();
          this.inferenceMs = data.inferenceMs;
          this.delegate = data.delegate;
          this.deliveryMs = now - data.timestamp;
          this.fps = this.lastResult ? 1000 / (now - this.lastResult) : 0;
          this.lastResult = now;
          this.frames++;
          this.handCount = data.hands.length;
          // Reject suspension/queue stalls, not every valid result from a slower backend.
          const frame: HandFrame = {
            timestamp: data.timestamp,
            hands:
              !document.hidden &&
              this.deliveryMs < 400 &&
              this.deliveryMs - this.inferenceMs < 150
                ? data.hands
                : [],
          };
          this.hasHand = frame.hands.length > 0;
          for (const cb of this.listeners) cb(frame);
        }
      };
      this.worker.postMessage({
        type: "init",
        base: new URL(import.meta.env.BASE_URL, location.href).href,
      });
    });
  }
  private clearTimers() {
    clearTimeout(this.initTimeout);
    clearTimeout(this.timer);
    clearInterval(this.watchdog);
    this.video?.cancelVideoFrameCallback?.(this.callback);
  }
  private fail(message: string) {
    this.clearTimers();
    this.hasHand = false;
    this.error = message;
    this.busy = false;
    this.rejectInit?.(new Error(message));
    this.rejectInit = undefined;
    for (const cb of this.listeners)
      cb({ timestamp: performance.now(), hands: [] });
    this.worker?.terminate();
    this.worker = undefined;
  }
  async start(video: HTMLVideoElement) {
    this.video = video;
    clearInterval(this.watchdog);
    // Independent of camera callbacks: frozen video must release the pen too.
    this.watchdog = setInterval(() => {
      const now = performance.now();
      if (this.hasHand && (document.hidden || now - this.lastResult > 400)) {
        this.hasHand = false;
        this.handCount = 0;
        this.fps = 0;
        for (const cb of this.listeners) cb({ timestamp: now, hands: [] });
      }
      // Initial GPU shader compilation/backend comparison can take seconds.
      const timeout = this.frames < 8 ? 20000 : 3000;
      if (this.busy && now - this.lastSent > timeout)
        this.fail(
          "Hand tracking stalled. Use mouse/touch or restart the mirror.",
        );
    }, 100);
    const tick = () => {
      if (this.stopped || !this.worker) return;
      const now = performance.now();
      if (
        !this.busy &&
        !document.hidden &&
        video.readyState >= 2 &&
        video.currentTime !== this.lastVideo &&
        now - this.lastSent >= this.interval - 2
      ) {
        this.busy = true;
        this.stage = "copying frame";
        this.lastVideo = video.currentTime;
        this.lastSent = now;
        void createImageBitmap(video)
          .then((bitmap) => {
            if (this.stopped || !this.worker) {
              bitmap.close();
              return;
            }
            this.stage = "running inference";
            this.worker.postMessage({ type: "frame", bitmap, timestamp: now }, [
              bitmap,
            ]);
          })
          .catch(() => this.fail("Could not read the camera frame"));
      }
      if (typeof video.requestVideoFrameCallback === "function")
        this.callback = video.requestVideoFrameCallback(tick);
      else this.timer = setTimeout(tick, this.interval);
    };
    tick();
  }
  onFrame(cb: (f: HandFrame) => void) {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }
  stop() {
    this.stopped = true;
    this.clearTimers();
    this.rejectInit?.(new Error("Tracking stopped"));
    this.rejectInit = undefined;
    this.worker?.terminate();
    this.worker = undefined;
    this.listeners.clear();
  }
}
