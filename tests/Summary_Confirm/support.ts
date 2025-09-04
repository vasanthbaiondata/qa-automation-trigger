import { Page } from '@playwright/test';

type LocatorConfig = {
  selector?: string;
  hasText?: string;
  text?: string;
  role?: string;
  name?: string;
  nth?: number;
  first?: boolean;
};

export function getLocator(page: Page, config: LocatorConfig) {
  if (config.role && config.name) {
    return page.getByRole(config.role as any, { name: config.name });
  }

  if (config.text) {
    return page.getByText(config.text);
  }

  if (config.selector) {
    let locator = page.locator(config.selector);

    if (config.hasText) {
      locator = locator.filter({ hasText: new RegExp(config.hasText) });
    }

    if (config.first) {
      locator = locator.first();
    }

    if (typeof config.nth === 'number') {
      locator = locator.nth(config.nth);
    }

    return locator;
  }

  throw new Error('Invalid locator configuration');
}