'use client';

import React from 'react';
import Masonry from 'react-masonry-css';
import type { PhotoData } from '../types';

interface GalleryMasonryProps {
  onPhotoSelect: (photo: PhotoData, rect: DOMRect) => void;
  photoData: PhotoData[];
}

const breakpointColumnsObj = {
  default: 4,
  1280: 4,
  1024: 3,
  768: 2,
  640: 1
};

/**
 * @description 图片画廊组件 - 瀑布流布局 (使用 react-masonry-css)
 */
const GalleryMasonry: React.FC<GalleryMasonryProps> = ({ onPhotoSelect, photoData }) => {
  return (
    <div className="p-4 md:p-8">
      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="my-masonry-grid"
        columnClassName="my-masonry-grid_column"
      >
        {photoData.map((photo) => (
          <div
            key={photo.id}
            className="rounded-lg overflow-hidden cursor-pointer group relative shadow-md hover:shadow-2xl transition-all duration-300 transform hover:scale-105 bg-stone-200"
            onClick={(e) => {
              e.stopPropagation();
              onPhotoSelect(photo, e.currentTarget.getBoundingClientRect());
            }}
          >
            <img
              src={photo.thumbnail}
              alt={photo.title}
              className="w-full h-auto object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center">
              <div className="text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-2">
                <span className="text-white text-xs md:text-sm font-thin tracking-wider drop-shadow-lg block">
                  {photo.title}
                </span>
              </div>
            </div>
          </div>
        ))}
      </Masonry>
    </div>
  );
};

export default GalleryMasonry;
