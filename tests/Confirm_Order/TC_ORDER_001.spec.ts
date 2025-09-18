import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

import locators from './locators.json';
import { testData } from './testData';

test.setTimeout(600000); // 10 mins
test.use({ storageState: 'loginState.json' });

test('Positive : Confirm order Buy Crypto (TC-ORDER-001)', async ({ page }, testInfo) => {
  // Reports directory per test
  const screenshotsDir = path.join('reports', testInfo.title.replace(/\s+/g, '_'));
  if (fs.existsSync(screenshotsDir)) {
    fs.rmSync(screenshotsDir, { recursive: true, force: true });
  }
  fs.mkdirSync(screenshotsDir, { recursive: true });

  // Helper for screenshots
  async function takeScreenshot(stepName: string) {
    const filePath = path.join(screenshotsDir, `${stepName}.png`);
    const shot = await page.screenshot({ path: filePath, fullPage: true });
    await testInfo.attach(stepName, { body: shot, contentType: 'image/png' });
    console.log(` Screenshot saved: ${filePath}`);
  }

  // Step 1: Go to sandbox
  await page.goto(testData.baseURL, { waitUntil: 'networkidle' });
  console.log(' Redirected to sandbox');
  await takeScreenshot('step1_sandbox');

  // Step 2: Enter amount
  const amountInput = page.getByRole(locators.buy.amountInput.role, { name: locators.buy.amountInput.name });
  await expect(amountInput).toBeVisible({ timeout: 30000 });
  await amountInput.fill(testData.buyAmount);
  console.log(' Amount entered');
  await takeScreenshot('step2_amount');

  // Step 3: Click Buy BTC
  const buyBtn = page.getByRole(locators.buy.buyBtn.role, { name: locators.buy.buyBtn.name });
  await expect(buyBtn).toBeEnabled({ timeout: 30000 });
  await buyBtn.click();
  console.log(' Buy BTC clicked');
  await takeScreenshot('step3_buy_btc');

  // Step 4: Wallet section
  const walletInput = page.getByRole(locators.buy.walletInput.role, { name: locators.buy.walletInput.name });
  await expect(walletInput).toBeVisible({ timeout: 30000 });
  await walletInput.fill(testData.walletAddress);

  const submitWallet = page.getByRole(locators.buy.submitWallet.role, { name: locators.buy.submitWallet.name });
  await expect(submitWallet).toBeEnabled({ timeout: 30000 });
  await submitWallet.click();
  console.log(' Wallet submitted');
  await takeScreenshot('step4_wallet');

  // Step 5: Special div click (replace img)
  const momoImg = page.locator(locators.buy.momoImg).locator('xpath=preceding-sibling::img').first();
  await expect(momoImg).toBeVisible({ timeout: 60000 });
  await momoImg.click();
  console.log(' Momo image clicked');
  await takeScreenshot('step5_momo');

  // Step 6: Continue buttons
  const continueBtn1 = page.getByRole(locators.buy.continueBtn.role, { name: locators.buy.continueBtn.name });
  await expect(continueBtn1).toBeVisible({ timeout: 30000 });
  await continueBtn1.click();
  console.log(' First Continue clicked');
  await takeScreenshot('step6_continue1');

  const phoneInput = page.getByRole(locators.buy.phoneInput.role, { name: new RegExp(locators.buy.phoneInput.name, 'i') });
  await expect(phoneInput).toBeVisible({ timeout: 30000 });
  await phoneInput.fill(testData.phoneNumber);
  console.log(' Phone number entered');
  await takeScreenshot('step7_phone');

  const continueBtn2 = page.getByRole(locators.buy.continueBtn.role, { name: locators.buy.continueBtn.name });
  await expect(continueBtn2).toBeVisible({ timeout: 30000 });
  await continueBtn2.click();
  console.log(' Second Continue clicked');
  await takeScreenshot('step8_continue2');

  // Step 7: Confirm
  const confirmBtn = page.getByRole(locators.buy.confirmBtn.role, { name: locators.buy.confirmBtn.name });
  await expect(confirmBtn).toBeVisible({ timeout: 30000 });
  await confirmBtn.click();
  console.log(' Phone confirmation done');
  await takeScreenshot('step9_confirm');
});
