import { test, expect } from "@playwright/test";
test("wet strokes gather moisture which drains down the glass", async ({
  page,
}) => {
  await page.goto("/?test=1&seed=7");
  await page.getByRole("button", { name: "Try without camera" }).click();
  const water = () =>
    page.evaluate(() =>
      (
        window as unknown as {
          __foglass: { getWater: () => { mass: number; y: number } };
        }
      ).__foglass.getWater(),
    );
  await page.evaluate(() => {
    const api = (
      window as unknown as {
        __foglass: {
          setTimeScale: (v: number) => void;
          seedCoverage: (v: number) => void;
          injectFinger: (x: number, y: number, d: boolean) => void;
        };
      }
    ).__foglass;
    api.setTimeScale(0);
    api.seedCoverage(0.95);
    for (let i = 0; i <= 30; i++)
      api.injectFinger(0.1 + (i * 0.8) / 30, 0.4, true);
    api.injectFinger(0.9, 0.4, false);
  });
  await expect.poll(async () => (await water()).mass).toBeGreaterThan(0.01);
  const before = await water();
  await page.evaluate(() =>
    (
      window as unknown as { __foglass: { setTimeScale: (v: number) => void } }
    ).__foglass.setTimeScale(1),
  );
  await page.waitForTimeout(800);
  const after = await water();
  expect(after.mass).toBeGreaterThan(0);
  expect(after.mass).toBeLessThan(before.mass);
  expect(after.y).toBeLessThan(before.y - 0.01);
});
