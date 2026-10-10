import { describe, it, expect } from "vitest";
import fs from "node:fs";
import { GestureEngine, features } from "../../src/gestures";
import { parseRecording } from "../../src/tracking/types";
import { OneEuro, mirrorPoint, catmullRom } from "../../src/filters";
const fixture = (name: string) =>
  parseRecording(
    JSON.parse(
      fs.readFileSync(
        new URL("../fixtures/gestures/" + name + ".json", import.meta.url),
        "utf8",
      ),
    ),
  );
describe("gesture recordings", () => {
  for (const [name, gesture] of Object.entries({
    "open-palm-left": "palm",
    "open-palm-right": "palm",
    "open-palm-slow": "palm",
    "index-draw-line": "point",
    "index-draw-heart": "point",
    pinch: "pinch",
    fist: "fist",
    "two-palm-clear": "two-palms",
    "two-finger-palette": "victory",
    "gesture-jitter": "point",
  })) {
    it(name, () => {
      const engine = new GestureEngine();
      const states = fixture(name).frames.map((f) => engine.update(f));
      expect(states.at(-1)?.gesture).toBe(gesture);
      expect(states[0].gesture).toBe("none");
    });
  }
  it("low confidence never writes", () => {
    const e = new GestureEngine();
    expect(
      fixture("low-confidence")
        .frames.map((f) => e.update(f).gesture)
        .every((g) => g === "none"),
    ).toBe(true);
  });
  it("hand loss lifts immediately and reacquisition dwells", () => {
    const e = new GestureEngine();
    const states = fixture("hand-disappears").frames.map((f) => e.update(f));
    expect(states[11].gesture).toBe("none");
    expect(states[25].gesture).toBe("none");
    expect(states.at(-1)?.gesture).toBe("point");
  });
  for (const [name, action] of [
    ["two-palm-clear", "clear"],
    ["fist", "pause"],
    ["two-finger-palette", "palette"],
    ["open-palm-hold", "reset"],
  ]) {
    it(name + " emits action once", () => {
      const e = new GestureEngine();
      expect(
        fixture(name)
          .frames.map((f) => e.update(f).action)
          .filter(Boolean),
      ).toEqual([action]);
    });
  }
  it("measures width, handedness, fingers and normalized pinch", () => {
    const h = features(fixture("pinch").frames[0].hands[0]);
    expect(h.width).toBeCloseTo(0.155);
    expect(h.pinch).toBeLessThan(0.1);
    expect(h.extended).toEqual([true, false, false, false]);
    expect(h.handedness).toBe("Right");
  });
});
describe("filters and mapping", () => {
  it("suppresses jitter and resets after lost hand", () => {
    const filter = new OneEuro();
    const values = Array.from({ length: 30 }, (_, i) =>
      filter.filter(0.5 + 0.002 * Math.sin(i), i * 33),
    );
    expect(Math.max(...values) - Math.min(...values)).toBeLessThan(0.003);
    filter.reset();
    expect(filter.filter(0.9, 2000)).toBe(0.9);
  });
  it("maps mirrored cover crop consistently", () => {
    expect(mirrorPoint({ x: 0.2, y: 0.4 }, 16 / 9, 16 / 9)).toEqual({
      x: 0.8,
      y: 0.4,
    });
    expect(mirrorPoint({ x: 0.5, y: 0.5 }, 16 / 9, 9 / 16)).toEqual({
      x: 0.5,
      y: 0.5,
    });
  });
  it("spline includes both endpoints", () => {
    const a = { x: 0, y: 0 },
      b = { x: 1, y: 1 };
    expect(catmullRom(a, a, b, b, 0)).toEqual(a);
    expect(catmullRom(a, a, b, b, 1)).toEqual(b);
  });
});
