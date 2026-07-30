import { test, expect } from "@playwright/test";

const testRoutes = [
  "/",
  "/dashboard/login",
  "/dashboard",
  "/dashboard/reception",
  "/dashboard/apartments",
  "/dashboard/bookings",
  "/dashboard/clients",
  "/dashboard/crm",
  "/dashboard/finance",
  "/dashboard/cashflow",
  "/dashboard/income",
  "/dashboard/kassa",
  "/dashboard/staff",
  "/dashboard/tasks",
];

test.describe("1. BROKEN IMAGES & ASSETS CHECK", () => {
  for (const route of testRoutes) {
    test(`Check images and assets on ${route}`, async ({ page }) => {
      const brokenAssets: string[] = [];

      // Intercept failed network requests for image/asset assets
      page.on("response", (response) => {
        const status = response.status();
        const url = response.url();
        const type = response.request().resourceType();
        if ((type === "image" || type === "media") && (status >= 400 || status === 0)) {
          brokenAssets.push(`[HTTP ${status}] ${url}`);
        }
      });

      await page.goto(route, { waitUntil: "networkidle" });

      // Check all <img> tags for naturalWidth === 0
      const imgStats = await page.evaluate(() => {
        const imgs = Array.from(document.querySelectorAll("img"));
        return imgs.map((img) => ({
          src: img.currentSrc || img.src,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
          complete: img.complete,
          alt: img.alt,
        }));
      });

      for (const img of imgStats) {
        if (img.src && !img.src.startsWith("data:") && img.src !== page.url()) {
          if (!img.complete || img.naturalWidth === 0) {
            brokenAssets.push(`[Broken <img> tag] src="${img.src}" (Width: ${img.naturalWidth})`);
          }
        }
      }

      // Check background-images
      const bgImages = await page.evaluate(() => {
        const elements = Array.from(document.querySelectorAll("*"));
        const urls: string[] = [];
        elements.forEach((el) => {
          const bg = window.getComputedStyle(el).backgroundImage;
          if (bg && bg !== "none" && bg.includes("url(")) {
            const match = bg.match(/url\(["']?(.*?)["']?\)/);
            if (match && match[1]) urls.push(match[1]);
          }
        });
        return urls;
      });

      if (brokenAssets.length > 0) {
        console.error(`❌ Broken assets found on page ${route}:\n` + brokenAssets.join("\n"));
      }

      expect(brokenAssets.length, `Broken assets on page ${route}: ${brokenAssets.join(", ")}`).toBe(0);
    });
  }
});
