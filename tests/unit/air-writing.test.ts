import { expect, it } from "vitest";
import fs from "node:fs";
import { Interaction } from "../../src/interaction";
import { GestureEngine, type GestureState } from "../../src/gestures";
import { parseRecording } from "../../src/tracking/types";
const fixture = (name: string) =>
  parseRecording(
    JSON.parse(
      fs.readFileSync(
        new URL("../fixtures/gestures/" + name + ".json", import.meta.url),
        "utf8",
      ),
    ),
  );
const point = fixture("index-draw-line").frames[0].hands[0];
function state(time: number): GestureState {
  const engine = new GestureEngine();
  engine.update({ timestamp: 0, hands: [point] });
  return {
    ...engine.update({ timestamp: 40, hands: [point] }),
    timestamp: time,
  };
}
function setup() {
  const events: { x: number; y: number; down: boolean }[] = [];
  const interaction = new Interaction({
    finger: (x, y, down) => events.push({ x, y, down }),
    clear() {},
    injectBreath() {},
  });
  return { events, interaction };
}
it("does not join handwriting across a delayed inference result", () => {
  const { events, interaction } = setup();
  interaction.update(state(40), { x: 0.3, y: 0.5 });
  events.length = 0;
  interaction.update(state(300), { x: 0.5, y: 0.5 });
  expect(events.some((e) => !e.down)).toBe(true);
  expect(events.filter((e) => e.down).every((e) => e.x === 0.5)).toBe(true);
});
it("lifts at the edge instead of writing offscreen and bridging the return", () => {
  const { events, interaction } = setup();
  interaction.update(state(40), { x: 0.95, y: 0.5 });
  events.length = 0;
  interaction.update(state(73), { x: 1.05, y: 0.5 });
  expect(events.some((e) => !e.down)).toBe(true);
  expect(events.some((e) => e.down)).toBe(false);
});
it("an open palm releases the writing gesture immediately", () => {
  const engine = new GestureEngine();
  engine.update({ timestamp: 0, hands: [point] });
  engine.update({ timestamp: 40, hands: [point] });
  const palm = fixture("open-palm-left").frames[0].hands[0];
  expect(engine.update({ timestamp: 73, hands: [palm] }).gesture).not.toBe(
    "point",
  );
});
it("pinch writing is deliberate and does not change fog density", () => {
  const { events, interaction } = setup();
  interaction.setMode("writing");
  interaction.writingGrip = "pinch";
  const s = state(40);
  s.gesture = s.raw = "pinch";
  interaction.update(s, { x: 0.4, y: 0.4 });
  expect(events.some((e) => e.down)).toBe(true);
  expect(interaction.density).toBe(0.75);
  events.length = 0;
  interaction.update(state(73), { x: 0.5, y: 0.4 });
  expect(events.some((e) => !e.down)).toBe(true);
  expect(events.some((e) => e.down)).toBe(false);
});
it("small loops retain both axes and sharp corners stay within the sampled segment", () => {
  const { events, interaction } = setup();
  const points = [
    { x: 0.5, y: 0.5 },
    { x: 0.505, y: 0.5 },
    { x: 0.505, y: 0.505 },
    { x: 0.5, y: 0.505 },
    { x: 0.5, y: 0.5 },
  ];
  points.forEach((p, i) => interaction.update(state(40 + i * 33), p));
  const drawn = events.filter((e) => e.down);
  expect(drawn.length).toBeGreaterThanOrEqual(5);
  expect(
    drawn.every(
      (p) => p.x >= 0.5 && p.x <= 0.505 && p.y >= 0.5 && p.y <= 0.505,
    ),
  ).toBe(true);
});

it("keeps visible fingertips wiping when the palm centre moves beyond the glass edge", () => {
  let wipes = 0;
  const interaction = new Interaction({
    finger() {},
    clear() {},
    injectBreath() {},
    wipe() {
      wipes++;
    },
  });
  const s = state(40);
  s.raw = s.gesture = "palm";
  const joints = Array.from({ length: 21 }, (_, i) => ({
    x: 0.95 + (i % 3) * 0.02,
    y: 0.4 + Math.floor(i / 3) * 0.02,
  }));
  interaction.update(s, { x: 1.03, y: 0.5 }, false, joints, 1.7);
  expect(wipes).toBe(1);
});
