import { test } from '@playwright/test';
import locators from './finder.json';
import { TestData } from './data';
import { getLocator } from './support';

test('Positive : Shows a Summary of Estimation and prompts to confirm selling. (TC-SUMMARY-003)', async ({ page }) => {
  await page.goto(TestData.baseUrl);

  // Tabs
  await getLocator(page, locators.tabs.sellCrypto).click();

  // Currencies
  await getLocator(page, locators.dropdown.currencyFrom).click();
  await getLocator(page, locators.dropdown.currencyTo).click();

  // Estimated value
  await getLocator(page, locators.buttons.estimatedValue).click();

  // Crypto selection (BTC → ADA)
  await getLocator(page, locators.dropdown.cryptoFrom).click();
  await getLocator(page, locators.dropdown.cryptoToADA).click();

  // Re-check estimated value
  await getLocator(page, locators.buttons.estimatedValue).click();

  // Continue button
  await getLocator(page, locators.buttons.continue).click();

  // Change ADA → ALGO
  await getLocator(page, locators.dropdown.cryptoADA).click();
  await getLocator(page, locators.dropdown.cryptoToALGO).click();

  // Final estimated value
  await getLocator(page, locators.buttons.estimatedValue).click();
});