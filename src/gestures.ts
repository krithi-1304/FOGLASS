import type { HandFrame, Point, TrackedHand } from "./tracking/types";
import type { Vec2 } from "./filters";
export type Gesture =
  "none" | "palm" | "point" | "pinch" | "fist" | "victory" | "two-palms";
export interface HandFeatures {
  palm: Vec2;
  index: Vec2;
  thumb: Vec2;
  width: number;
  pinch: number;
  extended: boolean[];
  confidence: number;
  handedness: "Left" | "Right";
}
export const distance = (a: Vec2, b: Vec2) => Math.hypot(a.x - b.x, a.y - b.y);
export function features(hand: TrackedHand): HandFeatures {
  const p = hand.landmarks;
  const width = Math.max(0.015, distance(p[5], p[17]));
  const extended = [8, 12, 16, 20].map((tip) => {
    const a = p[tip - 2],
      b = p[tip - 1],
      c = p[tip];
    const ux = a.x - b.x,
      uy = a.y - b.y,
      vx = c.x - b.x,
      vy = c.y - b.y;
    const cosine =
      (ux * vx + uy * vy) /
      Math.max(0.000001, Math.hypot(ux, uy) * Math.hypot(vx, vy));
    return cosine < -0.55 && distance(c, p[0]) > distance(a, p[0]) * 1.12;
  });
  const palm = [0, 5, 9, 13, 17]
    .map((i) => p[i])
    .reduce((a: Point, b) => ({ x: a.x + b.x / 5, y: a.y + b.y / 5, z: 0 }), {
      x: 0,
      y: 0,
      z: 0,
    });
  return {
    palm,
    index: p[8],
    thumb: p[4],
    width,
    pinch: distance(p[4], p[8]) / width,
    extended,
    confidence: hand.confidence,
    handedness: hand.handedness,
  };
}
export interface GestureState {
  gesture: Gesture;
  raw: Gesture;
  since: number;
  timestamp: number;
  hand: HandFeatures | null;
  count: number;
  velocity: Vec2;
  speed: number;
  action: "clear" | "pause" | "palette" | "reset" | null;
}
export class GestureEngine {
  confidence = 0.65;
  pinchThreshold = 0.23;
  dwell = 140;
  private candidate: Gesture = "none";
  private candidateSince = 0;
  private stable: Gesture = "none";
  private since = 0;
  private fired = false;
  private cooldownUntil = 0;
  private prior: { p: Vec2; t: number } | null = null;
  private stationarySince = 0;
  private pinched = false;
  private primary: HandFeatures | null = null;
  update(frame: HandFrame): GestureState {
    const valid = frame.hands
      .filter(
        (h) => h.confidence >= this.confidence && h.landmarks.length === 21,
      )
      .map(features);
    if (this.primary) {
      const previous = this.primary;
      const score = (h: HandFeatures) =>
        distance(h.palm, previous.palm) +
        (h.handedness === previous.handedness ? 0 : 0.3);
      valid.sort((a, b) => score(a) - score(b));
    }
    const hand = valid[0] || null;
    this.primary = hand;
    let raw: Gesture = "none";
    if (hand) {
      const e = hand.extended;
      this.pinched =
        hand.pinch < this.pinchThreshold * (this.pinched ? 1.4 : 1);
      if (valid.length === 2 && valid.every((h) => h.extended.every(Boolean)))
        raw = "two-palms";
      else if (this.pinched) raw = "pinch";
      else if (e.every((x) => !x)) raw = "fist";
      else if (e[0] && e[1] && !e[2] && !e[3]) raw = "victory";
      else if (e[0] && !e[1] && !e[2] && !e[3]) raw = "point";
      else if (e.every(Boolean)) raw = "palm";
    } else {
      this.pinched = false;
      this.prior = null;
    }
    if (raw !== this.candidate) {
      this.candidate = raw;
      this.candidateSince = frame.timestamp;
      this.fired = false;
    }
    if (raw === "none" || raw !== this.stable) this.stable = "none";
    if (raw !== "none" && frame.timestamp - this.candidateSince >= this.dwell) {
      if (this.stable !== raw) {
        this.stable = raw;
        this.since = this.candidateSince;
      }
    }
    let velocity = { x: 0, y: 0 };
    if (hand && this.prior) {
      const dt = Math.max(0.001, (frame.timestamp - this.prior.t) / 1000);
      velocity = {
        x: (hand.palm.x - this.prior.p.x) / dt,
        y: (hand.palm.y - this.prior.p.y) / dt,
      };
    }
    if (hand) this.prior = { p: hand.palm, t: frame.timestamp };
    const speed = Math.hypot(velocity.x, velocity.y);
    if (raw !== "palm" || speed > 0.035) this.stationarySince = frame.timestamp;
    let action: GestureState["action"] = null;
    if (!this.fired && frame.timestamp >= this.cooldownUntil) {
      const elapsed = frame.timestamp - this.since;
      if (this.stable === "two-palms" && elapsed >= 600) action = "clear";
      if (this.stable === "fist" && elapsed >= 800) action = "pause";
      if (this.stable === "victory" && elapsed >= 500) action = "palette";
      if (
        this.stable === "palm" &&
        frame.timestamp - this.stationarySince >= 2500
      )
        action = "reset";
      if (action) {
        this.fired = true;
        this.cooldownUntil = frame.timestamp + 1000;
      }
    }
    return {
      gesture: this.stable,
      raw,
      since: this.since,
      timestamp: frame.timestamp,
      hand,
      count: valid.length,
      velocity,
      speed,
      action,
    };
  }
  reset() {
    this.candidate = this.stable = "none";
    this.primary = null;
    this.prior = null;
    this.fired = false;
    this.pinched = false;
    this.cooldownUntil = 0;
    this.stationarySince = 0;
  }
}
