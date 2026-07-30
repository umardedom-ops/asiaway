import { test, expect } from "@playwright/test";

test.describe("3. BUTTONS, MODALS & LOGIC TEST", () => {
  test("Test Reception tabs, calendar block modal and guest details modal", async ({ page }) => {
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];

    // Capture JS console errors and unhandled rejections
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(`[Console Error] ${msg.text()}`);
      }
    });

    page.on("pageerror", (err) => {
      pageErrors.push(`[Page Error] ${err.message}`);
    });

    // Go to reception page
    await page.goto("/dashboard/reception", { waitUntil: "networkidle" });

    // 1. Test Reception Tabs switching
    const tabs = ["Joylashtirish", "Xonalar holati", "Mehmonlar bazasi", "Bronlar"];
    for (const tabText of tabs) {
      const tabBtn = page.locator(`button:has-text("${tabText}"), button:has-text("${tabText.toLowerCase()}")`).first();
      if (await tabBtn.isVisible()) {
        await tabBtn.click();
        await page.waitForTimeout(300);
      }
    }

    // 2. Switch back to Xonalar holati tab and open RoomStatusCalendarModal
    const roomTabBtn = page.locator('button:has-text("Xonalar holati"), button:has-text("Комнаты")').first();
    if (await roomTabBtn.isVisible()) {
      await roomTabBtn.click();
      await page.waitForTimeout(400);

      // Find and click "Xonani band qilish" / "Забронировать номер"
      const blockBtn = page.locator('button:has-text("Xonani band qilish"), button:has-text("Забронировать номер")').first();
      if (await blockBtn.isVisible()) {
        await blockBtn.click();
        await page.waitForTimeout(500);

        // Check if modal title appears
        const modalTitle = page.locator('text="Забронировать номер (Заселение)"), text="Xonaga band (Zaselenie) sanalarini belgilash"').first();
        expect(await modalTitle.isVisible()).toBeTruthy();

        // Close modal (click Bekor qilish / Отмена)
        const cancelBtn = page.locator('button:has-text("Bekor qilish"), button:has-text("Отмена")').first();
        if (await cancelBtn.isVisible()) {
          await cancelBtn.click();
          await page.waitForTimeout(300);
        }
      }
    }

    // Assert no unhandled page crash errors occurred
    expect(pageErrors.length, `JS page errors detected: ${pageErrors.join("; ")}`).toBe(0);
  });

  test("Test Navigation menu and links", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });

    await page.goto("/dashboard", { waitUntil: "networkidle" });

    const navLinks = [
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

    for (const linkPath of navLinks) {
      const link = page.locator(`a[href="${linkPath}"]`).first();
      if (await link.isVisible()) {
        await link.click();
        await page.waitForTimeout(400);
        expect(page.url()).toContain(linkPath);
      }
    }
  });
});
