// --- TYPES ---
export interface PhotoData {
  id: number;
  title: string;
  description: string;
  src: string;
  thumbnail: string;
  // 真实的EXIF数据（可选，异步加载）
  exifData?: {
    camera?: string;
    lens?: string;
    iso?: number;
    aperture?: string;
    shutterSpeed?: string;
    focalLength?: string;
    shootingDate?: string;
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