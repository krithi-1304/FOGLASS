import type { GestureState } from "./gestures";
export interface CalibrationProfile {
  version: 1;
  minX: number;
  maxX: number;
  palmWidth: number;
  pinchThreshold: number;
  jitter: number;
  handedness: "Left" | "Right";
}
export const defaultProfile: CalibrationProfile = {
  version: 1,
  minX: 0.15,
  maxX: 0.85,
  palmWidth: 0.16,
  pinchThreshold: 0.23,
  jitter: 0.002,
  handedness: "Right",
};
export const calibrationSteps = [
  "Show an open palm",
  "Move your hand left",
  "Now move right",
  "Point with your index finger",
  "Bring thumb and index together",
  "You’re ready",
];
export class Calibration {
  step = 0;
  active = false;
  private since = 0;
  private samples: number[] = [];
  profile = { ...defaultProfile };
  begin() {
    this.active = true;
    this.step = 0;
    this.since = 0;
    this.samples = [];
    this.profile = { ...defaultProfile };
  }
  update(state: GestureState) {
    if (!this.active || !state.hand || state.gesture === "none") {
      this.since = 0;
      return false;
    }
    const h = state.hand,
      x = 1 - h.palm.x;
    const eligible =
      this.step === 0
        ? state.gesture === "palm"
        : this.step === 1
          ? state.gesture === "palm" && x < 0.4
          : this.step === 2
            ? state.gesture === "palm" && x > 0.6
            : this.step === 3
              ? state.gesture === "point"
              : state.gesture === "pinch";
    if (!eligible) {
      this.since = 0;
      return false;
    }
    if (!this.since) this.since = state.timestamp;
    if (this.step === 0) {
      this.samples.push(x);
      this.profile.palmWidth = h.width;
      this.profile.handedness = h.handedness;
    }
    if (this.step === 1) this.profile.minX = Math.min(this.profile.minX, x);
    if (this.step === 2) this.profile.maxX = Math.max(this.profile.maxX, x);
    if (this.step === 4)
      this.profile.pinchThreshold = Math.max(
        0.12,
        Math.min(0.4, h.pinch * 1.5),
      );
    if (state.timestamp - this.since < 450) return false;
    if (this.step === 0 && this.samples.length > 1) {
      const mean =
        this.samples.reduce((a, b) => a + b, 0) / this.samples.length;
      this.profile.jitter = Math.min(
        0.015,
        Math.sqrt(
          this.samples.reduce((a, b) => a + (b - mean) ** 2, 0) /
            this.samples.length,
        ),
      );
    }
    this.step++;
    this.since = 0;
    if (this.step === 5) {
      this.active = false;
      return true;
    }
    return false;
  }
  skip() {
    this.active = false;
  }
}
export function readProfile(): CalibrationProfile {
  try {
    const p = JSON.parse(
      localStorage.getItem("foglass.calibration.v1") || "null",
    );
    if (
      p?.version === 1 &&
      [p.minX, p.maxX, p.palmWidth, p.pinchThreshold, p.jitter].every(
        Number.isFinite,
      ) &&
      p.minX >= 0 &&
      p.maxX <= 1 &&
      p.maxX - p.minX > 0.2 &&
      p.palmWidth > 0.02 &&
      p.palmWidth < 1 &&
      p.pinchThreshold >= 0.1 &&
      p.pinchThreshold <= 0.5 &&
      p.jitter >= 0 &&
      p.jitter < 0.05 &&
      ["Left", "Right"].includes(p.handedness)
    )
      return p;
  } catch {
    /* Storage may be unavailable; defaults remain usable. */
  }
  return { ...defaultProfile };
}
export function saveProfile(profile: CalibrationProfile) {
  try {
    localStorage.setItem("foglass.calibration.v1", JSON.stringify(profile));
  } catch {
    /* Calibration still works for this session. */
  }
}
