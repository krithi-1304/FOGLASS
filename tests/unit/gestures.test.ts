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
it("recognizes a foreshortened pointing hand from world geometry", () => {
  const hand = structuredClone(fixture("index-draw-line").frames[0].hands[0]);
  hand.worldLandmarks = hand.landmarks.map((p) => ({ x: p.x, y: 0, z: p.y }));
  hand.landmarks = hand.landmarks.map((p) => ({ ...p, y: 0.5, z: 0 }));
  expect(features(hand).extended).toEqual([true, false, false, false]);
});
it("brief finger classification noise does not break writing but hand loss releases immediately", () => {
  const point = fixture("index-draw-line").frames[0].hands;
  const victory = fixture("two-finger-palette").frames[0].hands;
  const engine = new GestureEngine();
  engine.update({ timestamp: 0, hands: point });
  expect(engine.update({ timestamp: 66, hands: point }).gesture).toBe("point");
  expect(engine.update({ timestamp: 100, hands: victory }).gesture).toBe(
    "point",
  );
  expect(engine.update({ timestamp: 133, hands: point }).gesture).toBe("point");
  expect(engine.update({ timestamp: 166, hands: [] }).gesture).toBe("none");
});

it("projected thumb overlap does not turn a 3D pointing hand into a pinch", () => {
  const hand = structuredClone(fixture("index-draw-line").frames[0].hands[0]);
  hand.worldLandmarks = structuredClone(hand.landmarks);
  hand.landmarks[4] = { ...hand.landmarks[8] };
  const e = new GestureEngine();
  e.update({ timestamp: 0, hands: [hand] });
  expect(e.update({ timestamp: 100, hands: [hand] }).gesture).toBe("point");
});
it("unevenly spaced stroke samples do not overshoot a letter corner", () => {
  const a = { x: 0, y: 0 },
    b = { x: 0.8, y: 0 },
    c = { x: 0.8, y: 0.01 };
  for (let t = 0; t <= 1; t += 0.1) {
    const p = catmullRom(a, b, c, c, t);
    expect(p.x).toBeCloseTo(0.8, 6);
    expect(p.y).toBeGreaterThanOrEqual(0);
    expect(p.y).toBeLessThanOrEqual(0.01);
  }
});

it("a camera gap cannot count as a held fist or continue writing", () => {
  for (const name of ["fist", "index-draw-line"]) {
    const hands = fixture(name).frames[0].hands;
    const engine = new GestureEngine();
    engine.update({ timestamp: 0, hands });
    engine.update({ timestamp: 160, hands });
    const resumed = engine.update({ timestamp: 1500, hands });
    expect(resumed.action).toBeNull();
    expect(resumed.gesture).toBe("none");
  }
});
