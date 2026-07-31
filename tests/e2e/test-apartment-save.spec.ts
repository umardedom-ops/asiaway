import { test, expect } from "@playwright/test";

test("Test editing and saving an apartment on dashboard", async ({ page }) => {
  // Go to apartments dashboard
  await page.goto("/dashboard/apartments", { waitUntil: "networkidle" });

  // Locate edit links matching /dashboard/apartments/.../edit
  const editButtons = page.locator('a[href*="/dashboard/apartments/"][href*="/edit"]');
  const count = await editButtons.count();
  console.log(`Found ${count} edit buttons on apartments dashboard page`);

  expect(count, "Apartment list should have at least one edit link").toBeGreaterThan(0);

  // Click the first edit link
  await editButtons.first().click();
  await page.waitForLoadState("networkidle");

  console.log(`Navigated to edit page: ${page.url()}`);

  // Fill Uzbek title & description
  const titleUz = page.locator('input[name="title"]');
  if (await titleUz.isVisible()) {
    await titleUz.fill("Nest One 34-qavat | Premium Penthouse");
  }

  const descUz = page.locator('textarea[name="description"]');
  if (await descUz.isVisible()) {
    await descUz.fill("Nest One 34-qavat | Premium shinam apartament. 24/7 qulayliklar va ajoyib ko'rinish.");
  }

  // Fill Russian title & description
  const titleRu = page.locator('input[name="title_ru"]');
  if (await titleRu.isVisible()) {
    await titleRu.fill("Nest One 34 этаж | Premium Penthouse");
  }

  const descRu = page.locator('textarea[name="description_ru"]');
  if (await descRu.isVisible()) {
    await descRu.fill("Nest One 34 этаж | Премиальные уютные апартаменты. 24/7 удобства и прекрасный вид.");
  }

  // Click Submit / Save
  const saveBtn = page.locator('button[type="submit"]');
  await saveBtn.click();

  // Wait for response or navigation
  await page.waitForTimeout(4000);

  // Check if red error banner appears
  const errorBanner = page.locator('div:has-text("Xatolik yuz berdi"), div:has-text("Произошла ошибка")');
  const isErrVisible = await errorBanner.isVisible();

  if (isErrVisible) {
    const errText = await errorBanner.innerText();
    console.error(`❌ Save Apartment Error: ${errText}`);
    expect(isErrVisible, `Apartment save failed with error: ${errText}`).toBeFalsy();
  } else {
    console.log(`✅ Save Apartment Succeeded! Current URL: ${page.url()}`);
  }
});
