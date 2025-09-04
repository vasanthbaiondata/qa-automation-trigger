import { test, expect } from '@playwright/test';
import locators from './locators.json';
import { testData } from './testData';
import fs from 'fs';
import path from 'path';

test.setTimeout(5 * 60 * 1000);

test('Negative: Maximum Value Order on Sell (TC-SellCRYPTO-Sell-003)', async ({ page }, testInfo) => {
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
    console.log(`📸 Screenshot saved: ${filePath}`);
  }

  // Step 1: Navigate to base URL
  await page.goto(testData.baseURL);
  console.log('✅ Navigated to sandbox');
  await takeScreenshot('step1_home');

  // Step 2: Open Sell Crypto tab
  const sellTab = page.getByRole(locators.tabs.sellCrypto.role, { name: locators.tabs.sellCrypto.name });
  await sellTab.click();
  console.log('✅ Sell Crypto tab clicked');
  await takeScreenshot('step2_sell_tab');

  // Step 3: Locate amount input and type maximum value
  const amountField = page.getByRole(locators.fields.amountInput.role, { name: locators.fields.amountInput.name });
  await expect(amountField).toBeVisible();
  await amountField.fill('');
  await amountField.type(testData.maxValue);
  console.log(`❌ Typed maximum value: ${testData.maxValue}`);
  await takeScreenshot('step3_max_value_input');

  // Step 4: Verify error message
  const errorMessage = page.locator(locators.messages.maxOrder);
  await expect(errorMessage).toBeVisible({ timeout: 5000 });
  await expect(errorMessage).toContainText(/The maximum order value in your geography is:\s*\d+(\.\d+)?\s*BTC/);
  console.log('✅ Maximum order error message verified');
  await takeScreenshot('step4_max_order_error');
});
