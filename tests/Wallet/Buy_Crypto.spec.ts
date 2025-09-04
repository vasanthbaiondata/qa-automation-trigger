import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

// Import locators and config from JSON
import locators from '../../locators/locators.json' assert { type: "json" };

test.setTimeout(600_000);
test.use({ storageState: 'WalletloginState.json' });

test('Positive: End-to-End Automation - Buy Crypto Wallet address from query param (END_TO_END_003)', async ({ page }, testInfo) => {
  // Create clean dynamic folder for screenshots (based on test title)
  const screenshotsDir = path.join('reports', testInfo.title.replace(/\s+/g, '_'));
  if (fs.existsSync(screenshotsDir)) {
    fs.rmSync(screenshotsDir, { recursive: true, force: true }); // delete old folder
  }
  fs.mkdirSync(screenshotsDir, { recursive: true });

  // Helper for auto screenshot with step name
  async function takeStepScreenshot(stepName: string) {
    const filePath = path.join(screenshotsDir, `${stepName}.png`);
    await page.screenshot({ path: filePath, fullPage: true });
    await testInfo.attach(stepName, { path: filePath, contentType: 'image/png' }); // Attach to HTML report
    console.log(`📸 Screenshot saved: ${filePath}`);
  }

  // Step 1: Go to Sandbox using URL from locators.json
  console.log('➡️ Step 1: Navigating to Sandbox...');
  await page.goto(locators.sandbox_url_with_wallet);
  console.log('✅ Redirected to sandbox');
  await takeStepScreenshot('step1_sandbox');

  // Step 2: Select Currency dynamically using locators.json
  console.log('➡️ Selecting currency VND → Euro Members-EUR...');
  await page.locator('div').filter({ hasText: new RegExp(locators.currency_vnd.text) }).nth(locators.currency_vnd.nth).click();
  await page.locator('div').filter({ hasText: new RegExp(locators.currency_euro.text) }).first().click();
  console.log('✅ Currency selected: Euro Members-EUR');
  await takeStepScreenshot('step1_currency');

  // Step 3: Enter Amount (Note: role "spinbutton" instead of "button")
  console.log('➡️ Step 2: Entering amount...');
  const amountInput = page.getByRole(locators.pay_amount.role, { name: locators.pay_amount.name });
  await expect(amountInput).toBeVisible({ timeout: 30_000 });
  await amountInput.fill('195');
  console.log('✅ Amount entered: 195');
  await takeStepScreenshot('step2_amount');

  // Step 4: Click Buy BTC
  console.log('➡️ Step 3: Clicking Buy BTC...');
  const buyBtn = page.getByRole(locators.buy_btc.role, { name: locators.buy_btc.name });
  await expect(buyBtn).toBeEnabled({ timeout: 30_000 });
  await buyBtn.click();
  console.log('✅ Buy BTC clicked');
  // Optional: await takeStepScreenshot('step3_buy');

  // Step 5: Select Payment Method SEPA Instant
  console.log('➡️ Step 4: Selecting SEPA Instant...');
  const sepaImg = page.locator(`main >> text=${locators.sepa_instant}`).locator('xpath=preceding-sibling::img').first();
  await expect(sepaImg).toBeVisible({ timeout: 60_000 });
  await sepaImg.click();
  console.log('✅ SEPA Instant image clicked');
  await takeStepScreenshot('step4_sepa');

  // Step 6: Click Continue
  console.log('➡️ Step 5: Clicking Continue...');
  const continueBtn1 = page.getByRole(locators.continue.role, { name: locators.continue.name });
  await expect(continueBtn1).toBeVisible({ timeout: 30_000 });
  await continueBtn1.click();
  console.log('✅ First Continue clicked');
  await takeStepScreenshot('step5_continue');

  // Step 7: Confirm
  console.log('➡️ Step 6: Clicking Confirm...');
  const confirmBtn = page.getByRole(locators.confirm.role, { name: locators.confirm.name });
  await expect(confirmBtn).toBeVisible({ timeout: 30_000 });
  await confirmBtn.click();
  console.log('✅ Confirmation done');
  await takeStepScreenshot('step6_confirm');

  // Step 8: Proceed to Payment
  console.log('➡️ Step 7: Proceeding to payment...');
  await page.waitForTimeout(3000);
  const proceedBtn = page.getByRole(locators.proceed_to_pay.role, { name: locators.proceed_to_pay.name });
  await proceedBtn.click();
  console.log('✅ Proceed to pay clicked');
  await takeStepScreenshot('step7_proceed');

  // Step 9: Open Order Details
  console.log('➡️ Step 8: Opening order details...');
  const orderDetailsBtn = page.getByRole(locators.order_details.role, { name: locators.order_details.name });
  await orderDetailsBtn.click();
  console.log('✅ Order Details opened');
  await takeStepScreenshot('step8_order');
});
