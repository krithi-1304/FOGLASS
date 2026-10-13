import { test, expect } from "@playwright/test";
import fs from "node:fs";
import type { GestureRecording } from "../src/tracking/types";
interface TestAPI {
  seedCoverage(n: number): void;
  setTimeScale(n: number): void;
  replay(r: GestureRecording, realtime?: boolean): Promise<void>;
  sampleMask(x: number, y: number): number;
  injectFinger(x: number, y: number, down: boolean): void;
  getState(): { frames: number; quality: number; gesture: string };
}

const palm = JSON.parse(
  fs.readFileSync(
    new URL("./fixtures/gestures/open-palm-left.json", import.meta.url),
    "utf8",
  ),
);

test("a full hand clears fingertips as well as the palm, with gaps between fingers", async ({
  page,
}, testInfo) => {
  await page.goto("/?test=1&mock=1&seed=7");
  await page.getByRole("button", { name: "Try without camera" }).click();
  const values = await page.evaluate(async (recording) => {
    const api = (window as unknown as { __foglass: TestAPI }).__foglass;
    api.seedCoverage(0.9);
    api.setTimeScale(0);
    const hand = recording.frames[0].hands[0];
    await api.replay({
      ...recording,
      frames: [0, 40, 80, 120, 160, 200].map((timestamp) => ({
        timestamp,
        hands: [hand],
      })),
    });
    await new Promise(requestAnimationFrame);
    await new Promise(requestAnimationFrame);
    return {
      tips: [4, 8, 12, 16, 20].map((i) =>
        api.sampleMask(1 - hand.landmarks[i].x, hand.landmarks[i].y),
      ),
      palm: api.sampleMask(0.2, 0.62),
      gap: api.sampleMask(0.25, 0.39),
    };
  }, palm);
  expect(values.palm).toBeLessThan(0.3);
  for (const tip of values.tips) expect(tip).toBeLessThan(0.3);
  expect(values.gap).toBeGreaterThan(0.6);
  await page.screenshot({ path: testInfo.outputPath("full-hand.png") });
});

test("writing batches interpolated samples without GPU readback for undo", async ({
  page,
}) => {
  await page.goto("/?test=1&seed=7");
  await page.getByRole("button", { name: "Try without camera" }).click();
  const stats = await page.evaluate(async () => {
    const api = (window as unknown as { __foglass: TestAPI }).__foglass;
    api.seedCoverage(0.9);
    api.setTimeScale(0);
    const gl = document.querySelector("canvas")!.getContext("webgl2")!;
    let draws = 0,
      reads = 0;
    const instanced = gl.drawArraysInstanced.bind(gl);
    gl.drawArraysInstanced = (...args) => {
      draws++;
      instanced(...args);
    };
    const draw = gl.drawArrays.bind(gl),
      read = gl.readPixels.bind(gl);
    gl.drawArrays = (...args) => {
      draws++;
      draw(...args);
    };
    gl.readPixels = ((...args: unknown[]) => {
      reads++;
      Reflect.apply(read, gl, args);
    }) as typeof gl.readPixels;
    for (let i = 0; i < 24; i++) api.injectFinger(0.25 + i * 0.015, 0.5, true);
    api.injectFinger(0.6, 0.5, false);
    await new Promise(requestAnimationFrame);
    await new Promise(requestAnimationFrame);
    gl.drawArraysInstanced = instanced;
    gl.drawArrays = draw;
    gl.readPixels = read;
    return { draws, reads };
  });
  console.log("Writing GPU work", stats);
  expect(stats.reads).toBe(0);
  expect(stats.draws).toBeLessThanOrEqual(6);
});

test("moving a complete hand keeps render throughput above the software-GL budget", async ({
  page,
}, testInfo) => {
  await page.goto("/?test=1&mock=1&seed=7");
  await page.getByRole("button", { name: "Try without camera" }).click();
  await page.waitForTimeout(2500);
  const result = await page.evaluate(async (recording) => {
    const api = (window as unknown as { __foglass: TestAPI }).__foglass;
    const source = recording.frames[0].hands[0];
    const frames = Array.from({ length: 100 }, (_, i) => ({
      timestamp: i * 33.333,
      hands: [
        {
          ...source,
          landmarks: source.landmarks.map((p) => ({
            ...p,
            x: p.x - 0.3 + 0.15 * Math.sin(i / 12),
          })),
        },
      ],
    }));
    const before = api.getState().frames,
      start = performance.now();
    await api.replay({ ...recording, frames }, true);
    return {
      fps:
        ((api.getState().frames - before) * 1000) / (performance.now() - start),
      quality: api.getState().quality,
    };
  }, palm as GestureRecording);
  await testInfo.attach("active-hand-performance", {
    body: JSON.stringify(result),
    contentType: "application/json",
  });
  console.log("Full-hand rendering", result);
  expect(result.fps).toBeGreaterThan(45);
});

test("portrait cover-crop keeps each finger in contact with its reflected position", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/?test=1&mock=1&seed=7");
  await page.getByRole("button", { name: "Try without camera" }).click();
  const samples = await page.evaluate(async (recording) => {
    const api = (window as unknown as { __foglass: TestAPI }).__foglass;
    api.seedCoverage(0.9);
    api.setTimeScale(0);
    const hand = recording.frames[0].hands[0];
    hand.landmarks = hand.landmarks.map((p) => ({
      ...p,
      x: 0.5 + (p.x - 0.8) * 0.5,
    }));
    await api.replay({
      ...recording,
      frames: [0, 40, 80, 120, 160].map((timestamp) => ({
        timestamp,
        hands: [hand],
      })),
    });
    await new Promise(requestAnimationFrame);
    await new Promise(requestAnimationFrame);
    const crop = innerWidth / innerHeight / (1280 / 720);
    return [4, 8, 12, 16, 20].map((i) =>
      api.sampleMask(
        0.5 + (0.5 - hand.landmarks[i].x) / crop,
        hand.landmarks[i].y,
      ),
    );
  }, palm as GestureRecording);
  for (const sample of samples) expect(sample).toBeLessThan(0.3);
});
