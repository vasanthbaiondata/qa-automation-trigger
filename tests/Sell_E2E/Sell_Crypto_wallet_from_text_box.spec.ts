import { test, expect } from '@playwright/test';
import locators from '../../locators/locators.json';
import { testData } from '../../data/testData';
import fs from 'fs';
import path from 'path';

test.use({ storageState: 'loginState.json' });

for (const args of locators.sell_args) {
  test(`Positive: End-to-End Automation - BUY_CRYPTO ${args.sell_cur} → ${args.buy_cur}`, async ({ page }, testInfo) => {
    // Create per-test reports/screenshots dir
    const screenshotsDir = path.join('reports', testInfo.title.replace(/\s+/g, '_'));
    if (fs.existsSync(screenshotsDir)) {
      fs.rmSync(screenshotsDir, { recursive: true, force: true });
    }
    fs.mkdirSync(screenshotsDir, { recursive: true });

    // Helper to capture and attach screenshots
    async function takeScreenshot(stepName: string) {
      const filePath = path.join(screenshotsDir, `${stepName}.png`);
      const shot = await page.screenshot({ path: filePath, fullPage: true });
      await testInfo.attach(stepName, { body: shot, contentType: 'image/png' });
      console.log(`📸 Screenshot saved: ${filePath}`);
    }

    // Step 1: Go to URL
    await page.goto(testData.url, { waitUntil: 'domcontentloaded', timeout: 120000 });
    console.log('✅ Step 1: Navigated to sandbox');
    await takeScreenshot('step1_home');

    // select Sell Crypto
    const sellCryptoBtn = page.getByRole(locators.sellcrypto.role, { name: locators.sellcrypto.name });
    await sellCryptoBtn.click();
    console.log('✅ Sell Crypto button clicked');
    await takeScreenshot('sell_crypto_clicked');

    // Step 2: Select Currency
    const currencyDropdown = page.getByRole(locators.currencyDropdown.role)
      .filter({ hasText: locators.currencyDropdown.hasTextsell })
      .locator(locators.currencyDropdown.child);
    await currencyDropdown.click();

    const payCurOption = page.getByRole('listitem').filter({ hasText: args.sell_cur });
    await payCurOption.click();
    console.log(`✅ Step 2: Currency selected: ${args.sell_cur}`);
    await takeScreenshot('step2_currency_selected');


    // Step 4: Select Crypto from dropdown
    const cryptoDropdown = page.getByRole(locators.cryptoDropdown.role)
      .filter({ hasText: locators.cryptoDropdown.hasText })
      .locator(locators.cryptoDropdown.child);
    await cryptoDropdown.click();

    const buycurOption = page.getByRole('listitem').filter({ hasText: args.sell_curr });
    await buycurOption.click();
    console.log(`✅ Step 4: Crypto selected: ${args.sell_curr}`);
    await takeScreenshot('step4_crypto_selected');
    await page.waitForTimeout(3000);

        // Step 3: Enter amount
    const payInput = page.getByRole(locators.payInput.role, { name: locators.payInput.namesell });
    await payInput.fill(args.amount);
    console.log(`✅ Step 3: Pay amount entered: ${args.amount}`);
    await takeScreenshot('step3_amount_filled');


    // Step 5: Click Buy Button
    const buy_buttonOption = page.getByRole('button', { name: args.buy_button });
    await buy_buttonOption.waitFor({ state: 'visible', timeout: 15000 });
    await buy_buttonOption.scrollIntoViewIfNeeded();
    await buy_buttonOption.click();
    console.log(`✅ Step 5: ${args.buy_button} clicked`);
    await takeScreenshot('step5_buy_button_clicked');
    await page.waitForTimeout(5000);

    // Step 8: Select Payment Method
    let continue_button = page.getByRole(locators.continue_button.role, { name: locators.continue_button.name });
    await continue_button.click();
    console.log('✅ Step 7: Continue clicked');
    await takeScreenshot('step7_continue');

    // Step 9: Continue after Payment
    continue_button = page.getByRole(locators.continue_button.role, { name: locators.continue_button.name });
    await continue_button.click();
    console.log('✅ Step 9: Continue clicked after payment');
    await takeScreenshot('step9_continue_payment');
    await page.waitForTimeout(5000);

    /* Step 12: Confirm
    const confirmBtn = page.getByRole(locators.confirm_button.role, { name: locators.confirm_button.name });
    await confirmBtn.click();
    console.log('✅ Step 12: Confirm clicked');
    await takeScreenshot('step12_confirm');

    // Step 13: Proceed to Pay
    await page.waitForTimeout(3000);
    const proceedBtn = page.getByRole(locators.proceedToPayButton.role, { name: locators.proceedToPayButton.name });
    await proceedBtn.click();
    console.log('✅ Step 13: Proceed to Pay clicked');
    await takeScreenshot('step13_proceed_to_pay');

    // Step 14: Order Details
    const orderDetailsBtn = page.getByRole(locators.orderDetailsButton.role, { name: locators.orderDetailsButton.name });
    await orderDetailsBtn.click();
    console.log('✅ Step 14: Order Details clicked');
    await takeScreenshot('step14_order_details'); */
  });
}
