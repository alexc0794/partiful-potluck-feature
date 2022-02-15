import { TABLES_WITH_TTL } from "./shared";
import { AWS_CONFIG } from "../config";

const AWS = require("aws-sdk");
AWS.config.update(AWS_CONFIG);

const dynamodb = new AWS.DynamoDB();

function createTable(params: any): void {
  dynamodb.createTable(params, (err, data) => {
    if (err) {
      console.error(
        `❌ Unable to create ${params.TableName}`,
        err.message,
        err.code
      );
    } else {
      console.log(`✅ Created table ${params.TableName}`);
      if (TABLES_WITH_TTL.includes(params.TableName)) {
        updateTTL(params.TableName);
      }
    }
  });
}

function updateTTL(tableName: string): void {
  dynamodb.updateTimeToLive(
    {
      TableName: tableName,
      TimeToLiveSpecification: {
        AttributeName: "expiringAtSeconds",
        Enabled: true,
      },
    },
    (err, data) => {
      if (err) {
        console.error(
          `❌ Unable to update TTL for ${tableName}`,
          err.message,
          err.code
        );
      } else {
        console.log(`✅ Created TTL for ${tableName}`);
      }
    }
  );
}


createTable({
  TableName: "QuickParties",
  KeySchema: [{ AttributeName: "PK", KeyType: "HASH" }, { AttributeName: "SK", KeyType: "RANGE" }],
  AttributeDefinitions: [{ AttributeName: "PK", AttributeType: "S" }, { AttributeName: "SK", AttributeType: "S" }],
  ProvisionedThroughput: {
    ReadCapacityUnits: 5,
    WriteCapacityUnits: 5,
  },
  GlobalSecondaryIndexes: [
    {
      IndexName: "GuestIndex",
      KeySchema: [
        {
            AttributeName: "SK",
            KeyType: "HASH"
        },
        {
            AttributeName: "PK",
            KeyType: "RANGE"
        }
      ],
      Projection: {
          ProjectionType: "ALL"
      },
      ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5
      }
    }
  ]
});

createTable({
  TableName: "QuickPotlucks",
  KeySchema: [{ AttributeName: "PK", KeyType: "HASH" }, { AttributeName: "SK", KeyType: "RANGE" }],
  AttributeDefinitions: [{ AttributeName: "PK", AttributeType: "S" }, { AttributeName: "SK", AttributeType: "S" }],
  ProvisionedThroughput: {
    ReadCapacityUnits: 5,
    WriteCapacityUnits: 5,
  }
});


createTable({
  TableName: "QuickPotluckItems",
  KeySchema: [{ AttributeName: "PK", KeyType: "HASH" }, { AttributeName: "SK", KeyType: "RANGE" }],
  AttributeDefinitions: [{ AttributeName: "PK", AttributeType: "S" }, { AttributeName: "SK", AttributeType: "S" }],
  ProvisionedThroughput: {
    ReadCapacityUnits: 5,
    WriteCapacityUnits: 5,
  }
});
