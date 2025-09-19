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
    console.log(` Screenshot saved: ${filePath}`);
  };
}

test('Negative: Above 70 — Age restriction error displayed (TC-007)', async ({ page }, testInfo) => {
  const takeScreenshot = setupScreenshots(testInfo);

  //  Go to Sandbox
  await page.goto(testData.urls.sandbox);
  console.log(' Sandbox loaded');
  await takeScreenshot(page, 'sandbox_loaded');

  //  Open navigation menu
  await page.getByRole(locators.navigation.menuIcon.role).getByRole('img').first().click();
  console.log(' Navigation menu clicked');
  await takeScreenshot(page, 'nav_clicked');

  //  Click Sign In
  await page.getByRole(locators.buttons.signIn.role, { name: locators.buttons.signIn.name }).click();
  console.log(' Sign In clicked');
  await takeScreenshot(page, 'signIn_clicked');

  //  Fill Email & Continue
  const email = testData.user.TC007.testEmail;
  await page.getByRole(locators.fields.email.role, { name: locators.fields.email.name }).fill(email);
  await page.getByRole(locators.buttons.continue.role, { name: locators.buttons.continue.name }).click();
  await takeScreenshot(page, 'continue_clicked');

  //  Fill Name
  await page.locator(locators.fields.firstName).fill(testData.user.TC007.firstName);
  await page.locator(locators.fields.lastName).fill(testData.user.TC007.lastName);
  console.log('🖊 First and last name filled');
  await takeScreenshot(page, 'name_filled');

 //  Fill DOB above 70 years old
const over70DOB = new Date();
over70DOB.setFullYear(over70DOB.getFullYear() - 75); // 75 years old
const dobString = over70DOB.toISOString().split('T')[0];
await page.getByRole(locators.fields.dob.role, { name: locators.fields.dob.name }).fill(dobString);
console.log(`📅 DOB filled (over 70): ${dobString}`);
await takeScreenshot(page, 'dob_filled');

  // 7️⃣ Select Country
  await page.getByLabel(locators.fields.country).selectOption({ label: testData.user.TC007.country });
  console.log(`🌏 Country selected: ${testData.user.TC007.country}`);
  await takeScreenshot(page, 'country_selected');

  // 8️⃣ Submit Sign Up
  const signUpBtn = page.getByRole(locators.buttons.signUp.role, { name: locators.buttons.signUp.name });
  await expect(signUpBtn).toBeEnabled({ timeout: 5000 });
  await signUpBtn.click();
  console.log(' Sign Up submitted');
  await takeScreenshot(page, 'signup_submitted');

  // 9️⃣ Verify Age Error
const ageError = page.locator(locators.errors.dobAbove70); 
await ageError.waitFor({ state: 'visible', timeout: 7000 });
const errorText = (await ageError.textContent())?.trim();
console.log(' Over-age error displayed:', errorText);
expect(errorText?.toLowerCase()).toContain('maximum age limit is 70');
await takeScreenshot(page, 'age_error');

  // 🔒 Ensure form not submitted
  await expect(page).not.toHaveURL(/success/i);
  console.log('🔒 Form not submitted as expected');
});