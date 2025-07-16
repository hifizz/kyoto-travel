import exifr from "exifr";
import type { PhotoData } from "../types";

// 读取图片的EXIF数据
export const readExifData = async (imageSrc: string): Promise<PhotoData['exifData']> => {
  try {
    const exif = await exifr.parse(imageSrc, {
      tiff: true,
      exif: true,
      iptc: true,
      xmp: true,
      gps: false,
      interop: false,
      ifd1: false,
      sanitize: false,
    });

    if (!exif) return {};

    // 格式化相机信息
    const camera = exif.Make && exif.Model ? `${exif.Make} ${exif.Model}` : exif.Model || '未知';

    // 格式化镜头信息
    const lens = exif.LensModel || exif.LensInfo || '未知';

    // 格式化光圈值
    const aperture = exif.FNumber ? `f/${exif.FNumber}` : exif.ApertureValue ? `f/${Math.round(Math.pow(2, exif.ApertureValue / 2) * 10) / 10}` : '未知';

    // 格式化快门速度
    let shutterSpeed = '未知';
    if (exif.ExposureTime) {
      if (exif.ExposureTime >= 1) {
        shutterSpeed = `${exif.ExposureTime}s`;
      } else {
        shutterSpeed = `1/${Math.round(1 / exif.ExposureTime)}`;
      }
    }

    // 格式化焦距
    const focalLength = exif.FocalLength ? `${exif.FocalLength}mm` : '未知';

    // 格式化拍摄时间
    let shootingDate = '未知';
    if (exif.DateTimeOriginal) {
      const date = new Date(exif.DateTimeOriginal);
      shootingDate = date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }

    // 读取照片评分
    const rating = exif.Rating ? Number(exif.Rating) : undefined;

    return {
      camera,
      lens,
      iso: exif.ISO?.toString() || 'Unknown',
      aperture,
      shutterSpeed,
      focalLength,
      shootingDate,
      rating,
      // 保存原始EXIF数据以备需要
      rawExif: exif,
    };
  } catch (error) {
    console.error(`Failed to read EXIF data for ${imageSrc}:`, error);
    return {};
  }
};

// 基于元数据文件生成图片数据的函数
export const generatePhotoData = (metadata?: Record<string, any>): PhotoData[] => {
  if (!metadata) {
    return [];
  }

  const photos: PhotoData[] = [];

  // 从元数据文件中获取所有图片
  for (const [filename, data] of Object.entries(metadata)) {
    const id = filename.replace(/\.(jpg|jpeg|png|webp)$/i, '');

    photos.push({
      id,
      title: filename.replace(/\.[^/.]+$/, ""), // 直接使用文件名作为标题
      description: data.description || "",
      location: data.location || undefined, // 添加地点字段支持
      thumbnail: data.thumbnail || `/images/${filename}`,
      original: data.original || `/images/${filename}`,
      width: data.width || 0,
      height: data.height || 0,
      blurDataURL: data.blurDataURL || '',
      version: data.version || '', // 确保包含version字段
    });
  }

  // 按文件名排序
  photos.sort((a, b) => a.id.localeCompare(b.id));

  return photos;
};

/**
 * 定义 getPhotoUrl 函数所需的最基本照片数据结构
 */
interface BasicPhotoData {
  thumbnail: string;
  original: string;
  version?: string;
}

/**
 * 获取照片的完整 URL，自动处理版本号和 CDN 前缀
 * @param photo - 包含图片路径和版本信息的对象
 * @param type - 图片类型 ('thumbnail' 或 'original')
 * @returns 返回处理后的图片 URL
 */
export function getPhotoUrl(photo: BasicPhotoData, type: 'thumbnail' | 'original' = 'thumbnail'): string {
  if (!photo) {
    return '/placeholder.svg';
  }

  const baseUrl = photo[type];
  if (!baseUrl) {
    return '/placeholder.svg';
  }

  // 检查是否有CDN前缀
  const cdnPrefix = process.env.NEXT_PUBLIC_CDN_PREFIX || process.env.CLOUDFLARE_PUBLIC_PREFIX;

  let finalUrl = baseUrl;

  // 如果有CDN前缀且URL是相对路径，添加CDN前缀
  if (cdnPrefix && baseUrl.startsWith('/')) {
    finalUrl = `${cdnPrefix}${baseUrl}`;
  }

  // 添加version参数用于缓存破坏
  if (photo.version) {
    const separator = finalUrl.includes('?') ? '&' : '?';
    finalUrl = `${finalUrl}${separator}v=${photo.version}`;
  }

  return finalUrl;
}

/**
 * 为普通img标签使用的URL生成器
 * @param filename - 图片文件名
 * @param version - 版本号（可选）
 * @returns 返回处理后的图片 URL
 */
export function getImageSrc(filename: string, version?: string): string {
  const cdnPrefix = process.env.NEXT_PUBLIC_CDN_PREFIX || process.env.CLOUDFLARE_PUBLIC_PREFIX;

  let url = `/images/${filename}`;

  if (cdnPrefix) {
    url = `${cdnPrefix}${url}`;
  }

  if (version) {
    url = `${url}?v=${version}`;
  }

  return url;
}
