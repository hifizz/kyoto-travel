import React, { useState } from "react";
import type { PhotoData } from "../types";
import { Loader } from "lucide-react";

interface GalleryGridProps {
  onPhotoSelect: (photo: PhotoData, rect: DOMRect) => void;
  photoData: PhotoData[];
}

const INITIAL_LOAD_COUNT = 24;
const LOAD_MORE_COUNT = 16;

/**
 * @description 图片画廊组件 - 经典网格布局
 */
const GalleryGrid: React.FC<GalleryGridProps> = ({ onPhotoSelect, photoData }) => {
  const [visibleCount, setVisibleCount] = useState(INITIAL_LOAD_COUNT);

  const handleLoadMore = () => {
    setVisibleCount(prevCount => Math.min(prevCount + LOAD_MORE_COUNT, photoData.length));
  };

  const visiblePhotos = photoData.slice(0, visibleCount);

  return (
    <div className="p-4 md:p-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {visiblePhotos.map((photo: PhotoData) => (
          <div
            key={photo.id}
            className="aspect-square bg-stone-200 rounded-lg overflow-hidden cursor-pointer group relative shadow-md hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            onClick={(e) => {
              e.stopPropagation();
              onPhotoSelect(photo, e.currentTarget.getBoundingClientRect());
            }}
          >
            <img
              src={photo.thumbnail}
              alt={photo.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-in-out"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-opacity-60 transition-all duration-300 flex items-center justify-center">
              <div className="text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-2">
                <span className="text-white text-xs md:text-sm font-thin tracking-wider drop-shadow-lg block">
                  {photo.title}
                </span>
                <span className="text-white/80 text-xs mt-1 block">
                  #{photo.id}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      {visibleCount < photoData.length && (
        <div className="text-center mt-8 md:mt-12">
          <button
            onClick={handleLoadMore}
            className="bg-white/80 backdrop-blur-sm text-stone-600 hover:bg-white transition-colors shadow-lg hover:shadow-xl px-8 py-3 rounded-full text-sm font-medium flex items-center gap-2 mx-auto"
          >
            <Loader className="h-4 w-4 animate-spin-slow" />
            <span>加载更多</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default GalleryGrid;
