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

test('Negative: Maximum Value Order (TC-SUMMARY-008)', async ({ page }, testInfo) => {
  const takeScreenshot = setupScreenshots(testInfo);

  // Step 1: Open sandbox
  await page.goto(testData.urls.sandbox);
  console.log(' Sandbox loaded');
  await takeScreenshot(page, 'step1_sandbox_loaded');

  // Step 2: Enter a large invalid amount
  const spinButton = page.getByRole(locators.fields.amountToPay.role, { name: locators.fields.amountToPay.name });
  await spinButton.fill(testData.validInputs.largeAmount);
  console.log(` Entered large amount: ${testData.validInputs.largeAmount}`);
  await takeScreenshot(page, 'step2_large_amount');

  // Step 3: Click Sell / Submit button if required (optional)
  if (locators.buttons.submitRole) {
    const submitBtn = page.getByRole(locators.buttons.submitRole.role, { name: locators.buttons.submitRole.name });
    await submitBtn.click();
    console.log(' Submit button clicked');
    await takeScreenshot(page, 'step3_submit_clicked');
  }

  // Step 4: Validate maximum order error
  const errorLocator = page.locator(locators.messages.maxOrder);
  await expect(errorLocator).toBeVisible({ timeout: 5000 });
  console.log(' Maximum order error validated');
  await takeScreenshot(page, 'step4_max_order_error');
});
