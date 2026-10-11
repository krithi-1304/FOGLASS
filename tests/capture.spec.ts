import { test, expect } from "@playwright/test";
test("photo and short recording export locally from Tools", async ({
  page,
}) => {
  await page.goto("/?test=1&seed=3");
  await page.getByRole("button", { name: "Try without camera" }).click();
  await page.getByRole("button", { name: "Tools", exact: true }).click();
  const photo = page.waitForEvent("download");
  await page.getByRole("button", { name: "Save photo", exact: true }).click();
  expect((await photo).suggestedFilename()).toBe("foglass.png");
  await page.getByRole("button", { name: "Record 10s", exact: true }).click();
  await page.waitForTimeout(500);
  const movie = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Stop recording", exact: true })
    .click();
  expect((await movie).suggestedFilename()).toMatch(/foglass\.(webm|mp4)/);
  await expect(
    page.getByRole("button", { name: "Record 10s", exact: true }),
  ).toBeVisible();
});
