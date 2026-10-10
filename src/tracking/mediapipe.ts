import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";
import type { HandFrame, HandTrackingProvider } from "./types";
export class MediaPipeHandProvider implements HandTrackingProvider {
  private model: HandLandmarker | undefined;
  private listeners = new Set<(f: HandFrame) => void>();
  private timer: ReturnType<typeof setTimeout> | undefined;
  private stopped = false;
  private running = false;
  private lastVideo = -1;
  inferenceMs = 0;
  fps = 0;
  frames = 0;
  handCount = 0;
  error = "";
  interval = 33;
  async initialize() {
    const files = await FilesetResolver.forVisionTasks(
      import.meta.env.BASE_URL + "wasm",
    );
    const model = await HandLandmarker.createFromOptions(files, {
      baseOptions: {
        modelAssetPath:
          import.meta.env.BASE_URL + "models/hand_landmarker.task",
        delegate: "GPU",
      },
      runningMode: "VIDEO",
      numHands: 2,
      minHandDetectionConfidence: 0.6,
      minHandPresenceConfidence: 0.6,
      minTrackingConfidence: 0.6,
    });
    if (this.stopped) {
      model.close();
      return;
    }
    this.model = model;
  }
  async start(video: HTMLVideoElement) {
    if (!this.model || this.stopped) return;
    this.running = true;
    let previous = performance.now();
    const tick = () => {
      if (!this.running || this.stopped) return;
      const now = performance.now();
      if (
        video.readyState >= 2 &&
        video.currentTime !== this.lastVideo &&
        !document.hidden
      ) {
        try {
          const result = this.model!.detectForVideo(video, now);
          this.inferenceMs = performance.now() - now;
          this.fps = 1000 / Math.max(1, now - previous);
          previous = now;
          this.frames++;
          this.lastVideo = video.currentTime;
          this.handCount = result.landmarks.length;
          const frame: HandFrame = {
            timestamp: now,
            hands: result.landmarks.map((landmarks, i) => ({
              landmarks,
              confidence: result.handedness[i]?.[0]?.score || 0,
              handedness:
                result.handedness[i]?.[0]?.categoryName === "Left"
                  ? "Left"
                  : "Right",
            })),
          };
          for (const cb of this.listeners) cb(frame);
        } catch (e) {
          this.error = (e as Error).message;
          this.running = false;
          for (const cb of this.listeners) cb({ timestamp: now, hands: [] });
          return;
        }
      }
      this.timer = setTimeout(
        tick,
        Math.max(0, this.interval - (performance.now() - now)),
      );
    };
    tick();
  }
  onFrame(cb: (f: HandFrame) => void) {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }
  stop() {
    this.running = false;
    this.stopped = true;
    clearTimeout(this.timer);
    this.model?.close();
    this.model = undefined;
    this.listeners.clear();
  }
}
