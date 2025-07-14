'use client';

import React, { useMemo } from 'react';
import { motion, Variants } from 'framer-motion';
import Image from 'next/image';
import type { PhotoData } from '../types';
import useBreakpoint from '@/hooks/use-breakpoint';

interface GalleryMasonryProps {
  onPhotoSelect: (photo: PhotoData, rect: DOMRect) => void;
  photoData: PhotoData[];
}

const breakpointConfig = {
  '640': 1, // sm
  '768': 2, // md
  '1024': 3, // lg
  '1280': 3, // xl
  '1536': 3  // 2xl
};

/**
 * @description 图片画廊组件 - 瀑布流布局 (JS 分组, 从左到右排序)
 */
const GalleryMasonry: React.FC<GalleryMasonryProps> = ({ onPhotoSelect, photoData }) => {
  const columns = useBreakpoint(breakpointConfig, 1);

  const photoColumns = useMemo(() => {
    const newColumns: PhotoData[][] = Array.from({ length: columns }, () => []);
    photoData.forEach((photo, index) => {
      newColumns[index % columns].push(photo);
    });
    return newColumns;
  }, [photoData, columns]);

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 10,
      },
    },
  };

  return (
    <div className="p-4 md:p-8 flex gap-4">
      {photoColumns.map((column, colIndex) => (
        <div key={colIndex} className="flex flex-col gap-4 w-full">
          {column.map((photo) => (
            <motion.div
              key={photo.id}
              variants={itemVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              whileHover={{ scale: 1.03, y: -5 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              className="overflow-hidden cursor-pointer group relative shadow-md hover:shadow-2xl transition-shadow duration-300 bg-stone-200 dark:bg-stone-900"
              onClick={(e) => {
                e.stopPropagation();
                onPhotoSelect(photo, e.currentTarget.getBoundingClientRect());
              }}
            >
              <Image
                src={photo.thumbnail}
                alt={photo.title}
                width={photo.width}
                height={photo.height}
                placeholder="blur"
                blurDataURL={photo.blurDataURL}
                className="w-full h-auto object-cover"
                sizes="(min-width: 1536px) 20vw, (min-width: 1280px) 25vw, (min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
              />
            </motion.div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default GalleryMasonry;
