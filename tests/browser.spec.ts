import { expect, test, type Page } from "@playwright/test";

function collectPageErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  return errors;
}

test("educational scope, sources, and disclaimer remain visible", async ({ page }) => {
  const errors = collectPageErrors(page);
  await page.goto("/?fallback=1");

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "See how a motor signal becomes movement.",
    }),
  ).toBeVisible();
  await expect(page.getByRole("main")).toBeVisible();
  const experience = page.locator("#experience");
  await expect(
    experience.getByRole("img", { name: /Simplified two-dimensional lower motor unit/ }),
  ).toBeVisible();
  await expect(page.getByText("this is not a clinical staging system", { exact: false })).toBeVisible();
  await expect(page.getByText("Educational disclaimer:", { exact: false })).toBeVisible();

  const sourceLinks = page.locator("#sources a");
  await expect(sourceLinks).toHaveCount(8);
  for (const link of await sourceLinks.all()) {
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute("rel", "noreferrer");
  }
  expect(errors).toEqual([]);
});

test("mode, timeline, structure, and journey controls are keyboard-operable", async ({ page }) => {
  const errors = collectPageErrors(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/?fallback=1");

  const experience = page.locator("#experience");

  const als = experience.getByRole("button", { name: "ALS", exact: true });
  await als.focus();
  await page.keyboard.press("Enter");
  await expect(als).toHaveAttribute("aria-pressed", "true");

  const timeline = experience.getByRole("slider", { name: "Illustrative ALS-related changes" });
  await timeline.focus();
  await page.keyboard.press("End");
  await expect(timeline).toHaveValue("5");
  await expect(page.getByText("Progressive motor-neuron loss", { exact: false })).toBeVisible();

  const anatomy = experience.locator("details.structure-index > summary");
  await expect(anatomy).toContainText("Browse the anatomy index");
  await anatomy.focus();
  await page.keyboard.press("Enter");
  await expect(experience.locator("details.structure-index")).toHaveAttribute("open", "");
  const junction = experience.getByRole("button", { name: /Neuromuscular junction$/ });
  await junction.focus();
  await page.keyboard.press("Enter");
  await expect(junction).toHaveAttribute("aria-pressed", "true");

  await experience.getByRole("button", { name: "Signal journey", exact: true }).click();
  await expect(experience.getByRole("status").filter({ hasText: "Signal journey" })).toBeVisible();
  expect(errors).toEqual([]);
});

test("comparison and narrow layouts do not overflow horizontally", async ({ page }) => {
  const errors = collectPageErrors(page);
  const experience = page.locator("#experience");
  for (const width of [320, 375, 390, 768, 1366]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/?fallback=1");
    await experience.getByRole("button", { name: "Compare", exact: true }).click();
    await expect(experience.getByRole("list", { name: "Comparison scene legend" })).toBeVisible();
    const dimensions = await page.evaluate(() => ({
      client: document.documentElement.clientWidth,
      scroll: document.documentElement.scrollWidth,
    }));
    expect(dimensions.scroll, `${width}px viewport overflowed`).toBe(dimensions.client);
  }
  expect(errors).toEqual([]);
});

test("cinematic hero controls render, focus, and link to the atlas", async ({ page }) => {
  const errors = collectPageErrors(page);
  await page.goto("/?fallback=1");

  const hero = page.getByRole("banner");

  for (const name of ["Normal", "ALS", "Compare"] as const) {
    const mode = hero.getByRole("button", { name, exact: true });
    await expect(mode).toBeVisible();
    await expect(mode).toHaveAttribute("aria-pressed", name === "Normal" ? "true" : "false");
  }

  const als = hero.getByRole("button", { name: "ALS", exact: true });
  await als.focus();
  await page.keyboard.press("Enter");
  await expect(als).toHaveAttribute("aria-pressed", "true");

  const stateSlider = hero.getByRole("slider", { name: "Hero illustrative state" });
  await expect(stateSlider).toBeVisible();
  await expect(stateSlider).toBeEnabled();
  await stateSlider.focus();
  await page.keyboard.press("End");
  await expect(stateSlider).toHaveValue("5");

  await expect(hero.getByRole("button", { name: /^(Play|Pause) motion$/ })).toBeVisible();

  for (const chapter of ["Cell body", "Axon", "Junction", "Muscle"] as const) {
    const button = hero.getByRole("button", { name: chapter, exact: true });
    await expect(button).toBeVisible();
    await button.focus();
    await expect(button).toBeFocused();
  }

  const cta = hero.getByRole("link", { name: "Explore the full atlas" });
  await expect(cta).toHaveAttribute("href", "#experience");

  await expect(
    hero.getByText("One spinal lower motor unit · educational schematic · not to scale."),
  ).toBeVisible();

  await page.setViewportSize({ width: 390, height: 844 });
  const dimensions = await page.evaluate(() => ({
    client: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth,
  }));
  expect(dimensions.scroll, "390px viewport overflowed").toBe(dimensions.client);

  expect(errors).toEqual([]);
});
