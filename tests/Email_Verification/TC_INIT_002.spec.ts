import { test, expect } from '@playwright/test';
import locators from './locators.json';
import { testData } from './testData';
import fs from 'fs';
import path from 'path';

test('Negative: Invalid Email Format shows error (TC-INIT-002)', async ({ page }, testInfo) => {
  // Create per-test screenshots folder
  const screenshotsDir = path.join('reports', testInfo.title.replace(/\s+/g, '_'));
  if (fs.existsSync(screenshotsDir)) {
    fs.rmSync(screenshotsDir, { recursive: true, force: true });
  }
  fs.mkdirSync(screenshotsDir, { recursive: true });

  // Helper function for screenshots
  async function takeScreenshot(stepName: string) {
    const filePath = path.join(screenshotsDir, `${stepName}.png`);
    const shot = await page.screenshot({ path: filePath, fullPage: true });
    await testInfo.attach(stepName, { body: shot, contentType: 'image/png' });
    console.log(` Screenshot saved: ${filePath}`);
  }

  //  Navigate to home page
  await page.goto(testData.baseURL);
  console.log(' Redirected to home page');
  await takeScreenshot('step1_home_page');

  //  Open navigation menu
  await page.getByRole('navigation').getByRole('img').first().click();
  console.log(' Navigation menu clicked');
  await takeScreenshot('step2_nav_menu');

  //  Click Sign In button
  await page.getByRole(locators.signInBtn.role, { name: locators.signInBtn.name }).click();
  console.log(' Sign In clicked');
  await takeScreenshot('step3_sign_in');

  //  Enter invalid email
  await page.getByRole(locators.emailInput.role, { name: locators.emailInput.name }).fill(testData.invalidEmail2);
  console.log(` Invalid email filled: ${testData.invalidEmail2}`);
  await takeScreenshot('step4_fill_invalid_email');

  //  Click Continue button
  await page.getByRole(locators.continueBtn.role, { name: locators.continueBtn.name }).click();
  console.log(' Continue button clicked');
  await takeScreenshot('step5_click_continue');

  //  Verify error message
  const errorMessage = page.getByText(testData.expectedError, { exact: false });
  await expect(errorMessage).toBeVisible();
  console.log(' Error message displayed: Must be a valid email');
  await takeScreenshot('step6_error_message');
});
