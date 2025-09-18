import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import locators from './locators.json';
import { testData } from './testData';

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

test('Negative: letters in number input disables button (TC-SUMMARY-006)', async ({ page }, testInfo) => {
  const takeScreenshot = setupScreenshots(testInfo);

  // Step 1: Open sandbox
  await page.goto(testData.urls.sandbox);
  console.log(' Sandbox loaded');
  await takeScreenshot(page, 'step1_sandbox_loaded');

  // Step 2: Enter invalid letters into "I want to Pay"
  const amountField = page.getByRole(locators.fields.amountToPay.role, { name: locators.fields.amountToPay.name });
  await amountField.fill('');
  await amountField.type(testData.validInputs.invalidChar);
  console.log(` Entered invalid char: ${testData.validInputs.invalidChar}`);
  await takeScreenshot(page, 'step2_invalid_input');

  // Step 3: Verify Buy button is disabled
  const buyButton = page.getByRole(locators.buttons.buy.role, { name: locators.buttons.buy.name });
  await expect(buyButton).toBeDisabled();
  console.log(' Buy button disabled');
  await takeScreenshot(page, 'step3_buy_disabled');
});
