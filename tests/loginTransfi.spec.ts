import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';
import { getLatestOtpFromEmail } from '../readEmails';

dotenv.config();

const baseURL = 'https://sandbox-buy.transfi.com/?apiKey=m4P91ifvL9NLCxQceZ';

test.setTimeout(3600000); // 60 mins timeout

// First test: Do OTP login and save session
test('TransFi login automation with OTP from email and save login state', async ({ page }) => {
  // 1. Go to home/login page
  await page.goto(baseURL);
  console.log(' Redirected to home page');

  // 2. Open navigation menu
  const navMenuIcon = page.getByRole('navigation').getByRole('img').first();
  await navMenuIcon.waitFor({ state: 'visible', timeout: 15000 });
  await navMenuIcon.click();
  console.log(' Navigation menu clicked');

  // 3. Click Sign In button
  const signInBtn = page.getByRole('button', { name: 'Sign In' });
  await signInBtn.waitFor({ state: 'visible', timeout: 5000 });
  await signInBtn.click();
  console.log(' Sign In clicked');
  await page.waitForTimeout(2000);

  // 4. Fill Email textbox
  const emailInput = page.getByRole('textbox', { name: 'Email' });
  await emailInput.waitFor({ state: 'visible', timeout: 8000 });
  await emailInput.click();
  if (!process.env.EMAIL_USER) throw new Error(' EMAIL_USER not set in .env');
  await emailInput.fill(process.env.EMAIL_USER);
  console.log(' Email filled');

  // 5. Click Continue button
  const continueBtn = page.getByRole('button', { name: 'Continue' });
  await continueBtn.waitFor({ state: 'visible', timeout: 5000 });
  await continueBtn.click();
  console.log(' Continue button clicked');

  // 6. Wait & fetch OTP from email
  await page.waitForTimeout(10000);
  const otp = await getLatestOtpFromEmail();
  console.log('OTP received:', otp);

  // Fill OTP inputs
  const digits = otp.trim().split('');
  await page.waitForSelector('input[id^="pin-input-1-"]', { state: 'visible', timeout: 15000 });
  const otpInputs = page.locator('input[id^="pin-input-1-"]');
  const count = await otpInputs.count();
  if (count !== 6) throw new Error(` Expected 6 OTP inputs, found ${count}`);

  for (let i = 0; i < 6; i++) {
    await otpInputs.nth(i).fill(digits[i]);
  }
  console.log(' OTP filled');

  // Wait for login to complete (adjust as needed)
  await page.waitForTimeout(7000);

  // Save full login state (cookies + localStorage)
  await page.context().storageState({ path: 'loginState.json' });
  console.log(' Full login state saved to loginState.json');
});

// Second test: Reuse saved login state → skip OTP/login
test.use({ storageState: 'loginState.json' });

test('Bypass login using saved login state', async ({ page }) => {
  await page.goto(baseURL);
  console.log(' Navigated with saved login state');
});
