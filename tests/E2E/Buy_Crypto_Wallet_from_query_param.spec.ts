import { test, expect } from '@playwright/test';
import locators from '../../locators/locators.json';
import { testData } from '../../data/testData';
import fs from 'fs';
import path from 'path';

test.use({ storageState: 'WalletloginState.json' });

for (const args of locators.buy_args) {
  test(`Positive: End-to-End Automation - BUY_CRYPTO ${args.pay_cur} → ${args.buy_cur}`, async ({ page }, testInfo) => {

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

    // Step 1: Go to URL (append walletAddress from array to query)
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
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 120000 });
    console.log(` Navigated to sandbox${args.wallet_address ? ` with wallet: ${args.wallet_address}` : ''}`);
    await takeScreenshot('step1_home');

    
    // Step 2: Select Currency
    const currencyDropdown = page.getByRole(locators.currencyDropdown.role)
      .filter({ hasText: locators.currencyDropdown.hasText })
      .locator(locators.currencyDropdown.child);
    await currencyDropdown.click();

    const payCurOption = page.getByRole('listitem').filter({ hasText: args.pay_cur });
    await payCurOption.click();
    console.log(` Currency selected: ${args.pay_cur}`);
    await takeScreenshot('step2_currency_selected');

    // Step 3: Enter amount
 
    const payInput = page.getByRole(locators.payInput.role, { name: locators.payInput.name });
    await payInput.fill(args.amount);
    console.log(` Pay amount entered: ${args.amount}`);
    await takeScreenshot('step3_amount_filled');

    // Step 4: Select Crypto from dropdown
    const cryptoDropdown = page.getByRole(locators.cryptoDropdown.role)
      .filter({ hasText: locators.cryptoDropdown.hasText })
      .locator(locators.cryptoDropdown.child);
    await cryptoDropdown.click();

    const buycurOption = page.getByRole('listitem').filter({ hasText: args.buy_cur });
    await buycurOption.click();
    console.log(` Step 4: Crypto selected: ${args.buy_cur}`);
    await takeScreenshot('step4_crypto_selected');

    
    // Step 5: Click Buy Button
    const buy_buttonOption = page.getByRole('button', { name: args.buy_button });
    await buy_buttonOption.waitFor({ state: 'visible', timeout: 15000 });
    await buy_buttonOption.scrollIntoViewIfNeeded();
    await buy_buttonOption.click();
    console.log(` Step 5: ${args.buy_button} clicked`);
    await takeScreenshot('step5_buy_button_clicked');

    // ─────────────────────────────────────────────────────────────
    // Step 6-7: Wallet input & Continue (if needed) - optional
    // ─────────────────────────────────────────────────────────────
    /* Uncomment if wallet input step is required
    const walletInput = page.getByRole(locators.walletInput.role as any, { name: locators.walletInput.name });
    await walletInput.fill(args.wallet_address);
    console.log(` Step 6: Wallet address entered: ${args.wallet_address}`);
    await takeScreenshot('step6_wallet_filled');
    await clickContinue('step7');
    */

    
    // Step 8: Select Payment Method
    
    const paymentOption = page.getByText(args.payment_method, { exact: true });
    await paymentOption.waitFor({ state: 'visible', timeout: 10000 });
    await paymentOption.scrollIntoViewIfNeeded();
    await paymentOption.click({ timeout: 15000 });
    console.log(` Step 8: Payment method selected: ${args.payment_method}`);
    await takeScreenshot('step8_payment_selected');

    
    // Step 9: Continue after Payment
    
    await clickContinue('after_payment');
    await page.waitForTimeout(5000);

    
    // Step 10-11: Enter Phone Number (if available) and Continue
    
    if (locators.phoneInput && args.phone_number) {
      const phoneLocator = page.getByRole(locators.phoneInput.role as any, { name: locators.phoneInput.name });
      if (await phoneLocator.count() > 0) {
        await phoneLocator.fill(args.phone_number);
        console.log(` Step 10: Phone number entered: ${args.phone_number}`);
        await takeScreenshot('step10_phone_filled');

        await clickContinue('after_phone');
      } else {
        console.log(' Phone input not found on this flow, skipping step.');
      }
    } else {
      console.log(' phoneInput locator not defined or phone number missing, skipping step.');
    }

    
    // Step 12: Confirm
    
    const confirmBtn = page.getByRole(locators.confirm_button.role, { name: locators.confirm_button.name });
    await confirmBtn.click();
    console.log(' Step 12: Confirm clicked');
    await takeScreenshot('step12_confirm');

       // Step 13: Proceed to Pay
    
    await page.waitForTimeout(3000);
    const proceedBtn = page.getByRole(locators.proceedToPayButton.role, { name: locators.proceedToPayButton.name });
    await proceedBtn.click();
    console.log(' Step 13: Proceed to Pay clicked');
    await takeScreenshot('step13_proceed_to_pay');

    
    // Step 14: Order Details
    const orderDetailsBtn = page.getByRole(locators.orderDetailsButton.role, { name: locators.orderDetailsButton.name });
    await orderDetailsBtn.click();
    console.log(' Step 14: Order Details clicked');
    await takeScreenshot('step14_order_details');

  });
}
