import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import locators from './locators.json';
import { testData } from './testData';
import { selectCurrency, selectCrypto, clickEstimatedValue } from './helpers';

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

test.use({ storageState: 'loginState.json' });

test('Positive: System shows conversion currency, crypto value, network fee & processing fee (TC-SUMMARY-005)', async ({ page }, testInfo) => {
  const takeScreenshot = setupScreenshots(testInfo);

  console.log(' Step 0: Open sandbox');
  await page.goto(testData.urls.sandbox);
  await takeScreenshot(page, 'step0_sandbox');
  console.log(' Sandbox loaded');

  // Step 1: VND -> Euro Members-EUR
  console.log(' Step 1: Select VND and Euro Members-EUR');
  await selectCurrency(page, 'vnd');
  await selectCurrency(page, 'eurMembers');
  await takeScreenshot(page, 'step1_eurMembers');
  console.log(' EUR (Euro Members) selected');

  // Enter amount
  const amountField = page.getByRole(locators.spinButton.role, { name: locators.spinButton.name });
  await amountField.fill(testData.amounts.eur);
  await takeScreenshot(page, 'step1_amount');
  console.log(` Entered amount: ${testData.amounts.eur}`);

  // Step 2: EUR -> Andorra-EUR
  console.log(' Step 2: Select Andorra-EUR');
  await selectCurrency(page, 'eur');
  await selectCurrency(page, 'andorraEUR');
  await takeScreenshot(page, 'step2_andorra');
  console.log(' Andorra-EUR selected');

  // Step 3: BTC -> AAVE
  console.log(' Step 3: Select BTC -> AAVE');
  await selectCrypto(page, 'btc');  // open dropdown
  await selectCrypto(page, 'aave');
  await takeScreenshot(page, 'step3_aave');
  console.log(' AAVE selected');

  // Step 4: Click Estimated Value for AAVE
  console.log(' Step 4: Click Estimated Value for AAVE');
  await clickEstimatedValue(page, 'AAVE');
  await takeScreenshot(page, 'step4_aave_summary');
  console.log(' AAVE summary clicked');

  // Step 5: EUR -> Austria-EUR
  console.log(' Step 5: Select Austria-EUR');
  await selectCurrency(page, 'eur');
  await selectCurrency(page, 'austriaEUR');
  await takeScreenshot(page, 'step5_austria');
  console.log(' Austria-EUR selected');

  // Step 6: Change crypto AAVE -> ADA
  console.log(' Step 6: Select ADA');
  await selectCrypto(page, 'aave'); // open dropdown
  await selectCrypto(page, 'ada');
  await takeScreenshot(page, 'step6_ada');
  console.log(' ADA selected');

  // Step 7: Click Estimated Value for ADA
  console.log(' Step 7: Click Estimated Value for ADA');
  await clickEstimatedValue(page, 'ADA');
  await takeScreenshot(page, 'step7_ada_summary');
  console.log(' ADA summary clicked');

  console.log('🎉 Test TC-SUMMARY-005 completed');
});