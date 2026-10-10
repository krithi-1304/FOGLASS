import { test, expect } from "@playwright/test";
test("microphone noise triggers real analyser and disabling stops it", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = navigator.mediaDevices.getUserMedia.bind(
      navigator.mediaDevices,
    );
    navigator.mediaDevices.getUserMedia = async (constraints) => {
      if (!constraints.audio) return original(constraints);
      const ctx = new AudioContext(),
        buffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate),
        data = buffer.getChannelData(0);
      let seed = 7;
      for (let i = 0; i < data.length; i++) {
        seed = (seed * 1664525 + 1013904223) >>> 0;
        data[i] = seed / 4294967296 - 0.5;
      }
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      const gain = ctx.createGain();
      gain.gain.value = 0.0001;
      const out = ctx.createMediaStreamDestination();
      source.connect(gain);
      gain.connect(out);
      source.start();
      await ctx.resume();
      Object.assign(window, {
        testBlow: () => {
          gain.gain.value = 0.8;
        },
      });
      return out.stream;
    };
  });
  await page.goto("/?test=1&seed=7");
  await page.getByRole("button", { name: "Try without camera" }).click();
  await page.getByRole("button", { name: "Tools", exact: true }).click();
  await page
    .getByRole("button", { name: "Enable breath", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Breath on · disable" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Clear", exact: true }).click();
  await page.evaluate(() =>
    (window as unknown as { testBlow: () => void }).testBlow(),
  );
  await expect
    .poll(
      () =>
        page.evaluate(() =>
          (
            window as unknown as { __foglass: { getFogCoverage: () => number } }
          ).__foglass.getFogCoverage(),
        ),
      { timeout: 4000 },
    )
    .toBeGreaterThan(0.3);
  await page.getByRole("button", { name: "Breath on · disable" }).click();
  await expect(
    page.getByRole("button", { name: "Enable breath", exact: true }),
  ).toHaveAttribute("aria-pressed", "false");
});
test("microphone denied is recoverable without losing the mirror", async ({
  page,
}) => {
  await page.addInitScript(() => {
    navigator.mediaDevices.getUserMedia = async () => {
      throw new DOMException("Denied", "NotAllowedError");
    };
  });
  await page.goto("/?test=1");
  await page.getByRole("button", { name: "Try without camera" }).click();
  await page.getByRole("button", { name: "Tools", exact: true }).click();
  await page
    .getByRole("button", { name: "Enable breath", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText(
    "Microphone unavailable",
  );
  await expect(
    page.getByRole("button", { name: "Enable breath", exact: true }),
  ).toBeEnabled();
});
