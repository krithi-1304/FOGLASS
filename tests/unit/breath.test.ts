import { it, expect } from "vitest";
import { BreathDetector } from "../../src/breath";
const spectrum = (db: number) => new Float32Array(1024).fill(db);
it("calibrates room noise, detects sustained broad noise and releases with hysteresis", () => {
  const d = new BreathDetector();
  for (let t = 0; t <= 1000; t += 25) d.update(spectrum(-80), 48000, 2048, t);
  expect(d.calibrated).toBe(true);
  expect(d.active).toBe(false);
  for (let t = 1025; t <= 1200; t += 25)
    d.update(spectrum(-40), 48000, 2048, t);
  expect(d.strength).toBeGreaterThan(0.5);
  d.update(spectrum(-90), 48000, 2048, 1225);
  expect(d.active).toBe(true);
  d.update(spectrum(-90), 48000, 2048, 1500);
  expect(d.active).toBe(false);
});
it("rejects a tone and one-frame impulse", () => {
  const d = new BreathDetector();
  for (let t = 0; t <= 1000; t += 25) d.update(spectrum(-80), 48000, 2048, t);
  const tone = spectrum(-100);
  tone[20] = -10;
  for (let t = 1025; t < 1500; t += 25) d.update(tone, 48000, 2048, t);
  expect(d.active).toBe(false);
  d.update(spectrum(-30), 48000, 2048, 1500);
  d.update(spectrum(-90), 48000, 2048, 1525);
  expect(d.active).toBe(false);
});
