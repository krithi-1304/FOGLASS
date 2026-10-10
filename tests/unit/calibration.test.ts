import { it, expect } from "vitest";
import { Calibration } from "../../src/calibration";
import { GestureEngine } from "../../src/gestures";
import { parseRecording } from "../../src/tracking/types";
import palm from "../fixtures/gestures/open-palm-left.json";
import point from "../fixtures/gestures/index-draw-line.json";
import pinch from "../fixtures/gestures/pinch.json";
it("calibrates ordered palm range, point and pinch with dwell", () => {
  const c = new Calibration(),
    e = new GestureEngine();
  c.begin();
  let t = 1;
  for (const [record, x] of [
    [palm, 0.5],
    [palm, 0.8],
    [palm, 0.2],
    [point, 0.5],
    [pinch, 0.5],
  ] as const) {
    const frame = parseRecording(record).frames[0];
    const offset = x - frame.hands[0].landmarks[0].x;
    frame.hands[0].landmarks.forEach((p) => (p.x += offset));
    for (let i = 0; i < 25; i++) {
      frame.timestamp = t;
      t += 40;
      c.update(e.update(frame));
    }
  }
  expect(c.step).toBe(5);
  expect(c.active).toBe(false);
  expect(c.profile.minX).toBeLessThan(0.4);
  expect(c.profile.maxX).toBeGreaterThan(0.6);
  expect(c.profile.pinchThreshold).toBeGreaterThanOrEqual(0.12);
});
it("calibration can be skipped without permission or storage", () => {
  const c = new Calibration();
  c.begin();
  c.skip();
  expect(c.active).toBe(false);
});
