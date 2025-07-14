import React from 'react';
import { Star } from 'lucide-react';
import type { PhotoData } from '../types';
import { STROKE_WIDTH } from '../constants';
import ExifItem from './ExifItem';

interface ExifInfoPreviewProps {
  exifData?: PhotoData['exifData'];
  isLoadingExif: boolean;
  authorName?: string;
}

/**
 * ExifInfoPreview组件 - 负责展示完整的EXIF信息预览
 *
 * 遵循SOLID原则：
 * - 单一职责：只负责EXIF信息的展示逻辑
 * - 开放封闭：通过props支持扩展，无需修改组件内部
 * - 里氏替换：可以在任何需要EXIF信息展示的地方使用
 * - 接口隔离：只暴露必要的props
 * - 依赖倒置：依赖抽象的ExifItem组件而非具体实现
 */
const ExifInfoPreview: React.FC<ExifInfoPreviewProps> = ({
  exifData,
  isLoadingExif,
  authorName = 'zilin',
}) => {
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
    <div className="space-y-3 text-sm">
      {exifData?.rating && (
        <ExifItem
          label="评分"
          renderValue={renderRatingStars}
        />
      )}

      <ExifItem
        label="相机"
        value={exifData?.camera}
        isLoading={isLoadingExif}
      />

      <ExifItem
        label="镜头"
        value={exifData?.lens}
        isLoading={isLoadingExif}
      />

      <ExifItem
        label="光圈"
        value={exifData?.aperture}
        isLoading={isLoadingExif}
      />

      <ExifItem
        label="快门"
        value={exifData?.shutterSpeed}
        isLoading={isLoadingExif}
      />

      <ExifItem
        label="ISO"
        value={exifData?.iso}
        isLoading={isLoadingExif}
      />

      <ExifItem
        label="拍摄时间"
        value={exifData?.shootingDate}
        isLoading={isLoadingExif}
      />

      <ExifItem
        label="作者"
        value={authorName}
      />
    </div>
  );
};

export default ExifInfoPreview;
