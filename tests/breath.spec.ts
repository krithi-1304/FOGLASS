import { test, expect } from "@playwright/test";
test("low-frequency airflow reaches the real analyser from the visible breath control", async ({
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
      gain.gain.value = 0.01;
      const out = ctx.createMediaStreamDestination();
      const lowpass = ctx.createBiquadFilter();
      lowpass.type = "lowpass";
      lowpass.frequency.value = 250;
      lowpass.Q.value = 0.7;
      source.connect(lowpass);
      lowpass.connect(gain);
      gain.connect(out);
      source.start();
      await ctx.resume();
      Object.assign(window, {
        testQuiet: () => {
          gain.gain.value = 0.01;
        },
        testBlow: () => {
          gain.gain.value = 0.8;
        },
      });
      return out.stream;
    };
  });
  await page.goto("/?test=1&seed=7");
  await page.getByRole("button", { name: "Try without camera" }).click();
  await page
    .getByRole("button", { name: "Enable breath", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Breath on · disable" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Tools", exact: true }).click();
  await page.getByRole("slider", { name: "Breath sensitivity" }).fill("4");
  await page.waitForTimeout(600);
  await expect(page.locator("#breath-message")).not.toHaveText(
    "Breath detected",
  );
  await page.getByRole("button", { name: "Tools", exact: true }).click();
  await page.locator("#mirror").click({ position: { x: 40, y: 40 } });
  await page.keyboard.press("c");
  await expect
    .poll(() =>
      page.evaluate(() =>
        (
          window as unknown as { __foglass: { getFogCoverage(): number } }
        ).__foglass.getFogCoverage(),
      ),
    )
    .toBeLessThan(0.02);
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (
            window as unknown as {
              __foglass: {
                getState(): { breathSignal: { waitingForQuiet: boolean } };
              };
            }
          ).__foglass.getState().breathSignal.waitingForQuiet,
      ),
    )
    .toBe(false);
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
  // Wipe while the sound is still present: the old burst cannot immediately refog it.
  await page.mouse.move(550, 280);
  await page.mouse.down();
  await page.mouse.move(730, 280, { steps: 8 });
  await page.mouse.up();
  const sample = () =>
    page.evaluate(() =>
      (
        window as unknown as {
          __foglass: { sampleMask(x: number, y: number): number };
        }
      ).__foglass.sampleMask(0.5, 280 / 720),
    );
  await expect.poll(sample).toBeLessThan(0.15);
  await page.waitForTimeout(500);
  expect(await sample()).toBeLessThan(0.15);
  await page.evaluate(() =>
    (window as unknown as { testQuiet: () => void }).testQuiet(),
  );
  await expect(page.locator("#breath-message")).not.toHaveText(
    "Breath detected",
  );
  await page.getByRole("button", { name: "Tools", exact: true }).click();
  await page
    .getByRole("button", { name: "Recalibrate breath", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Breath on · disable" }),
  ).toBeVisible();
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

test("repeated microphone use closes resources and resumes after audio suspension", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.addInitScript(() => {
    const contexts: AudioContext[] = [],
      streams: MediaStream[] = [];
    Object.assign(window, { audioTest: { contexts, streams } });
    const Original = window.AudioContext;
    window.AudioContext = class extends Original {
      constructor(options?: AudioContextOptions) {
        super(options);
        contexts.push(this);
      }
    };
    const get = navigator.mediaDevices.getUserMedia.bind(
      navigator.mediaDevices,
    );
    navigator.mediaDevices.getUserMedia = async (constraints) => {
      const stream = await get(constraints);
      streams.push(stream);
      return stream;
    };
  });
  await page.goto("/?test=1");
  await page.getByRole("button", { name: "Try without camera" }).click();
  for (let i = 0; i < 6; i++) {
    await page
      .getByRole("button", { name: "Enable breath", exact: true })
      .click();
    await expect(
      page.getByRole("button", { name: "Breath on · disable" }),
    ).toBeVisible();
    if (i === 2) {
      await page.evaluate(async () => {
        await (
          window as unknown as { audioTest: { contexts: AudioContext[] } }
        ).audioTest.contexts
          .at(-1)!
          .suspend();
      });
      await page
        .getByRole("button", { name: "Resume breath", exact: true })
        .click();
      await expect(
        page.getByRole("button", { name: "Breath on · disable" }),
      ).toBeVisible();
    }
    await page.getByRole("button", { name: "Breath on · disable" }).click();
  }
  const result = await page.evaluate(() => {
    const state = (
      window as unknown as {
        audioTest: { contexts: AudioContext[]; streams: MediaStream[] };
      }
    ).audioTest;
    return {
      states: state.contexts.map((c) => c.state),
      live: state.streams
        .flatMap((s) => s.getTracks())
        .filter((t) => t.readyState === "live").length,
    };
  });
  expect(result.live).toBe(0);
  expect(result.states.every((s) => s === "closed")).toBe(true);
  expect(errors).toEqual([]);
});
