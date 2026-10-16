import { expect, it } from "vitest";
import {
  StrokeMemory,
  isClosed,
  fitPoint,
  RainPaths,
} from "../../src/letters/memory";
import type { Stroke } from "../../src/letters/schema";
it("keeps letter undo/redo aligned with mark groups and bounds long sessions", () => {
  const memory = new StrokeMemory();
  const segment = {
    from: { x: 0.2, y: 0.2 },
    to: { x: 0.3, y: 0.3 },
    radius: 0.01,
    palm: false,
  };
  memory.mark([segment], true, 10);
  memory.mark([{ ...segment, to: { x: 0.4, y: 0.4 } }], false, 40);
  expect(memory.strokes).toHaveLength(1);
  memory.history("undo");
  expect(memory.strokes).toHaveLength(0);
  memory.history("redo");
  expect(memory.strokes[0].points).toHaveLength(3);
  memory.muted = true;
  memory.clear();
  memory.mark([segment], true, 80);
  expect(memory.strokes).toHaveLength(1);
  memory.muted = false;
  for (let i = 0; i < 8000; i++)
    memory.mark(
      [{ ...segment, to: { x: i % 2 ? 0.4 : 0.6, y: 0.5 } }],
      false,
      100 + i * 30,
    );
  expect(
    memory.strokes.reduce((n, s) => n + s.points.length, 0),
  ).toBeLessThanOrEqual(6000);
  expect(memory.full).toBe(true);
});
it("fits handwriting between portrait and landscape without changing aspect", () => {
  const a = fitPoint([0, 0, 0], 2, 0.5),
    b = fitPoint([1, 1, 0], 2, 0.5);
  expect(a).toEqual([0, 0.375, 0]);
  expect(b).toEqual([1, 0.625, 0]);
});
it("recognises only substantial closed strokes as windows", () => {
  const loop: Stroke = {
    radius: 0.01,
    points: Array.from({ length: 32 }, (_, i) => [
      0.5 + Math.cos((i / 31) * Math.PI * 2) * 0.2,
      0.5 + Math.sin((i / 31) * Math.PI * 2) * 0.2,
      i * 30,
    ]),
  };
  expect(isClosed(loop, 1)).toBe(true);
  expect(isClosed({ ...loop, points: loop.points.slice(0, 16) }, 1)).toBe(
    false,
  );
  expect(
    isClosed(
      {
        radius: 0.01,
        points: [
          [0.5, 0.5, 0],
          [0.5, 0.5, 1],
        ],
      },
      1,
    ),
  ).toBe(false);
});
it("rain follows a descending stroke and remains bounded without inventing uphill flow", () => {
  const rain = new RainPaths(),
    strokes: Stroke[] = [
      {
        radius: 0.01,
        points: [
          [0.2, 0.1, 0],
          [0.4, 0.4, 50],
          [0.6, 0.7, 100],
        ],
      },
    ];
  let segments = rain.update(0.9, strokes);
  expect(rain.count).toBe(1);
  expect(segments[0].to.x).toBeGreaterThan(0.2);
  for (let i = 0; i < 600; i++) {
    segments = rain.update(0.016, strokes);
    expect(rain.count).toBeLessThanOrEqual(8);
    expect(segments.every((s) => s.to.y >= s.from.y - 0.001)).toBe(true);
  }
  rain.reset();
  expect(rain.count).toBe(0);
});
