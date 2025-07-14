import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

export interface ImageMetadata {
  width: number;
  height: number;
  blurDataURL: string;
}

/**
 * 生成图片的元数据（宽高、blurhash）
 */
export async function generateImageMetadata(imagePath: string): Promise<ImageMetadata> {
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
 * 获取所有图片文件
 */
export async function getImageFiles(imagesDir: string): Promise<string[]> {
  try {
    const files = await fs.readdir(imagesDir);
    return files.filter(file => /\.(jpe?g|png|webp|tiff)$/i.test(file));
  } catch (error) {
    console.error(`Error reading images directory ${imagesDir}:`, error);
    return [];
  }
}

/**
 * 检查文件是否存在
 */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * 确保目录存在
 */
export async function ensureDir(dirPath: string): Promise<void> {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (error) {
    console.error(`Error creating directory ${dirPath}:`, error);
    throw error;
  }
}

/**
 * 为文件名添加哈希前缀（可选的安全增强）
 */
export function hashFilename(filename: string, includeTimestamp = false): string {
  const ext = path.extname(filename);
  const name = path.basename(filename, ext);

  // 创建基于文件名的短哈希
  const hash = crypto.createHash('md5').update(filename).digest('hex').substring(0, 8);

  // 可选：添加时间戳确保唯一性
  const timestamp = includeTimestamp ? `_${Date.now()}` : '';

  return `${hash}_${name}${timestamp}${ext}`;
}

/**
 * 验证文件名是否安全
 */
export function sanitizeFilename(filename: string): string {
  // 移除或替换不安全字符
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_') // 替换特殊字符
    .replace(/^\.+/, '') // 移除开头的点
    .replace(/\.+$/, '') // 移除结尾的点
    .substring(0, 100); // 限制长度
}
