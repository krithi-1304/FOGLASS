import type { HandFrame, HandTrackingProvider } from "./types";
export class MediaPipeHandProvider implements HandTrackingProvider {
  private worker: Worker | undefined;
  private listeners = new Set<(f: HandFrame) => void>();
  private timer: ReturnType<typeof setTimeout> | undefined;
  private video: HTMLVideoElement | undefined;
  private callback = 0;
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
  interval = 33;
  initialize() {
    return new Promise<void>((resolve, reject) => {
      this.rejectInit = reject;
      this.worker = new Worker(new URL("./hand.worker.ts", import.meta.url), {
        type: "module",
      });
      const timeout = setTimeout(
        () => this.fail("Hand model took too long to load"),
        30000,
      );
      this.worker.onerror = () => {
        clearTimeout(timeout);
        this.fail("Hand tracking worker could not start");
      };
      this.worker.onmessage = ({ data }) => {
        if (this.stopped) return;
        if (data.type === "ready") {
          clearTimeout(timeout);
          this.rejectInit = undefined;
          resolve();
        }
        if (data.type === "error") {
          clearTimeout(timeout);
          this.fail(data.message);
        }
        if (data.type === "frame") {
          this.busy = false;
          const now = performance.now();
          this.inferenceMs = data.inferenceMs;
          this.deliveryMs = now - data.timestamp;
          this.fps = this.lastResult ? 1000 / (now - this.lastResult) : 0;
          this.lastResult = now;
          this.frames++;
          this.handCount = data.hands.length;
          // Never draw an old observation after tab suspension or a stalled inference.
          const frame: HandFrame = {
            timestamp: data.timestamp,
            hands: this.deliveryMs < 180 ? data.hands : [],
          };
          for (const cb of this.listeners) cb(frame);
        }
      };
      this.worker.postMessage({
        type: "init",
        base: new URL(import.meta.env.BASE_URL, location.href).href,
      });
    });
  }
  private fail(message: string) {
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
        this.lastVideo = video.currentTime;
        this.lastSent = now;
        void createImageBitmap(video)
          .then((bitmap) => {
            if (this.stopped || !this.worker) {
              bitmap.close();
              return;
            }
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
    clearTimeout(this.timer);
    this.video?.cancelVideoFrameCallback?.(this.callback);
    this.rejectInit?.(new Error("Tracking stopped"));
    this.rejectInit = undefined;
    this.worker?.terminate();
    this.worker = undefined;
    this.listeners.clear();
  }
}
