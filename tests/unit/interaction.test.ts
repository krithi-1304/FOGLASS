import { it, expect } from "vitest";
import fs from "node:fs";
import { GestureEngine } from "../../src/gestures";
import { Interaction } from "../../src/interaction";
import { parseRecording } from "../../src/tracking/types";
const fixture = (n: string) =>
  parseRecording(
    JSON.parse(
      fs.readFileSync(
        new URL("../fixtures/gestures/" + n + ".json", import.meta.url),
        "utf8",
      ),
    ),
  );
it("palm and point create different continuous brushes", () => {
  const strokes: { radius: number; palm: boolean; x: number }[] = [];
  const target = {
    finger: (
      x: number,
      _y: number,
      down: boolean,
      radius = 0,
      palm = false,
    ) => {
      if (down) strokes.push({ radius, palm, x });
    },
    clear() {},
    injectBreath() {},
  };
  for (const name of ["open-palm-left", "index-draw-line"]) {
    strokes.length = 0;
    const interaction = new Interaction(target),
      e = new GestureEngine();
    for (const f of fixture(name).frames) {
      const s = e.update(f);
      const p = s.hand
        ? s.gesture === "point"
          ? s.hand.index
          : s.hand.palm
        : null;
      interaction.update(s, p);
    }
    expect(strokes.length).toBeGreaterThan(30);
    expect(
      strokes.every((p) =>
        name === "open-palm-left"
          ? p.radius > 0.05 && p.palm
          : p.radius < 0.03 && !p.palm,
      ),
    ).toBe(true);
    expect(
      strokes.slice(1).every((p, i) => Math.abs(p.x - strokes[i].x) < 0.04),
    ).toBe(true);
  }
});
it("low confidence, calibration and pause cannot draw; actions fire once", () => {
  let draws = 0,
    clear = 0;
  const target = {
    finger: (_x: number, _y: number, down: boolean) => {
      if (down) draws++;
    },
    clear() {
      clear++;
    },
    injectBreath() {},
  };
  const i = new Interaction(target),
    e = new GestureEngine();
  for (const f of fixture("low-confidence").frames) {
    const s = e.update(f);
    i.update(s, s.hand?.index || null);
  }
  expect(draws).toBe(0);
  for (const f of fixture("two-palm-clear").frames) {
    const s = e.update(f);
    i.update(s, s.hand?.palm || null);
  }
  expect(clear).toBe(1);
  i.togglePause();
  e.reset();
  for (const f of fixture("index-draw-line").frames) {
    const s = e.update(f);
    i.update(s, s.hand?.index || null);
  }
  expect(draws).toBe(0);
});
