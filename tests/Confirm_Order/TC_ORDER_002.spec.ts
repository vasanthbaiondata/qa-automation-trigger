import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

import locators from './locators.json';
import { testData } from './testData';

test.setTimeout(360000); // 6 mins
test.use({ storageState: 'loginState.json' });

test('Positive : Confirm order Sell Crypto (TC-ORDER-002)', async ({ page }, testInfo) => {
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
    console.log(`📸 Screenshot saved: ${filePath}`);
  }

  // Step 1: Go to sandbox
  await page.goto(testData.baseURL);
  console.log('✅ Redirected to sandbox');
  await takeScreenshot('step1_sandbox');

  // Step 2: Click Sell Crypto tab
  const sellTab = page.getByRole(locators.sell.sellTab.role, { name: locators.sell.sellTab.name });
  await expect(sellTab).toBeVisible({ timeout: 10000 });
  await sellTab.click();
  console.log('✅ Sell Crypto tab selected');
  await takeScreenshot('step2_sell_tab');

  // Step 3: Click Sell BTC button
  const sellBtn = page.getByRole(locators.sell.sellBtn.role, { name: locators.sell.sellBtn.name });
  await expect(sellBtn).toBeEnabled({ timeout: 10000 });
  await sellBtn.click();
  console.log(`✅ Sell ${testData.sellCurrency} clicked`);
  await takeScreenshot('step3_sell_btc');

  // Step 4: Wait for modal / page to load
  await page.waitForTimeout(2000);
  await takeScreenshot('step4_after_wait');

  // Step 5: Click Continue if visible
  const continueBtn = page.getByRole(locators.sell.continueBtn.role, { name: locators.sell.continueBtn.name });
  if (await continueBtn.isVisible({ timeout: 10000 })) {
    await continueBtn.click();
    console.log('✅ Continue clicked');
    await takeScreenshot('step5_continue');
  } else {
    console.log('ℹ️ Continue button not visible — skipped step5 screenshot');
  }

  // Step 6: Click Confirm Order
  const confirmOrderBtn = page.locator(locators.sell.confirmOrderBtn);
  await expect(confirmOrderBtn).toBeVisible({ timeout: 30000 });
  await confirmOrderBtn.click();
  console.log('✅ Order confirmed');
  await takeScreenshot('step6_confirm_order');

  // Step 7: Optional wait for navigation + final screenshot
  await page.waitForTimeout(5000);
  await takeScreenshot('step7_final');
});
