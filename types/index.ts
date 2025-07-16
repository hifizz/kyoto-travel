// --- TYPES ---
export interface PhotoData {
  id: string;
  title: string;
  description: string;
  location?: string;
  thumbnail: string;
  original: string;
  width: number;
  height: number;
  blurDataURL?: string;
  version: string; // 基于文件内容的哈希值，用于缓存破坏
  exif?: Record<string, any>;
  // 真实的EXIF数据（可选，异步加载）
  exifData?: {
    camera?: string;
    lens?: string;
    iso?: number;
    aperture?: string;
    shutterSpeed?: string;
    focalLength?: string;
    shootingDate?: string;
    rating?: number; // 照片评分（1-5星）
    rawExif?: Record<string, unknown>;
  };
}

// 内容配置接口（用于content-config.json）
export interface PhotoContentConfig {
  description: string;
  location?: string;
}

// 图片管理界面需要的接口
export interface PhotoManagementItem {
  filename: string;
  configured: boolean;
  config?: PhotoContentConfig;
}

export interface GalleryProps {
  onPhotoSelect: (photo: PhotoData, rect: DOMRect) => void;
}

export interface PhotoViewProps {
  photo: PhotoData | null;
  photoData: PhotoData[];
  onClose: () => void;
  isActive: boolean;
  originRect: DOMRect | null;
}
