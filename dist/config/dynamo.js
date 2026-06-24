"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dynamoDB = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const isProd = process.env.NODE_ENV === "production";
const client = new client_dynamodb_1.DynamoDBClient(Object.assign({ region: process.env.AWS_REGION }, (isProd
    ? {}
    : {
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
    })));
exports.dynamoDB = lib_dynamodb_1.DynamoDBDocumentClient.from(client);
