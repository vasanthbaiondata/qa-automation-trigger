import { TestInfo } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

export class TestUtils {
  /**
   * Setup test environment and cleanup old reports
   */
  static setupTestEnvironment(testInfo: TestInfo): string {
    const screenshotsDir = path.join('reports', testInfo.title.replace(/\s+/g, '_'));
    
    if (fs.existsSync(screenshotsDir)) {
      fs.rmSync(screenshotsDir, { recursive: true, force: true });
    }
    
    fs.mkdirSync(screenshotsDir, { recursive: true });
    
    console.log(`🔧 Test environment setup complete for: ${testInfo.title}`);
    return screenshotsDir;
  }

  /**
   * Generate unique test identifiers
   */
  static generateTestId(): string {
    return `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Log test step with formatting
   */
  static logStep(stepNumber: number, description: string, status: 'START' | 'SUCCESS' | 'FAILED' = 'START') {
    const icons = {
      START: '🔄',
      SUCCESS: '',
      FAILED: ''
    };
    
    const timestamp = new Date().toISOString();
    console.log(`${icons[status]} [${timestamp}] Step ${stepNumber}: ${description}`);
  }

  /**
   * Wait with custom message
   */
  static async waitWithMessage(ms: number, message: string) {
    console.log(`⏳ Waiting ${ms}ms: ${message}`);
    await new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Retry mechanism for flaky operations
   */
  static async retryOperation<T>(
    operation: () => Promise<T>,
    options: {
      maxRetries?: number;
      delay?: number;
      description?: string;
    } = {}
  ): Promise<T> {
    const { maxRetries = 3, delay = 1000, description = 'operation' } = options;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 Attempting ${description} (attempt ${attempt}/${maxRetries})`);
        const result = await operation();
        console.log(` ${description} succeeded on attempt ${attempt}`);
        return result;
      } catch (error) {
        console.warn(`⚠️ ${description} failed on attempt ${attempt}: ${error}`);
        
        if (attempt === maxRetries) {
          console.error(` ${description} failed after ${maxRetries} attempts`);
          throw error;
        }
        
        await this.waitWithMessage(delay, `before retry ${attempt + 1}`);
      }
    }
    
    throw new Error(`Retry operation failed after ${maxRetries} attempts`);
  }
}