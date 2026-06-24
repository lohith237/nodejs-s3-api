"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.s3 = exports.replaceS3Image = exports.deleteFromS3 = exports.createUploader = void 0;
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const multer_1 = __importDefault(require("multer"));
const multer_s3_1 = __importDefault(require("multer-s3"));
const s3 = new aws_sdk_1.default.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});
exports.s3 = s3;
const createUploader = (folder) => (0, multer_1.default)({
    storage: (0, multer_s3_1.default)({
        s3: s3,
        bucket: process.env.AWS_BUCKET_NAME,
        acl: 'public-read',
        contentType: multer_s3_1.default.AUTO_CONTENT_TYPE,
        key: (req, file, cb) => {
            cb(null, `${folder}/${Date.now()}-${file.originalname}`);
        },
    }),
    limits: { fileSize: 10 * 1024 * 1024 },
});
exports.createUploader = createUploader;
const deleteFromS3 = (file) => __awaiter(void 0, void 0, void 0, function* () {
    if (!file)
        return;
    yield s3.deleteObject({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: file.key,
    }).promise();
});
exports.deleteFromS3 = deleteFromS3;
const replaceS3Image = (imageUrl) => __awaiter(void 0, void 0, void 0, function* () {
    if (!imageUrl)
        return;
    const key = decodeURIComponent(imageUrl.split('.com/')[1]);
    yield s3.deleteObject({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
    }).promise();
});
exports.replaceS3Image = replaceS3Image;
