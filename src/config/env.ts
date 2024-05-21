import { load } from "ts-dotenv";

const env = load({
    RABBITMQ_URL: String,
    PROJECT_NAME: String,
    TEST_IMAGE_URL: String,
    TEST_ID: String,
  TEST_PROJECT: String,
});

export default env;
