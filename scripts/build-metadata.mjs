import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import sharp from 'sharp';
import { S3Client, HeadObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { createReadStream } from 'fs';
import dotenv from 'dotenv';

// 加载环境变量 (仅在本地开发时)
if (!process.env.VERCEL && !process.env.CI) {
  // 本地开发环境才加载 .env 文件
  if (process.env.NODE_ENV === 'production') {
    dotenv.config({ path: '.env.production' });
  } else {
    dotenv.config({ path: '.env.development' });
  }
}

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
  // 只有明确设置 ENABLE_R2_UPLOAD=true 才上传
  if (process.env.ENABLE_R2_UPLOAD !== 'true') {
    console.log('⏭️  默认跳过R2上传和多尺寸生成，仅生成metadata');
    return false;
  }

  const hasR2Config = !!(
    process.env.ACCOUNT_ID &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY &&
    process.env.R2_BUCKET_NAME &&
    process.env.R2_ENDPOINT
  );

  const assetPrefix = process.env.NEXT_PUBLIC_ASSET_PREFIX;

  if (!hasR2Config || !assetPrefix || !assetPrefix.startsWith('https://')) {
    console.log('❌ R2配置不完整，无法上传');
    return false;
  }

  console.log('✅ ENABLE_R2_UPLOAD=true，将生成多尺寸图片并上传');
  return true;
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
 * 生成多尺寸图片变体
 */
async function generateMultipleSizes(imagePath, outputDir) {
  const sizes = [400, 640, 960, 1280, 1920, 2880];
  const filename = path.basename(imagePath, path.extname(imagePath));
  const generatedFiles = [];

  console.log(`🔄 Generating multiple sizes for ${filename}...`);

  for (const size of sizes) {
    const outputPath = path.join(outputDir, `${filename}_${size}w.jpg`);

    try {
      await sharp(imagePath)
        .resize(size, null, {
          withoutEnlargement: true,
          fit: 'inside'
        })
        .jpeg({
          quality: size <= 640 ? 85 : size <= 1280 ? 80 : 75, // 小图保持更高质量
          progressive: true
        })
        .toFile(outputPath);

      generatedFiles.push(outputPath);
      console.log(`  ✓ Generated ${size}w version`);
    } catch (error) {
      console.error(`  ❌ Failed to generate ${size}w:`, error.message);
    }
  }

  return generatedFiles;
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
  const accountId = process.env.ACCOUNT_ID
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

    // 检查是否需要上传到R2
    const shouldUpload = shouldUploadToR2();
    const useCDNPaths = shouldUpload && !!r2Config && !!process.env.NEXT_PUBLIC_ASSET_PREFIX && process.env.NEXT_PUBLIC_ASSET_PREFIX.startsWith('https://');

    if (shouldUpload && r2Config) {
      uploader = new R2Uploader(r2Config);
      console.log('☁️  CDN 模式：生成多尺寸图片并上传到 R2');

      // 创建临时目录用于存放多尺寸图片
      const tempDir = path.join(process.cwd(), 'temp-images');
      await fs.mkdir(tempDir, { recursive: true });

      try {
        // 生成多尺寸图片
        console.log('🔧 Generating multiple sizes for all images...');
        const allGeneratedFiles = [];

        for (const filename of imageFiles) {
          const imagePath = path.join(imagesDir, filename);
          const generatedFiles = await generateMultipleSizes(imagePath, tempDir);
          allGeneratedFiles.push(...generatedFiles);
        }

        // 上传原图和所有尺寸变体到 R2
        console.log('☁️  Uploading images to R2...');
        uploadResults = await uploader.uploadImages(imagesDir, imageFiles);

        // 上传多尺寸变体
        const variantFiles = allGeneratedFiles.map(filepath => path.basename(filepath));
        const variantUploadResults = await uploader.uploadImages(tempDir, variantFiles);

        console.log(`✅ Uploaded ${imageFiles.length} original images and ${variantFiles.length} variants`);

        // 清理临时目录
        await fs.rm(tempDir, { recursive: true, force: true });
      } catch (error) {
        // 确保清理临时目录
        await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
        throw error;
      }
    } else if (useCDNPaths) {
      console.log('☁️  CDN 模式：跳过上传，使用CDN路径');
      // 不上传但使用CDN路径（假设文件已存在）
      const baseUrl = process.env.NEXT_PUBLIC_ASSET_PREFIX;
      for (const filename of imageFiles) {
        uploadResults[filename] = `${baseUrl}/images/${filename}`;
      }
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
