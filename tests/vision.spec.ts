import { test, expect } from "@playwright/test";
import fs from "node:fs";
const point = JSON.parse(
  fs.readFileSync(
    new URL("./fixtures/gestures/index-draw-line.json", import.meta.url),
    "utf8",
  ),
);
test("mock provider drives the production recognizer and cursor", async ({
  page,
}) => {
  await page.goto("/?test=1&mock=1");
  await page.getByRole("button", { name: "Try without camera" }).click();
  await page.evaluate(async (record) => {
    const api = (
      window as unknown as {
        __foglass: { replay: (r: unknown) => Promise<void> };
      }
    ).__foglass;
    await api.replay(record);
  }, point);
  await expect(page.locator("#cursor")).toHaveClass(/visible/);
  await expect(page.locator("#camera-state")).toContainText("POINT");
  await page.getByRole("button", { name: "Tools", exact: true }).click();
  await page.getByRole("button", { name: "Calibrate hand" }).click();
  await expect(
    page.getByRole("region", { name: "Hand calibration" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Skip calibration" }).click();
  await expect(
    page.getByRole("region", { name: "Hand calibration" }),
  ).toBeHidden();
});
test("MediaPipe model and WASM load locally and infer fake frames", async ({
  page,
}) => {
  test.setTimeout(60000);
  const external: string[] = [];
  page.on("request", (r) => {
    if (
      !r.url().startsWith("http://127.0.0.1:5173") &&
      !r.url().startsWith("data:") &&
      !r.url().startsWith("blob:")
    )
      external.push(r.url());
  });
  await page.goto("/?test=1&vision=1");
  await page.getByRole("button", { name: "Start", exact: true }).click();
  await expect
    .poll(
      () =>
        page.evaluate(
          () =>
            (
              window as unknown as {
                __foglass: {
                  getState: () => {
                    tracking: { status: string; frames: number };
                  };
                };
              }
            ).__foglass.getState().tracking,
        ),
      { timeout: 45000 },
    )
    .toMatchObject({ status: "ready" });
  await expect
    .poll(
      () =>
        page.evaluate(
          () =>
            (
              window as unknown as {
                __foglass: { getState: () => { tracking: { frames: number } } };
              }
            ).__foglass.getState().tracking.frames,
        ),
      { timeout: 15000 },
    )
    .toBeGreaterThan(1);
  expect(external).toEqual([]);
});
test("model failure retains conventional controls", async ({ page }) => {
  await page.route("**/models/hand_landmarker.task", (r) => r.abort());
  await page.goto("/?test=1&vision=1");
  await page.getByRole("button", { name: "Start", exact: true }).click();
  await expect(page.getByRole("status")).toContainText(
    "Hand tracking unavailable",
    { timeout: 30000 },
  );
  await page.getByRole("button", { name: "Tools", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Close mirror" }),
  ).toBeVisible();
});

test("real hand image reaches the worker and produces detected hands without forced calibration", async ({
  page,
}) => {
  test.setTimeout(60000);
  const photo = fs
    .readFileSync(new URL("./fixtures/vision/woman_hands.jpg", import.meta.url))
    .toString("base64");
  await page.addInitScript(async (data) => {
    navigator.mediaDevices.getUserMedia = async () => {
      const image = new Image();
      image.src = "data:image/jpeg;base64," + data;
      await image.decode();
      const canvas = document.createElement("canvas");
      canvas.width = image.width;
      canvas.height = image.height;
      const ctx = canvas.getContext("2d")!;
      const tick = () => {
        ctx.drawImage(image, 0, 0);
        requestAnimationFrame(tick);
      };
      tick();
      return canvas.captureStream(30);
    };
  }, photo);
  await page.goto("/?vision=1");
  await page.getByRole("button", { name: "Start", exact: true }).click();
  await expect(page.locator("#cursor")).toHaveClass(/visible/, {
    timeout: 45000,
  });
  await expect(page.locator("#calibration")).toBeHidden();
  await expect(page.locator("#cursor")).toHaveClass(/visible/);
});
