import amqp, { Connection, Channel, ConsumeMessage } from "amqplib";
import env from "#config/env.js";
import { log } from "#infrastructure/log.js";
import { TestRequest, TestResult, testRequestValidator, testResultValidator } from "#domain/test/index.js";

const RESULT_QUEUE = "result_queue";
const REQUEST_QUEUE = "read_queue";

let connection: Connection;
let channel: Channel;

export const connectRabbitMQ = async () => {
  connection = await amqp.connect(env.RABBITMQ_URL);
  channel = await connection.createChannel();
  log.info("Connected to RabbitMQ");
  return channel;
};

export const sendTestResultMessage = async (message: TestResult) => {
  channel.sendToQueue(RESULT_QUEUE, Buffer.from(JSON.stringify(message)), {
    persistent: true,
  });
};

export const sendTestRequestMessage = async (message: TestRequest) => {
  channel.sendToQueue(REQUEST_QUEUE, Buffer.from(JSON.stringify(message)), {
    persistent: true,
  });
};

export const consumeTestResults = async (
  callback: (msg: TestResult) => Promise<void>,
) => {
  channel.consume(RESULT_QUEUE, async (msg: ConsumeMessage | null) => {
    if (msg !== null) {
      log.info("Consume message from rabbitmq", { queue: RESULT_QUEUE, msg });
      const contentString = msg.content.toString();
      const content = JSON.parse(contentString);
      const isContentValid = testResultValidator(content);
      if (!isContentValid) {
        log.error("Invalid message content. Nacking message", {
          queue: RESULT_QUEUE,
          content: contentString,
        });
        channel.nack(msg);
        return;
      }
      await callback(content as TestResult);
      channel.ack(msg);
      log.info("Message acknowledged", { queue: RESULT_QUEUE, msg });
    } else {
      log.error("Message is null", { queue: RESULT_QUEUE });
    }
  });
};

export const consumeTestRequests = async (
  callback: (msg: TestRequest) => Promise<void>,
) => {
  channel.consume(REQUEST_QUEUE, async (msg) => {
    if (msg !== null) {
      log.info("Consume message from rabbitmq", { queue: RESULT_QUEUE, msg });
      const contentString = msg.content.toString();
      const content = JSON.parse(contentString);
      const isContentValid = testRequestValidator(content);
      if (!isContentValid) {
        log.error("Invalid message content. Nacking message", {
          queue: RESULT_QUEUE,
          content: contentString,
        });
        channel.nack(msg);
        return;
      }
      await callback(content as TestRequest);
      channel.ack(msg);
      log.info("Message acknowledged", { queue: RESULT_QUEUE, msg });
    } else {
      log.error("Message is null", { queue: RESULT_QUEUE });
    }
  });
};

export const createQueues = async () => {
  await connectRabbitMQ();
  await channel.assertQueue(RESULT_QUEUE, { durable: true });
  await channel.assertQueue(REQUEST_QUEUE, { durable: true });
  log.info("RabbitMQ queues created:", {
    queues: [RESULT_QUEUE, REQUEST_QUEUE],
  });
};
