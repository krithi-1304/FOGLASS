import { test, expect } from "@playwright/test";
test("review deterministic glass states and mobile invitation", async ({
  page,
}) => {
  await page.goto("/?test=1&seed=7&visual=1");
  await expect(page).toHaveScreenshot("landing-desktop.png", {
    animations: "disabled",
    maxDiffPixelRatio: 0.015,
  });
  await page.getByRole("button", { name: "Try without camera" }).click();
  await page.waitForTimeout(1000);
  for (const [name, coverage] of [
    ["none", 0],
    ["light", 0.28],
    ["heavy", 0.9],
  ] as const) {
    await page.evaluate((value) => {
      const api = (
        window as unknown as {
          __foglass: {
            setTimeScale: (v: number) => void;
            seedCoverage: (v: number) => void;
          };
        }
      ).__foglass;
      api.setTimeScale(0);
      api.seedCoverage(value);
    }, coverage);
    await expect(page).toHaveScreenshot(`glass-${name}.png`, {
      animations: "disabled",
      maxDiffPixelRatio: 0.015,
    });
  }
  await page.evaluate(() => {
    const api = (
      window as unknown as {
        __foglass: {
          injectFinger: (x: number, y: number, down: boolean) => void;
        };
      }
    ).__foglass;
    for (let i = 0; i <= 60; i++) {
      const t = (i / 60) * Math.PI * 2;
      const x = 0.5 + 0.013 * 16 * Math.sin(t) ** 3;
      const y =
        0.5 -
        0.013 *
          (13 * Math.cos(t) -
            5 * Math.cos(2 * t) -
            2 * Math.cos(3 * t) -
            Math.cos(4 * t));
      api.injectFinger(x, y, true);
    }
    api.injectFinger(0.5, 0.5, false);
  });
  await expect(page).toHaveScreenshot("glass-writing.png", {
    animations: "disabled",
    maxDiffPixelRatio: 0.015,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/?test=1&seed=7&visual=1");
  await expect(page).toHaveScreenshot("landing-mobile.png", {
    animations: "disabled",
    maxDiffPixelRatio: 0.015,
  });
});
test("measure sustained render throughput", async ({ page }, testInfo) => {
  await page.goto("/?test=1&seed=7");
  await page.getByRole("button", { name: "Try without camera" }).click();
  await page.waitForTimeout(3000);
  const result = await page.evaluate(async () => {
    const api = (
      window as unknown as {
        __foglass: {
          getState: () => { frames: number; quality: number; frameMs: number };
        };
      }
    ).__foglass;
    const begin = performance.now(),
      before = api.getState().frames;
    await new Promise((resolve) => setTimeout(resolve, 3000));
    return {
      ...api.getState(),
      averageFps:
        ((api.getState().frames - before) * 1000) / (performance.now() - begin),
    };
  });
  await testInfo.attach("performance", {
    body: JSON.stringify(result, null, 2),
    contentType: "application/json",
  });
  console.log(
    `Measured render FPS ${result.averageFps.toFixed(1)} at quality ${result.quality.toFixed(2)}`,
  );
  expect(result.averageFps).toBeGreaterThan(45);
});
