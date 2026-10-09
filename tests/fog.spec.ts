import { test, expect, Page } from "@playwright/test";
type FogAPI = {
  injectBreath: (strength: number, ms: number) => void;
  injectFinger: (x: number, y: number, down: boolean) => void;
  getFogCoverage: () => number;
  sampleMask: (x: number, y: number) => number;
};
const run = async <T>(page: Page, fn: (api: FogAPI) => T) =>
  page.evaluate((fn) => {
    const api = (window as unknown as { __foglass: FogAPI }).__foglass;
    return eval("(" + fn + ")")(api);
  }, fn.toString()) as Promise<T>;
test("breath, continuous wipe, regrowth, resize, clear and snapshot", async ({
  page,
}) => {
  await page.goto("/?test=1&seed=7&speed=4");
  await page.getByRole("button", { name: "Try without camera" }).click();
  await run(page, (a) => a.injectBreath(1, 600));
  await expect
    .poll(() => run(page, (a) => a.getFogCoverage()))
    .toBeGreaterThan(0.5);
  await page.waitForTimeout(650);
  await run(page, (a) => {
    a.injectFinger(0.2, 0.5, true);
    a.injectFinger(0.8, 0.5, true);
    a.injectFinger(0.8, 0.5, false);
  });
  await expect
    .poll(() => run(page, (a) => a.sampleMask(0.5, 0.5)))
    .toBeLessThan(0.2);
  const untouched = await run(page, (a) => a.sampleMask(0.5, 0.2));
  expect(untouched).toBeGreaterThan(0.5);
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await run(page, (a) => a.getFogCoverage())).toBeGreaterThan(0.4);
  await expect
    .poll(() => run(page, (a) => a.sampleMask(0.5, 0.5)), { timeout: 5000 })
    .toBeGreaterThan(0.5);
  const download = page.waitForEvent("download");
  await page.keyboard.press("s");
  expect((await download).suggestedFilename()).toBe("foglass.png");
  await page.keyboard.press("c");
  await expect
    .poll(() => run(page, (a) => a.getFogCoverage()))
    .toBeLessThan(0.01);
});
test("unanswered permissions never block keyboard and mouse fallback", async ({
  page,
}) => {
  await page.addInitScript(() => {
    navigator.mediaDevices.getUserMedia = () => new Promise(() => {});
  });
  await page.goto("/?test=1&speed=4");
  await page.getByRole("button", { name: "Start", exact: true }).click();
  await page.keyboard.down("b");
  await expect
    .poll(() => run(page, (a) => a.getFogCoverage()))
    .toBeGreaterThan(0.5);
  await page.keyboard.up("b");
  await page.mouse.move(200, 360);
  await page.mouse.down();
  await page.mouse.move(1000, 360, { steps: 12 });
  await page.mouse.up();
  expect(await run(page, (a) => a.sampleMask(0.5, 0.5))).toBeLessThan(0.3);
});
test("capture M2 glass states", async ({ page }) => {
  await page.goto("/?test=1&seed=7");
  await page.getByRole("button", { name: "Try without camera" }).click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: "test-results/m2-none.png" });
  await run(page, (a) => a.injectBreath(0.5, 700));
  await page.waitForTimeout(750);
  await page.screenshot({ path: "test-results/m2-light.png" });
  await run(page, (a) => a.injectBreath(1, 2200));
  await page.waitForTimeout(2300);
  await page.screenshot({ path: "test-results/m2-heavy.png" });
  await run(page, (a) => {
    a.injectFinger(0.3, 0.7, true);
    a.injectFinger(0.35, 0.4, true);
    a.injectFinger(0.5, 0.3, true);
    a.injectFinger(0.6, 0.5, true);
    a.injectFinger(0.7, 0.6, true);
  });
  await page.waitForTimeout(60);
  await page.screenshot({ path: "test-results/m2-stroke.png" });
});
