import { S3Client, HeadObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import fs from 'fs/promises';
import path from 'path';
import { createReadStream } from 'fs';

export interface R2Config {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  endpoint: string;
  publicUrl: string;
}

export class R2Uploader {
  private client: S3Client;
  private config: R2Config;

  constructor(config: R2Config) {
    this.config = config;
    this.client = new S3Client({
      region: 'auto',
      endpoint: config.endpoint,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }

  /**
   * 检查文件是否已存在于 R2
   */
  async fileExists(key: string): Promise<boolean> {
    try {
      await this.client.send(new HeadObjectCommand({
        Bucket: this.config.bucketName,
        Key: key,
      }));
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 上传文件到 R2
   */
  async uploadFile(
    localPath: string,
    key: string,
    contentType?: string
  ): Promise<string> {
    try {
      const fileStream = createReadStream(localPath);
      const stats = await fs.stat(localPath);

      const upload = new Upload({
        client: this.client,
        params: {
          Bucket: this.config.bucketName,
          Key: key,
          Body: fileStream,
          ContentType: contentType || this.getContentType(localPath),
          ContentLength: stats.size,
        },
      });

      await upload.done();

      const publicUrl = `${this.config.publicUrl}/${key}`;
      console.log(`Uploaded ${key} to R2: ${publicUrl}`);

      return publicUrl;
    } catch (error) {
      console.error(`Failed to upload ${key}:`, error);
      throw error;
    }
  }

  /**
   * 批量上传图片
   */
  async uploadImages(
    imagesDir: string,
    imageFiles: string[],
    prefix = 'images'
  ): Promise<Record<string, string>> {
    const uploadResults: Record<string, string> = {};

    console.log(`Starting upload of ${imageFiles.length} images to R2...`);

    for (const filename of imageFiles) {
      const localPath = path.join(imagesDir, filename);
      const key = `${prefix}/${filename}`;

      try {
        // 检查文件是否已存在
        if (await this.fileExists(key)) {
          const publicUrl = `${this.config.publicUrl}/${key}`;
          console.log(`File ${key} already exists, skipping upload`);
          uploadResults[filename] = publicUrl;
          continue;
        }

        // 上传文件
        const publicUrl = await this.uploadFile(localPath, key);
        uploadResults[filename] = publicUrl;
      } catch (error) {
        console.error(`Failed to upload ${filename}:`, error);
        // 如果上传失败，记录本地路径作为降级
        uploadResults[filename] = `/images/${filename}`;
      }
    }

    console.log(`Completed uploading images to R2`);
    return uploadResults;
  }

  /**
   * 根据文件扩展名获取 MIME 类型
   */
  private getContentType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.tiff': 'image/tiff',
      '.gif': 'image/gif',
    };

    return mimeTypes[ext] || 'application/octet-stream';
  }
}

/**
 * 从环境变量创建 R2 配置
 */
export function createR2ConfigFromEnv(): R2Config | null {
  const accountId = process.env.ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucketName = process.env.R2_BUCKET_NAME;
  const endpoint = process.env.R2_ENDPOINT;
  const publicUrl = process.env.CLOUDFLARE_PUBLIC_PREFIX;

  if (!accountId || !accessKeyId || !secretAccessKey || !bucketName || !endpoint || !publicUrl) {
    console.warn('Missing R2 environment variables, skipping R2 upload');
    return null;
  }

  return {
    accountId,
    accessKeyId,
    secretAccessKey,
    bucketName,
    endpoint,
    publicUrl,
  };
}
