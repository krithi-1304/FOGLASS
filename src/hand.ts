import { GestureEngine, type GestureState } from "./gestures";
import { Calibration, readProfile, saveProfile } from "./calibration";
import { OneEuro, mirrorPoint, type Vec2 } from "./filters";
import { MockHandProvider } from "./tracking/mock";
import type {
  HandTrackingProvider,
  HandFrame,
  GestureRecording,
} from "./tracking/types";
import type { MediaPipeHandProvider } from "./tracking/mediapipe";
export class HandController {
  readonly engine = new GestureEngine();
  readonly calibration = new Calibration();
  private provider: HandTrackingProvider | undefined;
  private filterX = new OneEuro();
  private filterY = new OneEuro();
  private stopped = false;
  private tipMode = false;
  state: GestureState | null = null;
  point: Vec2 | null = null;
  status = "off";
  lastFrame: HandFrame | null = null;
  profile = readProfile();
  constructor(
    private video: HTMLVideoElement,
    private onUpdate: (state: GestureState, point: Vec2 | null) => void,
  ) {
    this.engine.pinchThreshold = this.profile.pinchThreshold;
  }
  private receive = (frame: HandFrame) => {
    this.lastFrame = frame;
    const state = this.engine.update(frame);
    this.state = state;
    if (this.calibration.active && this.calibration.update(state)) {
      this.profile = this.calibration.profile;
      saveProfile(this.profile);
      this.engine.pinchThreshold = this.profile.pinchThreshold;
    }
    if (!state.hand) {
      this.filterX.reset();
      this.filterY.reset();
      this.point = null;
    } else {
      const tipMode = state.raw === "point" || state.raw === "pinch";
      if (tipMode !== this.tipMode) {
        this.filterX.reset();
        this.filterY.reset();
        this.point = null;
      }
      this.tipMode = tipMode;
      const raw = tipMode ? state.hand.index : state.hand.palm;
      const mapped = mirrorPoint(
        raw,
        (this.video.videoWidth || 1280) / (this.video.videoHeight || 720),
        innerWidth / innerHeight,
      );
      const next = {
        x: this.filterX.filter(mapped.x, frame.timestamp),
        y: this.filterY.filter(mapped.y, frame.timestamp),
      };
      if (
        !this.point ||
        Math.hypot(next.x - this.point.x, next.y - this.point.y) >
          Math.max(0.001, this.profile.jitter * 0.5)
      )
        this.point = next;
    }
    this.onUpdate(state, this.point);
  };
  async start(mock = false) {
    this.status = "loading";
    try {
      if (mock) this.provider = new MockHandProvider();
      else {
        const { MediaPipeHandProvider } = await import("./tracking/mediapipe");
        this.provider = new MediaPipeHandProvider();
      }
      if (this.stopped) {
        this.provider.stop();
        return;
      }
      this.provider.onFrame(this.receive);
      await this.provider.initialize();
      if (this.stopped) {
        this.provider.stop();
        return;
      }
      await this.provider.start(this.video);
      this.status = "ready";
    } catch {
      this.status = "unavailable";
      this.provider?.stop();
    }
  }
  beginCalibration() {
    this.calibration.begin();
  }
  skipCalibration() {
    this.calibration.skip();
  }
  async replay(recording: GestureRecording, realtime = false) {
    if (!(this.provider instanceof MockHandProvider))
      throw new Error("Replay requires mock mode");
    this.engine.reset();
    this.filterX.reset();
    this.filterY.reset();
    this.point = null;
    await this.provider.replay(recording, realtime);
  }
  metrics() {
    const provider = this.provider as MediaPipeHandProvider | undefined;
    return {
      status: provider?.error ? "unavailable" : this.status,
      inferenceMs: provider?.inferenceMs || 0,
      deliveryMs: provider?.deliveryMs || 0,
      inferenceFps: provider?.fps || 0,
      handCount: this.state?.count || 0,
      frames: provider?.frames || 0,
    };
  }
  stop() {
    this.stopped = true;
    this.provider?.stop();
    this.point = null;
    this.status = "off";
  }
}
