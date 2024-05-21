import fs from 'fs';
import util, { promisify } from 'util';
import { Parser } from 'tap-parser';
import { connectRabbitMQ, sendTestResultMessage } from './rabbitMqService.js';
import type { TestItem } from '#domain/test/index.js';
import { log } from '#infrastructure/log.js';
import { exec } from 'child_process';

const execAsync = promisify(exec);
const readFile = util.promisify(fs.readFile);

export async function runTests() {
  try {
    // Run tests and output the results to a file
    const { stderr } = await execAsync('node --test --test-reporter tap > test.tap');
    if (stderr) {
      log.error(`Test run encountered errors: ${stderr}`);
      return;
    }

    // Read the TAP output from the file
    const tapOutput = await readFile('test.tap', 'utf8');

    // Parse TAP output
    const parser = new Parser();
    const testItems: TestItem[] = [];
    const summary = {
      total: 0,
      passed: 0,
      failed: 0,
    };

    parser.on('assert', (assert) => {
      const testItem: TestItem = {
        id: assert.id.toString(),
        description: assert.name,
        status: assert.ok ? 'pass' : 'fail',
        directive: assert.diag?.directive || null,
        todo: assert.diag?.todo || null,
        skip: assert.diag?.skip || null,
      };

      testItems.push(testItem);
      summary.total++;
      if (assert.ok) {
        summary.passed++;
      } else {
        summary.failed++;
      }
    });

    parser.on('complete', async () => {
      const testResult = {
        id: 'some-uuid', 
        project: 'example-project',
        commitHash: 'example-commit-hash',
        imageUrl: 'example-image-url',
        status: summary.failed > 0 ? 'fail' : 'pass',
        executedAt: new Date().toISOString(),
        testItems,
      };

      await connectRabbitMQ();
      await sendTestResultMessage(testResult);
      log.info('Test results sent to the queue successfully');
    });

    parser.end(tapOutput);
  } catch (error) {
    log.error('Error running tests or sending results:', error);
  }
}

runTests();
