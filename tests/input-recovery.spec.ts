import { test, expect } from "@playwright/test";
test.use({ hasTouch: true });
type FogAPI = {
  seedCoverage(value: number): void;
  sampleMask(x: number, y: number): number;
};
test("wiped glass stays clear until an explicit breath and microphone starts only by choice", async ({
  page,
}, testInfo) => {
  await page.goto("/?test=1&speed=10");
  await expect(
    page.getByLabel("Enable breath with my microphone"),
  ).not.toBeChecked();
  await page.getByRole("button", { name: "Try without camera" }).click();
  await page.evaluate(() =>
    (window as unknown as { __foglass: FogAPI }).__foglass.seedCoverage(0.9),
  );
  await page.mouse.move(500, 350);
  await page.mouse.down();
  await page.mouse.move(750, 350, { steps: 10 });
  await page.mouse.up();
  const cleared = () =>
    page.evaluate(() =>
      (window as unknown as { __foglass: FogAPI }).__foglass.sampleMask(
        0.5,
        350 / 720,
      ),
    );
  await expect.poll(cleared).toBeLessThan(0.15);
  await page.waitForTimeout(1600); // sixteen simulated seconds: no passive regrowth
  expect(await cleared()).toBeLessThan(0.15);
  await page.keyboard.down("b");
  await expect.poll(cleared).toBeGreaterThan(0.4);
  await page.keyboard.up("b");
  await page.getByRole("button", { name: "Tools", exact: true }).click();
  await page.getByRole("button", { name: "Test my breath" }).click();
  await expect(page.locator("#breath-feedback")).toBeVisible();
  await expect(page.getByLabel("Fog returns")).toHaveValue("breath");
  await expect(page.locator("#microphone-source")).toContainText("Using");
  await page.screenshot({
    path: testInfo.outputPath("input-controls-desktop.png"),
  });
});
test("controls and options remain usable on touch without hover", async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/?test=1");
  await page.getByRole("button", { name: "Try without camera" }).tap();
  await page.getByRole("button", { name: "Tools", exact: true }).tap();
  await page.mouse.move(50, 180);
  await page.waitForTimeout(5000);
  await expect(page.locator("#tools")).toBeVisible();
  await page.getByLabel("Fog returns").selectOption("natural");
  await page.getByLabel("Writing gesture").selectOption("pinch");
  await page.getByRole("button", { name: "Test my breath" }).tap();
  await expect(page.getByLabel("Fog returns")).toHaveValue("breath");
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
    390,
  );
  await page.screenshot({
    path: testInfo.outputPath("input-controls-mobile.png"),
  });
  await page.getByRole("button", { name: "Hide controls", exact: true }).tap();
  await expect(
    page.getByRole("button", { name: "Controls", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Controls", exact: true }).tap();
  await expect(page.locator("#tools")).toBeVisible();
});
