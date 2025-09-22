import { test, expect } from '@playwright/test';
import locators from '../../locators/locators.json';
import { testData } from '../../data/testData';
import fs from 'fs';
import path from 'path';

test.use({ storageState: 'WalletloginState.json' });

for (const args of locators.sell_args) {
  test(`Positive: End-to-End Automation - BUY_CRYPTO ${args.sell_cur} → ${args.sell_curr}`, async ({ page }, testInfo) => {

    // Setup: per-test report/screenshots directory
    const screenshotsDir = path.join('reports', testInfo.title.replace(/\s+/g, '_'));
    if (fs.existsSync(screenshotsDir)) {
      fs.rmSync(screenshotsDir, { recursive: true, force: true });
    }
    fs.mkdirSync(screenshotsDir, { recursive: true });

    async function takeScreenshot(stepName: string) {
      const filePath = path.join(screenshotsDir, `${stepName}.png`);
      const shot = await page.screenshot({ path: filePath, fullPage: true });
      await testInfo.attach(stepName, { body: shot, contentType: 'image/png' });
      console.log(` Screenshot saved: ${filePath}`);
    }

    // Helper: Click Continue Button
    async function clickContinue(stepName: string) {
      const btn = page.getByRole(locators.continue_button.role, { name: locators.continue_button.name });
      await btn.click();
      console.log(` Continue clicked (${stepName})`);
      await takeScreenshot(`continue_${stepName}`);
    }

    // Step 1: Go to URL (append walletAddress if exists)
    let targetUrl = testData.url;
    if (args.wallet_address) {
      try {
        const u = new URL(testData.url);
        u.searchParams.set('walletAddress', args.wallet_address);
        targetUrl = u.toString();
      } catch {
        const sep = testData.url.includes('?') ? '&' : '?';
        targetUrl = `${testData.url}${sep}walletAddress=${encodeURIComponent(args.wallet_address)}`;
      }
    }
    await page.goto(testData.url, { waitUntil: 'domcontentloaded', timeout: 120000 });
    console.log('Step 1: Navigated to sandbox');
    await takeScreenshot('step1_home');

    // Step 2: Select Sell Crypto
    const sellCryptoBtn = page.getByRole(locators.sellcrypto.role, { name: locators.sellcrypto.name });
    await sellCryptoBtn.click();
    console.log('Sell Crypto button clicked');
    await takeScreenshot('sell_crypto_clicked');

    // Step 3: Select Currency
    const currencyDropdown = page.getByRole(locators.currencyDropdown.role)
      .filter({ hasText: locators.currencyDropdown.hasTextsell })
      .locator(locators.currencyDropdown.child);
    await currencyDropdown.click();

    const payCurOption = page.getByRole('listitem').filter({ hasText: args.sell_cur });
    await payCurOption.click();
    console.log(` Step 2: Currency selected: ${args.sell_cur}`);
    await takeScreenshot('step2_currency_selected');

    // Step 4: Select Crypto
    const cryptoDropdown = page.getByRole(locators.cryptoDropdown.role)
      .filter({ hasText: locators.cryptoDropdown.hasText })
      .locator(locators.cryptoDropdown.child);
    await cryptoDropdown.click();

    const buycurOption = page.getByRole('listitem').filter({ hasText: args.sell_curr });
    await buycurOption.click();
    console.log(` Step 3: Crypto selected: ${args.sell_curr}`);
    await takeScreenshot('step3_crypto_selected');
    await page.waitForTimeout(3000);

    // Step 5: Enter Amount
    const payInput = page.getByRole(locators.payInput.role, { name: locators.payInput.namesell });
    await payInput.fill(args.amount);
    console.log(`Step 4: Pay Crypto entered: ${args.amount}`);
    await takeScreenshot('step4_crypto_filled');

    // Step 6: Click Buy Button
    const sell_buttonOption = page.getByRole('button', { name: args.sell_button });
    await sell_buttonOption.waitFor({ state: 'visible', timeout: 15000 });
    await sell_buttonOption.scrollIntoViewIfNeeded();
    await sell_buttonOption.click();
    console.log(`Step 5: ${args.sell_button} clicked`);
    await takeScreenshot('step5_sell_button_clicked');
    await page.waitForTimeout(5000);

    // Step 7: Continue after Payment
    let continue_button = page.getByRole(locators.continue_button.role, { name: locators.continue_button.name });
    await continue_button.click();
    console.log('Step 6: Continue clicked');
    await takeScreenshot('step6_continue');

    // Step 8: Confirm Order
    let confirm_order = page.getByRole(locators.confirm_order.role, { name: locators.confirm_order.name });
    await confirm_order.click();
    console.log('Step 7: Confirm Order clicked');
    await takeScreenshot('step7_confirm_order');

    // Step 9: View Order (wait until attached & visible)
    await page.waitForTimeout(3000);
    const view_order = page.getByRole(locators.view_order.role, { name: locators.view_order.name });
    await view_order.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500); // smooth scroll
    await view_order.click();
    console.log(' Step 8: View order clicked');
    await takeScreenshot('step8_view_order');
    
        // Step 10: Order Details (scroll into view first)
    const orderDetailsBtn = page.getByRole(locators.orderDetailsButton.role, { name: locators.orderDetailsButton.name });// smooth scroll
    await orderDetailsBtn.click();
    console.log(' Step 9: Order Details clicked');
    await takeScreenshot('step9_order_details');
  });
}
