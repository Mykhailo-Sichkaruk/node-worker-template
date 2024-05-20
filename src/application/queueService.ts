import amqp, { Connection, Channel } from "amqplib";
import env from "#config/env.js";
import pino from "pino";

const logger = pino();

let connection: Connection;
let channel: Channel;

export const connectRabbitMQ = async () => {
    connection = await amqp.connect(env.RABBITMQ_URL);
    channel = await connection.createChannel();
    logger.info("Connected to RabbitMQ");
};

export const sendTestResultMessage = async (message: any) => {
    await channel.assertQueue(env.RESULT_QUEUE, { durable: true });
    channel.sendToQueue(env.RESULT_QUEUE, Buffer.from(JSON.stringify(message)), {
        persistent: true,
    });
};

export const consumeTestRequests = async (callback: (msg: any) => void) => {
    await channel.assertQueue(env.REQUEST_QUEUE, { durable: true });
    channel.consume(env.REQUEST_QUEUE, (msg) => {
        if (msg !== null) {
            callback(msg);
            channel.ack(msg);
        }
    });
};
