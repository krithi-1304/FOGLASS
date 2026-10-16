import { test, expect } from "@playwright/test";
import fs from "node:fs";
import type { GestureRecording } from "../src/tracking/types";
const recording = JSON.parse(
  fs.readFileSync(
    new URL("./fixtures/gestures/index-draw-line.json", import.meta.url),
    "utf8",
  ),
) as GestureRecording;
test("camera landmark pipeline lifts across stale samples instead of joining letters", async ({
  page,
}) => {
  await page.goto("/?test=1&mock=1&seed=7");
  await page.getByRole("button", { name: "Try without camera" }).click();
  const result = await page.evaluate(async (recording) => {
    const api = (
      window as unknown as {
        __foglass: {
          seedCoverage(n: number): void;
          setTimeScale(n: number): void;
          replay(r: GestureRecording): Promise<void>;
          sampleMask(x: number, y: number): number;
        };
      }
    ).__foglass;
    api.seedCoverage(0.9);
    api.setTimeScale(0);
    const original = recording.frames[0].hands[0],
      tip = original.landmarks[8];
    const hand = (x: number) => ({
      ...original,
      landmarks: original.landmarks.map((p) => ({
        ...p,
        x: p.x - tip.x + (1 - x),
        y: p.y - tip.y + 0.5,
      })),
    });
    await api.replay({
      ...recording,
      frames: [
        { timestamp: 0, hands: [hand(0.3)] },
        { timestamp: 40, hands: [hand(0.3)] },
        { timestamp: 300, hands: [hand(0.5)] },
        { timestamp: 340, hands: [hand(0.5)] },
      ],
    });
    await new Promise(requestAnimationFrame);
    await new Promise(requestAnimationFrame);
    return {
      first: api.sampleMask(0.3, 0.5),
      gap: api.sampleMask(0.4, 0.5),
      second: api.sampleMask(0.5, 0.5),
    };
  }, recording);
  expect(result.first).toBeLessThan(0.3);
  expect(result.second).toBeLessThan(0.3);
  expect(result.gap).toBeGreaterThan(0.8);
});
