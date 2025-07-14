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
Object.defineProperty(exports, "__esModule", { value: true });
exports.S3Service = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const uuid_1 = require("uuid");
const s3Client = new client_s3_1.S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});
const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;
class S3Service {
    /**
     * Generate a pre-signed URL for direct upload to S3
     */
    static generatePresignedUrl(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const fileExtension = params.fileType.split('/')[1];
            const fileName = params.fileName || `${(0, uuid_1.v4)()}.${fileExtension}`;
            const fileKey = params.folder
                ? `${params.folder}/${fileName}`
                : `uploads/${fileName}`;
            const command = new client_s3_1.PutObjectCommand({
                Bucket: BUCKET_NAME,
                Key: fileKey,
                ContentType: params.fileType,
            });
            const uploadUrl = yield (0, s3_request_presigner_1.getSignedUrl)(s3Client, command, { expiresIn: 3600 });
            const fileUrl = `https://${BUCKET_NAME}.s3.amazonaws.com/${fileKey}`;
            return {
                uploadUrl,
                fileKey,
                fileUrl,
            };
        });
    }
    /**
     * Generate a pre-signed URL for reading a file from S3
     */
    static generateReadUrl(fileKey) {
        return __awaiter(this, void 0, void 0, function* () {
            const command = new client_s3_1.GetObjectCommand({
                Bucket: BUCKET_NAME,
                Key: fileKey,
            });
            return yield (0, s3_request_presigner_1.getSignedUrl)(s3Client, command, { expiresIn: 3600 });
        });
    }
    /**
     * Delete a file from S3
     */
    static deleteFile(fileKey) {
        return __awaiter(this, void 0, void 0, function* () {
            const command = new client_s3_1.PutObjectCommand({
                Bucket: BUCKET_NAME,
                Key: fileKey,
            });
            yield s3Client.send(command);
        });
    }
}
exports.S3Service = S3Service;
