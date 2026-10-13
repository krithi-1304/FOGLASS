import type { Vec2 } from "./filters";
export interface BrushSegment {
  from: Vec2;
  to: Vec2;
  radius: number;
  palm: boolean;
}
// Joint-driven contact footprint, not a circle around the palm centroid.
export function handBrush(
  joints: Vec2[],
  aspect: number,
  previous?: Vec2[],
): BrushSegment[] {
  if (joints.length !== 21) return [];
  const distance = (a: Vec2, b: Vec2) =>
    Math.hypot((a.x - b.x) * aspect, a.y - b.y);
  const width = distance(joints[5], joints[17]);
  const result: BrushSegment[] = [];
  const add = (from: Vec2, to: Vec2, radius: number) =>
    result.push({ from, to, radius, palm: true });
  // The palm is four overlapping metacarpal pads; fingers retain their gaps.
  for (const i of [5, 9, 13, 17])
    add(joints[0], joints[i], Math.max(0.008, width * 0.23));
  for (const base of [1, 5, 9, 13, 17]) {
    for (let k = 0; k < 3; k++)
      add(
        joints[base + k],
        joints[base + k + 1],
        Math.max(0.005, width * (base === 1 ? 0.105 : 0.075)),
      );
  }
  if (previous?.length === 21) {
    // Sweep pads across motion; never bridge a hand teleport.
    const jump = distance(previous[0], joints[0]);
    if (jump < 0.35)
      for (let i = 0; i < 21; i++) {
        if (distance(previous[i], joints[i]) > 0.001)
          add(
            previous[i],
            joints[i],
            Math.max(0.005, width * (i === 0 ? 0.23 : 0.075)),
          );
      }
  }
  return result;
}
