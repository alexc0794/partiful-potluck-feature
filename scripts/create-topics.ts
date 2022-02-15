import { AWS_CONFIG, EXPRESS_PORT } from "../config";

const AWS = require("aws-sdk");
AWS.config.update(AWS_CONFIG);

const sns = new AWS.SNS();


async function createTopic(topicName: string): Promise<string | null> {
  try {
    const topic = await sns.createTopic({Name: topicName}).promise();
    console.log(`✅ Created topic ${topicName}, with arn ${topic.TopicArn}`);
    return topic.TopicArn;
  } catch (e) {
    console.error(`❌ Unable to update TTL for ${topicName}`, e);
    return null;
  }
}

async function subscribeTopic(topicArn: string, protocol: string, endpoint: string): Promise<void> {
  try {
    const message = await sns.subscribe({
      Protocol: protocol,
      TopicArn: topicArn,
      Endpoint: endpoint,
    }).promise();
    console.log(`✅ Subscribed topic ${topicArn} to ${endpoint} with protocol ${protocol}. Subscription ARN is ${message.SubscriptionArn}`);
  } catch (e) {
    console.error(`❌ Unable to subscribe to ${topicArn}`, e);
  }
}

async function run() {
  // const topicArn = await createTopic('EventCompletion');
  // if (topicArn) {
  //   subscribeTopic(topicArn, 'https', `https://docker.for.mac.localhost:${EXPRESS_PORT}/event/async-complete`); // NOTE: Using docker.for.mac.localhost instead of localhost as mentioned here https://www.thestrugglingdeveloper.com/2021/02/22/setup-amazon-sns-locally/
  // }
}

run();