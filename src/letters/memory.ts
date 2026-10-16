import type { BrushSegment } from "../brush";
import { MAX_POINTS, type Stroke, type Point } from "./schema";
export class StrokeMemory {
  strokes: Stroke[] = [];
  private undo: Stroke[][] = [];
  private redo: Stroke[][] = [];
  private started = 0;
  private count = 0;
  private lastPalm = 0;
  private continuing = false;
  muted = false;
  full = false;
  mark(segments: BrushSegment[], begin: boolean, now = performance.now()) {
    if (this.muted || !segments.length || this.full) return;
    if (begin) {
      this.undo.push(structuredClone(this.strokes));
      if (this.undo.length > 8) this.undo.shift();
      this.redo = [];
      this.continuing = false;
    }
    if (segments.length > 1 && !begin && now - this.lastPalm < 100) return;
    if (segments.length > 1) this.lastPalm = now;
    if (!this.started) this.started = now;
    const t = Math.min(600000, Math.round(now - this.started));
    const point = (p: { x: number; y: number }): Point => [
      Math.round(Math.max(0, Math.min(1, p.x)) * 10000) / 10000,
      Math.round(Math.max(0, Math.min(1, p.y)) * 10000) / 10000,
      t,
    ];
    for (const segment of segments) {
      if (this.count >= MAX_POINTS - 2 || this.strokes.length >= 300) {
        this.full = true;
        break;
      }
      const last = this.strokes.at(-1),
        next = point(segment.to);
      if (
        segments.length === 1 &&
        this.continuing &&
        last &&
        Math.abs(last.radius - segment.radius) < 0.001
      ) {
        const p = last.points.at(-1)!;
        if (Math.hypot(p[0] - next[0], p[1] - next[1]) < 0.0015) continue;
        last.points.push(next);
        this.count++;
      } else {
        this.strokes.push({
          radius: Math.max(0.003, Math.min(0.2, segment.radius)),
          points: [point(segment.from), next],
        });
        this.count += 2;
      }
    }
    this.continuing = segments.length === 1;
  }
  history(direction: "undo" | "redo") {
    if (this.muted) return;
    const from = direction === "undo" ? this.undo : this.redo,
      to = direction === "undo" ? this.redo : this.undo;
    const previous = from.pop();
    if (!previous) return;
    to.push(structuredClone(this.strokes));
    this.strokes = previous;
    this.recount();
  }
  replace(strokes: Stroke[]) {
    this.strokes = structuredClone(strokes);
    this.undo = [];
    this.redo = [];
    this.started = 0;
    this.recount();
  }
  clear() {
    if (!this.muted) this.replace([]);
  }
  private recount() {
    this.count = this.strokes.reduce((n, s) => n + s.points.length, 0);
    this.full = this.count >= MAX_POINTS - 2;
    this.continuing = false;
  }
}
export function isClosed(stroke: Stroke, aspect: number) {
  const p = stroke.points;
  if (p.length < 8) return false;
  const first = p[0],
    last = p.at(-1)!;
  let length = 0;
  for (let i = 1; i < p.length; i++)
    length += Math.hypot(
      (p[i][0] - p[i - 1][0]) * aspect,
      p[i][1] - p[i - 1][1],
    );
  return (
    length > 0.18 &&
    Math.hypot((first[0] - last[0]) * aspect, first[1] - last[1]) < 0.045
  );
}
/** Fit the authored glass inside another viewport without distorting handwriting. */
export function fitPoint(
  p: Point,
  sourceAspect: number,
  targetAspect: number,
): Point {
  const x = Math.min(1, sourceAspect / targetAspect),
    y = Math.min(1, targetAspect / sourceAspect);
  return [0.5 + (p[0] - 0.5) * x, 0.5 + (p[1] - 0.5) * y, p[2]];
}
export class RainPaths {
  private drops: {
    points: Point[];
    index: number;
    x: number;
    y: number;
    age: number;
  }[] = [];
  private since = 0;
  private next = 0;
  get count() {
    return this.drops.length;
  }
  reset() {
    this.drops = [];
    this.since = 0;
    this.next = 0;
  }
  update(dt: number, strokes: Stroke[]): BrushSegment[] {
    this.since += dt;
    if (strokes.length && this.since > 0.8 && this.drops.length < 8) {
      this.since = 0;
      let points = strokes[this.next++ % strokes.length].points;
      if (points.length > 1) {
        if (points[0][1] > points.at(-1)![1]) points = [...points].reverse();
        this.drops.push({
          points,
          index: 1,
          x: points[0][0],
          y: points[0][1],
          age: 0,
        });
      }
    }
    const segments: BrushSegment[] = [];
    for (const d of this.drops) {
      const from = { x: d.x, y: d.y };
      let distance = dt * 0.13;
      d.age += dt;
      while (distance > 0 && d.index < d.points.length) {
        const p = d.points[d.index],
          length = Math.hypot(p[0] - d.x, p[1] - d.y);
        if (p[1] < d.y - 0.015) {
          d.index = d.points.length;
          break;
        }
        if (length <= distance) {
          d.x = p[0];
          d.y = p[1];
          distance -= length;
          d.index++;
        } else {
          d.x += ((p[0] - d.x) * distance) / length;
          d.y += ((p[1] - d.y) * distance) / length;
          distance = 0;
        }
      }
      if (d.index >= d.points.length) d.y += distance;
      segments.push({
        from,
        to: { x: d.x, y: d.y },
        radius: 0.005,
        palm: false,
        water: true,
      });
    }
    this.drops = this.drops.filter((d) => d.y < 1.02 && d.age < 15);
    return segments;
  }
}
