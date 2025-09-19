import { FullConfig, FullResult, Reporter, Suite, TestCase, TestResult } from '@playwright/test/reporter';
import fs from 'fs';
import path from 'path';

class CustomTestReporter implements Reporter {
  private startTime: number = 0;
  private results: any[] = [];

  onBegin(config: FullConfig, suite: Suite) {
    this.startTime = Date.now();
    console.log(` Starting test execution with ${suite.allTests().length} tests`);
    console.log(`📊 Parallel workers: ${config.workers}`);
    console.log(`🔄 Retries: ${config.projects[0]?.retries || 0}`);
  }

  onTestBegin(test: TestCase) {
    console.log(`\n🧪 Starting: ${test.title}`);
    console.log(`📁 File: ${test.location.file}`);
  }

  onTestEnd(test: TestCase, result: TestResult) {
    const status = result.status;
    const duration = result.duration;
    const emoji = this.getStatusEmoji(status);
    
    console.log(`${emoji} ${test.title} (${duration}ms)`);
    
    if (result.error) {
      console.log(` Error: ${result.error.message}`);
    }

    this.results.push({
      title: test.title,
      file: test.location.file,
      status,
      duration,
      error: result.error?.message,
      retry: result.retry,
      startTime: result.startTime,
      attachments: result.attachments.length
    });
  }

  onEnd(result: FullResult) {
    const duration = Date.now() - this.startTime;
    const passed = this.results.filter(r => r.status === 'passed').length;
    const failed = this.results.filter(r => r.status === 'failed').length;
    const skipped = this.results.filter(r => r.status === 'skipped').length;

    console.log(`\n📊 Test Results Summary:`);
    console.log(` Passed: ${passed}`);
    console.log(` Failed: ${failed}`);
    console.log(`⏭️ Skipped: ${skipped}`);
    console.log(`⏱️ Total Duration: ${duration}ms`);
    console.log(`🏁 Status: ${result.status.toUpperCase()}`);

    // Generate custom report
    this.generateCustomReport();
  }

  private getStatusEmoji(status: string): string {
    const emojis: Record<string, string> = {
      passed: '',
      failed: '',
      timedOut: '⏱️',
      skipped: '⏭️'
    };
    return emojis[status] || '❓';
  }

  private generateCustomReport() {
    const reportData = {
      timestamp: new Date().toISOString(),
      totalDuration: Date.now() - this.startTime,
      results: this.results,
      summary: {
        total: this.results.length,
        passed: this.results.filter(r => r.status === 'passed').length,
        failed: this.results.filter(r => r.status === 'failed').length,
        skipped: this.results.filter(r => r.status === 'skipped').length
      }
    };

    const reportPath = path.join('reports', `custom-report-${Date.now()}.json`);
    
    if (!fs.existsSync('reports')) {
      fs.mkdirSync('reports', { recursive: true });
    }

    fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
    console.log(`📄 Custom report saved: ${reportPath}`);
  }
}

export default CustomTestReporter;