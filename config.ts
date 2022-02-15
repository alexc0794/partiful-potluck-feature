const AWS = require("aws-sdk");
import dotenv from "dotenv";
dotenv.config();

// Local ports
export const EXPRESS_PORT = 1024;
const LOCALSTACK_PORT = 4566

export const IS_DEV = process.env.NODE_ENV === "development";
export const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
export const CLIENT_URL = IS_DEV ? 'https://localhost:3000/' : process.env.CLIENT_URL || '';

// AWS configurations
const AWS_LOCAL_CONFIG = {
  region: "local",
  endpoint: `http://localhost:${LOCALSTACK_PORT}`,
};
const AWS_REMOTE_CONFIG = {
  region: "us-east-1",
};
export const AWS_CONFIG = IS_DEV ? AWS_LOCAL_CONFIG : AWS_REMOTE_CONFIG;

const AWS_SNS_LOCAL_CONFIG = {
  endpoint: new AWS.Endpoint(`http://localhost:${LOCALSTACK_PORT}`)
}
const AWS_SNS_REMOTE_CONFIG = {
  apiVersion: '2010-03-31'
};
export const AWS_SNS_CONFIG = IS_DEV ? AWS_SNS_LOCAL_CONFIG : AWS_SNS_REMOTE_CONFIG;

// Other configurations
export const TOKEN_REFRESH_DURATION = IS_DEV ? "10m" : "1w";
export const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || '';
export const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || '';
export const TWILIO_MESSAGING_SERVICE_ID = process.env.TWILIO_MESSAGING_SERVICE_ID || '';
export const TWILIO_VERIFY_SERVICE_SID = process.env.TWILIO_VERIFY_SERVICE_SID || '';