import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

// Import locators from your shared file
import locators from '../../locators/locators.json' assert { type: "json" };

test.setTimeout(600000); // 10 mins
test.use({ storageState: 'WalletloginState.json' });

test('Positive : End To End Automation_SELL_CRYPTO Wallet address from query param', async ({ page }, testInfo) => {
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

  // Step 1: Go to sandbox using locator URL
  console.log('➡️ Step 1: Navigating to sandbox...');
  await page.goto(locators.sandbox_url_with_wallet);
  console.log('✅ Redirected to sandbox');
  await takeScreenshot('step1_sandbox');

  // Step 2: Switch to Sell Crypto tab
  const sellTab = page.getByRole(locators.sell_crypto_tab.role, { name: locators.sell_crypto_tab.name });
  await sellTab.click();
  console.log('✅ Sell Crypto tab clicked');
  await takeScreenshot('step2_sell_crypto');

  // Step 3: Click Sell BTC (wait for enabled and click with navigation)
  const sellBtn = page.getByRole(locators.sell_btc.role, { name: locators.sell_btc.name });
  await expect(sellBtn).toBeEnabled({ timeout: 30000 });
  await Promise.all([
    page.waitForNavigation(),
    sellBtn.click()
  ]);
  console.log('✅ Sell BTC clicked');
  await takeScreenshot('step3_sell_btc');

  // Step 4: Wallet Continue
  const submitWallet = page.getByRole(locators.continue.role, { name: locators.continue.name });
  await expect(submitWallet).toBeEnabled({ timeout: 30000 });
  await Promise.all([
    page.waitForNavigation(),
    submitWallet.click()
  ]);
  console.log('✅ Payment Withdrawal Method Confirmed');
  await takeScreenshot('step4_continue_wallet');

  // Step 5: Confirm Order
  const confirmOrderBtn = page.getByRole(locators.confirm_order.role, { name: locators.confirm_order.name });
  await expect(confirmOrderBtn).toBeVisible({ timeout: 30000 });
  await Promise.all([
    page.waitForNavigation(),
    confirmOrderBtn.click()
  ]);
  console.log('✅ Confirmed Order');
  await takeScreenshot('step5_confirm_order');

  // Step 6: View Order
  const viewOrderBtn = page.getByRole(locators.view_order.role, { name: locators.view_order.name });
  await expect(viewOrderBtn).toBeVisible({ timeout: 30000 });
  await Promise.all([
    page.waitForNavigation(),
    viewOrderBtn.click()
  ]);
  console.log('✅ View Order clicked');
  await takeScreenshot('step6_view_order');

  // Step 7: Order Details
  const orderDetailsBtn = page.getByRole(locators.order_details.role, { name: locators.order_details.name });
  await orderDetailsBtn.click();
  console.log('✅ View Order Details');
  await takeScreenshot('step7_order_details');
});
