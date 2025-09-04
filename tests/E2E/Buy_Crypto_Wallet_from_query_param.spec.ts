import { test, expect } from '@playwright/test';
import locators from '../../locators/locators.json';
import { testData } from '../../data/testData';
import fs from 'fs';
import path from 'path';

test.use({ storageState: 'WalletloginState.json' });

for (const args of locators.insert_args) {
  test(`Positive: End-to-End Automation - BUY_CRYPTO ${args.pay_cur} → ${args.buy_cur}`, async ({ page }, testInfo) => {

    // ─────────────────────────────────────────────────────────────
    // Setup: per-test report/screenshots directory
    // ─────────────────────────────────────────────────────────────
    const screenshotsDir = path.join('reports', testInfo.title.replace(/\s+/g, '_'));
    if (fs.existsSync(screenshotsDir)) {
      fs.rmSync(screenshotsDir, { recursive: true, force: true });
    }
    fs.mkdirSync(screenshotsDir, { recursive: true });

    async function takeScreenshot(stepName: string) {
      const filePath = path.join(screenshotsDir, `${stepName}.png`);
      const shot = await page.screenshot({ path: filePath, fullPage: true });
      await testInfo.attach(stepName, { body: shot, contentType: 'image/png' });
      console.log(`📸 Screenshot saved: ${filePath}`);
    }

    // ─────────────────────────────────────────────────────────────
    // Step 1: Go to URL (append walletAddress from array to query)
    // ─────────────────────────────────────────────────────────────
    let targetUrl = testData.url;
    if (args.wallet_address) {
      try {
        const u = new URL(testData.url);
        u.searchParams.set('walletAddress', args.wallet_address);
        targetUrl = u.toString();
      } catch {
        // Fallback if testData.url isn't absolute for some reason
        const sep = testData.url.includes('?') ? '&' : '?';
        targetUrl = `${testData.url}${sep}walletAddress=${encodeURIComponent(args.wallet_address)}`;
      }
    }
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 120000 });
    console.log(`✅ Navigated to sandbox${args.wallet_address ? ` with wallet: ${args.wallet_address}` : ''}`);
    await takeScreenshot('step1_home');

    // ─────────────────────────────────────────────────────────────
    // Step 2: Select Currency
    // ─────────────────────────────────────────────────────────────
    const currencyDropdown = page.getByRole(locators.currencyDropdown.role)
      .filter({ hasText: locators.currencyDropdown.hasText })
      .locator(locators.currencyDropdown.child);
    await currencyDropdown.click();

    const payCurOption = page.getByRole('listitem').filter({ hasText: args.pay_cur });
    await payCurOption.click();
    console.log(`✅ Currency selected: ${args.pay_cur}`);
    await takeScreenshot('step2_currency_selected');

    // ─────────────────────────────────────────────────────────────
    // Step 3: Enter amount
    // ─────────────────────────────────────────────────────────────
    const payInput = page.getByRole(locators.payInput.role, { name: locators.payInput.name });
    await payInput.fill(args.amount);
    console.log(`✅ Pay amount entered: ${args.amount}`);
    await takeScreenshot('step3_amount_filled');

    // ─────────────────────────────────────────────────────────────
    // Step 4: Select Crypto from dropdown
    // ─────────────────────────────────────────────────────────────
    const cryptoDropdown = page.getByRole(locators.cryptoDropdown.role)
      .filter({ hasText: locators.cryptoDropdown.hasText })
      .locator(locators.cryptoDropdown.child);
    await cryptoDropdown.click();

    const buycurOption = page.getByRole('listitem').filter({ hasText: args.buy_cur });
    await buycurOption.click();
    console.log(`✅ Crypto selected: ${args.buy_cur}`);
    await takeScreenshot('step4_crypto_selected');

    // ─────────────────────────────────────────────────────────────
    // Step 5: Click Buy Button (from array)
    // ─────────────────────────────────────────────────────────────
    const buy_buttonOption = page.getByRole('button', { name: args.buy_button });
    await buy_buttonOption.waitFor({ state: 'visible', timeout: 15000 });
    await buy_buttonOption.scrollIntoViewIfNeeded();
    await buy_buttonOption.click();
    console.log(`✅ ${args.buy_button} clicked`);
    await takeScreenshot('step5_buy_button_clicked');

    /* ─────────────────────────────────────────────────────────────
    // Step 6: Enter wallet address (from array; fill only if needed)
    // ─────────────────────────────────────────────────────────────
    const walletInput = page.getByRole(locators.walletInput.role as any, { name: locators.walletInput.name });
    const walletVisible = await walletInput.isVisible().catch(() => false);
    if (walletVisible) {
      const editable = await walletInput.isEditable().catch(() => false);
      if (editable) {
        const existing = await walletInput.inputValue().catch(() => '');
        if (!existing || existing.trim() !== String(args.wallet_address ?? '').trim()) {
          await walletInput.fill(args.wallet_address ?? '');
          console.log(`✅ Wallet address entered/updated: ${args.wallet_address ?? ''}`);
        } else {
          console.log('ℹ️ Wallet already prefilled from URL; leaving as-is');
        }
      } else {
        console.log('ℹ️ Wallet field not editable; probably prefilled from URL');
      }
      await takeScreenshot('step6_wallet_filled');
    } else {
      console.log('ℹ️ Wallet input not visible; likely handled by URL param');
    }

    // ─────────────────────────────────────────────────────────────
    // Step 7: Continue
    // ─────────────────────────────────────────────────────────────
    const continue_button = page.getByRole(locators.continue_button.role, { name: locators.continue_button.name });
    await continue_button.click();
    console.log('✅ Continue clicked');
    await takeScreenshot('step7_continue'); */

    // ─────────────────────────────────────────────────────────────
    // Step 8: Select Payment Method (from array)
    // ─────────────────────────────────────────────────────────────
    const paymentOption = page.getByText(args.payment_method, { exact: true });
    await paymentOption.waitFor({ state: 'visible', timeout: 10000 });
    await paymentOption.scrollIntoViewIfNeeded();
    await paymentOption.click({ timeout: 15000 });
    console.log(`✅ Payment method selected: ${args.payment_method}`);
    await takeScreenshot('step8_payment_selected');

    // ─────────────────────────────────────────────────────────────
    // Step 8.1: Conditional Phone Number Entry (from array)
    // ─────────────────────────────────────────────────────────────
    if (args.phone_number) {
      const phoneField = page.getByRole('textbox', { name: /phone/i });
      if (await phoneField.isVisible().catch(() => false)) {
        await phoneField.fill(args.phone_number);
        console.log(`✅ Phone number entered: ${args.phone_number}`);
        await takeScreenshot('step8_1_phone_filled');

        await continue_button.click();
        console.log('✅ Continue clicked after phone number');
        await takeScreenshot('step8_2_continue_after_phone');
      } else {
        console.log('ℹ️ Phone field not visible, skipping phone entry');
      }
    } else {
      console.log('ℹ️ Phone number not provided in array, skipping phone step');
    }

    // ─────────────────────────────────────────────────────────────
    // Step 9: Continue after Payment
    // ─────────────────────────────────────────────────────────────
    await continue_button.click();
    console.log('✅ Continue clicked after payment');
    await takeScreenshot('step9_continue_payment');

    // ─────────────────────────────────────────────────────────────
    // Step 10: Confirm
    // ─────────────────────────────────────────────────────────────
    const confirmBtn = page.getByRole(locators.confirm_button.role, { name: locators.confirm_button.name });
    await confirmBtn.click();
    console.log('✅ Confirm clicked');
    await takeScreenshot('step10_confirm');

    // ─────────────────────────────────────────────────────────────
    // Step 11: Proceed to Pay
    // ─────────────────────────────────────────────────────────────
    await page.waitForTimeout(3000);
    const proceedBtn = page.getByRole(locators.proceedToPayButton.role, { name: locators.proceedToPayButton.name });
    await proceedBtn.click();
    console.log('✅ Proceed to Pay clicked');
    await takeScreenshot('step11_proceed_to_pay');

    // ─────────────────────────────────────────────────────────────
    // Step 12: Order Details
    // ─────────────────────────────────────────────────────────────
    const orderDetailsBtn = page.getByRole(locators.orderDetailsButton.role, { name: locators.orderDetailsButton.name });
    await orderDetailsBtn.click();
    console.log('✅ Order Details clicked');
    await takeScreenshot('step12_order_details');
  });
}
