import { Page, expect, TestInfo } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

export class BasePage {
  protected page: Page;
  protected testInfo?: TestInfo;

  constructor(page: Page, testInfo?: TestInfo) {
    this.page = page;
    this.testInfo = testInfo;
  }

  /**
   * Enhanced screenshot utility with automatic error screenshots
   */
  async takeScreenshot(stepName: string, options?: { fullPage?: boolean; clip?: any }) {
    if (!this.testInfo) return;
    
    const screenshotsDir = path.join('reports', this.testInfo.title.replace(/\s+/g, '_'));
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }

    const filePath = path.join(screenshotsDir, `${stepName}.png`);
    const shot = await this.page.screenshot({ 
      path: filePath, 
      fullPage: options?.fullPage ?? true,
      clip: options?.clip 
    });
    
    await this.testInfo.attach(stepName, { 
      body: shot, 
      contentType: 'image/png' 
    });
    
    console.log(` ${stepName} screenshot saved at: ${filePath}`);
  }

  /**
   * Wait for element with custom timeout and error handling
   */
  async waitForElement(locator: any, options?: { timeout?: number; state?: 'visible' | 'hidden' | 'attached' }) {
    try {
      await locator.waitFor({
        timeout: options?.timeout ?? 30000,
        state: options?.state ?? 'visible'
      });
      return true;
    } catch (error) {
      await this.takeScreenshot(`error_${Date.now()}`);
      console.error(` Element not found: ${error}`);
      throw error;
    }
  }

  /**
   * Safe click with retry mechanism
   */
  async safeClick(locator: any, options?: { timeout?: number; retries?: number }) {
    const retries = options?.retries ?? 3;
    const timeout = options?.timeout ?? 30000;

    for (let i = 0; i < retries; i++) {
      try {
        await this.waitForElement(locator, { timeout });
        await expect(locator).toBeEnabled({ timeout });
        await locator.click();
        return;
      } catch (error) {
        console.warn(`⚠️  Click attempt ${i + 1} failed: ${error}`);
        if (i === retries - 1) {
          await this.takeScreenshot(`click_failed_${Date.now()}`);
          throw error;
        }
        await this.page.waitForTimeout(1000);
      }
    }
  }

  /**
   * Safe fill with validation
   */
  async safeFill(locator: any, value: string, options?: { timeout?: number; clear?: boolean }) {
    try {
      await this.waitForElement(locator, { timeout: options?.timeout });
      
      if (options?.clear !== false) {
        await locator.clear();
      }
      
      await locator.fill(value);
      
      // Verify the value was entered correctly
      const actualValue = await locator.inputValue();
      if (actualValue !== value) {
        throw new Error(`Value mismatch. Expected: ${value}, Actual: ${actualValue}`);
      }
      
      console.log(` Successfully filled field with: ${value}`);
    } catch (error) {
      await this.takeScreenshot(`fill_error_${Date.now()}`);
      throw error;
    }
  }

  /**
   * Navigate with loading verification
   */
  async navigateAndWait(url: string, waitForSelector?: string) {
    try {
      await this.page.goto(url, { waitUntil: 'domcontentloaded' });
      
      if (waitForSelector) {
        await this.page.waitForSelector(waitForSelector, { timeout: 30000 });
      }
      
      console.log(` Successfully navigated to: ${url}`);
    } catch (error) {
      await this.takeScreenshot(`navigation_error_${Date.now()}`);
      throw error;
    }
  }
}