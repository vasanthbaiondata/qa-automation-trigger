import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

import locators from './locators.json';
import { testData } from './testData';

test.setTimeout(360000); // 6 mins
test.use({ storageState: 'loginState.json' }); // use saved login

test('Negative: To show invalid wallet address (TC-INPUT-002)', async ({ page }, testInfo) => {
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
    console.log(` Screenshot saved: ${filePath}`);
  }

  // Step 1: Go to sandbox
  await page.goto(testData.baseURL);
  console.log(' Redirected to sandbox');
  await takeScreenshot('step1_sandbox');

  // Step 2: Enter amount
  const amountInput = page.getByRole(locators.amountInput.role, { name: locators.amountInput.name });
  await expect(amountInput).toBeVisible();
  await amountInput.fill(testData.amount);
  console.log(' Amount entered');
  await takeScreenshot('step2_amount');

  // Step 3: Click Buy BTC
  const buyBtn = page.getByRole(locators.buyBtn.role, { name: locators.buyBtn.name });
  await expect(buyBtn).toBeEnabled();
  await buyBtn.click();
  console.log(' Buy BTC clicked');
  await takeScreenshot('step3_buy_btn');

  // Step 4: Wallet section (enter invalid wallet)
  const walletInput = page.getByRole(locators.walletInput.role, { name: locators.walletInput.name });
  await expect(walletInput).toBeVisible();
  await walletInput.fill(testData.invalidWallet);
  await takeScreenshot('step4_wallet_input');

  const submitWallet = page.getByRole(locators.submitWallet.role, { name: locators.submitWallet.name });
  await submitWallet.click();
  console.log(' Wallet Address added');
  await takeScreenshot('step5_submit_wallet');

  await page.waitForTimeout(4000);
  await takeScreenshot('step6_after_wait');

  // Step 5: Verify invalid wallet error
  const errorMsg = page.getByText(new RegExp(locators.invalidWalletError, "i"));
  await expect(errorMsg).toBeVisible({ timeout: 5000 });
  console.log(' Invalid wallet error verified');
  await takeScreenshot('step7_invalid_wallet_error');
});
