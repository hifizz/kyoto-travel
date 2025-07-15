'use client';
import React, { useState } from 'react';
import type { PhotoData } from '../types';
import Header from '@/components/Header';
import GalleryMasonry from '@/components/GalleryMasonry';
import PhotoView from '@/components/PhotoView';
import Footer from '@/components/Footer';

interface AppProps {
  photoData: PhotoData[];
}

const freezeBody = () => {
  // 锁定body滚动
  const originalOverflow = document.body.style.overflow;
  const originalPaddingRight = document.body.style.paddingRight;

  // 获取滚动条宽度来避免布局抖动
  const scrollBarWidth =
    window.innerWidth - document.documentElement.clientWidth;

  // 锁定滚动
  document.body.style.overflow = 'hidden';
  document.body.style.paddingRight = `${scrollBarWidth}px`;

  // 保存原始值到元素属性上，以便恢复时使用
  document.body.setAttribute('data-original-overflow', originalOverflow);
  document.body.setAttribute(
    'data-original-padding-right',
    originalPaddingRight
  );
};

const releaseBody = () => {
  // 恢复body滚动
  const originalOverflow =
    document.body.getAttribute('data-original-overflow') || '';
  const originalPaddingRight =
    document.body.getAttribute('data-original-padding-right') || '';

  document.body.style.overflow = originalOverflow;
  document.body.style.paddingRight = originalPaddingRight;

  // 清理属性
  document.body.removeAttribute('data-original-overflow');
  document.body.removeAttribute('data-original-padding-right');
};

/**
 * @description 主应用组件
 */
export default function App({ photoData }: AppProps) {
  const [activePhoto, setActivePhoto] = useState<PhotoData | null>(null);
  const [originRect, setOriginRect] = useState<DOMRect | null>(null);

  const handlePhotoSelect = (photo: PhotoData, rect: DOMRect) => {
    freezeBody();
    setActivePhoto(photo);
    setOriginRect(rect);
  };

  const handleClosePhotoView = () => {
    setActivePhoto(null);
    setOriginRect(null);
    releaseBody();
  };

  return (
    <div className="min-h-screen bg-stone-100 font-sans antialiased dark:bg-black">
      <main className="max-w-7xl mx-auto">
        <Header photoData={photoData} />
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

      <div className="mt-10">
        <Footer />
      </div>

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
