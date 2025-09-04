import { Page, TestInfo, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import locators from '../locators/locators.json';
import { TestUtils } from '../utils/TestUtils';

export class CryptoTradingPage extends BasePage {
  constructor(page: Page, testInfo?: TestInfo) {
    super(page, testInfo);
  }

  /**
   * Navigate to sandbox environment
   */
  async navigateToSandbox() {
    await this.navigateAndWait(locators.sandbox_url);
    await this.takeScreenshot('navigate_to_sandbox');
  }

  /**
   * Select currency pair
   */
  async selectCurrencyPair(fromCurrency: string = 'vnd', toCurrency: string = 'euro') {
    try {
      const fromCurrencyLocator = this.page.locator('div')
        .filter({ hasText: new RegExp(locators.currency_vnd.text) })
        .nth(locators.currency_vnd.nth);

      await this.safeClick(fromCurrencyLocator);

      const toCurrencyLocator = this.page.locator('div')
        .filter({ hasText: new RegExp(locators.currency_euro.text) })
        .first();

      await this.safeClick(toCurrencyLocator);

      await this.takeScreenshot('currency_selection');
      console.log(`✅ Currency pair selected: ${fromCurrency} → ${toCurrency}`);
    } catch (error) {
      console.error(`❌ Failed to select currency pair: ${error}`);
      throw error;
    }
  }

  /**
   * Enter trading amount
   */
  async enterAmount(amount: string) {
    try {
      const amountInput = this.page.getByRole(locators.pay_amount.role as any, {
        name: locators.pay_amount.name,
      });

      await this.safeFill(amountInput, amount);
      await this.takeScreenshot('amount_entered');
      console.log(`✅ Amount entered: ${amount}`);
    } catch (error) {
      console.error(`❌ Failed to enter amount: ${error}`);
      throw error;
    }
  }

  /**
   * Click buy cryptocurrency button
   */
  async clickBuyCrypto() {
    try {
      const buyBtn = this.page.getByRole(locators.buy_btc.role as any, {
        name: locators.buy_btc.name,
      });

      await this.safeClick(buyBtn);
      await this.takeScreenshot('buy_crypto_clicked');
      console.log('✅ Buy crypto button clicked');
    } catch (error) {
      console.error(`❌ Failed to click buy crypto: ${error}`);
      throw error;
    }
  }

  /**
   * Enter wallet address and submit
   */
  async enterWalletAddress(address?: string) {
    try {
      const walletAddress = address || locators.wallet_address_value;

      const walletInput = this.page.getByRole(locators.wallet_address.role as any, {
        name: locators.wallet_address.name,
      });

      await this.safeFill(walletInput, walletAddress);

      const continueBtn = this.page.getByRole(locators.continue.role as any, {
        name: locators.continue.name,
      });

      await this.safeClick(continueBtn);
      await this.takeScreenshot('wallet_address_submitted');
      console.log('✅ Wallet address submitted');
    } catch (error) {
      console.error(`❌ Failed to enter wallet address: ${error}`);
      throw error;
    }
  }

  /**
   * Select payment method
   */
  async selectPaymentMethod(method: string = 'sepa_instant') {
    try {
      let paymentLocator;

      if (method === 'sepa_instant') {
        paymentLocator = this.page.getByText(locators.sepa_instant)
          .locator('xpath=preceding-sibling::img')
          .first();
      }

      if (paymentLocator) {
        await this.safeClick(paymentLocator, { timeout: 60000 });
        await this.takeScreenshot('payment_method_selected');
        console.log(`✅ Payment method selected: ${method}`);
      } else {
        throw new Error(`Payment method ${method} not supported`);
      }
    } catch (error) {
      console.error(`❌ Failed to select payment method: ${error}`);
      throw error;
    }
  }

  /**
   * Continue with the process
   */
  async clickContinue(stepName: string = 'continue') {
    try {
      const continueBtn = this.page.getByRole(locators.continue.role as any, {
        name: locators.continue.name,
      });

      await this.safeClick(continueBtn);
      await this.takeScreenshot(`${stepName}_clicked`);
      console.log(`✅ ${stepName} clicked`);
    } catch (error) {
      console.error(`❌ Failed to click ${stepName}: ${error}`);
      throw error;
    }
  }

  /**
   * Confirm phone verification
   */
  async confirmPhone() {
    try {
      const confirmBtn = this.page.getByRole(locators.confirm.role as any, {
        name: locators.confirm.name,
      });

      await this.safeClick(confirmBtn);

      await this.page.waitForTimeout(2000);

      await this.takeScreenshot('phone_confirmed');
      console.log('✅ Phone confirmation completed');
    } catch (error) {
      console.error(`❌ Failed to confirm phone: ${error}`);
      throw error;
    }
  }

  /**
   * Proceed to payment (Improved version)
   */
  async proceedToPayment() {
    try {
      const proceedBtn = this.page.getByRole(locators.proceed_to_pay.role as any, {
        name: locators.proceed_to_pay.name,
      });

      TestUtils.logStep(1, 'Waiting for Proceed to Pay button');
      console.log('⏳ Waiting for Proceed to Pay button...');

      await proceedBtn.waitFor({ state: 'visible', timeout: 60000 });
      await expect(proceedBtn).toBeEnabled({ timeout: 60000 });

      await proceedBtn.scrollIntoViewIfNeeded();
      await this.page.waitForTimeout(500);

      let clicked = false;
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          await proceedBtn.click({ timeout: 5000 });
          clicked = true;
          console.log(`✅ Proceed to Pay clicked (attempt ${attempt})`);
          break;
        } catch (err) {
          console.warn(`⚠️ Attempt ${attempt} to click Proceed to Pay failed`, err);
          await this.page.waitForTimeout(1500);
        }
      }

      if (!clicked) {
        throw new Error('Failed to click Proceed to Pay button after retries');
      }

      await Promise.race([
        this.page.waitForURL(/summary|review|order/i, { timeout: 20000 }).catch(() => null),
        this.page.waitForSelector('text=/Order|Payment|Details/i', { timeout: 20000 }).catch(() => null),
      ]);

      await this.takeScreenshot('proceed_to_payment');
      console.log('✅ Proceeded to payment successfully');
    } catch (error) {
      console.error(`❌ Failed to proceed to payment: ${error}`);
      throw error;
    }
  }

  /**
   * Open order details
   */
  async openOrderDetails() {
    try {
      const orderDetailsBtn = this.page.getByRole(locators.order_details.role as any, {
        name: locators.order_details.name,
      });

      await this.safeClick(orderDetailsBtn);
      await this.takeScreenshot('order_details_opened');
      console.log('✅ Order details opened');
    } catch (error) {
      console.error(`❌ Failed to open order details: ${error}`);
      throw error;
    }
  }

  /**
   * Complete buy crypto flow
   */
  async completeBuyCryptoFlow(testData: {
    amount: string;
    walletAddress?: string;
    paymentMethod?: string;
  }) {
    await this.navigateToSandbox();
    await this.selectCurrencyPair();
    await this.enterAmount(testData.amount);
    await this.clickBuyCrypto();
    await this.enterWalletAddress(testData.walletAddress);
    await this.selectPaymentMethod(testData.paymentMethod);
    await this.clickContinue('first_continue');
    await this.confirmPhone();
    await this.proceedToPayment();
    await this.openOrderDetails();
  }

  /**
   * Select Sell Crypto tab
   */
  async selectSellCryptoTab() {
    try {
      const sellTab = this.page.getByRole(locators.sell_crypto_tab.role as any, {
        name: locators.sell_crypto_tab.name,
      });

      await this.safeClick(sellTab);
      await this.takeScreenshot('sell_crypto_tab_selected');
      console.log('✅ Sell Crypto tab selected');
    } catch (error) {
      console.error(`❌ Failed to select sell crypto tab: ${error}`);
      throw error;
    }
  }

  /**
   * Click sell cryptocurrency button
   */
  async clickSellCrypto() {
    try {
      const sellBtn = this.page.getByRole(locators.sell_btc.role as any, {
        name: locators.sell_btc.name,
      });

      await this.safeClick(sellBtn);
      await this.takeScreenshot('sell_crypto_clicked');
      console.log('✅ Sell crypto button clicked');
    } catch (error) {
      console.error(`❌ Failed to click sell crypto: ${error}`);
      throw error;
    }
  }

  /**
   * Confirm order
   */
  async confirmOrder() {
    try {
      const confirmOrderBtn = this.page.getByRole(locators.confirm_order.role as any, {
        name: locators.confirm_order.name,
      });

      await this.safeClick(confirmOrderBtn);
      await this.takeScreenshot('order_confirmed');
      console.log('✅ Order confirmed');
    } catch (error) {
      console.error(`❌ Failed to confirm order: ${error}`);
      throw error;
    }
  }

  /**
   * View order
   */
  async viewOrder() {
    try {
      const viewOrderBtn = this.page.getByRole(locators.view_order.role as any, {
        name: locators.view_order.name,
      });

      await this.safeClick(viewOrderBtn);
      await this.takeScreenshot('order_viewed');
      console.log('✅ Order viewed');
    } catch (error) {
      console.error(`❌ Failed to view order: ${error}`);
      throw error;
    }
  }

  /**
   * Complete sell crypto flow
   */
  async completeSellCryptoFlow(testData: {
    amount?: string;
    walletAddress?: string;
  }) {
    await this.navigateToSandbox();
    await this.selectSellCryptoTab();
    await this.clickSellCrypto();
    await this.clickContinue('payment_withdrawal_method');
    await this.confirmOrder();
    await this.viewOrder();
    await this.openOrderDetails();
  }
}