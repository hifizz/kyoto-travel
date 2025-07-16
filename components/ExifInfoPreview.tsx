import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star } from 'lucide-react';
import type { PhotoData } from '../types';
import { STROKE_WIDTH } from '../constants';
import { readExifData, getPhotoUrl } from '../utils/photoUtils';
import ExifItem from './ExifItem';

interface ExifInfoPreviewProps {
  photo: PhotoData | null;
  authorName?: string;
}

/**
 * ExifInfoPreview组件 - 负责完整的EXIF信息管理和展示
 *
 * 遵循SOLID原则：
 * - 单一职责：负责EXIF数据的获取、管理和展示
 * - 开放封闭：通过props支持扩展，无需修改组件内部
 * - 里氏替换：可以在任何需要EXIF信息展示的地方使用
 * - 接口隔离：只暴露必要的props
 * - 依赖倒置：依赖抽象的ExifItem组件而非具体实现
 */
const ExifInfoPreview: React.FC<ExifInfoPreviewProps> = ({
  photo,
  authorName = 'zilin',
}) => {
  const [exifData, setExifData] = useState<PhotoData['exifData']>(undefined);

  // 加载EXIF数据
  useEffect(() => {
    if (photo) {
      let isMounted = true;

      readExifData(getPhotoUrl(photo, 'original'))
        .then((data) => {
          if (isMounted) {
            setExifData(data);
          }
        })
        .catch((error) => {
          console.error('Failed to read EXIF data:', error);
          if (isMounted) {
            setExifData({});
          }
        });

      return () => {
        isMounted = false;
      };
    } else {
      setExifData(undefined);
    }
  }, [photo]);

  const renderRatingStars = () => {
    if (!exifData?.rating) return null;

    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: exifData.rating }, (_, index) => (
          <Star
            key={index}
            className="h-4 w-4 fill-yellow-400 text-yellow-400"
            strokeWidth={STROKE_WIDTH}
          />
        ))}
        <span className="ml-1 text-xs text-stone-500 dark:text-stone-400">
          ({exifData.rating}/5)
        </span>
      </div>
    );
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={photo?.id || 'empty'}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="space-y-3 text-sm"
      >
        {exifData?.rating && (
          <ExifItem
            label="评分"
            renderValue={renderRatingStars}
          />
        )}

        <ExifItem
          label="相机"
          value={exifData?.camera}
        />

        <ExifItem
          label="镜头"
          value={exifData?.lens}
        />

        <ExifItem
          label="光圈"
          value={exifData?.aperture}
        />

        <ExifItem
          label="快门"
          value={exifData?.shutterSpeed}
        />

        <ExifItem
          label="ISO"
          value={exifData?.iso}
        />

        <ExifItem
          label="拍摄时间"
          value={exifData?.shootingDate}
        />

        <ExifItem
          label="作者"
          value={authorName}
        />
      </motion.div>
    </AnimatePresence>
  );
};

export default ExifInfoPreview;
