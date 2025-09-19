import { test, expect } from '@playwright/test';
import locators from './locators.json';
import { testData } from './testData';
import fs from 'fs';
import path from 'path';

test.setTimeout(600000); // 10 mins

test('Positive: Accepts valid email and moves to OTP screen (TC-INIT-001)', async ({ page }, testInfo) => {
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

  //  Go to home/login page
  await page.goto(testData.baseURL);
  console.log(' Redirected to home page');
  await takeScreenshot('step1_home_page');

  //  Open navigation menu
  const navMenuIcon = page
    .getByRole(locators.navMenuIcon.role)
    .getByRole(locators.navMenuIcon.target)
    .first();
  await navMenuIcon.waitFor({ state: 'visible', timeout: 15000 });
  await navMenuIcon.click();
  console.log(' Navigation menu clicked');
  await takeScreenshot('step2_nav_menu');

  //  Click Sign In button
  const signInBtn = page.getByRole(locators.signInBtn.role, {
    name: locators.signInBtn.name,
  });
  await signInBtn.waitFor({ state: 'visible', timeout: 5000 });
  await signInBtn.click();
  console.log(' Sign In clicked');
  await takeScreenshot('step3_sign_in');

  //  Fill Email textbox with valid email
  const emailInput = page.getByRole(locators.emailInput.role, {
    name: locators.emailInput.name,
  });
  await emailInput.waitFor({ state: 'visible', timeout: 8000 });
  await emailInput.fill(testData.validEmail);
  console.log(` Valid email filled: ${testData.validEmail}`);
  await takeScreenshot('step4_fill_email');

  //  Click Continue button
  const continueBtn = page.getByRole(locators.continueBtn.role, {
    name: locators.continueBtn.name,
  });
  await continueBtn.waitFor({ state: 'visible', timeout: 5000 });
  await continueBtn.click();
  console.log(' Continue button clicked');
  await takeScreenshot('step5_click_continue');

  //  Verify OTP screen
  const otpInput = page.getByRole(locators.otpInput.role, {
    name: locators.otpInput.name,
  });

  await expect(
    otpInput.or(page.getByText(/Enter verification code/i))
  ).toBeVisible({ timeout: 10000 });
  console.log(' Redirected to OTP page & OTP input visible');
  await takeScreenshot('step6_otp_screen');
});
