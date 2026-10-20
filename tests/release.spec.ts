import { test, expect } from "@playwright/test";
import fs from "node:fs";
import type { GestureRecording } from "../src/tracking/types";
const fist = JSON.parse(
  fs.readFileSync(
    new URL("./fixtures/gestures/fist.json", import.meta.url),
    "utf8",
  ),
) as GestureRecording;
interface API {
  seedCoverage(n: number): void;
  setTimeScale(n: number): void;
  injectFinger(x: number, y: number, down: boolean): void;
  sampleMask(x: number, y: number): number;
  replay(r: GestureRecording): Promise<void>;
  getState(): {
    paused: boolean;
    history: { undo: number; redo: number };
    frames: number;
  };
}
test("repeated use retains bounded undo, drawing and default gesture safety", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/?test=1&mock=1&seed=7");
  await page.getByRole("button", { name: "Try without camera" }).click();
  const result = await page.evaluate(async (recording) => {
    const api = (window as unknown as { __foglass: API }).__foglass;
    api.seedCoverage(0.9);
    api.setTimeScale(0);
    for (let round = 0; round < 32; round++) {
      for (let i = 0; i < 20; i++)
        api.injectFinger(0.2 + i * 0.02, 0.3 + (round % 8) * 0.05, true);
      api.injectFinger(0.6, 0.5, false);
      await new Promise(requestAnimationFrame);
    }
    await api.replay(recording);
    await new Promise(requestAnimationFrame);
    return { state: api.getState(), sample: api.sampleMask(0.4, 0.65) };
  }, fist);
  expect(result.state.paused).toBe(false);
  expect(result.state.history.undo).toBe(8);
  expect(result.sample).toBeLessThan(0.3);
  await page.getByRole("button", { name: "Tools", exact: true }).click();
  for (let i = 0; i < 8; i++)
    await page.getByRole("button", { name: "Undo", exact: true }).click();
  for (let i = 0; i < 8; i++)
    await page.getByRole("button", { name: "Redo", exact: true }).click();
  expect(
    await page.evaluate(
      () =>
        (window as unknown as { __foglass: API }).__foglass.getState().history,
    ),
  ).toEqual({ undo: 8, redo: 0 });
  for (let i = 0; i < 4; i++) {
    await page.getByRole("button", { name: "Pause", exact: true }).click();
    await page.getByRole("button", { name: "Resume", exact: true }).click();
    await page.getByRole("button", { name: "Clear", exact: true }).click();
  }
  await page.evaluate(() => {
    const api = (window as unknown as { __foglass: API }).__foglass;
    api.seedCoverage(0.9);
    api.injectFinger(0.5, 0.5, true);
    api.injectFinger(0.5, 0.5, false);
  });
  await expect
    .poll(() =>
      page.evaluate(() =>
        (window as unknown as { __foglass: API }).__foglass.sampleMask(
          0.5,
          0.5,
        ),
      ),
    )
    .toBeLessThan(0.3);
  expect(errors).toEqual([]);
});
test("controls stay available until explicitly hidden, including while choosing options", async ({
  page,
}) => {
  await page.goto("/?test=1");
  await page.getByRole("button", { name: "Try without camera" }).click();
  await page.mouse.move(500, 280);
  await expect(page.locator("#dock")).toHaveCSS("opacity", "1");
  await page.mouse.move(640, 680);
  await expect(page.locator("#dock")).toHaveCSS("opacity", "1");
  await page.getByRole("button", { name: "Tools", exact: true }).focus();
  await page.keyboard.press("Space");
  await page.mouse.move(200, 200);
  await expect(page.locator("#tools")).toHaveCSS("opacity", "1");
  await page.getByLabel("Mode", { exact: true }).selectOption("writing");
  await page
    .getByRole("button", { name: "Hide controls", exact: true })
    .click();
  await expect(page.locator("#tools")).toBeHidden();
  await page.getByRole("button", { name: "Controls", exact: true }).click();
  await expect(page.locator("#dock")).toHaveCSS("opacity", "1");
});
test("lost WebGL context offers a working restart instead of a blank mirror", async ({
  page,
}) => {
  await page.goto("/?test=1");
  await page.getByRole("button", { name: "Try without camera" }).click();
  const supported = await page.evaluate(() => {
    const ext = document
      .querySelector("canvas")!
      .getContext("webgl2")!
      .getExtension("WEBGL_lose_context");
    ext?.loseContext();
    return !!ext;
  });
  expect(supported).toBe(true);
  await expect(
    page.getByRole("button", { name: "Restart mirror" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Restart mirror" }).click();
  await expect(
    page.getByRole("button", { name: "Start", exact: true }),
  ).toBeVisible();
});

test("adaptive fog resolution preserves marks and both history directions", async ({
  page,
}) => {
  await page.goto("/?test=1");
  const result = await page.evaluate(async () => {
    const modulePath = "/src/fogSim.ts";
    const { FogSim } = await import(modulePath);
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2")!;
    const fog = new FogSim(gl);
    fog.seedCoverage(0.9);
    fog.finger(0.3, 0.5, true);
    fog.finger(0.7, 0.5, true);
    fog.finger(0.7, 0.5, false);
    fog.update(0, 1);
    const before = fog.sample(0.5, 0.5);
    fog.undo();
    fog.reduceResolution(256);
    const restored = fog.sample(0.5, 0.5);
    fog.redo();
    const after = fog.sample(0.5, 0.5);
    fog.undo();
    const undoAgain = fog.sample(0.5, 0.5);
    const untouched = fog.sample(0.5, 0.2),
      error = gl.getError();
    fog.dispose();
    return { before, after, restored, undoAgain, untouched, error };
  });
  expect(result.before).toBeLessThan(0.2);
  expect(result.after).toBeLessThan(0.2);
  expect(result.restored).toBeGreaterThan(0.8);
  expect(result.undoAgain).toBeGreaterThan(0.8);
  expect(result.untouched).toBeGreaterThan(0.8);
  expect(result.error).toBe(0);
});
