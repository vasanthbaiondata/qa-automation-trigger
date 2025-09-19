import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';
import { getLatestOtpFromEmail } from '../../readEmails';
import locators from './locators.json';
import { testData } from './testData';
import fs from 'fs';
import path from 'path';

dotenv.config();

test.setTimeout(3600000); // 60 mins

test('Positive : Accepts validation and allows to access Wallet address page (TC-OTP-001)', async ({ page }, testInfo) => {
  // create per-test reports/screenshots dir
  const screenshotsDir = path.join('reports', testInfo.title.replace(/\s+/g, '_'));
  if (fs.existsSync(screenshotsDir)) {
    fs.rmSync(screenshotsDir, { recursive: true, force: true });
  }
  fs.mkdirSync(screenshotsDir, { recursive: true });

  // helper to capture and attach screenshots
  async function takeScreenshot(stepName: string) {
    const filePath = path.join(screenshotsDir, `${stepName}.png`);
    const shot = await page.screenshot({ path: filePath, fullPage: true });
    await testInfo.attach(stepName, { body: shot, contentType: 'image/png' });
    console.log(` Screenshot saved: ${filePath}`);
  }

  // Step 1: Go to sandbox
  await page.goto(testData.baseURLSandbox);
  console.log(' Redirected to home page');
  await takeScreenshot('step1_home');

  // Step 2: Open navigation menu
  const navMenuIcon = page.locator(locators.navigationMenuIcon).first();
  await navMenuIcon.waitFor({ state: 'visible', timeout: 15000 });
  await navMenuIcon.click();
  console.log(' Navigation menu clicked');
  await takeScreenshot('step2_nav_menu');

  // Step 3: Click Sign In
  const signInBtn = page.locator(locators.signInButton);
  await signInBtn.waitFor({ state: 'visible', timeout: 5000 });
  await signInBtn.click();
  console.log(' Sign In clicked');
  await takeScreenshot('step3_sign_in');

  // Step 4: Fill email
  const emailInput = page.locator(locators.emailInput);
  await emailInput.waitFor({ state: 'visible', timeout: 8000 });
  await emailInput.fill(process.env.EMAIL_USER || '');
  console.log(' Email filled');
  await takeScreenshot('step4_email_filled');

  // Step 5: Click Continue
  const continueBtn = page.locator(locators.continueButton);
  await continueBtn.click();
  console.log(' Continue button clicked');
  await takeScreenshot('step5_continue');

  // Step 6: Wait & get OTP
  await page.waitForTimeout(10000);
  const otp = await getLatestOtpFromEmail();
  console.log(' OTP received:', otp);

  // Step 7: Fill OTP inputs
  const otpInputs = page.locator(locators.otpInputs);
  await otpInputs.first().waitFor({ state: 'visible', timeout: 15000 });
  const digits = otp.trim().split('');
  for (let i = 0; i < 6; i++) {
    await otpInputs.nth(i).fill(digits[i]);
  }
  console.log(' OTP filled');
  await takeScreenshot('step6_otp_filled');

  // Step 8: Verify navigation to Wallet page
  await expect(page).toHaveURL(testData.baseURLSandbox);
  console.log(' Successfully navigated to Wallet page');
  await takeScreenshot('step7_wallet_page');
});
