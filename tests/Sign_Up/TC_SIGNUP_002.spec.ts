import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import locators from './locators.json';
import { testData } from './testData';

test('Negative: Sign up without first name shows error (TC-SIGNUP-002)', async ({ page }, testInfo) => {
  // Setup report directory & screenshot helper
  const safeTitle = testInfo.title.replace(/[^a-zA-Z0-9_\-]/g, '_');
  const dir = path.join('reports', safeTitle);
  if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });

  const screenshot = async (step: string, message: string) => {
    console.log(message); // log message
    const filePath = path.join(dir, `${step}.png`);
    const shot = await page.screenshot({ path: filePath, fullPage: true });
    await testInfo.attach(step, { body: shot, contentType: 'image/png' });
    console.log(`📸 Screenshot saved: ${filePath}`);
  };

  // 1️⃣ Go to Sandbox
  await page.goto(testData.urls.sandbox);
  await screenshot('sandbox_loaded', '✅ Sandbox page loaded');

  // 2️⃣ Navigation menu & Sign In
  await page.getByRole(locators.navigation.menuIcon.role).getByRole('img').first().click();
  await screenshot('nav_clicked', '📂 Navigation menu clicked');

  await page.getByRole(locators.buttons.signIn.role, { name: locators.buttons.signIn.name }).click();
  await screenshot('signIn_clicked', '🔑 Sign In button clicked');

   const randomEmail = `testingsignin+${Date.now()}@gmail.com`;
   await page.getByRole(locators.fields.email.role, { name: locators.fields.email.name }).fill(randomEmail);



  await page.getByRole(locators.buttons.continue.role, { name: locators.buttons.continue.name }).click();
  await screenshot('continue_clicked', '➡️ Continue clicked');

// 4️⃣ Fill Sign Up form (First Name missing)
 await page.locator(locators.fields.firstName).fill(testData.user.TC002.firstName); // will be ''
 await page.locator(locators.fields.lastName).fill(testData.user.TC002.lastName);
 await page.getByRole(locators.fields.dob.role, { name: locators.fields.dob.name }).fill(testData.user.TC002.dob);
 await page.getByLabel(locators.fields.country).selectOption({ label: testData.user.TC002.country });
 await screenshot('form_filled', '🖊 Form filled (first name missing)');

  // 5️⃣ Submit & verify error
  await page.getByRole(locators.buttons.signUp.role, { name: locators.buttons.signUp.name }).click();
  await screenshot('form_submitted', '✅ Form submitted');

  const firstNameError = page.locator(locators.errors.firstName);
  await expect(firstNameError).toBeVisible();
  await expect(firstNameError).toHaveText(/enter your first name/i);
  await screenshot('firstName_error', '❌ First name validation error displayed');

  // Ensure form not submitted
  await expect(page).not.toHaveURL(/success/i);
  console.log('🔒 Form not submitted as expected');
});