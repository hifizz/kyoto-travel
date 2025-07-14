import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { Info, Star } from 'lucide-react';
import type { PhotoData } from '../types';
import { readExifData } from '../utils/photoUtils';
import { STROKE_WIDTH } from '../constants';

interface ExifDataViewProps {
  photo: PhotoData | null;
}

const ExifDataView: React.FC<ExifDataViewProps> = ({ photo }) => {
  const [exifData, setExifData] = useState<PhotoData['exifData']>(undefined);
  const [isLoadingExif, setIsLoadingExif] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (photo) {
      setIsLoadingExif(true);
      let isMounted = true;

      readExifData(photo.original)
        .then((data) => {
          if (isMounted) {
            setExifData(data);
            setIsLoadingExif(false);
          }
        })
        .catch((error) => {
          console.error('Failed to read EXIF data:', error);
          if (isMounted) {
            setIsLoadingExif(false);
            setExifData({}); // Set to empty object on error
          }
        });

      return () => {
        isMounted = false;
      };
    } else {
      setExifData(undefined);
    }
  }, [photo]);

  // 渲染星星评分
  const renderStarRating = (rating?: number) => {
    if (!rating || rating < 1 || rating > 5) {
      return <span className="text-stone-400 dark:text-stone-500">无评分</span>;
    }

    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-3 w-3 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-stone-300 dark:text-stone-600'
            }`}
            strokeWidth={STROKE_WIDTH}
          />
        ))}
        <span className="ml-1 text-xs text-stone-500 dark:text-stone-400">
          ({rating}/5)
        </span>
      </div>
    );
  };

  const panelVariants: Variants = {
    hidden: {
      opacity: 0,
      scale: 0.95,
      y: 10,
      transition: {
        duration: 0.2,
        ease: 'easeOut',
      },
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.25,
        ease: 'easeOut',
      },
    },
  };

  return (
    <motion.div
      className="absolute bottom-6 right-6"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* 星星评分显示 - 竖排在按钮上方 */}
      {!isLoadingExif && exifData?.rating && exifData.rating > 0 && (
        <div className="flex flex-col items-center mb-2 gap-1">
          {Array.from({ length: exifData.rating }, (_, index) => (
            <Star
              key={index}
              className="h-4 w-4 fill-yellow-400 text-yellow-400"
              strokeWidth={STROKE_WIDTH}
            />
          ))}
        </div>
      )}

      <motion.div
        className="w-12 h-12 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:shadow-xl transition-shadow dark:bg-stone-800/80"
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.2 }}
      >
        <Info className="h-6 w-6 text-stone-500 dark:text-stone-300" strokeWidth={STROKE_WIDTH} />
      </motion.div>

      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={panelVariants}
            className="absolute bottom-0 right-0 w-72 bg-white/80 backdrop-blur-lg rounded-lg shadow-2xl dark:bg-stone-900/50"
            style={{ originX: 1, originY: 1, marginBottom: '60px' }}
          >
            <div className="p-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-medium text-stone-800 border-b border-stone-200 pb-2 flex-1 dark:text-stone-200 dark:border-stone-700">
                    摄影参数
                  </h3>
                  {isLoadingExif && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-stone-600 dark:border-stone-400"></div>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-2 text-xs">
                  <div className="flex justify-between items-center py-1">
                    <span className="text-stone-500 dark:text-stone-400">
                      照片评分
                    </span>
                    <div className="font-medium text-stone-700 dark:text-stone-300">
                      {isLoadingExif
                        ? '读取中...'
                        : renderStarRating(exifData?.rating)}
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-stone-500 dark:text-stone-400">
                      相机
                    </span>
                    <span className="font-medium text-stone-700 text-right dark:text-stone-300">
                      {exifData?.camera || '读取中...'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-stone-500 dark:text-stone-400">
                      镜头
                    </span>
                    <span className="font-medium text-stone-700 text-right dark:text-stone-300">
                      {exifData?.lens || '读取中...'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-stone-500 dark:text-stone-400">
                      ISO
                    </span>
                    <span className="font-medium text-stone-700 dark:text-stone-300">
                      {exifData?.iso || '读取中...'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-stone-500 dark:text-stone-400">
                      光圈
                    </span>
                    <span className="font-medium text-stone-700 dark:text-stone-300">
                      {exifData?.aperture || '读取中...'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-stone-500 dark:text-stone-400">
                      快门
                    </span>
                    <span className="font-medium text-stone-700 dark:text-stone-300">
                      {exifData?.shutterSpeed || '读取中...'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-stone-500 dark:text-stone-400">
                      焦距
                    </span>
                    <span className="font-medium text-stone-700 dark:text-stone-300">
                      {exifData?.focalLength || '读取中...'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-stone-500 dark:text-stone-400">
                      拍摄时间
                    </span>
                    <span className="font-medium text-stone-700 text-right dark:text-stone-300">
                      {exifData?.shootingDate || '读取中...'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1">
                    <span className="text-stone-500 dark:text-stone-400">
                      文件名
                    </span>
                    <span className="font-medium text-stone-700 dark:text-stone-300">
                      {photo?.original.split('/').pop()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-stone-500 dark:text-stone-400">
                      作者
                    </span>
                    <span className="font-medium text-stone-700 dark:text-stone-300">
                      zilin
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ExifDataView;
