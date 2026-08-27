import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const viewportWidths = [1280, 864, 390, 320] as const;
const caseStudyRoutes = [
  "/work/field-index/",
  "/work/coffee-cupping/",
  "/work/lineage/",
  "/work/npkn-studio/",
  "/work/gumo-supplies/",
  "/work/mchns/",
  "/work/soul-mag/",
  "/work/pixel-vault/",
] as const;
const allRoutes = ["/", ...caseStudyRoutes] as const;
const playwrightPort = process.env.PLAYWRIGHT_PORT ?? "4331";
const playwrightBaseUrl = `http://127.0.0.1:${playwrightPort}`;

async function expectNoHorizontalOverflow(page: Page) {
  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    bodyScrollWidth: document.body.scrollWidth,
    offenders: [...document.querySelectorAll<HTMLElement>("body *")]
      .map((element) => {
        const bounds = element.getBoundingClientRect();
        return {
          element: `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ""}${
            element.className && typeof element.className === "string"
              ? `.${element.className.trim().replace(/\s+/g, ".")}`
              : ""
          }`,
          left: Math.round(bounds.left),
          right: Math.round(bounds.right),
          width: Math.round(bounds.width),
          scrollWidth: element.scrollWidth,
        };
      })
      .filter(({ left, right }) => left < -1 || right > document.documentElement.clientWidth + 1)
      .slice(0, 10),
  }));

  const overflowDetail = dimensions.offenders
    .map(
      ({ element, left, right, width, scrollWidth }) =>
        `${element} left=${left} right=${right} width=${width} scrollWidth=${scrollWidth}`,
    )
    .join("\n");

  expect(
    dimensions.scrollWidth,
    `document width ${dimensions.scrollWidth}px exceeded viewport ${dimensions.clientWidth}px\n${overflowDetail}`,
  ).toBeLessThanOrEqual(dimensions.clientWidth + 1);
  expect(
    dimensions.bodyScrollWidth,
    `body width ${dimensions.bodyScrollWidth}px exceeded viewport ${dimensions.clientWidth}px\n${overflowDetail}`,
  ).toBeLessThanOrEqual(dimensions.clientWidth + 1);
}

async function expectCanvasReady(page: Page, name: RegExp) {
  const canvas = page.getByRole("img", { name });
  await canvas.scrollIntoViewIfNeeded();
  await expect(canvas).toHaveCSS("opacity", "1");
  return canvas;
}

async function expectAccessiblePage(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();

  expect(
    results.violations,
    results.violations
      .map(({ id, impact, help }) => `${impact ?? "unknown"}: ${id} — ${help}`)
      .join("\n"),
  ).toEqual([]);
}

test.describe("static portfolio", () => {
  test("homepage is semantic, static, and links to eight internal case studies", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("tony bermea");
    await expect(page.locator(".work-list")).toHaveRole("list");
    await expect(page.locator(".work-list > li")).toHaveCount(8);
    await expect(page.locator("script")).toHaveCount(0);
    await expect(page.getByAltText(/lightning strikes over Walter De Maria’s field/i)).toBeVisible();

    for (const [name, route] of [
      ["Field Index", "/work/field-index/"],
      ["Coffee Cupping", "/work/coffee-cupping/"],
      ["Gumo Supplies", "/work/gumo-supplies/"],
      ["Lineage", "/work/lineage/"],
      ["NPKN Studio", "/work/npkn-studio/"],
      ["MCHNS", "/work/mchns/"],
      ["Soul Mag", "/work/soul-mag/"],
      ["Pixel Vault", "/work/pixel-vault/"],
    ] as const) {
      await expect(page.getByRole("link", { name: new RegExp(name, "i") })).toHaveAttribute("href", route);
    }

    await expect(page.getByRole("link", { name: "linkedin" })).toHaveAttribute(
      "href",
      "https://www.linkedin.com/in/tony-bermea/",
    );
    await expect(page.getByRole("link", { name: /Pixel Vault \(2023 · decommissioned\)/i })).toHaveAttribute(
      "href",
      "/work/pixel-vault/",
    );
    await expect(page.locator('a[href*="example.com"]')).toHaveCount(0);
    await expect(page.getByText(/Built across product strategy, interface design, web engineering, and cloud delivery/i)).toBeVisible();

    await page.getByRole("link", { name: /Coffee Cupping/i }).click();
    await expect(page).toHaveURL(/\/work\/coffee-cupping\/$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Coffee Cupping");
  });

  test("Lineage suppresses its broken live-project link", async ({ page }) => {
    await page.goto("/work/lineage/");
    await expect(page.locator('.case-live-link')).toHaveCount(0);
    await expect(page.locator('a[href="https://lineage-trials.netlify.app/"]')).toHaveCount(0);
  });

  test("Soul Mag and Pixel Vault remain static with one source link each", async ({ page }) => {
    await page.goto("/work/soul-mag/");
    await expect(page.locator("script")).toHaveCount(0);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Soul Mag");
    const soulLinks = page.locator('a[href="https://silly-faloodeh-0d1ed4.netlify.app/"]');
    await expect(soulLinks).toHaveCount(1);
    await expect(soulLinks).toHaveText("view interactive concept ↗︎");
    await expect(page.locator(".mdx-gallery a, .mdx-figure a")).toHaveCount(0);

    await page.goto("/work/pixel-vault/");
    await expect(page.locator("script")).toHaveCount(0);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Pixel Vault");
    await expect(page.locator(".dateline")).toHaveText(
      "2023 · decommissioned · NFT marketplace prototype",
    );
    const pixelLinks = page.locator(
      'a[href="https://phenomenal-custard-0bd4af.netlify.app/"]',
    );
    await expect(pixelLinks).toHaveCount(1);
    await expect(pixelLinks).toHaveText("view preserved snapshot ↗︎");
    await expect(page.locator(".mdx-gallery a, .mdx-figure a")).toHaveCount(0);
  });

  test("NPKN remains fully static", async ({ page }) => {
    await page.goto("/work/npkn-studio/");
    await expect(page.locator("script")).toHaveCount(0);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("NPKN Studio");

    const gallery = page.locator(".mdx-gallery");
    await expect(gallery.locator(".mdx-gallery__item")).toHaveCount(6);
    await expect(gallery.locator("a")).toHaveCount(0);
    await expect(page.locator(".mdx-figure a")).toHaveCount(0);

    const npknLinks = page.locator('a[href^="https://strong-bavarois-ba61f6.netlify.app/"]');
    await expect(npknLinks).toHaveCount(2);
    await expect(npknLinks.nth(0)).toHaveAttribute(
      "href",
      "https://strong-bavarois-ba61f6.netlify.app/",
    );
    await expect(npknLinks.nth(1)).toHaveAttribute(
      "href",
      "https://strong-bavarois-ba61f6.netlify.app/work/plvs%20vltra",
    );
  });

  test("Gumo and MCHNS remain static with constrained outbound links", async ({ page }) => {
    await page.goto("/work/gumo-supplies/");
    await expect(page.locator("script")).toHaveCount(0);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Gumo Supplies");
    await expect(page.locator(".commerce-mockup")).toHaveCount(3);
    await expect(page.locator('[data-commerce-view="collection"]')).toHaveCount(1);
    await expect(page.locator('[data-commerce-view="product"]')).toHaveCount(1);
    await expect(page.locator('[data-commerce-view="cart"]')).toHaveCount(1);
    await expect(page.locator('a[href^="https://"]')).toHaveCount(0);

    await page.goto("/work/mchns/");
    await expect(page.locator("script")).toHaveCount(0);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("MCHNS");
    const behanceLinks = page.locator('a[href="https://www.behance.net/gallery/167302435/MCHNS"]');
    await expect(behanceLinks).toHaveCount(1);
    await expect(behanceLinks).toHaveText("view project on Behance ↗︎");
    await expect(page.locator(".mdx-gallery a, .mdx-figure a")).toHaveCount(0);
  });

  test("unknown work slugs return the custom 404", async ({ request }) => {
    const response = await request.get("/work/not-a-real-project/");
    expect(response.status()).toBe(404);
    expect(await response.text()).toContain("Page not found");
  });

  for (const width of viewportWidths) {
    test(`all routes do not overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: width <= 390 ? 844 : 900 });

      for (const route of allRoutes) {
        await page.goto(route);
        await expectNoHorizontalOverflow(page);
      }
    });
  }

  test("pages have one H1, meaningful image alternatives, focus, and no axe violations", async ({ page }) => {
    for (const route of allRoutes) {
      await page.goto(route);
      await expect(page.locator("h1")).toHaveCount(1);

      const images = page.locator("img");
      const imageCount = await images.count();
      expect(imageCount).toBeGreaterThan(0);
      for (let index = 0; index < imageCount; index += 1) {
        await expect(images.nth(index)).toHaveAttribute("alt", /\S/);
      }

      await page.keyboard.press("Tab");
      const focused = page.locator(":focus-visible");
      await expect(focused).toHaveCount(1);
      const focusStyle = await focused.evaluate((element) => {
        const style = getComputedStyle(element);
        return {
          outlineStyle: style.outlineStyle,
          outlineWidth: parseFloat(style.outlineWidth),
        };
      });
      expect(focusStyle.outlineStyle).not.toBe("none");
      expect(focusStyle.outlineWidth).toBeGreaterThanOrEqual(2);

      await expectAccessiblePage(page);
    }
  });
});

test.describe("Coffee Cupping interactions", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/work/coffee-cupping/");
    await page.locator('[data-demo="cupping-compare"]').scrollIntoViewIfNeeded();
  });

  test("switches modes and links keyboard lot selection to the value point", async ({ page }) => {
    const modeGroup = page.getByRole("group", { name: "Score display mode" });
    const absolute = modeGroup.getByRole("button", { name: "Absolute" });
    const delta = modeGroup.getByRole("button", { name: "Delta" });
    await expect(absolute).toHaveAttribute("aria-pressed", "true");
    await delta.click();
    await expect(delta).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("status").filter({ hasText: /Deltas from the room average/i })).toBeVisible();

    const konga = page.getByRole("button", { name: "Konga", exact: true });
    await konga.focus();
    await page.keyboard.press("Enter");
    await expect(konga).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("status").filter({ hasText: /Konga selected/i })).toBeVisible();
    await expect(page.getByRole("img", { name: /Konga is selected at \$5.10 per pound/i })).toBeVisible();
  });
});

test.describe("Lineage interactions", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/work/lineage/");
    await page.locator('[data-demo="protocol-diff"]').scrollIntoViewIfNeeded();
  });

  test("keeps main fixed while regional diff controls update counts and fields", async ({ page }) => {
    const regions = page.getByRole("group", { name: "Protocol region" });
    const eu = regions.getByRole("button", { name: /EU · European Union/i });
    const us = regions.getByRole("button", { name: /US · United States/i });
    await expect(eu).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByLabel("European Union diff summary")).toContainText("6");

    await us.focus();
    await page.keyboard.press("Space");
    await expect(us).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("status").filter({ hasText: /United States/i })).toContainText(
      "1 added, 4 modified, 0 removed",
    );
    await expect(page.locator(".protocol-demo__changes")).toContainText("FDA 7- and 15-day reporting windows");
    await expect(page.locator(".protocol-demo__header")).toContainText("f9d04bd");
  });
});

test.describe("Field Index interactions", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/work/field-index/");
  });

  test("layer buttons expose their initial state and support pointer and keyboard toggles", async ({ page }) => {
    await expectCanvasReady(page, /map preview that updates/i);
    const layers = page.getByRole("group", { name: "Map layers" });
    const grid = layers.getByRole("button", { name: "Grid" });
    const signals = layers.getByRole("button", { name: "Signals" });
    const routes = layers.getByRole("button", { name: "Routes" });
    const notes = layers.getByRole("button", { name: "Notes" });

    await expect(grid).toHaveAttribute("aria-pressed", "true");
    await expect(signals).toHaveAttribute("aria-pressed", "true");
    await expect(routes).toHaveAttribute("aria-pressed", "false");
    await expect(notes).toHaveAttribute("aria-pressed", "false");

    await routes.click();
    await expect(routes).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("status").filter({ hasText: /Visible layers/i })).toContainText("Routes");

    await notes.focus();
    await page.keyboard.press("Space");
    await expect(notes).toHaveAttribute("aria-pressed", "true");
    await page.keyboard.press("Enter");
    await expect(notes).toHaveAttribute("aria-pressed", "false");
  });

  test("sampling controls switch through every density and pause and resume motion", async ({ page }) => {
    await expectCanvasReady(page, /sampling preview at 2 times density/i);
    const canvas = page.locator(".interactive-demo--pattern-scale canvas");
    const scales = page.getByRole("group", { name: "Sampling density" });

    for (const scale of [1, 2, 4, 8]) {
      const button = scales.getByRole("button", { name: `${scale}×`, exact: true });
      await button.click();
      await expect(button).toHaveAttribute("aria-pressed", "true");
      await expect(canvas).toHaveAttribute(
        "aria-label",
        `A Field Index sampling preview at ${scale} times density.`,
      );
    }

    const motionButton = page.locator(".interactive-demo__motion-button");
    await expect(motionButton).toHaveText("Pause motion");
    await motionButton.click();
    await expect(motionButton).toHaveAttribute("aria-pressed", "true");
    await expect(motionButton).toHaveText("Resume motion");
    await expect(page.getByRole("status").filter({ hasText: /sampling density/i })).toContainText(
      "Motion paused",
    );

    await motionButton.click();
    await expect(motionButton).toHaveText("Pause motion");
    await expect(motionButton).toHaveAttribute("aria-pressed", "false");
  });
});

test.describe("motion and no-JavaScript resilience", () => {
  test("reduced motion renders a static pattern and disables the motion control", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/work/field-index/");
    expect(
      await page.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches),
    ).toBe(true);
    await expectCanvasReady(page, /sampling preview at 2 times density/i);
    const motion = page.getByRole("button", { name: "Motion off" });
    await expect(motion).toBeDisabled();
    await expect(page.getByRole("status").filter({ hasText: /sampling density/i })).toContainText(
      "A static state is shown for reduced motion",
    );
  });
});

test("no-JavaScript visitors see both static interactive fallbacks", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(`${playwrightBaseUrl}/work/field-index/`);

  const fallbacks = page.locator(".interactive-demo__fallback");
  await expect(fallbacks).toHaveCount(2);
  await expect(fallbacks.nth(0)).toBeVisible();
  await expect(fallbacks.nth(1)).toBeVisible();
  await expect(page.locator(".interactive-demo__canvas").nth(0)).toHaveCSS("opacity", "0");
  await expect(page.locator(".interactive-demo__canvas").nth(1)).toHaveCSS("opacity", "0");

  await context.close();
});

test("route-specific no-JavaScript fallbacks stay visible", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();

  for (const [route, expectedFallbacks] of [
    ["/work/coffee-cupping/", 1],
    ["/work/lineage/", 1],
    ["/work/npkn-studio/", 0],
    ["/work/gumo-supplies/", 0],
    ["/work/mchns/", 0],
    ["/work/soul-mag/", 0],
    ["/work/pixel-vault/", 0],
  ] as const) {
    await page.goto(`${playwrightBaseUrl}${route}`);
    const fallbacks = page.locator(".interactive-demo__fallback");
    await expect(fallbacks).toHaveCount(expectedFallbacks);
    if (expectedFallbacks > 0) await expect(fallbacks.first()).toBeVisible();
  }

  await context.close();
});
