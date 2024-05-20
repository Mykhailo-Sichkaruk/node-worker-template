import amqp, { Connection, Channel } from "amqplib";
import env from "#config/env.js";
import { log } from "#infrastructure/log.js";

let connection: Connection;
let channel: Channel;

export const connectRabbitMQ = async () => {
    connection = await amqp.connect(env.RABBITMQ_URL);
    channel = await connection.createChannel();

    log.info("Connected to RabbitMQ");

    return channel;
};

export const sendTestRequestMessage = async (message: any) => {
    await channel.assertQueue(env.REQUEST_QUEUE, { durable: true });
    channel.sendToQueue(env.REQUEST_QUEUE, Buffer.from(JSON.stringify(message)), {
        persistent: true,
    });
};

export const consumeTestResults = async (callback: (msg: any) => void) => {
    await channel.assertQueue(env.RESULT_QUEUE, { durable: true });
    channel.consume(env.RESULT_QUEUE, (msg) => {
        if (msg !== null) {
            callback(msg);
            channel.ack(msg);
        }
    });
};

export const createQueues = async () => {
    await connectRabbitMQ();
    // Assert (create) the queues if they do not exist
    await channel.assertQueue(env.REQUEST_QUEUE, { durable: true });
    await channel.assertQueue(env.RESULT_QUEUE, { durable: true });
    log.info(`RabbitMQ queues created: [${env.REQUEST_QUEUE}, ${env.RESULT_QUEUE}]`);
};
