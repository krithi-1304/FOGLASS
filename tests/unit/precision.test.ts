import { expect, it } from "vitest";
import { OneEuro } from "../../src/filters";

it("reduces normalized-coordinate writing lag without amplifying stationary noise", () => {
  const old = new OneEuro(1.7, 0.12);
  const current = new OneEuro();
  let oldError = 0,
    newError = 0;
  for (let i = 0; i < 90; i++) {
    const x = 0.1 + i / 120;
    oldError += Math.abs(x - old.filter(x, (i * 1000) / 30));
    newError += Math.abs(x - current.filter(x, (i * 1000) / 30));
  }
  expect(newError).toBeLessThan(oldError * 0.5);
  current.reset();
  let filteredNoise = 0,
    rawNoise = 0;
  for (let i = 0; i < 120; i++) {
    const noise = Math.sin(i * 2.1) * 0.003;
    rawNoise += noise ** 2;
    filteredNoise += (current.filter(0.5 + noise, (i * 1000) / 30) - 0.5) ** 2;
  }
  expect(filteredNoise).toBeLessThan(rawNoise * 0.4);
});

import { GestureEngine } from "../../src/gestures";
import fs from "node:fs";
import { parseRecording } from "../../src/tracking/types";
it("keeps the same writing hand when detector output order swaps", () => {
  const record = parseRecording(
    JSON.parse(
      fs.readFileSync(
        new URL("../fixtures/gestures/index-draw-line.json", import.meta.url),
        "utf8",
      ),
    ),
  );
  const a = record.frames[0].hands[0];
  const b = {
    ...a,
    handedness:
      a.handedness === "Left" ? ("Right" as const) : ("Left" as const),
    landmarks: a.landmarks.map((p) => ({ ...p, x: p.x + 0.35 })),
  };
  const engine = new GestureEngine();
  engine.update({ timestamp: 0, hands: [a, b] });
  expect(engine.update({ timestamp: 40, hands: [b, a] }).hand?.handedness).toBe(
    a.handedness,
  );
});
