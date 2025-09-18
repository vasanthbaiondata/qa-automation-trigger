import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import locators from './locators.json';
import { testData } from './testData';

test('Negative: DOB is required — form not submitted (TC-SIGNUP-004)', async ({ page }, testInfo) => {
  // Setup screenshots
  const safeTitle = testInfo.title.replace(/[^a-zA-Z0-9_\-]/g, '_');
  const dir = path.join('reports', safeTitle);
  if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  const screenshot = async (step: string) => {
    const filePath = path.join(dir, `${step}.png`);
    const shot = await page.screenshot({ path: filePath, fullPage: true });
    await testInfo.attach(step, { body: shot, contentType: 'image/png' });
    console.log(` Screenshot saved: ${filePath}`);
  };

  const data = testData.user.TC004; // DOB missing
  const randomEmail = `testingsignin+${Date.now()}@gmail.com`;

  // 1️⃣ Go to Sandbox
  console.log('🌐 Navigating to Sandbox...');
  await page.goto(testData.urls.sandbox);
  await screenshot('sandbox_loaded');
  console.log(' Sandbox page loaded');

  // 2️⃣ Navigation menu & Sign In
  console.log('📂 Opening navigation menu...');
  await page.getByRole(locators.navigation.menuIcon.role).getByRole('img').first().click();
  console.log('🔑 Clicking Sign In button...');
  await page.getByRole(locators.buttons.signIn.role, { name: locators.buttons.signIn.name }).click();
  await screenshot('signIn_clicked');
  console.log(' Sign In page opened');

  // 3️⃣ Fill Email & Continue
  console.log(`✉️ Filling email: ${randomEmail}`);
  await page.getByRole(locators.fields.email.role, { name: locators.fields.email.name }).fill(randomEmail);
  console.log('➡️ Clicking Continue...');
  await page.getByRole(locators.buttons.continue.role, { name: locators.buttons.continue.name }).click();
  await screenshot('email_continue_clicked');
  console.log(' Email submitted');

  // 4️⃣ Fill Sign Up form (DOB missing)
  console.log('📝 Filling Sign Up form (DOB intentionally missing)...');
  await page.locator(locators.fields.firstName).fill(data.firstName);
  await page.locator(locators.fields.lastName).fill(data.lastName);
  await page.getByLabel(locators.fields.country).selectOption({ label: data.country });
  await screenshot('form_filled');
  console.log(' Form filled (without DOB)');

  // 5️⃣ Submit & verify error
  console.log('🚀 Submitting form...');
  await page.getByRole(locators.buttons.signUp.role, { name: locators.buttons.signUp.name }).click();
  await screenshot('form_submitted');
  console.log(' Form submitted');

  console.log('⚠️ Verifying DOB required error...');
  const dobError = page.locator(locators.errors.dobRequired); 
  await expect(dobError).toBeVisible();
  await expect(dobError).toHaveText(/please enter your date of birth/i);
  await screenshot('dob_error');
  console.log(' DOB required error displayed');

  // Ensure form not submitted
  console.log('🔒 Ensuring form is not submitted...');
  await expect(page).not.toHaveURL(/success/i);
  console.log(' Test completed: form not submitted due to missing DOB');
});