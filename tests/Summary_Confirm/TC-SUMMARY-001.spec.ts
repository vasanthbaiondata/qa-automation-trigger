import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import locators from './locators.json';
import { testData } from './testData';
import { selectCurrency } from './helpers';

// Screenshot helper
function setupScreenshots(testInfo) {
  const safeTitle = testInfo.title.replace(/[^a-zA-Z0-9_\-]/g, '_');
  const dir = path.join('reports', safeTitle);
  if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  return async (page, step: string) => {
    const filePath = path.join(dir, `${step}.png`);
    const shot = await page.screenshot({ path: filePath, fullPage: true });
    await testInfo.attach(step, { body: shot, contentType: 'image/png' });
    console.log(` Screenshot saved: ${filePath}`);
  };
}

test('Positive: shows Summary and prompts to confirm buying. (TC-SUMMARY-001)', async ({ page }, testInfo) => {
  const takeScreenshot = setupScreenshots(testInfo);

  console.log(' Test started: TC-SUMMARY-001');

  // Step 0: Open sandbox
  console.log(' Step 0: Navigate to sandbox URL');
  await page.goto(testData.urls.sandbox);
  console.log(` Sandbox loaded: ${testData.urls.sandbox}`);
  await takeScreenshot(page, 'sandbox_loaded');

  const amountField = page.getByRole(locators.spinButton.role, { name: locators.spinButton.name });

  // Step 1: VND -> EUR
  console.log(' Step 1: Select currency VND');
  await selectCurrency(page, 'vnd');
  console.log(' VND selected');

  console.log(' Step 1: Select currency Euro Members-EUR');
  await selectCurrency(page, 'eurMembers');
  console.log(' Euro Members-EUR selected');

  console.log(` Step 1: Enter amount ${testData.amounts.eur}`);
  await amountField.fill(testData.amounts.eur);
  console.log(` Amount ${testData.amounts.eur} entered`);

  console.log(' Step 1: Click Estimated Value');
  await page.locator(`text=${locators.estimatedValue.text}`).click();
  console.log(' Estimated Value clicked');
  await takeScreenshot(page, 'summary_eur');

  // Step 2: EUR -> THB
  console.log(' Step 2: Select currency EUR');
  await selectCurrency(page, 'eur');
  console.log(' EUR selected');

  console.log(' Step 2: Select currency Thailand-THB');
  await selectCurrency(page, 'thailandTHB');
  console.log(' Thailand-THB selected');

  console.log(` Step 2: Enter amount ${testData.amounts.thb}`);
  await amountField.fill(testData.amounts.thb);
  console.log(` Amount ${testData.amounts.thb} entered`);

  console.log(' Step 2: Click Estimated Value');
  await page.locator(`text=${locators.estimatedValue.text}`).click();
  console.log(' Estimated Value clicked');
  await takeScreenshot(page, 'summary_thb');

  // Step 3: THB -> VND
  console.log(' Step 3: Select currency THB');
  await selectCurrency(page, 'thb');
  console.log(' THB selected');

  console.log(' Step 3: Select currency Vietnam-VND');
  await selectCurrency(page, 'vietnamVND');
  console.log(' Vietnam-VND selected');

  console.log(` Step 3: Enter amount ${testData.amounts.vnd}`);
  await amountField.fill(testData.amounts.vnd);
  console.log(` Amount ${testData.amounts.vnd} entered`);

  console.log(' Step 3: Click Estimated Value');
  await page.locator(`text=${locators.estimatedValue.text}`).click();
  console.log(' Estimated Value clicked');
  await takeScreenshot(page, 'summary_vnd');

  // Final Step: Check Buy button
  console.log(' Final Step: Check Buy button visibility');
  const buyBtn = page.getByRole(locators.buyButton.role, { name: locators.buyButton.name });
  await expect(buyBtn).toBeVisible({ timeout: 10000 });
  console.log(' Buy button is visible');
  await takeScreenshot(page, 'buy_button');

  console.log('🎉 Test completed: TC-SUMMARY-001');
});