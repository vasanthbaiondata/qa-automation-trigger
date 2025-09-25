import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://sandbox-buy.transfi.com/?apiKey=m4P91ifvL9NLCxQceZ');
  await page.getByRole('tab', { name: 'Sell Crypto' }).click();
  await page.getByRole('tab', { name: 'Buy Crypto' }).click();
});