import {
  parseRecording,
  type GestureRecording,
  type HandFrame,
  type HandTrackingProvider,
} from "./types";
export class MockHandProvider implements HandTrackingProvider {
  private listeners = new Set<(frame: HandFrame) => void>();
  private timer: ReturnType<typeof setTimeout> | undefined;
  private running = false;
  async initialize() {}
  async start() {
    this.running = true;
  }
  onFrame(callback: (frame: HandFrame) => void) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }
  emit(frame: HandFrame) {
    if (this.running)
      for (const cb of this.listeners) cb(structuredClone(frame));
  }
  async replay(input: GestureRecording, realtime = false) {
    const recording = parseRecording(input);
    this.stop();
    this.running = true;
    if (!realtime) {
      for (const frame of recording.frames) this.emit(frame);
      return;
    }
    const start = performance.now(),
      base = recording.frames[0].timestamp;
    for (const frame of recording.frames) {
      if (!this.running) break;
      await new Promise<void>((resolve) => {
        this.cancelWait = resolve;
        this.timer = setTimeout(
          resolve,
          Math.max(0, frame.timestamp - base - (performance.now() - start)),
        );
      });
      this.cancelWait = undefined;
      if (this.running) this.emit(frame);
    }
  }
  private cancelWait: (() => void) | undefined;
  stop() {
    this.running = false;
    clearTimeout(this.timer);
    this.cancelWait?.();
    this.cancelWait = undefined;
  }
}
