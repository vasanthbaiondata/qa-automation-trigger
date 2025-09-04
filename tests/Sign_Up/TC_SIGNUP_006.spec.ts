import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import locators from './locators.json';
import { testData } from './testData';

// Helper to take screenshots
function setupScreenshots(testInfo) {
  const safeTitle = testInfo.title.replace(/[^a-zA-Z0-9_\-]/g, '_');
  const dir = path.join('reports', safeTitle);
  if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });

  return async (page, step: string, message?: string) => {
    if (message) console.log(message);
    const filePath = path.join(dir, `${step}.png`);
    const shot = await page.screenshot({ path: filePath, fullPage: true });
    await testInfo.attach(step, { body: shot, contentType: 'image/png' });
    console.log(`📸 Screenshot saved: ${filePath}`);
  };
}

test('Negative: Under 18 — Age restriction error displayed (TC-006)', async ({ page }, testInfo) => {
  const takeScreenshot = setupScreenshots(testInfo);

  // 1️⃣ Go to Sandbox
  await page.goto(testData.urls.sandbox);
  console.log('✅ Sandbox loaded');
  await takeScreenshot(page, 'sandbox_loaded');

  // 2️⃣ Open navigation menu
  await page.getByRole(locators.navigation.menuIcon.role).getByRole('img').first().click();
  console.log('📂 Navigation menu clicked');
  await takeScreenshot(page, 'nav_clicked');

  // 3️⃣ Click Sign In
  await page.getByRole(locators.buttons.signIn.role, { name: locators.buttons.signIn.name }).click();
  console.log('🔑 Sign In clicked');
  await takeScreenshot(page, 'signIn_clicked');

  // 4️⃣ Fill Email & Continue
  const randomEmail = `testingsignin+${Date.now()}@gmail.com`;
  await page.getByRole(locators.fields.email.role, { name: locators.fields.email.name }).fill(randomEmail);
  await page.getByRole(locators.buttons.continue.role, { name: locators.buttons.continue.name }).click();
  await takeScreenshot(page, 'continue_clicked', '➡️ Continue clicked');

  // 5️⃣ Fill Name
  await page.locator(locators.fields.firstName).fill(testData.user.TC006.firstName);
  await page.locator(locators.fields.lastName).fill(testData.user.TC006.lastName);
  console.log('🖊 First and last name filled');
  await takeScreenshot(page, 'name_filled');

  // 6️⃣ Fill Underage DOB dynamically (10 years old)
  const under18DOB = new Date();
  under18DOB.setFullYear(under18DOB.getFullYear() - 10);
  const dobString = under18DOB.toISOString().split('T')[0];
  await page.getByRole(locators.fields.dob.role, { name: locators.fields.dob.name }).fill(dobString);
  console.log(`📅 DOB filled (under 18): ${dobString}`);
  await takeScreenshot(page, 'dob_filled');

  // 7️⃣ Select Country
  await page.getByLabel(locators.fields.country).selectOption({ label: testData.user.TC006.country });
  console.log(`🌏 Country selected: ${testData.user.TC006.country}`);
  await takeScreenshot(page, 'country_selected');

  // 8️⃣ Submit Sign Up
  const signUpBtn = page.getByRole(locators.buttons.signUp.role, { name: locators.buttons.signUp.name });
  await expect(signUpBtn).toBeEnabled({ timeout: 5000 });
  await signUpBtn.click();
  console.log('✅ Sign Up submitted');
  await takeScreenshot(page, 'signup_submitted');

  // 9️⃣ Verify Underage Error
  const ageError = page.locator('div.customDatePicker .text-red-600.text-sm', { hasText: /18/i });
  await ageError.waitFor({ state: 'visible', timeout: 7000 });
  const errorText = (await ageError.textContent())?.trim();
  console.log('❌ Age error displayed:', errorText);
  expect(errorText?.toLowerCase()).toContain('18');

  await takeScreenshot(page, 'age_error');

  // 🔒 Ensure form not submitted
  await expect(page).not.toHaveURL(/success/i);
  console.log('🔒 Form not submitted as expected');
});