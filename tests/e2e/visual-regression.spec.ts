import { test } from "@playwright/test";
import path from "path";
import fs from "fs";

const screenshotsDir = path.join(process.cwd(), "tests", "screenshots");

test.beforeAll(() => {
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }
});

const pagesToCapture = [
  { name: "01_homepage", path: "/" },
  { name: "02_dashboard_overview", path: "/dashboard" },
  { name: "03_reception", path: "/dashboard/reception" },
  { name: "04_apartments", path: "/dashboard/apartments" },
  { name: "05_bookings", path: "/dashboard/bookings" },
  { name: "06_clients", path: "/dashboard/clients" },
  { name: "07_crm", path: "/dashboard/crm" },
  { name: "08_finance", path: "/dashboard/finance" },
  { name: "09_cashflow", path: "/dashboard/cashflow" },
  { name: "10_income", path: "/dashboard/income" },
  { name: "11_kassa", path: "/dashboard/kassa" },
  { name: "12_staff", path: "/dashboard/staff" },
  { name: "13_tasks", path: "/dashboard/tasks" },
];

test.describe("4. UI & LAYOUT REGRESSION SCREENSHOTS", () => {
  for (const item of pagesToCapture) {
    test(`Capture screenshot of ${item.name}`, async ({ page }) => {
      await page.goto(item.path, { waitUntil: "networkidle" });
      await page.waitForTimeout(500);

      const filePath = path.join(screenshotsDir, `${item.name}.png`);
      await page.screenshot({ path: filePath, fullPage: true });
      console.log(`📸 Screenshot saved: ${filePath}`);
    });
  }
});
