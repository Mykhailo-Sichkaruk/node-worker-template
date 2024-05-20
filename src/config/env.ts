import { load } from "ts-dotenv";

const env = load({
    RABBITMQ_URL: String,
    REQUEST_QUEUE: String,
    RESULT_QUEUE: String,
});

export default env;
