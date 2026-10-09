import { test, expect } from "@playwright/test";
const state = (page: import("@playwright/test").Page) =>
  page.evaluate(() =>
    (
      window as unknown as {
        __foglass: {
          getState: () => {
            mode: string;
            frames: number;
            uploads: number;
            width: number;
            height: number;
            pointer: { down: boolean };
          };
        };
      }
    ).__foglass.getState(),
  );
test("fallback renders varied pixels and resizes to portrait", async ({
  page,
}) => {
  await page.goto("/?test=1&seed=7");
  await expect.poll(async () => (await state(page)).frames).toBeGreaterThan(3);
  const pixels = await page.evaluate(() => {
    const api = (
      window as unknown as {
        __foglass: { samplePixel: (x: number, y: number) => number[] };
      }
    ).__foglass;
    return [api.samplePixel(0.2, 0.8), api.samplePixel(0.8, 0.2)];
  });
  expect(pixels[0][3]).toBe(255);
  expect(pixels[0]).not.toEqual(pixels[1]);
  await page.setViewportSize({ width: 390, height: 844 });
  await expect.poll(async () => (await state(page)).width).toBe(390);
  expect((await state(page)).height).toBe(844);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
    390,
  );
});
test("fake camera uploads to WebGL without errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/?test=1");
  await page.getByRole("button", { name: "Start", exact: true }).click();
  await expect
    .poll(async () => await state(page), { timeout: 15000 })
    .toMatchObject({ mode: "camera" })
    .catch(async (e: Error) => {
      throw new Error(e.message + JSON.stringify(await state(page)));
    });
  await expect.poll(async () => (await state(page)).uploads).toBeGreaterThan(5);
  expect(errors).toEqual([]);
});
test("denied devices preserve fallback and pointer input", async ({ page }) => {
  await page.addInitScript(() => {
    navigator.mediaDevices.getUserMedia = async () => {
      throw new DOMException("Denied", "NotAllowedError");
    };
  });
  await page.goto("/?test=1");
  await page.getByRole("button", { name: "Start", exact: true }).click();
  await expect.poll(async () => (await state(page)).mode).toBe("fallback");
  await expect(page.getByRole("status")).toContainText("permission denied");
  await page.mouse.move(300, 250);
  await page.mouse.down();
  expect((await state(page)).pointer.down).toBe(true);
  await page.mouse.up();
  expect((await state(page)).pointer.down).toBe(false);
});
test("test instrumentation is absent normally", async ({ page }) => {
  await page.goto("/");
  expect(await page.evaluate(() => "__foglass" in window)).toBe(false);
});
