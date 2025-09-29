import { test, expect, Page, Locator } from '@playwright/test';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { getLatestOtpFromEmail } from '../../readEmails'; // keep your existing helper

dotenv.config();

const baseURL =
  'https://sandbox-buy.transfi.com/?apiKey=m4P91ifvL9NLCxQceZ&walletAddress=3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy';

test.setTimeout(3600000); // 60 mins timeout

// --- Load locators.json (your custom format) ---
const locatorsPath = path.resolve(__dirname, 'locators.json');
if (!fs.existsSync(locatorsPath)) {
  throw new Error(`locators.json not found at ${locatorsPath}`);
}
const locators = JSON.parse(fs.readFileSync(locatorsPath, 'utf8'));

// --- Helper: build a Playwright Locator from your JSON entry ---
function getLocator(page: Page, spec: any): Locator {
  // priority: css -> role+name -> role+target -> text -> role only fallback
  if (!spec) throw new Error('Locator spec is undefined/null');

  if (spec.css) {
    return page.locator(spec.css);
  }

  if (spec.role && spec.name) {
    return page.getByRole(spec.role as any, { name: spec.name });
  }

  if (spec.role && spec.target) {
    // get the parent role then find target role inside and use first()
    // e.g. { role: 'navigation', target: 'img' }
    return page.getByRole(spec.role as any).getByRole(spec.target as any).first();
  }

  if (spec.text) {
    // text= is robust for visible text
    return page.locator(`text=${spec.text}`);
  }

  if (spec.role) {
    // fallback: just role
    return page.getByRole(spec.role as any);
  }

  throw new Error('Unsupported locator spec: ' + JSON.stringify(spec));
}

// --- Robust OTP filler helper ---
async function fillOtpRobust(page: Page, otp: string, otpSpec: any) {
  if (!otp) throw new Error('OTP is empty');
  const code = otp.trim();
  if (!code) throw new Error('OTP (after trim) is empty');

  // 1) If JSON locator gave css for OTP, try that first
  if (otpSpec && otpSpec.css) {
    const locator = page.locator(otpSpec.css);
    const cnt = await locator.count();
    if (cnt === 0) {
      console.warn(`OTP css locator returned 0 elements: ${otpSpec.css}`);
    } else if (cnt === 1) {
      // single input - fill whole code
      const el = locator.first();
      await el.waitFor({ state: 'visible', timeout: 15000 });
      await el.scrollIntoViewIfNeeded();
      await el.click({ force: true });
      await el.fill(code);
      // dispatch input event to make sure framework notices
      await page.evaluate((selector, value) => {
        const el = document.querySelector(selector) as HTMLInputElement | null;
        if (el) {
          el.value = value;
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }, otpSpec.css, code);
      console.log('Filled OTP into single css input');
      return;
    } else {
      // multiple inputs matched by css
      for (let i = 0; i < Math.min(cnt, code.length); i++) {
        const single = locator.nth(i);
        await single.scrollIntoViewIfNeeded();
        await single.click({ force: true });
        await single.fill(''); // clear
        await single.type(code[i], { delay: 60 });
        // try to move focus if needed
        try { await page.keyboard.press('Tab'); } catch {}
        await page.waitForTimeout(60);
      }
      console.log('Filled OTP across multiple css inputs');
      return;
    }
  }

  // 2) Common multi-input pattern fallback (ids that start with pin-input)
  const multiPattern = page.locator('input[id^="pin-input-1-"], input[id^="pin-input-"]');
  const multiCount = await multiPattern.count();
  if (multiCount >= 2) {
    for (let i = 0; i < Math.min(multiCount, code.length); i++) {
      const input = multiPattern.nth(i);
      await input.scrollIntoViewIfNeeded();
      await input.click({ force: true });
      await input.fill('');
      await input.type(code[i], { delay: 60 });
      try { await page.keyboard.press('ArrowRight'); } catch {}
      try { await page.keyboard.press('Tab'); } catch {}
      await page.waitForTimeout(60);
    }
    console.log(`Filled OTP into ${multiCount} separate inputs (pin-input fallback)`);
    return;
  }

  // 3) General single-input fallback: look for likely OTP input fields
  const generalSingle = page.locator('input[type="text"], input[type="tel"], input[type="number"], input[name*="otp"], input[placeholder*="OTP"], input[aria-label*="OTP"], input[placeholder*="Enter OTP"]');
  const singleCount = await generalSingle.count();
  for (let i = 0; i < singleCount; i++) {
    const input = generalSingle.nth(i);
    if (!(await input.isVisible())) continue;
    try {
      await input.scrollIntoViewIfNeeded();
      await input.click({ force: true });
      await input.fill(code);
      // dispatch events so frameworks pick up the change
      await page.evaluate((el) => {
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      }, await input.elementHandle());
      console.log('Filled OTP into a general single input fallback');
      return;
    } catch (e) {
      // continue trying others
    }
  }

  // 4) Last resort: directly set values into multiple inputs if we can find them by pattern
  const fallbackMulti = await page.$$eval('input', (inputs, code) => {
    // try to find input sequence suitable for OTP by checking placeholder/maxlength
    const candidates = inputs.filter((inp: any) => {
      const maxlength = inp.getAttribute('maxlength');
      const placeholder = inp.getAttribute('placeholder') || '';
      return (maxlength === '1' || placeholder.toLowerCase().includes('otp') || inp.type === 'tel' || inp.type === 'number');
    });
    if (candidates.length >= 1) {
      // fill as many as possible
      for (let i = 0; i < Math.min(candidates.length, code.length); i++) {
        candidates[i].value = code[i];
        candidates[i].dispatchEvent(new Event('input', { bubbles: true }));
        candidates[i].dispatchEvent(new Event('change', { bubbles: true }));
      }
      return candidates.length;
    }
    return 0;
  }, code);

  if (fallbackMulti && fallbackMulti > 0) {
    console.log(`Filled OTP via page.$$eval fallback into ${fallbackMulti} inputs`);
    return;
  }

  // Give up with a helpful error
  throw new Error('Failed to locate OTP input fields. Tried css, pin-input pattern, general inputs, and DOM fallback.');
}

// --- Test: do OTP login and save WalletloginState.json ---
test('TransFi wallet login automation with OTP and save login state', async ({ page }) => {
  // 1. Go to home/login page
  await page.goto(baseURL);
  console.log('Redirected to home page');

  // 2. Open navigation menu (robust handling)
  const navMenuIcon = getLocator(page, locators.navMenuIcon);
  await navMenuIcon.waitFor({ state: 'visible', timeout: 15000 }).catch(() => {
    console.warn('navMenuIcon.waitFor timed out — will try page.waitForSelector fallback');
  });
  try {
    await navMenuIcon.scrollIntoViewIfNeeded();
    await navMenuIcon.click({ force: true });
  } catch (err) {
    console.warn('navMenuIcon click failed, attempting fallback selector...');
    if (locators.navMenuIcon?.css) {
      await page.locator(locators.navMenuIcon.css).first().click({ force: true }).catch(() => {});
    } else {
      await page.locator('nav img').first().click({ force: true }).catch(() => {});
    }
  }
  console.log('Navigation menu clicked');

  // 3. Click Sign In button
  const signInBtn = getLocator(page, locators.signInBtn);
  await signInBtn.waitFor({ state: 'visible', timeout: 10000 });
  await signInBtn.click();
  console.log('Sign In clicked');
  await page.waitForTimeout(2000);

  // 4. Fill Email textbox
  const emailInput = getLocator(page, locators.emailInput);
  await emailInput.waitFor({ state: 'visible', timeout: 10000 });
  await emailInput.click();
  if (!process.env.EMAIL_USER) throw new Error('EMAIL_USER not set in .env');
  await emailInput.fill(process.env.EMAIL_USER);
  console.log('Email filled');

  // 5. Click Continue button
  const continueBtn = getLocator(page, locators.continueBtn);
  await continueBtn.waitFor({ state: 'visible', timeout: 8000 });
  await continueBtn.click();
  console.log('Continue button clicked');

  // 6. Wait & fetch OTP from email
  await page.waitForTimeout(8000); // wait for mail to arrive & inputs to render
  const otp = await getLatestOtpFromEmail();
  if (!otp) throw new Error('No OTP returned from getLatestOtpFromEmail()');
  console.log('OTP received:', otp);

  // 7. Fill OTP inputs (robust)
  try {
    await fillOtpRobust(page, otp, locators.otpInput);
    console.log('OTP filled (robust flow)');
  } catch (err) {
    console.error('OTP filling failed:', err);
    // Take a screenshot to help debugging
    try { await page.screenshot({ path: 'otp-fail-screenshot.png', fullPage: true }); } catch {}
    throw err; // fail the test so you can inspect
  }

  // 8. Wait for login to complete (adjust as needed)
  await page.waitForTimeout(7000);

  // Optionally validate login succeeded (example: check for user menu or logout)
  if (locators.postLoginCheck) {
    try {
      const postLogin = getLocator(page, locators.postLoginCheck);
      await postLogin.waitFor({ state: 'visible', timeout: 10000 });
      console.log('Post-login check passed');
    } catch {
      console.warn('Post-login check failed or not present in locators.json');
    }
  }

  // 9. Save full login state (cookies + localStorage)
  await page.context().storageState({ path: 'WalletloginState.json' });
  console.log('Full login state saved to WalletloginState.json');
});

// Second test: Reuse saved login state → skip OTP/login
test.use({ storageState: 'WalletloginState.json' });

test('Bypass login using saved login state', async ({ page }) => {
  await page.goto(baseURL);
  console.log('Navigated with saved login state');

  // optional quick check that user is logged in
  if (locators.postLoginCheck) {
    const postLogin = getLocator(page, locators.postLoginCheck);
    await postLogin.waitFor({ state: 'visible', timeout: 10000 });
    console.log('Verified user is logged in using saved state');
  }
});
