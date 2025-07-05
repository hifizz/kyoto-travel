import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { Info } from 'lucide-react';
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

      readExifData(photo.original).then(data => {
        if (isMounted) {
          setExifData(data);
          setIsLoadingExif(false);
        }
      }).catch(error => {
        console.error("Failed to read EXIF data:", error);
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

  const panelVariants: Variants = {
    hidden: {
      opacity: 0,
      y: 50,
      height: 0,
      transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
    },
    visible: {
      opacity: 1,
      y: 0,
      height: 'auto',
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
    },
  };

  return (
    <motion.div
      className="absolute bottom-6 right-6"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <motion.div
        className="w-12 h-12 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:shadow-xl transition-shadow dark:bg-stone-800/80"
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
            className="absolute bottom-full right-0 mb-3 w-72 p-4 bg-white/90 backdrop-blur-md rounded-lg shadow-2xl overflow-hidden dark:bg-stone-900/90"
            style={{ originX: 1, originY: 1 }}
          >
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
                  <span className="text-stone-500 dark:text-stone-400">相机</span>
                  <span className="font-medium text-stone-700 text-right dark:text-stone-300">
                    {exifData?.camera || '读取中...'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-stone-500 dark:text-stone-400">镜头</span>
                  <span className="font-medium text-stone-700 text-right dark:text-stone-300">
                    {exifData?.lens || '读取中...'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-stone-500 dark:text-stone-400">ISO</span>
                  <span className="font-medium text-stone-700 dark:text-stone-300">
                    {exifData?.iso || '读取中...'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-stone-500 dark:text-stone-400">光圈</span>
                  <span className="font-medium text-stone-700 dark:text-stone-300">
                    {exifData?.aperture || '读取中...'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-stone-500 dark:text-stone-400">快门</span>
                  <span className="font-medium text-stone-700 dark:text-stone-300">
                    {exifData?.shutterSpeed || '读取中...'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-stone-500 dark:text-stone-400">焦距</span>
                  <span className="font-medium text-stone-700 dark:text-stone-300">
                    {exifData?.focalLength || '读取中...'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-stone-500 dark:text-stone-400">拍摄时间</span>
                  <span className="font-medium text-stone-700 text-right dark:text-stone-300">
                    {exifData?.shootingDate || '读取中...'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-stone-500 dark:text-stone-400">文件名</span>
                  <span className="font-medium text-stone-700 dark:text-stone-300">
                    {photo?.original.split('/').pop()}
                  </span>
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
