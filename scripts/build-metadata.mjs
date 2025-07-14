import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import sharp from 'sharp';
import { S3Client, HeadObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { createReadStream } from 'fs';
import dotenv from 'dotenv';

// 获取当前文件的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = path.join(__dirname, '..');


const imagesDir = path.join(rootDir, 'public/images');
const contentConfigPath = path.join(rootDir, 'data/content-config.json');
const metadataOutputPath = path.join(rootDir, 'data/photo-metadata.json');

/**
 * 环境检测函数
 */
function shouldUploadToR2() {
  const hasR2Config = !!(
    (process.env.R2_ACCOUNT_ID || process.env.ACCOUNT_ID) &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY &&
    process.env.R2_BUCKET_NAME &&
    process.env.R2_ENDPOINT
  );

  const assetPrefix = process.env.NEXT_PUBLIC_ASSET_PREFIX;
  return hasR2Config && !!assetPrefix && assetPrefix.startsWith('https://');
}

/**
 * 检查文件是否存在
 */
async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * 获取所有图片文件
 */
async function getImageFiles(imagesDir) {
  try {
    const files = await fs.readdir(imagesDir);
    return files.filter(file => /\.(jpe?g|png|webp|tiff)$/i.test(file));
  } catch (error) {
    console.error(`Error reading images directory ${imagesDir}:`, error);
    return [];
  }
}

/**
 * 生成图片的元数据（宽高、blurhash）
 */
async function generateImageMetadata(imagePath) {
  try {
    const image = sharp(imagePath);
    const { width = 0, height = 0 } = await image.metadata();

    // 生成低质量占位符
    const placeholderBuffer = await image
      .resize(10)
      .jpeg({ quality: 50 })
      .toBuffer();

    const blurDataURL = `data:image/jpeg;base64,${placeholderBuffer.toString('base64')}`;

    return {
      width,
      height,
      blurDataURL
    };
  } catch (error) {
    console.error(`Error processing image ${imagePath}:`, error);
    throw error;
  }
}

/**
 * 根据文件扩展名获取 MIME 类型
 */
function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.tiff': 'image/tiff',
    '.gif': 'image/gif',
  };

  return mimeTypes[ext] || 'application/octet-stream';
}

/**
 * R2 上传器类
 */
class R2Uploader {
  constructor(config) {
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

  async fileExists(key) {
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

  async uploadFile(localPath, key, contentType) {
    try {
      const fileStream = createReadStream(localPath);
      const stats = await fs.stat(localPath);

      const upload = new Upload({
        client: this.client,
        params: {
          Bucket: this.config.bucketName,
          Key: key,
          Body: fileStream,
          ContentType: contentType || getContentType(localPath),
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

  async uploadImages(imagesDir, imageFiles, prefix = 'images') {
    const uploadResults = {};

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
}

/**
 * 从环境变量创建 R2 配置
 */
function createR2ConfigFromEnv() {
  const accountId = process.env.R2_ACCOUNT_ID || process.env.ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucketName = process.env.R2_BUCKET_NAME;
  const endpoint = process.env.R2_ENDPOINT;
  const publicUrl = process.env.NEXT_PUBLIC_ASSET_PREFIX;

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

/**
 * 读取内容配置文件
 */
async function loadContentConfig() {
  try {
    if (await fileExists(contentConfigPath)) {
      const data = await fs.readFile(contentConfigPath, 'utf-8');
      return JSON.parse(data);
    }
    return {};
  } catch (error) {
    console.warn('Could not load content config:', error);
    return {};
  }
}

/**
 * 构建时元数据生成主函数
 */
async function buildMetadata() {
  console.log('🚀 Starting build-time metadata generation...');

  try {
    // 1. 获取所有图片文件
    const imageFiles = await getImageFiles(imagesDir);
    console.log(`📸 Found ${imageFiles.length} images`);

    if (imageFiles.length === 0) {
      console.log('No images found, exiting...');
      return;
    }

    // 2. 读取内容配置
    const contentConfig = await loadContentConfig();
    console.log(`📝 Loaded content config for ${Object.keys(contentConfig).length} images`);

    // 3. 根据配置决定是否上传到 R2
    let uploader = null;
    let uploadResults = {};
    const r2Config = createR2ConfigFromEnv();

    if (shouldUploadToR2() && r2Config) {
      uploader = new R2Uploader(r2Config);
      console.log('☁️  CDN 模式：上传图片到 R2');

      // 上传图片到 R2
      uploadResults = await uploader.uploadImages(imagesDir, imageFiles);
    } else {
      console.log('🏠 本地模式：使用本地图片路径');
      // 本地模式使用本地路径
      for (const filename of imageFiles) {
        uploadResults[filename] = `/images/${filename}`;
      }
    }

    // 4. 生成元数据
    console.log('🔧 Generating image metadata...');
    const metadata = {};
    let processedCount = 0;

    for (const filename of imageFiles) {
      try {
        console.log(`Processing ${filename}...`);

        // 生成图片尺寸和 blur hash
        const imagePath = path.join(imagesDir, filename);
        const imageMetadata = await generateImageMetadata(imagePath);

        // 获取内容配置
        const content = contentConfig[filename] || {};

        // 构建最终的元数据对象
        metadata[filename] = {
          ...content, // 标题和描述
          width: imageMetadata.width,
          height: imageMetadata.height,
          blurDataURL: imageMetadata.blurDataURL,
          thumbnail: uploadResults[filename], // 使用上传后的 URL 或本地路径
          original: uploadResults[filename],
        };

        processedCount++;
      } catch (error) {
        console.error(`❌ Error processing ${filename}:`, error);
      }
    }

    // 5. 写入元数据文件
    await fs.writeFile(metadataOutputPath, JSON.stringify(metadata, null, 2));
    console.log(`✅ Successfully generated metadata for ${processedCount} images`);
    console.log(`📄 Metadata saved to: ${metadataOutputPath}`);

    // 6. 输出构建统计
    const useR2 = shouldUploadToR2() && r2Config !== null;
    console.log('\n📊 Build Summary:');
    console.log(`   Images processed: ${processedCount}`);
    console.log(`   Storage: ${useR2 ? 'Cloudflare R2' : 'Local'}`);
    console.log(`   Asset prefix: ${useR2 ? r2Config.publicUrl : 'Local paths'}`);

  } catch (error) {
    console.error('❌ Build metadata failed:', error);
    process.exit(1);
  }
}

// 运行构建脚本
buildMetadata();
