import { test, expect } from "@playwright/test";
const begin = async (page: import("@playwright/test").Page) => {
  await page.goto("/?test=1&seed=7");
  await page.getByRole("button", { name: "Try without camera" }).click();
};
const sheet = async (page: import("@playwright/test").Page) => {
  await page.mouse.move(640, 700);
  await page.getByRole("button", { name: "Letters", exact: true }).click();
};
test("previewing a letter resumes paused glass so it can be uncovered", async ({
  page,
}) => {
  await begin(page);
  await page.getByRole("button", { name: "Tools", exact: true }).click();
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  await sheet(page);
  await page.getByLabel("Title", { exact: true }).fill("Still here");
  await page.getByLabel("A note beneath the mist").fill("Find me");
  await page.getByRole("button", { name: "Try this letter" }).click();
  await expect(
    page.getByRole("button", { name: "Pause", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Clear", exact: true }).click();
  await page.getByRole("button", { name: "Add steam", exact: true }).click();
  await expect
    .poll(() =>
      page.evaluate(() =>
        (
          window as unknown as {
            __foglass: { sampleMask(x: number, y: number): number };
          }
        ).__foglass.sampleMask(0.5, 0.5),
      ),
    )
    .toBeGreaterThan(0.4);
});
test("copy retry reuses the prepared link after clipboard permission fails", async ({
  page,
}) => {
  let creates = 0;
  await page.route("http://127.0.0.1:8787/letters", async (route) => {
    creates++;
    await route.fulfill({
      json: {
        id: creates.toString(16).padStart(32, "0"),
        deleteToken: "test-owner",
        expiresAt: Date.now() + 86400000,
      },
    });
  });
  await page.addInitScript(() => {
    let attempts = 0;
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: async (value: string) => {
          if (++attempts === 1)
            throw new DOMException("Blocked", "NotAllowedError");
          (window as unknown as { copied: string }).copied = value;
        },
      },
    });
  });
  await page.goto("/?test=1&letters=local");
  await page.getByRole("button", { name: "Try without camera" }).click();
  await sheet(page);
  await page.getByLabel("Title", { exact: true }).fill("Copy retry");
  await page.getByRole("button", { name: "Copy share link" }).click();
  await expect(page.getByLabel("Letter share link")).toBeVisible();
  const link = await page.getByLabel("Letter share link").inputValue();
  await page.getByRole("button", { name: "Copy share link" }).click();
  await expect(page.locator("#letter-status")).toContainText("Link copied");
  expect(creates).toBe(1);
  expect(
    await page.evaluate(() => (window as unknown as { copied: string }).copied),
  ).toBe(link);
});
test("editing a saved letter as a copy preserves the original", async ({
  page,
}) => {
  await begin(page);
  await sheet(page);
  await page.getByLabel("Title", { exact: true }).fill("Original memory");
  await page.getByLabel("A note beneath the mist").fill("Keep this thought.");
  await page.getByRole("button", { name: "Keep on this device" }).click();
  await page.getByRole("button", { name: "Your collection" }).click();
  await page
    .getByRole("button", { name: "Original memory", exact: true })
    .click();
  await page.getByRole("button", { name: "Edit a copy" }).click();
  await page.getByLabel("Title", { exact: true }).fill("Another memory");
  await page.getByLabel("A note beneath the mist").fill("A different thought.");
  await page.getByRole("button", { name: "Keep on this device" }).click();
  await page.getByRole("button", { name: "Your collection" }).click();
  await expect(
    page.getByRole("button", { name: "Another memory", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Original memory", exact: true })
    .click();
  await page.getByRole("button", { name: "Edit a copy" }).click();
  await expect(page.getByLabel("A note beneath the mist")).toHaveValue(
    "Keep this thought.",
  );
});
test("write, save, portable share, uncover and reply without a backend", async ({
  page,
  context,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await begin(page);
  await page.mouse.move(350, 330);
  await page.mouse.down();
  await page.mouse.move(700, 400, { steps: 15 });
  await page.mouse.up();
  await sheet(page);
  await page.getByLabel("Title", { exact: true }).fill("For tomorrow");
  await page.getByLabel("A note beneath the mist").fill("You have got this.");
  await page.getByRole("button", { name: "Keep on this device" }).click();
  await expect(page.locator("#letter-status")).toContainText("Kept");
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download letter" }).click();
  expect((await download).suggestedFilename()).toBe("a-little-mist.foglass");
  await page.getByRole("button", { name: "Copy share link" }).click();
  await expect(page.getByLabel("Letter share link")).toHaveValue(/#mist=/);
  const url = await page.getByLabel("Letter share link").inputValue();
  expect(url).toContain("#mist=");
  const recipient = await context.newPage();
  await recipient.goto(url);
  await expect(recipient.getByLabel("Title", { exact: true })).toHaveValue(
    "For tomorrow",
  );
  await expect(recipient.getByLabel("A note beneath the mist")).toBeHidden();
  await expect(
    recipient.getByRole("region", { name: "Sealed letter" }),
  ).toBeVisible();
  await recipient
    .getByRole("button", { name: "Use camera & hand tracking" })
    .click();
  await expect
    .poll(() =>
      recipient.evaluate(
        () =>
          (
            window as unknown as {
              __foglass?: { getState(): { mode: string } };
            }
          ).__foglass?.getState().mode ||
          document.querySelector("#camera-state")?.textContent,
      ),
    )
    .toMatch(/camera|CAMERA ON/);
  await recipient.keyboard.down("b");
  await recipient.waitForTimeout(600);
  await recipient.keyboard.up("b");
  await sheet(recipient);
  await recipient.getByRole("button", { name: "Replay handwriting" }).click();
  await recipient.waitForTimeout(800);
  await sheet(recipient);
  await recipient.getByRole("button", { name: "Leave a reply" }).click();
  await expect(recipient.getByLabel("Title", { exact: true })).toHaveValue(
    "Re: For tomorrow",
  );
  await expect(recipient.getByLabel("A note beneath the mist")).toHaveValue("");
  await page.getByRole("button", { name: "Your collection" }).click();
  await page.getByRole("button", { name: "For tomorrow", exact: true }).click();
  await expect(page.getByLabel("A note beneath the mist")).toHaveValue(
    "You have got this.",
  );
  expect(errors).toEqual([]);
});
test("bad letter files and corrupt links show recovery without executing content", async ({
  page,
}) => {
  await begin(page);
  await sheet(page);
  await page.locator("#letter-file").setInputFiles({
    name: "bad.foglass",
    mimeType: "application/json",
    buffer: Buffer.from('{"version":999}'),
  });
  await expect(page.locator("#letter-status")).toContainText("not supported");
  await page.getByRole("button", { name: "Close letters" }).click();
  await page.goto("/#mist=not-a-valid-letter");
  await expect(page.locator("#letter-status")).not.toContainText(
    "Opening your letter",
  );
  await page.getByRole("button", { name: "Close letters" }).click();
  await expect(
    page.getByRole("button", { name: "Start", exact: false }),
  ).toBeVisible();
});
test("letters sheet fits mobile and supports keyboard dismissal", async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await begin(page);
  await page.mouse.move(190, 820);
  await page.getByRole("button", { name: "Letters", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
    390,
  );
  await page.screenshot({ path: testInfo.outputPath("letters-mobile.png") });
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
});
test("letter effects keep the original handwriting unchanged while uncovering", async ({
  page,
}, testInfo) => {
  await begin(page);
  await page.mouse.move(350, 300);
  await page.mouse.down();
  await page.mouse.move(600, 450, { steps: 20 });
  await page.mouse.up();
  await sheet(page);
  await page
    .getByLabel("A note beneath the mist")
    .fill("a little weather, just for you");
  await page.getByText("Atmosphere & little details", { exact: true }).click();
  await page.getByLabel("A little magic").selectOption("rain");
  await page.getByLabel("Uncover with").selectOption("wipe");
  await page.getByRole("button", { name: "Try this letter" }).click();
  await page.mouse.move(700, 300);
  await page.mouse.down();
  await page.mouse.move(800, 500, { steps: 12 });
  await page.mouse.up();
  await page.waitForTimeout(1500);
  await sheet(page);
  await expect(page.locator("#letter-drawing-note")).toContainText(
    "1 drawn marks",
  );
  await page.screenshot({ path: testInfo.outputPath("letters-desktop.png") });
});

test("breath reveals remembered writing in the composite and windows clear their interiors", async ({
  page,
}) => {
  await begin(page);
  await sheet(page);
  const letter = {
    version: 1,
    title: "Memory test",
    message: "",
    from: "",
    theme: "rose",
    reveal: "breath",
    effect: "memory",
    aspect: 1280 / 720,
    createdAt: Date.now(),
    strokes: [
      {
        radius: 0.025,
        points: [
          [0.25, 0.5, 0],
          [0.75, 0.5, 300],
        ],
      },
    ],
  };
  const upload = async (value: unknown) =>
    page.locator("#letter-file").setInputFiles({
      name: "memory.foglass",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify(value)),
    });
  await upload(letter);
  await expect(page.getByLabel("Title", { exact: true })).toHaveValue(
    "Memory test",
  );
  await page.getByRole("button", { name: "Close letters" }).click();
  const sample = () =>
    page.evaluate(() => {
      const api = (
        window as unknown as {
          __foglass: {
            setTimeScale(n: number): void;
            samplePixel(x: number, y: number): number[];
          };
        }
      ).__foglass;
      api.setTimeScale(0);
      return api
        .samplePixel(0.5, 0.5)
        .slice(0, 3)
        .reduce((a, b) => a + b, 0);
    });
  await page.waitForTimeout(100);
  const before = await sample();
  await page.keyboard.down("b");
  await page.waitForTimeout(180);
  const during = await sample();
  await page.keyboard.up("b");
  expect(before - during).toBeGreaterThan(35);
  await sheet(page);
  await upload({
    ...letter,
    title: "Window test",
    reveal: "wipe",
    effect: "window",
    strokes: [
      {
        radius: 0.015,
        points: Array.from({ length: 41 }, (_, i) => [
          0.5 + Math.cos((i * Math.PI) / 20) * 0.2,
          0.5 + Math.sin((i * Math.PI) / 20) * 0.2,
          i * 20,
        ]),
      },
    ],
  });
  await expect(page.getByLabel("Title", { exact: true })).toHaveValue(
    "Window test",
  );
  await page.getByRole("button", { name: "Close letters" }).click();
  await page.waitForTimeout(150);
  expect(before - (await sample())).toBeGreaterThan(35);
});

test("online UI creates a real letter, receives a reply and deletes the conversation", async ({
  page,
  context,
}) => {
  await page.goto("/?test=1&letters=local");
  await page.getByRole("button", { name: "Try without camera" }).click();
  await sheet(page);
  await page.getByLabel("Title", { exact: true }).fill("An online memory");
  await page.getByLabel("A note beneath the mist").fill("See you in the rain.");
  await page.getByRole("button", { name: "Copy share link" }).click();
  await expect(page.getByLabel("Letter share link")).toBeVisible();
  const link = new URL(await page.getByLabel("Letter share link").inputValue());
  expect(link.hash).toMatch(/^#letter=[a-f0-9]{32}$/);
  link.search = "?test=1&letters=local";
  const recipient = await context.newPage();
  await recipient.goto(link.href);
  await expect(recipient.getByLabel("Title", { exact: true })).toHaveValue(
    "An online memory",
  );
  await recipient.getByRole("button", { name: "Leave a reply" }).click();
  await recipient
    .getByLabel("A note beneath the mist")
    .fill("I found your letter.");
  await recipient.getByRole("button", { name: "Copy share link" }).click();
  await expect(recipient.getByLabel("Letter share link")).toBeVisible();
  await page.getByRole("button", { name: "Your collection" }).click();
  await page
    .getByRole("button", { name: "An online memory", exact: true })
    .click();
  await page.getByRole("button", { name: "Read replies" }).click();
  await expect(
    page.getByRole("button", { name: "Re: An online memory", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Your collection" }).click();
  await page
    .getByRole("button", { name: "Remove An online memory", exact: true })
    .click();
  await expect(page.locator("#letter-status")).toHaveText("Letter removed.");
  await recipient.reload();
  await expect(recipient.locator("#letter-status")).toContainText(
    "expired or was removed",
  );
});
