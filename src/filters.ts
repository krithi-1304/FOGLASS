export interface Vec2 {
  x: number;
  y: number;
}
const alpha = (cutoff: number, dt: number) =>
  1 / (1 + 1 / (2 * Math.PI * cutoff * dt));
export class OneEuro {
  private value: number | null = null;
  private raw = 0;
  private derivative = 0;
  private last = 0;
  constructor(
    public minCutoff = 1.7,
    public beta = 0.12,
  ) {}
  filter(value: number, time: number) {
    if (this.value === null) {
      this.value = this.raw = value;
      this.last = time;
      return value;
    }
    const dt = Math.max(0.001, Math.min(0.2, (time - this.last) / 1000));
    this.derivative +=
      alpha(1, dt) * ((value - this.raw) / dt - this.derivative);
    const next =
      this.value +
      alpha(this.minCutoff + this.beta * Math.abs(this.derivative), dt) *
        (value - this.value);
    this.raw = value;
    this.last = time;
    this.value = next;
    return next;
  }
  reset() {
    this.value = null;
    this.derivative = 0;
  }
}
export function catmullRom(
  a: Vec2,
  b: Vec2,
  c: Vec2,
  d: Vec2,
  t: number,
): Vec2 {
  const axis = (k: "x" | "y") =>
    0.5 *
    (2 * b[k] +
      (-a[k] + c[k]) * t +
      (2 * a[k] - 5 * b[k] + 4 * c[k] - d[k]) * t * t +
      (-a[k] + 3 * b[k] - 3 * c[k] + d[k]) * t * t * t);
  return { x: axis("x"), y: axis("y") };
}
export function mirrorPoint(
  p: Vec2,
  videoAspect: number,
  screenAspect: number,
): Vec2 {
  const cx = Math.min(1, screenAspect / videoAspect),
    cy = Math.min(1, videoAspect / screenAspect);
  return { x: 0.5 + (0.5 - p.x) / cx, y: 0.5 + (p.y - 0.5) / cy };
}
