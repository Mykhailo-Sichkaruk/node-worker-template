import { load } from "ts-dotenv";

const env = load({
    RABBITMQ_URL: String,
    PROJECT_NAME: String,
});

export default env;
