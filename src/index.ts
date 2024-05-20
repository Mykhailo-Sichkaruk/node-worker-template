import { connectRabbitMQ, consumeTestRequests, sendTestResultMessage, createQueues } from "#application/rabbitmqService";
import { runTests } from "#application/testRunner.js";
import { log } from "#infrastructure/log.js";
import env from "#config/env.js";
import { Value } from "@sinclair/typebox/value";
import { TestResultSchema } from "#domain/testResult/index.js";

const startWorker = async () => {
    try {
        await createQueues();
        await connectRabbitMQ();

        consumeTestRequests(async (msg) => {
            const content = msg.content.toString();
            log.info(`Received test request: ${content}`);

            try {
                const results = await runTests();
                results.forEach(result => {
                    if (!Value.Check(TestResultSchema, result)) {
                        throw new Error("Invalid test result format");
                    }
                });
                await sendTestResultMessage({ requestId: content, results });
                log.info(`Test results sent for request: ${content}`);
            } catch (err) {
                log.error(`Error running tests for request: ${content}`, err);
            }
        });

        log.info("Worker started and waiting for test requests...");
    } catch (err) {
        log.error("Error starting worker", err);
        process.exit(1);
    }
};

startWorker();
