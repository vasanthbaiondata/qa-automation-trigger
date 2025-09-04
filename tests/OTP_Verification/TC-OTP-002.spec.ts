import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';
import locators from './locators.json';
import { testData } from './testData';
import fs from 'fs';
import path from 'path';

dotenv.config();

test.setTimeout(3600000); // 60 mins

test('Negative : Rejects incorrect OTP and shows error message (TC-OTP-002)', async ({ page }, testInfo) => {
  const screenshotsDir = path.join('reports', testInfo.title.replace(/\s+/g, '_'));
  if (fs.existsSync(screenshotsDir)) {
    fs.rmSync(screenshotsDir, { recursive: true, force: true });
  }
  fs.mkdirSync(screenshotsDir, { recursive: true });

  async function takeScreenshot(stepName: string) {
    const filePath = path.join(screenshotsDir, `${stepName}.png`);
    const shot = await page.screenshot({ path: filePath, fullPage: true });
    await testInfo.attach(stepName, { body: shot, contentType: 'image/png' });
    console.log(`📸 Screenshot saved: ${filePath}`);
  }

  // 1️⃣ Go to Sandbox/Login page
  await page.goto(testData.baseURLSandbox);
  console.log('✅ Redirected to home page');
  await takeScreenshot('step1_home');

  // 2️⃣ Open navigation menu
  const navMenuIcon = page.locator(locators.navigationMenuIcon).first();
  await navMenuIcon.waitFor({ state: 'visible', timeout: 15000 });
  await navMenuIcon.click();
  console.log('📂 Navigation menu clicked');
  await takeScreenshot('step2_nav_menu');

  // 3️⃣ Click Sign In button
  const signInBtn = page.locator(locators.signInButton);
  await signInBtn.waitFor({ state: 'visible', timeout: 5000 });
  await signInBtn.click();
  console.log('🔑 Sign In clicked');
  await takeScreenshot('step3_sign_in');

  // 4️⃣ Fill Email textbox (from testData)
  const emailInput = page.locator(locators.emailInput);
  await emailInput.waitFor({ state: 'visible', timeout: 8000 });

  const email = testData.email1;
  if (!email) throw new Error('email1 not defined in testData');

  await emailInput.fill(email);
  console.log(`✉️ Email filled: ${email}`);
  await takeScreenshot('step4_email_filled');

  // 5️⃣ Click Continue button
  const continueBtn = page.locator(locators.continueButton);
  await continueBtn.click();
  console.log('➡️ Continue button clicked');
  await takeScreenshot('step5_continue');

  // 6️⃣ Wait a bit for OTP page to load
  await page.waitForTimeout(5000);
  await takeScreenshot('step6_otp_page_loaded');

  // 7️⃣ Enter WRONG OTP
  const wrongOtp = testData.wrongOtp;
  const otpInputs = page.locator(locators.otpInputs);
  await otpInputs.first().waitFor({ state: 'visible', timeout: 15000 });

  for (let i = 0; i < 6; i++) {
    await otpInputs.nth(i).fill(wrongOtp[i]);
  }
  console.log('❌ Wrong OTP entered');
  await takeScreenshot('step7_wrong_otp');

  // 8️⃣ Expect error/toast message
  const toast = page.locator(locators.toastMessage);
  await expect(toast).toContainText(/incorrect verification code/i, { timeout: 10000 });
  console.log('✅ Incorrect OTP message verified');
  await takeScreenshot('step8_toast_error');

  // 9️⃣ Verify user stays on OTP page
  await expect(page.locator(locators.otpInputs).first()).toBeVisible();
  console.log('✅ User did NOT navigate to Wallet page as expected');
  await takeScreenshot('step9_still_on_otp_page');
});
