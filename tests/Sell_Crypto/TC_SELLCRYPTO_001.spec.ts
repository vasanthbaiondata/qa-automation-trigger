import { test, expect } from '@playwright/test';
import locators from './locators.json';
import { testData } from './testData';

test.setTimeout(5 * 60 * 1000);
test.use({ storageState: 'loginState.json' });

test('Negative: typing letters disables Sell BTC button and shows error (TC-SellCRYPTO-Sell-001)', async ({ page }) => {
  await page.goto(testData.baseURL);

  // 1. Open Sell Crypto tab
  await page.getByRole(locators.tabs.sellCrypto.role, { name: locators.tabs.sellCrypto.name }).click();

  // 2. Locate amount input
  const amountField = page.getByRole(locators.fields.amountInput.role, { name: locators.fields.amountInput.name });
  await expect(amountField).toBeVisible();

  // 3. Type invalid letters
  await amountField.fill('');
  await amountField.type(testData.invalidInput);

  // 4. Verify Sell button is disabled
  const sellButton = page.getByRole(locators.buttons.sellBTC.role, { name: locators.buttons.sellBTC.name });
  await expect(sellButton).toBeDisabled();
});
