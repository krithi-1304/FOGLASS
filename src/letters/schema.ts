export const MAX_LETTER_BYTES = 196608;
export const MAX_POINTS = 6000;
export type Point = [number, number, number];
export interface Stroke {
  points: Point[];
  radius: number;
}
export type LetterTheme = "rose" | "moon" | "rain";
export interface Letter {
  version: 1;
  title: string;
  message: string;
  from: string;
  theme: LetterTheme;
  reveal: "wipe" | "breath";
  effect: "memory" | "rain" | "window";
  aspect: number;
  strokes: Stroke[];
  createdAt: number;
}
const finite = (n: unknown, min: number, max: number): n is number =>
  typeof n === "number" && Number.isFinite(n) && n >= min && n <= max;
const text = (v: unknown, max: number) => {
  if (typeof v !== "string" || v.length > max)
    throw new Error("This letter contains invalid text.");
  return v;
};
export function parseLetter(value: unknown): Letter {
  if (!value || typeof value !== "object")
    throw new Error("This is not a mirror letter.");
  const v = value as Record<string, unknown>;
  if (
    v.version !== 1 ||
    !["rose", "moon", "rain"].includes(String(v.theme)) ||
    !["wipe", "breath"].includes(String(v.reveal)) ||
    !["memory", "rain", "window"].includes(String(v.effect)) ||
    !finite(v.aspect, 0.25, 4) ||
    !finite(v.createdAt, 0, 4102444800000) ||
    !Array.isArray(v.strokes) ||
    v.strokes.length > 300
  )
    throw new Error("This letter format is not supported.");
  let count = 0;
  const strokes = v.strokes.map((raw): Stroke => {
    if (
      !raw ||
      typeof raw !== "object" ||
      !finite(raw.radius, 0.003, 0.2) ||
      !Array.isArray(raw.points) ||
      !raw.points.length
    )
      throw new Error("Invalid handwriting.");
    count += raw.points.length;
    if (count > MAX_POINTS)
      throw new Error("This letter has too much handwriting.");
    let previous = -1;
    const points = raw.points.map((p: unknown): Point => {
      if (
        !Array.isArray(p) ||
        p.length !== 3 ||
        !finite(p[0], 0, 1) ||
        !finite(p[1], 0, 1) ||
        !finite(p[2], 0, 600000) ||
        p[2] < previous
      )
        throw new Error("Invalid handwriting coordinates.");
      previous = p[2];
      return [p[0], p[1], p[2]];
    });
    return { radius: raw.radius, points };
  });
  return {
    version: 1,
    title: text(v.title, 60),
    message: text(v.message, 280),
    from: text(v.from, 40),
    theme: v.theme as LetterTheme,
    reveal: v.reveal as Letter["reveal"],
    effect: v.effect as Letter["effect"],
    aspect: v.aspect,
    strokes,
    createdAt: v.createdAt,
  };
}
export function emptyLetter(): Letter {
  return {
    version: 1,
    title: "A little mist for you",
    message: "",
    from: "",
    theme: "rose",
    reveal: "breath",
    effect: "memory",
    aspect: Math.min(
      4,
      Math.max(
        0.25,
        typeof innerWidth === "number" ? innerWidth / innerHeight : 1.5,
      ),
    ),
    strokes: [],
    createdAt: Date.now(),
  };
}
