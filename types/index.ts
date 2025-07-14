// --- TYPES ---
export interface PhotoData {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  original: string;
  width: number;
  height: number;
  blurDataURL?: string;
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
