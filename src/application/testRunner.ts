import { exec } from "child_process";
import { promisify } from "util";
import { TestResult } from "#domain/testResult";

const execAsync = promisify(exec);

export const runTests = async (): Promise<TestResult[]> => {
    try {
        const { stdout } = await execAsync("node --test --test-reporter tap src/test/");
        return parseTestResults(stdout);
    } catch (error) {
        console.error("Error running tests", error);
        return [];
    }
};

const parseTestResults = (output: string): TestResult[] => {
    const results: TestResult[] = [];
    const lines = output.split("\n");

    lines.forEach(line => {
        const match = line.match(/^(ok|not ok) (\d+) - (.+)$/);
        if (match) {
            const status = match[1] === "ok" ? "passed" : "failed";
            const testName = match[3];
            results.push({
                testName,
                status,
                duration: 0, // You might need to parse the duration from the output if available
                errorMessage: status === "failed" ? "Test failed" : undefined,
            });
        }
    });

    return results;
};
