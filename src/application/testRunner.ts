import { exec } from 'child_process';
import { promisify } from 'util';
import { Type } from '@sinclair/typebox';
import { connectRabbitMQ, sendTestResultMessage } from './rabbitMqService.js';
import { TestResult, TestItem } from '#domain/test/index.js';
import { log } from '#infrastructure/log.js';
import { Parser} from 'tap-parser';

const execAsync = promisify(exec);

export async function runTests() {
  try {
    // Run tests and get TAP report
    const { stdout, stderr } = await execAsync('node --test --test-reporter tap');

    if (stderr) {
      log.error(`Test run encountered errors: ${stderr}`);
    }

    // Parse TAP output
    const parser = new Parser();
    const testItems: any = [];
    const summary = {
      total: 0,
      passed: 0,
      failed: 0,
    };

    parser.on('assert', (assert) => {
      const testItem = {
        id: assert.id.toString(),
        description: assert.name,
        status: assert.ok ? 'pass' : 'fail',
        directive: assert.diag.directive || null,
        todo: assert.diag.todo || null,
        skip: assert.diag.skip || null,
        error: !assert.ok
          ? {
              message: assert.diag.message || 'Test failed',
              stack: assert.diag.stack || '',
            }
          : null,
      };

      testItems.push(Type.Strict(TestItem).check(testItem));
      summary.total++;
      if (assert.ok) {
        summary.passed++;
      } else {
        summary.failed++;
      }
    });

    parser.on('complete', () => {
      // Validate and prepare test result
      const testResult: TestResult = {
        id: 'some-uuid', // Generate or assign a proper UUID
        project: 'example-project',
        commitHash: 'example-commit-hash',
        imageUrl: 'example-image-url',
        status: summary.failed > 0 ? 'fail' : 'pass',
        executedAt: new Date().toISOString(),
        testItems,
      };

      Type.Strict(TestResult).check(testResult);

      // Connect to RabbitMQ and send the result
      connectRabbitMQ()
        .then(() => sendTestResultMessage(testResult))
        .then(() => {
          log.info('Test results sent to the queue successfully');
        })
        .catch((error) => {
          log.error('Error sending test results to the queue:', error);
        });
    });

    // Write TAP output to the parser
    parser.end(stdout);
  } catch (error) {
    log.error('Error running tests or sending results:', error);
  }
}

