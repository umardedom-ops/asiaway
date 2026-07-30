import { test, expect } from "@playwright/test";

const routes = [
  "/",
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

test.describe("2. I18N & LANGUAGE SWITCH CHECK (Russian)", () => {
  test.beforeEach(async ({ context }) => {
    // Set language cookie to Russian
    await context.addCookies([
      {
        name: "asiaway-lang",
        value: "ru",
        domain: "localhost",
        path: "/",
      },
    ]);
  });

  for (const route of routes) {
    test(`Verify Russian translation integrity on ${route}`, async ({ page }) => {
      await page.goto(route, { waitUntil: "networkidle" });

      // Detect raw i18n key leaks (e.g., 'd.reception...', 'dashboard.title', 'errors.selectApt', etc.)
      const rawKeyRegex = /\b(d\.[a-zA-Z0-9_.]+|dashboard\.[a-zA-Z0-9_.]+|common\.[a-zA-Z0-9_.]+|reception\.[a-zA-Z0-9_.]+|errors\.[a-zA-Z0-9_.]+)\b/;

      const pageText = await page.innerText("body");
      const match = pageText.match(rawKeyRegex);

      if (match) {
        console.error(`❌ Raw i18n key leak on ${route}: ${match[0]}`);
      }

      expect(match, `Raw untranslated i18n key found on ${route}`).toBeNull();

      // Check for empty buttons or labels
      const emptyInteractiveElements = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll("button, a.btn"));
        return buttons
          .filter((btn) => {
            const text = (btn.textContent || "").trim();
            const ariaLabel = btn.getAttribute("aria-label");
            const title = btn.getAttribute("title");
            const hasSvgIcon = btn.querySelector("svg") !== null;
            return !text && !ariaLabel && !title && !hasSvgIcon;
          })
          .map((btn) => btn.outerHTML);
      });

      if (emptyInteractiveElements.length > 0) {
        console.warn(`⚠️ Empty interactive buttons found on ${route}:`, emptyInteractiveElements);
      }

      expect(emptyInteractiveElements.length, `Empty button elements on ${route}`).toBe(0);
    });
  }
});
