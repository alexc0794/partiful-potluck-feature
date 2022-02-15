const AWS = require("aws-sdk");
import { AWS_CONFIG } from "../../config";

AWS.config.update(AWS_CONFIG);

export default abstract class BaseRepository {
  tableName?: string;

  ddbClient;

  constructor() {
    this.ddbClient = new AWS.DynamoDB.DocumentClient();
  }
}
