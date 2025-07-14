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
    });
  }

  // 按文件名排序
  photos.sort((a, b) => a.id.localeCompare(b.id));

  return photos;
};
