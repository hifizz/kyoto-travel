import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeft, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import type { PhotoViewProps } from '../types';
import { STROKE_WIDTH } from '../constants';
import ExifInfoPreview from './ExifInfoPreview';
import { ZenModeProvider } from './zen-mode/ZenModeProvider';
import { ZenModeToggle } from './zen-mode/ZenModeToggle';
import { ZenModeOverlay } from './zen-mode/ZenModeOverlay';

type ImageStatus = 'loading' | 'loaded' | 'error';

/**
 * @description 单张图片详情视图
 */
const PhotoView: React.FC<PhotoViewProps> = ({
  photo,
  photoData,
  onClose,
  isActive,
  originRect,
}) => {
  const [isClosing, setIsClosing] = useState(false);
  const [imageStatus, setImageStatus] = useState<ImageStatus>('loading');
  const [showLoadingIndicator] = useState(false);
  const [showNavButtons, setShowNavButtons] = useState(true);
  const navButtonTimerRef = useRef<number | null>(null);

  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // 当组件激活时，根据传入的 photo prop 设置初始索引
  useEffect(() => {
    if (photo && isActive) {
      setCurrentIndex(photoData.findIndex((p) => p.id === photo.id));
    }
  }, [photo, isActive, photoData]);

  // 根据当前索引从数据列表中获取要显示的照片
  const displayedPhoto = currentIndex > -1 ? photoData[currentIndex] : null;
  const totalCount = photoData.length;

  // Next/Image 自动处理图片加载和blurhash占位符

  const startHideTimer = useCallback(() => {
    if (navButtonTimerRef.current) {
      clearTimeout(navButtonTimerRef.current);
    }
    navButtonTimerRef.current = window.setTimeout(() => {
      setShowNavButtons(false);
    }, 3000);
  }, []);

  const cancelHideTimer = useCallback(() => {
    if (navButtonTimerRef.current) {
      clearTimeout(navButtonTimerRef.current);
    }
  }, []);

  // 处理导航按钮显隐的逻辑
  const handleMouseMove = useCallback(() => {
    setShowNavButtons(true);
    startHideTimer();
  }, [startHideTimer]);

  // 组件挂载时，启动初始的隐藏定时器
  useEffect(() => {
    handleMouseMove(); // 初始显示并启动定时器
    return () => {
      if (navButtonTimerRef.current) {
        clearTimeout(navButtonTimerRef.current);
      }
    };
  }, [handleMouseMove]);

  const handleNavigate = useCallback(
    (direction: 'prev' | 'next') => {
      if (currentIndex === -1) return;

      let newIndex;
      if (direction === 'prev') {
        newIndex = (currentIndex - 1 + totalCount) % totalCount;
      } else {
        newIndex = (currentIndex + 1) % totalCount;
      }

      setCurrentIndex(newIndex);
    },
    [currentIndex, totalCount]
  );

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
      // 关闭后重置状态
      setCurrentIndex(-1);
      setImageStatus('loading');
    }, 600);
  }, [onClose]);

  // 触摸手势处理
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      handleNavigate('next');
    } else if (isRightSwipe) {
      handleNavigate('prev');
    }
  };

  // 键盘导航
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isActive) return;

      switch (event.key) {
        case 'Escape':
          handleClose();
          break;
        case 'ArrowLeft':
          event.preventDefault();
          handleNavigate('prev');
          break;
        case 'ArrowRight':
          event.preventDefault();
          handleNavigate('next');
          break;
        case ' ':
          event.preventDefault();
          if (event.shiftKey) {
            handleNavigate('prev');
          } else {
            handleNavigate('next');
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isActive, handleNavigate, handleClose]);

  const clipPathStyle: React.CSSProperties = {
    '--x': originRect ? `${originRect.left + originRect.width / 2}px` : '50%',
    '--y': originRect ? `${originRect.top + originRect.height / 2}px` : '50%',
  } as React.CSSProperties;

  const containerClasses = `
    fixed inset-0 bg-stone-100/90 bg-opacity-95 backdrop-blur-md z-[999999] dark:bg-black/90
    transition-all duration-500 ease-in-out
    ${isActive && !isClosing ? 'animate-clip-in' : 'animate-clip-out'}
  `;

  // Zen Mode 导航处理函数
  const handleZenNext = useCallback(() => {
    if (currentIndex < totalCount - 1) {
      handleNavigate('next');
    }
  }, [currentIndex, totalCount, handleNavigate]);

  const handleZenPrevious = useCallback(() => {
    if (currentIndex > 0) {
      handleNavigate('prev');
    }
  }, [currentIndex, handleNavigate]);

  // zen mode 关闭时不退出 PhotoView，保持在当前状态
  // 这个函数会被 ZenModeOverlay 调用，它会处理 zen mode 的退出
  const handleZenClose = useCallback(() => {}, []);

  if (!displayedPhoto) return null;

  return (
    <ZenModeProvider>
      <div
        style={clipPathStyle}
        className={containerClasses}
        onMouseMove={handleMouseMove}
      >
        <div className="relative w-full h-full flex flex-col md:flex-row items-center justify-center">
          {/* 加载指示器 */}
          {showLoadingIndicator && imageStatus === 'loading' && (
            <div className="absolute inset-0 flex items-center justify-center bg-stone-100/80 dark:bg-black/80">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-600 dark:border-stone-400"></div>
            </div>
          )}

          {/* 导航提示 - 移动端在左上角，桌面端在右侧信息栏 */}
          <div className="absolute top-4 left-4 md:hidden text-stone-600 text-xs font-light dark:text-stone-400">
            <span>
              {currentIndex + 1} / {totalCount}
            </span>
          </div>

          {/* 移动端滑动提示 */}
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 md:hidden px-3 py-1 bg-black/40 rounded-full text-white text-xs backdrop-blur-sm">
            <span>← 滑动切换 →</span>
          </div>

          {/* 关闭按钮 */}
          <button
            onClick={handleClose}
            className="absolute top-2 right-2 md:top-3 md:right-3 w-6 h-6 md:w-8 md:h-8 bg-white/70 backdrop-blur-sm rounded-full text-stone-600 hover:bg-white hover:scale-110 hover:shadow-lg transition-all z-10 flex items-center justify-center dark:bg-stone-800/70 dark:text-stone-300 dark:hover:bg-stone-700"
            aria-label="Close photo view"
          >
            <X className="h-4 w-4 md:h-5 md:w-5" strokeWidth={STROKE_WIDTH} />
          </button>

          {/* 导航按钮 */}
          <AnimatePresence>
            {showNavButtons && totalCount > 1 && (
              <>
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => handleNavigate('prev')}
                  onMouseEnter={() => {
                    setShowNavButtons(true);
                    cancelHideTimer();
                  }}
                  onMouseLeave={startHideTimer}
                  className="absolute left-6 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/70 backdrop-blur-sm rounded-full text-stone-500 hover:bg-white hover:scale-110 hover:shadow-lg transition-all z-10 hidden md:flex items-center justify-center dark:bg-stone-800/70 dark:text-stone-300 dark:hover:bg-stone-700"
                  aria-label="Previous photo"
                >
                  <ArrowLeft className="h-6 w-6" strokeWidth={STROKE_WIDTH} />
                </motion.button>
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => handleNavigate('next')}
                  onMouseEnter={() => {
                    setShowNavButtons(true);
                    cancelHideTimer();
                  }}
                  onMouseLeave={startHideTimer}
                  className="absolute right-6 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/70 backdrop-blur-sm rounded-full text-stone-500 hover:bg-white hover:scale-110 hover:shadow-lg transition-all z-10 hidden md:flex items-center justify-center dark:bg-stone-800/70 dark:text-stone-300 dark:hover:bg-stone-700"
                  aria-label="Next photo"
                >
                  <ArrowRight className="h-6 w-6" strokeWidth={STROKE_WIDTH} />
                </motion.button>
              </>
            )}
          </AnimatePresence>

          {/* 主内容区: 响应式布局 */}
          <div className="w-full h-full flex flex-col lg:flex-row">
            {/* 图片区域 */}
            <div
              className="flex-1 relative flex items-center justify-center p-2 md:p-4"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div className="relative w-full h-full flex items-center justify-center">
                <AnimatePresence initial={false}>
                  <motion.div
                    key={displayedPhoto.id}
                    className="absolute inset-0 flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                  >
                                        {/* 按图片真实宽高比创建容器 */}
                    <div
                      className="relative"
                      style={{
                        aspectRatio: `${displayedPhoto.width} / ${displayedPhoto.height}`,
                        maxWidth: '100%',
                        maxHeight: '100%',
                        width:
                          displayedPhoto.width >= displayedPhoto.height
                            ? '100%'
                            : 'auto',
                        height:
                          displayedPhoto.height > displayedPhoto.width
                            ? '100%'
                            : 'auto',
                      }}
                    >
                      <Image
                        priority
                        src={displayedPhoto.original}
                        alt={displayedPhoto.location || ''}
                        fill
                        placeholder="blur"
                        blurDataURL={displayedPhoto.blurDataURL}
                        quality={90}
                        className="object-contain"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                      />
                    </div>
                  </motion.div>
                </AnimatePresence>

                {imageStatus === 'error' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-stone-100/50 dark:bg-black/50">
                    <p className="text-red-500">图片加载失败</p>
                  </div>
                )}
              </div>
            </div>

            {/* 文字面板 - 移动端在底部，桌面端在右侧 */}
            <div className="w-full md:w-full lg:max-w-[280px] ">
              <div className="h-full flex flex-col py-3 px-4 md:py-5 md:px-5">
                {/* 桌面端导航提示 */}
                <div className="hidden md:block text-stone-500 text-xs font-light mb-4 dark:text-stone-400 ">
                  <div className="flex items-center justify-between pr-0 lg:pr-10">
                    <span>
                      {currentIndex + 1} / {totalCount}
                    </span>
                    <div>
                      {/* 沉浸模式按钮 */}
                      <ZenModeToggle className="cursor-pointer" />
                    </div>
                  </div>
                </div>

                {/* 标题和描述 */}
                <div className="flex-1 flex flex-col justify-between pb-0 pt-2 md:pt-0">
                  <div className="flex flex-col gap-1 md:gap-2 text-sm md:text-base lg:text-lg xl:text-xl font-light leading-relaxed text-stone-600 dark:text-stone-400 mb-2 lg:pt-12 md:pt-0">
                    {displayedPhoto.location && (
                      <p className="text-base md:text-lg font-medium text-stone-700 dark:text-stone-300">
                        {displayedPhoto.location}
                      </p>
                    )}
                    {displayedPhoto.description && (
                      <p className="text-sm md:text-base">
                        {displayedPhoto.description}
                      </p>
                    )}
                  </div>

                  {/* EXIF 信息预览 */}
                  <div className="mt-3 md:mt-0">
                    <ExifInfoPreview
                      photo={displayedPhoto}
                      authorName="zilin"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Zen Mode Overlay */}
        <ZenModeOverlay
          photo={displayedPhoto}
          onClose={handleZenClose}
          onNext={handleZenNext}
          onPrevious={handleZenPrevious}
          hasNext={currentIndex < totalCount - 1}
          hasPrevious={currentIndex > 0}
        />
      </div>
    </ZenModeProvider>
  );
};

export default PhotoView;
