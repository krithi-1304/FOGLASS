import { test, expect, Page } from "@playwright/test";
import fs from "node:fs";
const fixture = (name: string) =>
  JSON.parse(
    fs.readFileSync(
      new URL("./fixtures/gestures/" + name + ".json", import.meta.url),
      "utf8",
    ),
  );
const replay = (page: Page, name: string) =>
  page.evaluate(async (r) => {
    await (
      window as unknown as {
        __foglass: { replay: (r: unknown) => Promise<void> };
      }
    ).__foglass.replay(r);
  }, fixture(name));
const sample = (page: Page, x: number, y: number) =>
  page.evaluate(
    ([x, y]) =>
      (
        window as unknown as {
          __foglass: { sampleMask: (x: number, y: number) => number };
        }
      ).__foglass.sampleMask(x, y),
    [x, y],
  );
test("recorded pointing mutates mask and supports undo/redo", async ({
  page,
}) => {
  await page.goto("/?test=1&mock=1&seed=7&speed=4");
  await page.getByRole("button", { name: "Try without camera" }).click();
  await page.evaluate(() =>
    (
      window as unknown as {
        __foglass: { injectBreath: (s: number, ms: number) => void };
      }
    ).__foglass.injectBreath(1, 800),
  );
  await page.waitForTimeout(900);
  await page.evaluate(() =>
    (
      window as unknown as { __foglass: { setTimeScale: (n: number) => void } }
    ).__foglass.setTimeScale(0),
  );
  await replay(page, "index-draw-line");
  await expect.poll(() => sample(page, 0.5, 0.37)).toBeLessThan(0.25);
  await page.getByRole("button", { name: "Tools", exact: true }).click();
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect.poll(() => sample(page, 0.5, 0.37)).toBeGreaterThan(0.5);
  await page.getByRole("button", { name: "Redo", exact: true }).click();
  await expect.poll(() => sample(page, 0.5, 0.37)).toBeLessThan(0.3);
});
test("palm wipe, low-confidence rejection and two-palm clear", async ({
  page,
}) => {
  await page.goto("/?test=1&mock=1&seed=7&speed=4");
  await page.getByRole("button", { name: "Try without camera" }).click();
  await page.getByRole("button", { name: "Add steam" }).click();
  await page.waitForTimeout(1900);
  const before = await sample(page, 0.5, 0.58);
  await replay(page, "low-confidence");
  expect(await sample(page, 0.5, 0.58)).toBeGreaterThan(before * 0.9);
  await replay(page, "open-palm-left");
  await expect.poll(() => sample(page, 0.5, 0.58)).toBeLessThan(0.35);
  await page.getByRole("button", { name: "Tools", exact: true }).click();
  await page.getByRole("checkbox", { name: /Extra hand shortcuts/ }).check();
  await replay(page, "two-palm-clear");
  await expect.poll(() => sample(page, 0.5, 0.58)).toBeLessThan(0.02);
});
test("fist pauses, victory opens palette, lost hands release strokes", async ({
  page,
}) => {
  await page.goto("/?test=1&mock=1");
  await page.getByRole("button", { name: "Try without camera" }).click();
  await page.getByRole("button", { name: "Tools", exact: true }).click();
  await page.getByRole("checkbox", { name: /Extra hand shortcuts/ }).check();
  await page.getByRole("button", { name: "Tools", exact: true }).click();
  await replay(page, "fist");
  await page.getByRole("button", { name: "Tools", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Resume", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Resume", exact: true }).click();
  await page.getByRole("button", { name: "Tools", exact: true }).click();
  await replay(page, "two-finger-palette");
  await expect(
    page.getByRole("region", { name: "Mirror tools" }),
  ).toBeVisible();
  await replay(page, "hand-disappears");
  await expect(page.locator("#camera-state")).toContainText("POINT");
});
