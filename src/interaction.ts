import type { GestureState } from "./gestures";
import { catmullRom, type Vec2 } from "./filters";
export type MirrorMode = "mirror" | "writing" | "reveal";
export interface GlassTarget {
  finger(
    x: number,
    y: number,
    down: boolean,
    radius?: number,
    palm?: boolean,
  ): void;
  clear(): void;
  injectBreath(strength: number, ms: number): void;
}
export class Interaction {
  paused = false;
  palette = false;
  mode: MirrorMode = "mirror";
  density = 0.75;
  private previous: Vec2 | null = null;
  private before: Vec2 | null = null;
  private drawing = false;
  private lastGesture = "";
  private pinchOrigin: Vec2 | null = null;
  private pinchDensity = 0;
  constructor(
    private target: GlassTarget,
    private onChange: () => void = () => {},
  ) {}
  lift() {
    if (this.drawing)
      this.target.finger(this.previous?.x || 0, this.previous?.y || 0, false);
    this.drawing = false;
    this.previous = this.before = null;
  }
  update(state: GestureState, point: Vec2 | null, calibrating = false) {
    if (calibrating) {
      this.lift();
      return;
    }
    if (state.action) {
      this.lift();
      if (state.action === "pause") this.paused = !this.paused;
      if (state.action === "palette") this.palette = !this.palette;
      if (state.action === "clear") this.target.clear();
      if (state.action === "reset") this.target.injectBreath(1, 1800);
      this.onChange();
    }
    if (!point || !state.hand || state.gesture === "none") {
      this.lift();
      this.pinchOrigin = null;
      return;
    }
    if (state.gesture === "pinch") {
      this.lift();
      if (!this.pinchOrigin) {
        this.pinchOrigin = { ...point };
        this.pinchDensity = this.density;
      }
      this.density = Math.max(
        0.1,
        Math.min(1, this.pinchDensity + (this.pinchOrigin.y - point.y) * 2),
      );
      this.onChange();
      return;
    }
    this.pinchOrigin = null;
    const palm = state.gesture === "palm" && this.mode !== "writing";
    const draw =
      !this.paused &&
      (state.gesture === "point" || (palm && state.speed > 0.035));
    if (!draw) {
      this.lift();
      return;
    }
    if (this.lastGesture !== state.gesture) {
      this.lift();
      this.lastGesture = state.gesture;
    }
    if (
      this.previous &&
      Math.hypot(point.x - this.previous.x, point.y - this.previous.y) > 0.35
    )
      this.lift();
    const radius = palm
      ? Math.max(
          0.05,
          Math.min(0.14, state.hand.width * 0.55 + state.speed * 0.018),
        )
      : 0.011;
    if (!this.previous)
      this.target.finger(point.x, point.y, true, radius, palm);
    else {
      const a = this.before || this.previous,
        b = this.previous,
        c = point,
        d = {
          x: point.x + (point.x - b.x) * 0.5,
          y: point.y + (point.y - b.y) * 0.5,
        };
      const steps = Math.max(
        1,
        Math.min(24, Math.ceil(Math.hypot(c.x - b.x, c.y - b.y) / 0.012)),
      );
      for (let i = 1; i <= steps; i++) {
        const p = catmullRom(a, b, c, d, i / steps);
        this.target.finger(p.x, p.y, true, radius, palm);
      }
    }
    this.before = this.previous;
    this.previous = { ...point };
    this.drawing = true;
  }
  togglePause() {
    this.paused = !this.paused;
    this.lift();
    this.onChange();
  }
  setMode(mode: MirrorMode) {
    this.mode = mode;
    this.lift();
    this.onChange();
  }
}
