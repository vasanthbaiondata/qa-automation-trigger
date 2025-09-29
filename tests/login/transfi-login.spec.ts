import { test, expect, Page, Locator } from '@playwright/test';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { getLatestOtpFromEmail } from '../../readEmails';

dotenv.config();

const baseURL = 'https://sandbox-buy.transfi.com/?apiKey=m4P91ifvL9NLCxQceZ';

// Load locators
const locatorsPath = path.resolve(__dirname, 'locators.json');
if (!fs.existsSync(locatorsPath)) {
  throw new Error(`locators.json not found at ${locatorsPath}`);
}
const locators = JSON.parse(fs.readFileSync(locatorsPath, 'utf8'));

// Helper: get locator from JSON format
function getLocator(page: Page, obj: any): Locator {
  if (!obj) throw new Error('Locator spec is missing');
  if (obj.css) return page.locator(obj.css);
  if (obj.role && obj.name) return page.getByRole(obj.role as any, { name: obj.name });
  if (obj.role && obj.target) return page.getByRole(obj.role as any).getByRole(obj.target as any).first();
  if (obj.text) return page.locator(`text=${obj.text}`);
  if (obj.role) return page.getByRole(obj.role as any);
  throw new Error('Unsupported locator format: ' + JSON.stringify(obj));
}

// Robust OTP filler: handles single input or multiple single-digit inputs
async function fillOtpRobust(page: Page, otp: string, otpSpec: any) {
  if (!otp) throw new Error('OTP is empty');

  // Normalize otp
  const code = otp.trim();
  if (!code) throw new Error('OTP (after trim) is empty');

  // If user provided a css for otp in JSON, prefer it
  if (otpSpec && otpSpec.css) {
    const singleOtp = page.locator(otpSpec.css);
    await singleOtp.waitFor({ state: 'visible', timeout: 15000 });
    // If this locator resolves to multiple inputs, handle below; otherwise fill
    const cnt = await singleOtp.count();
    if (cnt === 1) {
      await singleOtp.scrollIntoViewIfNeeded();
      await singleOtp.click({ force: true });
      await singleOtp.fill(code);
      console.log('Filled OTP into single input via css locator');
      return;
    } else {
      // treat as multiple inputs
      for (let i = 0; i < Math.min(cnt, code.length); i++) {
        const input = singleOtp.nth(i);
        await input.scrollIntoViewIfNeeded();
        await input.click({ force: true });
        // type instead of fill for single-digit boxes
        await input.type(code[i], { delay: 80 });
        // try tab to move focus if needed
        try { await page.keyboard.press('Tab'); } catch {}
        await page.waitForTimeout(80);
      }
      console.log('Filled OTP into multiple inputs via css locator');
      return;
    }
  }

  // Fallback 1: common pattern of 6 separate inputs
  const multiPattern = page.locator('input[id^="pin-input-1-"], input[id^="pin-input-"]');
  const multiCount = await multiPattern.count();
  if (multiCount >= 2) {
    // assume separate single-digit inputs
    for (let i = 0; i < Math.min(multiCount, code.length); i++) {
      const input = multiPattern.nth(i);
      await input.scrollIntoViewIfNeeded();
      await input.click({ force: true });
      await input.fill(''); // clear any prefilled
      // type single digit; type is usually more reliable for masked inputs
      await input.type(code[i], { delay: 70 });
      // some apps require a tab or arrow to move to next input
      try { await page.keyboard.press('Tab'); } catch {}
      await page.waitForTimeout(80);
    }
    console.log(`Filled OTP into ${multiCount} separate inputs (pattern fallback)`);
    return;
  }

  // Fallback 2: look for any visible input likely to accept the whole OTP
  const generalSingle = page.locator('input[type="text"], input[type="tel"], input[type="number"], input[name*="otp"], input[placeholder*="OTP"], input[aria-label*="OTP"]');
  let found = false;
  const singleCount = await generalSingle.count();
  for (let i = 0; i < singleCount; i++) {
    const input = generalSingle.nth(i);
    try {
      const visible = await input.isVisible();
      if (!visible) continue;
      await input.scrollIntoViewIfNeeded();
      await input.click({ force: true });
      await input.fill(code);
      console.log('Filled OTP into a general single input fallback');
      found = true;
      break;
    } catch (err) {
      // ignore and try next
    }
  }
  if (found) return;

  // Last resort: throw with debugging info
  throw new Error('Failed to locate OTP input fields. Tried pattern and general fallbacks.');
}

test.setTimeout(3600000); // 60 mins

test('TransFi login automation with OTP and save login state', async ({ page }) => {
  await page.goto(baseURL);
  console.log('Redirected to home page');

  // 1️⃣ Navigation menu
  const navMenuIcon = getLocator(page, locators.navMenuIcon);
  await navMenuIcon.waitFor({ state: 'visible', timeout: 15000 }).catch(() => {
    console.warn('navMenuIcon.waitFor timed out - continuing to try to click');
  });
  try {
    await navMenuIcon.scrollIntoViewIfNeeded();
    await navMenuIcon.click({ force: true });
  } catch (err) {
    console.warn('navMenuIcon click failed, attempting fallback selectors...', err);
    // fallback: try generic
    try { await page.locator('nav img').first().click({ force: true }); } catch {}
  }
  console.log('Navigation menu clicked');

  // 2️⃣ Sign In button
  const signInBtn = getLocator(page, locators.signInBtn);
  await signInBtn.waitFor({ state: 'visible', timeout: 10000 });
  await signInBtn.click();
  console.log('Sign In clicked');

  // 3️⃣ Email input
  const emailInput = getLocator(page, locators.emailInput);
  await emailInput.waitFor({ state: 'visible', timeout: 10000 });
  if (!process.env.EMAIL_USER) throw new Error('EMAIL_USER not set in .env');
  await emailInput.fill(process.env.EMAIL_USER);
  console.log('Email filled');

  // 4️⃣ Continue button
  const continueBtn = getLocator(page, locators.continueBtn);
  await continueBtn.waitFor({ state: 'visible', timeout: 8000 });
  await continueBtn.click();
  console.log('Continue clicked');

  // 5️⃣ Wait & fetch OTP
  // Increase wait here if your email takes longer to arrive
  await page.waitForTimeout(8000);
  const otp = await getLatestOtpFromEmail();
  if (!otp) throw new Error('No OTP returned from getLatestOtpFromEmail()');
  console.log('OTP received:', otp);

  // 6️⃣ Fill OTP (robust handler)
  try {
    await fillOtpRobust(page, otp, locators.otpInput);
    console.log('OTP filled (robust)');
  } catch (err) {
    console.error('OTP filling failed:', err);
    throw err; // bubble up so test fails and you can inspect
  }

  // 7️⃣ Wait for login to complete
  await page.waitForTimeout(5000);

  // optional: assert post-login element if available
  if (locators.postLoginCheck) {
    try {
      const postLogin = getLocator(page, locators.postLoginCheck);
      await postLogin.waitFor({ state: 'visible', timeout: 10000 });
      console.log('Post-login check passed');
    } catch {
      console.warn('Post-login check not found or not visible');
    }
  }

  // 8️⃣ Save storage state
  await page.context().storageState({ path: 'loginState.json' });
  console.log('Full login state saved to loginState.json');
});

// Reuse saved login state
test.use({ storageState: 'loginState.json' });

test('Bypass login using saved login state', async ({ page }) => {
  await page.goto(baseURL);
  console.log('Navigated with saved login state');
});
