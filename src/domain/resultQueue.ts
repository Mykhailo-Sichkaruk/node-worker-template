export interface TestResult {
    testName: string;
    status: 'passed' | 'failed';
    duration: number;
    errorMessage?: string;
}
