import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const isProd = process.env.NODE_ENV === "production";

const client = new DynamoDBClient({
  region: process.env.AWS_REGION,
  ...(isProd
    ? {}
    : {
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
        },
      }),
});

export const dynamoDB = DynamoDBDocumentClient.from(client);