import locators from './locators.json';
import { expect, Page } from '@playwright/test';

/**
 * Select a currency
 */
export async function selectCurrency(page: Page, key: keyof typeof locators.currencies) {
  const currency = locators.currencies[key];
  if (!currency) throw new Error(`Currency not found: ${key}`);

  const option = page.getByText(currency.text, { exact: true });
  await expect(option).toBeVisible({ timeout: 10000 });
  await option.click();
}
/**
 * Select a crypto safely
 */

 export async function selectCrypto(page: Page, key: keyof typeof locators.cryptos) {
  const crypto = locators.cryptos[key];
  if (!crypto) throw new Error(`Crypto not found: ${key}`);

  const symbol = crypto.text.split(' ')[0]; // e.g. "AAVE" from "AAVE - ( Ethereum )"

  // Click the dropdown trigger (the current selected crypto)
  const trigger = page.getByText(/BTC|AAVE|ADA/, { exact: true }).first();
  await expect(trigger).toBeVisible({ timeout: 10000 });
  await trigger.click();

  // Now select the option from visible list (chakra-heading items)
  const option = page.locator(`.chakra-heading:has-text("${symbol}")`).first();
  await expect(option).toBeVisible({ timeout: 10000 });
  await option.click();
 }



/**
 * Click dynamic estimated value button
 */
export async function clickEstimatedValue(page: Page, cryptoShortName: string) {
  const btn = page.getByRole('button', { name: new RegExp(`You get ~.*${cryptoShortName}`) });
  await expect(btn).toBeVisible({ timeout: 10000 });
  await btn.click();
}

/**
 * Select a tab
 */
export async function selectTab(page: Page, tabKey: keyof typeof locators.tabs) {
  const tab = locators.tabs[tabKey];
  if (!tab) throw new Error(`Tab locator not found: ${tabKey}`);

  const tabElement = page.getByRole(tab.role, { name: tab.name });
  await expect(tabElement).toBeVisible({ timeout: 10000 });
  await tabElement.click();
}