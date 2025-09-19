import { test, expect } from '@playwright/test';
import locators from './locators.json';
import { testData } from './testData';
import fs from 'fs';
import path from 'path';

test('Positive: Identifies as a new user and shows Sign Up page (TC-INIT-003)', async ({ page }, testInfo) => {
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

  //  Enter new user email
  await page.getByRole(locators.emailInput.role, { name: locators.emailInput.name }).fill(testData.newUserEmail);
  console.log(` New user email filled: ${testData.newUserEmail}`);
  await takeScreenshot('step4_fill_new_user_email');

  //  Click Continue button
  await page.getByRole(locators.continueBtn.role, { name: locators.continueBtn.name }).click();
  console.log(' Continue button clicked');
  await takeScreenshot('step5_click_continue');

  //  Verify Sign Up page is visible
  const firstNameInput = page.locator(locators.signUpFirstName.css);
  await expect(firstNameInput).toBeVisible();
  console.log(' Sign Up page visible');
  await takeScreenshot('step6_sign_up_page');
});
