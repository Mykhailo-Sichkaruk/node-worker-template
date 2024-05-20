import Mocha from "mocha";
import pino from "pino";
import { TestResult } from "#domain/resultQueue.js";

const logger = pino();

export const runTests = (): Promise<TestResult[]> => {
    return new Promise((resolve, reject) => {
        const mocha = new Mocha();
        mocha.addFile("./test/index.ts");

        const testResults: TestResult[] = [];

        mocha.run()
            .on('test', (test) => {
                logger.info(`Test started: ${test.title}`);
            })
            .on('pass', (test) => {
                logger.info(`Test passed: ${test.title}`);
                testResults.push({
                    testName: test.title,
                    status: 'passed',
                    duration: test.duration,
                });
            })
            .on('fail', (test, err) => {
                logger.error(`Test failed: ${test.title}`, err);
                testResults.push({
                    testName: test.title,
                    status: 'failed',
                    duration: test.duration,
                    errorMessage: err.message,
                });
            })
            .on('end', () => {
                logger.info('All tests completed');
                resolve(testResults);
            })
            .on('error', (err) => {
                logger.error('Test runner error', err);
                reject(err);
            });
    });
};
