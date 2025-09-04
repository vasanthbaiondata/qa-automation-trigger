import { test as base, TestInfo, Page } from '@playwright/test';
import { CryptoTradingPage } from '../pages/CryptoTradingPage';
import { TestUtils } from '../utils/TestUtils';

type CustomFixtures = {
  cryptoPage: CryptoTradingPage;
  testUtils: typeof TestUtils;
};

export const test = base.extend<CustomFixtures>({
  cryptoPage: async ({ page }, use, testInfo) => {
    const cryptoPage = new CryptoTradingPage(page, testInfo);
    await use(cryptoPage);
  },

  testUtils: async ({}, use) => {
    await use(TestUtils);
  }
});

export { expect } from '@playwright/test';