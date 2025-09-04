import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import locators from './locators.json';
import { testData } from './testData';

function setupScreenshots(testInfo) {
  const safeTitle = testInfo.title.replace(/[^a-zA-Z0-9_\-]/g, '_');
  const dir = path.join('reports', safeTitle);
  if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });

  return async (page, step: string) => {
    const filePath = path.join(dir, `${step}.png`);
    const shot = await page.screenshot({ path: filePath, fullPage: true });
    await testInfo.attach(step, { body: shot, contentType: 'image/png' });
    console.log(`📸 Screenshot saved: ${filePath}`);
  };
}

test('Positive : Sign Up page submission passes (TC-INIT-001)', async ({ page }, testInfo) => {
  const takeScreenshot = setupScreenshots(testInfo);

  // 1. Go to home/login page
  await page.goto(testData.urls.sandbox);
  console.log('✅ Sandbox loaded');
  await takeScreenshot(page, 'sandbox_loaded');

  // 2. Open navigation menu
  const navMenuIcon = page.getByRole(locators.navigation.menuIcon.role).getByRole('img').first();
  await navMenuIcon.click();
  console.log('📂 Navigation menu clicked');
  await takeScreenshot(page, 'nav_clicked');

  // 3. Click Sign In button
  const signInBtn = page.getByRole(locators.buttons.signIn.role, { name: locators.buttons.signIn.name });
  await signInBtn.click();
  console.log('🔑 Sign In clicked');
  await takeScreenshot(page, 'signIn_clicked');

  // 4. Fill random email
 const randomEmail = `testingsignin+${Date.now()}@gmail.com`;
 await page.getByRole(locators.fields.email.role, { name: locators.fields.email.name }).fill(randomEmail);
 

  // 5. Click Continue
  await page.getByRole(locators.buttons.continue.role, { name: locators.buttons.continue.name }).click();

// 6. Fill First & Last Name
await page.locator(locators.fields.firstName).fill(testData.user.TC001.firstName);
await page.locator(locators.fields.lastName).fill(testData.user.TC001.lastName);
console.log('🖊 Filled first and last name');
await takeScreenshot(page, 'name_filled');

// 7. Fill DOB
await page.getByRole(locators.fields.dob.role, { name: locators.fields.dob.name }).fill(testData.user.TC001.dob);
console.log('📅 DOB filled');
await takeScreenshot(page, 'dob_filled');

// 8. Select Country
await page.getByLabel(locators.fields.country).selectOption({ label: testData.user.TC001.country });
console.log(`🌏 Country selected: ${testData.user.TC001.country}`);
await takeScreenshot(page, 'country_selected');


  // 9. Submit Sign Up
  await page.getByRole(locators.buttons.signUp.role, { name: locators.buttons.signUp.name }).first().click();
  console.log('✅ Sign Up submitted');
  await takeScreenshot(page, 'signup_submitted');
});