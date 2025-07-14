import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import sharp from 'sharp';

// 获取当前文件的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = path.join(__dirname, '..');

const imagesDir = path.join(rootDir, 'public/images');
const contentConfigPath = path.join(rootDir, 'data/content-config.json');

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

async function testMetadata() {
  console.log('🧪 Testing metadata generation...');

  try {
    // 1. 获取图片文件
    const imageFiles = await getImageFiles(imagesDir);
    console.log(`📸 Found ${imageFiles.length} images`);

    if (imageFiles.length === 0) {
      console.log('No images found');
      return;
    }

    // 2. 读取内容配置
    const contentConfig = await loadContentConfig();
    console.log(`📝 Loaded content config for ${Object.keys(contentConfig).length} images`);

    // 3. 测试处理前几个图片
    const testFiles = imageFiles.slice(0, 3);
    console.log(`🔧 Testing ${testFiles.length} images...`);

    for (const filename of testFiles) {
      try {
        console.log(`Processing ${filename}...`);

        const imagePath = path.join(imagesDir, filename);
        const imageMetadata = await generateImageMetadata(imagePath);
        const content = contentConfig[filename] || {};

        const metadata = {
          ...content,
          width: imageMetadata.width,
          height: imageMetadata.height,
          blurDataURL: imageMetadata.blurDataURL.substring(0, 100) + '...',
        };

        console.log(`✅ ${filename}:`, metadata);
      } catch (error) {
        console.error(`❌ Error processing ${filename}:`, error);
      }
    }

    console.log('✅ Test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testMetadata();
