import { promises as fs } from 'fs';
import path from 'path';
import sharp from 'sharp';
import { getCorrectDimensions } from '../lib/image-utils.mjs';

// 直接在脚本中实现 blurhash 生成
async function generateBlurHash(imagePath) {
  try {
    // 创建小尺寸图片用于生成 blurhash
    const buffer = await sharp(imagePath)
      .resize(10, 7, { fit: 'inside' })
      .jpeg({ quality: 20 })
      .toBuffer();

    return `data:image/jpeg;base64,${buffer.toString('base64')}`;
  } catch (error) {
    console.warn(`⚠️ 无法为 ${imagePath} 生成 blur hash:`, error.message);
    return 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
  }
}

// 获取图片尺寸
async function getImageDimensions(imagePath) {
  try {
    const metadata = await sharp(imagePath).metadata();

    // 获取原始尺寸和旋转信息
    const { width: originalWidth = 800, height: originalHeight = 600, orientation = 1 } = metadata;

    // 根据 EXIF orientation 获取正确的显示尺寸
    const { width, height } = getCorrectDimensions(originalWidth, originalHeight, orientation);

    return { width, height };
  } catch (error) {
    console.warn(`⚠️ 无法获取 ${imagePath} 的尺寸:`, error.message);
    return { width: 800, height: 600 };
  }
}

// 开发环境缓存管理
class DevCache {
  constructor() {
    this.memoryCache = new Map();
    this.cacheDir = '.dev-cache';
  }

  async ensureCacheDir() {
    try {
      await fs.mkdir(this.cacheDir, { recursive: true });
    } catch (error) {
      // 目录已存在，忽略错误
    }
  }

  async get(key) {
    // 先检查内存缓存
    if (this.memoryCache.has(key)) {
      return this.memoryCache.get(key);
    }

    // 检查文件缓存
    try {
      await this.ensureCacheDir();
      const filePath = path.join(this.cacheDir, `${key}.json`);
      const data = await fs.readFile(filePath, 'utf-8');
      const parsed = JSON.parse(data);
      this.memoryCache.set(key, parsed);
      return parsed;
    } catch (error) {
      return null;
    }
  }

  async set(key, value) {
    // 设置内存缓存
    this.memoryCache.set(key, value);

    // 设置文件缓存
    try {
      await this.ensureCacheDir();
      const filePath = path.join(this.cacheDir, `${key}.json`);
      await fs.writeFile(filePath, JSON.stringify(value, null, 2));
    } catch (error) {
      console.warn(`⚠️ 无法写入缓存文件: ${error.message}`);
    }
  }
}

async function processImage(imagePath, cache) {
  const filename = path.basename(imagePath);
  const cacheKey = `img_${filename}_${(await fs.stat(imagePath)).mtime.getTime()}`;

  // 检查缓存
  const cached = await cache.get(cacheKey);
  if (cached) {
    console.log(`📦 使用缓存: ${filename}`);
    return cached;
  }

  console.log(`🔄 处理图片: ${filename}`);

  const [dimensions, blurDataURL] = await Promise.all([
    getImageDimensions(imagePath),
    generateBlurHash(imagePath)
  ]);

  const result = {
    ...dimensions,
    blurDataURL,
    thumbnail: `/images/${filename}`,
    original: `/images/${filename}`
  };

  // 缓存结果
  await cache.set(cacheKey, result);

  return result;
}

async function loadContentConfig() {
  try {
    const configPath = 'data/content-config.json';
    const content = await fs.readFile(configPath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.warn('⚠️ 无法加载内容配置，将使用默认值');
    return {};
  }
}

async function generateMetadata() {
  console.log('🚀 开始生成照片元数据...');

  const cache = new DevCache();
  const contentConfig = await loadContentConfig();

  const imagesDir = 'public/images';
  const outputPath = 'data/photo-metadata.json';

  try {
    const files = await fs.readdir(imagesDir);
    const imageFiles = files.filter(file =>
      /\.(jpg|jpeg|png|webp)$/i.test(file)
    );

    console.log(`📸 找到 ${imageFiles.length} 张图片`);

    const metadata = {};

    for (const filename of imageFiles) {
      const imagePath = path.join(imagesDir, filename);
      const imageData = await processImage(imagePath, cache);

      // 合并内容配置
      const content = contentConfig[filename] || {
        description: ""
      };

      metadata[filename] = {
        ...content,
        ...imageData
      };
    }

    await fs.writeFile(outputPath, JSON.stringify(metadata, null, 2));
    console.log(`✅ 元数据已生成: ${outputPath}`);
    console.log(`📊 处理了 ${Object.keys(metadata).length} 张图片`);

  } catch (error) {
    console.error('❌ 生成元数据失败:', error);
    process.exit(1);
  }
}

generateMetadata();
