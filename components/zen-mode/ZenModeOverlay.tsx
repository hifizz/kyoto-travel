import React, { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeft, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { useZenMode } from './ZenModeProvider';
import type { PhotoData } from '../../types';
import imageLoader from '@/lib/image-loader';

interface ZenModeOverlayProps {
  photo: PhotoData;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
  hasNext: boolean;
  hasPrevious: boolean;
}

export const ZenModeOverlay: React.FC<ZenModeOverlayProps> = ({
  photo,
  onClose,
  onNext,
  onPrevious,
  hasNext,
  hasPrevious,
}) => {
  const { isZenMode, showControls, exitZenMode, isMobile } = useZenMode();

  const handleEscapeKey = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      handleClose();
    }
  }, []);

  const handleArrowKeys = useCallback((event: KeyboardEvent) => {
    if (event.key === 'ArrowLeft' && hasPrevious) {
      onPrevious();
    } else if (event.key === 'ArrowRight' && hasNext) {
      onNext();
    }
  }, [hasNext, hasPrevious, onNext, onPrevious]);

  const handleClose = useCallback(() => {
    exitZenMode();
    onClose();
  }, [exitZenMode, onClose]);

  useEffect(() => {
    if (isZenMode) {
      document.addEventListener('keydown', handleEscapeKey);
      document.addEventListener('keydown', handleArrowKeys);

      return () => {
        document.removeEventListener('keydown', handleEscapeKey);
        document.removeEventListener('keydown', handleArrowKeys);
      };
    }
  }, [isZenMode, handleEscapeKey, handleArrowKeys]);

  if (!isZenMode) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[9999] bg-black"
    >
      {/* 图片容器 */}
      <div className="absolute inset-0 flex items-center justify-center">
        <Image
          loader={imageLoader}
          src={photo.original}
          alt={photo.location || ''}
          width={photo.width}
          height={photo.height}
          placeholder="blur"
          blurDataURL={photo.blurDataURL}
          className="max-w-none max-h-none w-full h-full object-contain"
          priority
        />
      </div>

      {/* 关闭按钮 - 移动端始终显示 */}
      <button
        onClick={handleClose}
        className="absolute top-4 right-4 w-10 h-10 bg-black/20 hover:bg-black/40 rounded-full flex items-center justify-center text-white transition-colors duration-200 z-10"
        title="退出沉浸模式"
        aria-label="退出沉浸模式"
      >
        <X className="w-5 h-5" />
      </button>

      {/* 桌面端导航按钮 - 根据鼠标状态显示/隐藏 */}
      {!isMobile && (
        <AnimatePresence>
          {showControls && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 pointer-events-none"
            >
              {/* 上一张 */}
              {hasPrevious && (
                <button
                  onClick={onPrevious}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/20 hover:bg-black/40 rounded-full flex items-center justify-center text-white transition-colors duration-200 pointer-events-auto"
                  title="上一张"
                  aria-label="上一张"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>
              )}

              {/* 下一张 */}
              {hasNext && (
                <button
                  onClick={onNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/20 hover:bg-black/40 rounded-full flex items-center justify-center text-white transition-colors duration-200 pointer-events-auto"
                  title="下一张"
                  aria-label="下一张"
                >
                  <ArrowRight className="w-6 h-6" />
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      )}


    </motion.div>
  );
};
