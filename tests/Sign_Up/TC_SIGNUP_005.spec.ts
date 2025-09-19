import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import locators from './locators.json';
import { testData } from './testData';

test('Negative: Sign up with missing country shows error (TC-SIGNUP-005)', async ({ page }, testInfo) => {
  // Setup report directory & screenshot helper
  const safeTitle = testInfo.title.replace(/[^a-zA-Z0-9_\-]/g, '_');
  const dir = path.join('reports', safeTitle);
  if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });

  const screenshot = async (step: string, message?: string) => {
    if (message) console.log(message);
    const filePath = path.join(dir, `${step}.png`);
    const shot = await page.screenshot({ path: filePath, fullPage: true });
    await testInfo.attach(step, { body: shot, contentType: 'image/png' });
    console.log(` Screenshot saved: ${filePath}`);
  };

  const data = testData.user.TC005; // Country missing
  const randomEmail = `testingsignin+${Date.now()}@gmail.com`;

  //  Go to Sandbox
  await page.goto(testData.urls.sandbox);
  await screenshot('sandbox_loaded', ' Sandbox page loaded');

  //  Navigation menu & Sign In
  await page.getByRole(locators.navigation.menuIcon.role).getByRole('img').first().click();
  await screenshot('nav_clicked', ' Navigation menu clicked');

  await page.getByRole(locators.buttons.signIn.role, { name: locators.buttons.signIn.name }).click();
  await screenshot('signIn_clicked', ' Sign In button clicked');

  //  Fill Email & Continue
  await page.getByRole(locators.fields.email.role, { name: locators.fields.email.name }).fill(randomEmail);
  await page.getByRole(locators.buttons.continue.role, { name: locators.buttons.continue.name }).click();
  await screenshot('continue_clicked', ' Continue clicked');

  //  Fill Sign Up form (Country missing)
await page.locator(locators.fields.firstName).fill(data.firstName);
await page.locator(locators.fields.lastName).fill(data.lastName);
await page.getByRole(locators.fields.dob.role, { name: locators.fields.dob.name }).fill(data.dob);

 //  Do NOT select country, leave it empty to trigger validation
 // await page.getByLabel('Country*').selectOption({ label: data.country });

 await screenshot('form_filled', '🖊 Form filled with missing country');


  //  Submit & verify error
  await page.getByRole(locators.buttons.signUp.role, { name: locators.buttons.signUp.name }).click();
  await screenshot('form_submitted', ' Form submitted');

  // Use the updated locator for country error
  const countryError = page.locator(`text=${locators.errors.country}`);
  await expect(countryError).toBeVisible();
  await expect(countryError).toHaveText(/please select your country/i);
  await screenshot('country_error', ' Country error displayed');

  // Ensure form not submitted
  await expect(page).not.toHaveURL(/success/i);
  console.log('🔒 Form not submitted as expected');
});