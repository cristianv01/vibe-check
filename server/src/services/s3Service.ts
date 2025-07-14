import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from 'uuid';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME!;

export interface UploadParams {
  fileType: string;
  fileName?: string;
  folder?: string;
}

export class S3Service {
  /**
   * Generate a pre-signed URL for direct upload to S3
   */
  static async generatePresignedUrl(params: UploadParams): Promise<{
    uploadUrl: string;
    fileKey: string;
    fileUrl: string;
  }> {
    const fileExtension = params.fileType.split('/')[1];
    const fileName = params.fileName || `${uuidv4()}.${fileExtension}`;
    const fileKey = params.folder 
      ? `${params.folder}/${fileName}`
      : `uploads/${fileName}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileKey,
      ContentType: params.fileType,
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    const fileUrl = `https://${BUCKET_NAME}.s3.amazonaws.com/${fileKey}`;

    return {
      uploadUrl,
      fileKey,
      fileUrl,
    };
  }

  /**
   * Generate a pre-signed URL for reading a file from S3
   */
  static async generateReadUrl(fileKey: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileKey,
    });

    return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  }

  /**
   * Delete a file from S3
   */
  static async deleteFile(fileKey: string): Promise<void> {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileKey,
    });

    await s3Client.send(command);
  }
} 