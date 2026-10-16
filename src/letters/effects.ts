import type { Renderer } from "../renderer";
import type { Letter, Stroke } from "./schema";
import { fitPoint, isClosed, RainPaths, StrokeMemory } from "./memory";
export class LetterEffects {
  readonly memory = new StrokeMemory();
  private rain = new RainPaths();
  private reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  private projected: Stroke[] = [];
  private projectedAspect = 0;
  letter: Letter | null = null;
  private glow = 0;
  private replayTime = -1;
  private replayIndex = 0;
  private replaySegments: {
    at: number;
    from: { x: number; y: number };
    to: { x: number; y: number };
    radius: number;
    palm: boolean;
  }[] = [];
  constructor(private renderer: Renderer) {
    renderer.fog.observer = {
      mark: (s, b) => this.memory.mark(s, b),
      clear: () => this.memory.clear(),
      history: (d) => this.memory.history(d),
      breath: () => {
        this.glow = 1;
      },
    };
    renderer.frameHook = (dt) => this.tick(dt);
  }
  private layer(letter: Letter) {
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(1024 * Math.min(1, letter.aspect));
    canvas.height = Math.round(1024 * Math.min(1, 1 / letter.aspect));
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = "lighter";
    for (const s of letter.strokes) {
      if (letter.effect === "window" && isClosed(s, letter.aspect)) {
        ctx.beginPath();
        s.points.forEach((p, i) =>
          i
            ? ctx.lineTo(p[0] * canvas.width, p[1] * canvas.height)
            : ctx.moveTo(p[0] * canvas.width, p[1] * canvas.height),
        );
        ctx.closePath();
        ctx.fillStyle = "#00ff00";
        ctx.fill();
      }
      ctx.strokeStyle = "#ff0000";
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineWidth = s.radius * canvas.height * 1.8;
      ctx.beginPath();
      s.points.forEach((p, i) =>
        i
          ? ctx.lineTo(p[0] * canvas.width, p[1] * canvas.height)
          : ctx.moveTo(p[0] * canvas.width, p[1] * canvas.height),
      );
      ctx.stroke();
    }
    const lines: string[] = [];
    let line = "";
    for (const word of letter.message.split(/\s+/)) {
      if ((line + " " + word).length > 28 && line) {
        lines.push(line);
        line = "";
      }
      line += (line ? " " : "") + word;
    }
    if (line) lines.push(line);
    const size = Math.min(
      canvas.width * 0.07,
      canvas.height * 0.075,
      (canvas.height * 0.6) / Math.max(lines.length, 1),
    );
    ctx.fillStyle = "#ff0000";
    ctx.textAlign = "center";
    ctx.font = `${size}px "Instrument Serif",serif`;
    lines.forEach((text, i) =>
      ctx.fillText(
        text,
        canvas.width * 0.5,
        canvas.height * 0.5 + (i - (lines.length - 1) / 2) * size * 1.25,
        canvas.width * 0.86,
      ),
    );
    return canvas;
  }
  async open(letter: Letter) {
    this.stop();
    this.letter = structuredClone(letter);
    this.rain.reset();
    this.projectedAspect = 0;
    this.memory.muted = true;
    this.renderer.fog.seedCoverage(0.88);
    this.memory.muted = false;
    this.memory.replace(letter.strokes);
    this.memory.muted = true;
    this.renderer.reveal = false;
    this.renderer.letterMode = letter.reveal === "breath" ? 2 : 1;
    this.renderer.letterAspect = letter.aspect;
    this.renderer.windowMode = letter.effect === "window";
    this.renderer.themeTone = { rose: 1, moon: 2, rain: 3 }[letter.theme];
    this.glow = 0;
    const current = this.letter;
    await document.fonts.ready;
    if (this.letter === current) this.renderer.setLetter(this.layer(letter));
  }
  close() {
    this.memory.muted = false;
    this.stop();
    this.letter = null;
    this.rain.reset();
    this.renderer.letterMode = 0;
    this.renderer.themeTone = 0;
    this.renderer.windowMode = false;
    this.glow = 0;
  }
  replay() {
    const letter = this.letter;
    if (!letter) return;
    this.replaySegments = [];
    let time = 0;
    for (const stroke of letter.strokes) {
      const p = stroke.points;
      for (let i = 0; i < p.length; i++) {
        const a = fitPoint(
            p[Math.max(0, i - 1)],
            letter.aspect,
            innerWidth / innerHeight,
          ),
          b = fitPoint(p[i], letter.aspect, innerWidth / innerHeight);
        time += i ? Math.min(70, Math.max(12, p[i][2] - p[i - 1][2])) : 160;
        this.replaySegments.push({
          at: time,
          from: { x: a[0], y: a[1] },
          to: { x: b[0], y: b[1] },
          radius:
            stroke.radius *
            Math.min(1, innerWidth / innerHeight / letter.aspect),
          palm: false,
        });
      }
    }
    const duration = Math.max(time, 1);
    if (duration > 10000)
      this.replaySegments.forEach((s) => (s.at *= 10000 / duration));
    this.replayTime = 0;
    this.replayIndex = 0;
  }
  stop() {
    this.replayTime = -1;
    this.replaySegments = [];
  }
  get playing() {
    return this.replayTime >= 0;
  }
  get droplets() {
    return this.rain.count;
  }
  private tick(dt: number) {
    if (!this.letter) return;
    this.glow = Math.max(0, this.glow - dt * 0.22);
    this.renderer.memoryGlow = this.glow;
    if (this.replayTime >= 0) {
      this.replayTime += dt * 1000;
      const batch = [];
      while (
        this.replayIndex < this.replaySegments.length &&
        this.replaySegments[this.replayIndex].at <= this.replayTime
      )
        batch.push(this.replaySegments[this.replayIndex++]);
      this.renderer.fog.effect(batch);
      if (this.replayIndex >= this.replaySegments.length) this.replayTime = -1;
    }
    if (this.letter.effect === "rain" && !this.reducedMotion.matches) {
      const aspect = innerWidth / innerHeight;
      if (aspect !== this.projectedAspect) {
        this.projectedAspect = aspect;
        this.projected = this.letter.strokes.map((s) => ({
          ...s,
          points: s.points.map((p) => fitPoint(p, this.letter!.aspect, aspect)),
        }));
      }
      this.renderer.fog.effect(this.rain.update(dt, this.projected));
    }
  }
}
