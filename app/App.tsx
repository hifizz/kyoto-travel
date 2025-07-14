'use client';
import React, { useState } from 'react';
import type { PhotoData } from '../types';
import Header from '@/components/Header';
import GalleryMasonry from '@/components/GalleryMasonry';
import PhotoView from '@/components/PhotoView';

interface AppProps {
  photoData: PhotoData[];
}

/**
 * @description 主应用组件
 */
export default function App({ photoData }: AppProps) {
  const [activePhoto, setActivePhoto] = useState<PhotoData | null>(null);
  const [originRect, setOriginRect] = useState<DOMRect | null>(null);

  const handlePhotoSelect = (photo: PhotoData, rect: DOMRect) => {
    setActivePhoto(photo);
    setOriginRect(rect);
  };

  const handleClosePhotoView = () => {
    setActivePhoto(null);
    setOriginRect(null);
  };

  return (
    <div className="min-h-screen bg-stone-100 font-sans antialiased dark:bg-black">
      <main className="max-w-7xl mx-auto">
        <Header />
        <GalleryMasonry
          onPhotoSelect={handlePhotoSelect}
          photoData={photoData}
        />
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
