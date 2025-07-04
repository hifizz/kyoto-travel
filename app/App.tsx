'use client';
import React, { useState, useMemo } from 'react';
import type { PhotoData } from '../types';
import { generatePhotoData } from '../utils/photoUtils';
import Header from '@/components/Header';
// import GalleryGrid from './components/GalleryGrid';
import GalleryMasonry from '@/components/GalleryMasonry';
import PhotoView from '@/components/PhotoView';
import { LayoutGrid, Columns } from 'lucide-react';

// type GalleryLayout = 'grid' | 'masonry';

/**
 * @description 主应用组件
 */
export default function App() {
  const [activePhoto, setActivePhoto] = useState<PhotoData | null>(null);
  const [originRect, setOriginRect] = useState<DOMRect | null>(null);
  // const [layout, setLayout] = useState<GalleryLayout>('grid');
  const photoData = useMemo(() => generatePhotoData(), []);

  const handlePhotoSelect = (photo: PhotoData, rect: DOMRect) => {
    setActivePhoto(photo);
    setOriginRect(rect);
  };

  const handleClosePhotoView = () => {
    setActivePhoto(null);
    setOriginRect(null);
  };

  // const LayoutSwitcher = () => (
  //   <div className="text-center my-8">
  //     <div className="inline-flex items-center bg-white/80 backdrop-blur-sm shadow-lg rounded-full p-1">
  //       <button
  //         onClick={() => setLayout('grid')}
  //         aria-label="网格布局"
  //         className={`px-4 py-2 text-sm rounded-full transition-colors ${
  //           layout === 'grid' ? 'bg-stone-800 text-white' : 'text-stone-500 hover:text-stone-800'
  //         }`}
  //       >
  //         <LayoutGrid className="h-5 w-5" />
  //       </button>
  //       <button
  //         onClick={() => setLayout('masonry')}
  //         aria-label="瀑布流布局"
  //         className={`px-4 py-2 text-sm rounded-full transition-colors ${
  //           layout === 'masonry' ? 'bg-stone-800 text-white' : 'text-stone-500 hover:text-stone-800'
  //         }`}
  //       >
  //         <Columns className="h-5 w-5" />
  //       </button>
  //     </div>
  //   </div>
  // );

  return (
    <div className="min-h-screen bg-stone-100 font-sans antialiased dark:bg-black">
      <main className="max-w-7xl mx-auto">
        <Header />
        {/* <LayoutSwitcher /> */}
        {/* {layout === 'grid' ? (
          <GalleryGrid
            onPhotoSelect={handlePhotoSelect}
            photoData={photoData}
          />
        ) : (
          <GalleryMasonry
            onPhotoSelect={handlePhotoSelect}
            photoData={photoData}
          />
        )} */}

        <GalleryMasonry onPhotoSelect={handlePhotoSelect} photoData={photoData} />
      </main>

      <PhotoView
        photo={activePhoto}
        photoData={photoData}
        onClose={handleClosePhotoView}
        isActive={!!activePhoto}
        originRect={originRect}
      />

      <style>{`
        @keyframes clip-in {
          from { clip-path: circle(0% at var(--x, 50%) var(--y, 50%)); }
          to { clip-path: circle(150% at var(--x, 50%) var(--y, 50%)); }
        }
        @keyframes clip-out {
          from { clip-path: circle(150% at var(--x, 50%) var(--y, 50%)); }
          to { clip-path: circle(0% at var(--x, 50%) var(--y, 50%)); }
        }
        .animate-clip-in {
          animation: clip-in 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        .animate-clip-out {
          animation: clip-out 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
      `}</style>
    </div>
  );
}
