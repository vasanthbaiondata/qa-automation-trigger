import { defineConfig } from '@playwright/test';
import path from 'path';
import fs from 'fs';

// Pick test group from command: TEST_GROUP=End_To_End npx playwright test
const testGroup = process.env.TEST_GROUP || 'All';

// Load testMatch array from tests.env.json
let testMatch: string[] = [];
try {
  const envConfig = JSON.parse(fs.readFileSync('tests.env.json', 'utf-8'));
  testMatch = envConfig[testGroup] || [];
  if (testMatch.length === 0) {
    console.warn(`⚠️ No tests found for group "${testGroup}".`);
  }
} catch (err) {
  console.error('❌ Failed to load tests.env.json:', err);
}

const fileName = process.env.TEST_FILE_NAME || 'test';
const safeFileName = fileName.replace(/[^\w\-]/g, '_');
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

export default defineConfig({
  testDir: './tests',
  testMatch,
  retries: 1,
  timeout: 60000,
  workers: 1,
  use: {
    headless: true,
    screenshot: 'on',
    video: 'on',
    trace: 'on',
    outputDir: path.join('test-results', `${safeFileName}-${timestamp}`),
  },
  projects: [
    {
      name: 'Firefox',
      use: { browserName: 'firefox', headless: true },
    }
  ],
  reporter: [
    ['html', { outputFolder: 'playwright-report' }]
  ],
});
