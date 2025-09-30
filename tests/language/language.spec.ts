import { test } from '@playwright/test';
import locators from './locators.json';
import fs from 'fs';
import path from 'path';

test.setTimeout(600000); // 10 mins

test('Language change loop test', async ({ page }, testInfo) => {
  // Create per-test screenshots folder
  const screenshotsDir = path.join('reports', testInfo.title.replace(/\s+/g, '_'));
  if (fs.existsSync(screenshotsDir)) {
    fs.rmSync(screenshotsDir, { recursive: true, force: true });
  }
  fs.mkdirSync(screenshotsDir, { recursive: true });

  // Helper function for screenshots
  async function takeScreenshot(stepName: string) {
    const filePath = path.join(screenshotsDir, `${stepName}.png`);
    const shot = await page.screenshot({ path: filePath, fullPage: true });
    await testInfo.attach(stepName, { body: shot, contentType: 'image/png' });
    console.log(` Screenshot saved: ${filePath}`);
  }

  await page.goto('https://sandbox-buy.transfi.com/?apiKey=m4P91ifvL9NLCxQceZ');
  console.log(' Redirected to home page');
  await takeScreenshot('step1_home_page');

  for (const lang of locators.languages) {
    // Open navigation menu
    const navMenu = page.getByRole(locators.navMenu[0].role)
                        .getByRole('img')
                        .first();
    await navMenu.waitFor({ state: 'visible' });
    await navMenu.click();
    console.log(` Navigation menu opened for language: ${lang.name}`);
    await takeScreenshot(`nav_menu_${lang.name}`);

    // Open language dropdown
    await page.waitForTimeout(3000); 
    const dropdown = page.locator('div')
                         .filter({ hasText: new RegExp(`^${lang.dropdownText}$`) })
                         .first();
    await dropdown.waitFor({ state: 'visible' });
    await dropdown.click();
    console.log(` Dropdown clicked for language: ${lang.name}`);
    await takeScreenshot(`dropdown_${lang.name}`);

    // Select the language
    const langOption = page.getByText(lang.name, { exact: true }).first();
    await langOption.waitFor({ state: 'visible' });
    await langOption.click();
    console.log(` Language changed to: ${lang.name}`);
    await takeScreenshot(`language_selected_${lang.name}`);

    await page.waitForTimeout(500); 
  }

  console.log(' All languages switched. Test considered passed.');
});
