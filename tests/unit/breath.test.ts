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
it("detects sustained low-frequency coloured airflow, not just white noise", () => {
  const d = new BreathDetector();
  for (let t = 0; t <= 1000; t += 25) d.update(spectrum(-90), 48000, 2048, t);
  const wind = spectrum(-100);
  for (let i = 3; i < 110; i++) wind[i] = -35 - 40 * Math.log10(i / 3);
  for (let t = 1025; t <= 1200; t += 25) d.update(wind, 48000, 2048, t);
  expect(d.active).toBe(true);
  expect(d.strength).toBeGreaterThan(0.3);
});
it("quiet recalibration recovers after a noisy startup", () => {
  const d = new BreathDetector();
  for (let t = 0; t < 800; t += 25) d.update(spectrum(-30), 48000, 2048, t);
  d.recalibrate();
  for (let t = 800; t < 1800; t += 25) d.update(spectrum(-80), 48000, 2048, t);
  for (let t = 1800; t < 2000; t += 25) d.update(spectrum(-45), 48000, 2048, t);
  expect(d.active).toBe(true);
});

it("detects low-gain airflow above a quiet calibrated room", () => {
  const d = new BreathDetector();
  for (let t = 0; t <= 1000; t += 25) d.update(spectrum(-100), 48000, 2048, t);
  const wind = spectrum(-110);
  for (let i = 3; i < 110; i++) wind[i] = -55 - 40 * Math.log10(i / 3);
  for (let t = 1025; t <= 1250; t += 25) d.update(wind, 48000, 2048, t);
  expect(d.active).toBe(true);
});
