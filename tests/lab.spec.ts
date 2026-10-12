import { test, expect } from "@playwright/test";
import fs from "node:fs";
test("laboratory replays local landmark recordings and exports no video", async ({
  page,
}) => {
  await page.goto("/lab?test=1&seed=7");
  await expect(
    page.getByRole("heading", { name: "Gesture laboratory" }),
  ).toBeVisible();
  const fixture = fs.readFileSync(
    new URL("./fixtures/gestures/index-draw-line.json", import.meta.url),
  );
  await page
    .getByRole("button", { name: "Record landmarks", exact: true })
    .click();
  await page.locator("#lab-file").setInputFiles({
    name: "gesture.json",
    mimeType: "application/json",
    buffer: fixture,
  });
  await expect(page.locator("#lab-message")).toContainText("Replayed");
  await expect(page.locator("#camera-state")).toContainText("POINT");
  const exported = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Save landmarks", exact: true })
    .click();
  const download = await exported;
  expect(download.suggestedFilename()).toBe("foglass-gesture.json");
  const saved = JSON.parse(fs.readFileSync((await download.path())!, "utf8"));
  expect(saved.frames.length).toBeGreaterThan(5);
  expect(Object.keys(saved.frames[0]).sort()).toEqual(["hands", "timestamp"]);
  await page.getByRole("button", { name: "Tools", exact: true }).click();
  await expect(page.locator("#vr")).toBeHidden();
  await expect(page.locator("#vr")).toBeDisabled();
  await expect(page.locator("#vr")).toContainText("headset");
});

test("optional sound is off initially and M mutes it", async ({ page }) => {
  await page.goto("/?test=1");
  await page.getByRole("button", { name: "Try without camera" }).click();
  await page.getByRole("button", { name: "Tools", exact: true }).click();
  await expect(page.locator("#sound")).toHaveAttribute("aria-pressed", "false");
  await page.locator("#sound").click();
  await expect(page.locator("#sound")).toHaveAttribute("aria-pressed", "true");
  await page.keyboard.press("m");
  await expect(page.locator("#sound")).toHaveAttribute("aria-pressed", "false");
});
