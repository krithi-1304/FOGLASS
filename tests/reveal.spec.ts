import { test, expect } from "@playwright/test";
test("modes and private message reveal work without a backend", async ({
  page,
}) => {
  const offOrigin: string[] = [];
  page.on("request", (r) => {
    if (!r.url().startsWith("http://127.0.0.1:5173")) offOrigin.push(r.url());
  });
  await page.goto("/?test=1&seed=7&speed=4");
  await page.getByRole("button", { name: "Try without camera" }).click();
  await page.getByRole("button", { name: "Tools", exact: true }).click();
  await page.getByLabel("Mode", { exact: true }).selectOption("writing");
  await page.getByLabel("Mode", { exact: true }).selectOption("reveal");
  await page.getByLabel("Hidden message").fill("Happy Birthday, Krithi");
  await page.getByRole("button", { name: "Use message", exact: true }).click();
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (
            window as unknown as {
              __foglass: { getState: () => { mirrorMode: string } };
            }
          ).__foglass.getState().mirrorMode,
      ),
    )
    .toBe("reveal");
  await page.waitForTimeout(1700);
  await page.evaluate(() => {
    const a = (
      window as unknown as { __foglass: { setTimeScale: (n: number) => void } }
    ).__foglass;
    a.setTimeScale(0);
  });
  const before = await page.evaluate(() =>
    (
      window as unknown as {
        __foglass: { samplePixel: (x: number, y: number) => number[] };
      }
    ).__foglass.samplePixel(0.25, 0.5),
  );
  await page.getByRole("button", { name: "Clear", exact: true }).click();
  await page.waitForTimeout(100);
  const after = await page.evaluate(() =>
    (
      window as unknown as {
        __foglass: { samplePixel: (x: number, y: number) => number[] };
      }
    ).__foglass.samplePixel(0.25, 0.5),
  );
  expect(after).not.toEqual(before);
  await page.getByLabel("Mode", { exact: true }).selectOption("mirror");
  await expect(page.getByLabel("Hidden message")).toBeHidden();
  expect(offOrigin).toEqual([]);
});
test("typing control letters never clears or saves the mirror", async ({
  page,
}) => {
  await page.goto("/?test=1");
  await page.getByRole("button", { name: "Try without camera" }).click();
  await page.getByRole("button", { name: "Tools", exact: true }).click();
  await page.getByLabel("Mode", { exact: true }).selectOption("reveal");
  let downloads = 0;
  page.on("download", () => downloads++);
  await page.waitForTimeout(900);
  const before = await page.evaluate(() => {
    const a = (
      window as unknown as {
        __foglass: {
          setTimeScale: (n: number) => void;
          getFogCoverage: () => number;
        };
      }
    ).__foglass;
    a.setTimeScale(0);
    return a.getFogCoverage();
  });
  await page.getByLabel("Hidden message").fill("");
  await page.getByLabel("Hidden message").pressSequentially("cshb");
  const after = await page.evaluate(() =>
    (
      window as unknown as { __foglass: { getFogCoverage: () => number } }
    ).__foglass.getFogCoverage(),
  );
  expect(after).toBeCloseTo(before, 4);
  expect(downloads).toBe(0);
  await expect(page.getByLabel("Hidden message")).toHaveValue(/cshb$/);
});
test("local photo upload is revealed and invalid formats report recovery", async ({
  page,
}) => {
  await page.goto("/?test=1&seed=7");
  await page.getByRole("button", { name: "Try without camera" }).click();
  await page.getByRole("button", { name: "Tools", exact: true }).click();
  await page.getByLabel("Mode", { exact: true }).selectOption("reveal");
  const png = await page.evaluate(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 32;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#d84c35";
    ctx.fillRect(0, 0, 32, 32);
    return c.toDataURL().split(",")[1];
  });
  await page.locator("#reveal-file").setInputFiles({
    name: "local.png",
    mimeType: "image/png",
    buffer: Buffer.from(png, "base64"),
  });
  await page.waitForTimeout(100);
  await page.getByRole("button", { name: "Clear", exact: true }).click();
  await expect
    .poll(() =>
      page.evaluate(() => {
        const p = (
          window as unknown as {
            __foglass: { samplePixel: (x: number, y: number) => number[] };
          }
        ).__foglass.samplePixel(0.5, 0.5);
        return p[0] - p[2];
      }),
    )
    .toBeGreaterThan(80);
  await page.locator("#reveal-file").setInputFiles({
    name: "bad.svg",
    mimeType: "image/svg+xml",
    buffer: Buffer.from("<svg/>"),
  });
  await expect(page.getByRole("status")).toContainText("PNG, JPG or WebP");
});
