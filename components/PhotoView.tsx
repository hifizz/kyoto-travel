import React, { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowLeft, ArrowRight } from "lucide-react";
import type { PhotoViewProps } from "../types";
import ExifDataView from "./ExifDataView";
import { STROKE_WIDTH } from '../constants';

type ImageStatus = "loading" | "loaded" | "error";

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
  const [imageStatus, setImageStatus] = useState<ImageStatus>("loading");
  const [showLoadingIndicator, setShowLoadingIndicator] = useState(false);
  const [showNavButtons, setShowNavButtons] = useState(true);
  const imageRef = useRef<HTMLImageElement>(null);
  const loadingTimerRef = useRef<number | null>(null);
  const navButtonTimerRef = useRef<number | null>(null);

  const [currentIndex, setCurrentIndex] = useState<number>(-1);

  // 当组件激活时，根据传入的 photo prop 设置初始索引
  useEffect(() => {
    if (photo && isActive) {
      setCurrentIndex(photoData.findIndex((p) => p.id === photo.id));
    }
  }, [photo, isActive, photoData]);

  // 根据当前索引从数据列表中获取要显示的照片
  const displayedPhoto = currentIndex > -1 ? photoData[currentIndex] : null;
  const totalCount = photoData.length;

  // 核心图片加载逻辑
  useEffect(() => {
    if (!displayedPhoto) return;

    setImageStatus("loading");
    setShowLoadingIndicator(false); // 每次都重置

    // 清除上一个定时器
    if (loadingTimerRef.current) {
      clearTimeout(loadingTimerRef.current);
    }

    // 设置延迟显示loading的定时器
    loadingTimerRef.current = window.setTimeout(() => {
      setShowLoadingIndicator(true);
    }, 800);

    const img = new Image();
    img.onload = () => {
      setImageStatus("loaded");
      if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current);
      setShowLoadingIndicator(false);
    };
    img.onerror = () => {
      setImageStatus("error");
      if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current);
      setShowLoadingIndicator(false); // 也可能需要显示错误状态
    };
    img.src = displayedPhoto.src;

    // 清理函数
    return () => {
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);
      }
      img.onload = null;
      img.onerror = null;
    };
  }, [displayedPhoto]);

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
    (direction: "prev" | "next") => {
      if (currentIndex === -1) return;

      let newIndex;
      if (direction === "prev") {
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
    }, 600);
  }, [onClose]);

  // 键盘导航
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isActive) return;

      switch (event.key) {
        case "Escape":
          handleClose();
          break;
        case "ArrowLeft":
          event.preventDefault();
          handleNavigate("prev");
          break;
        case "ArrowRight":
          event.preventDefault();
          handleNavigate("next");
          break;
        case " ":
          event.preventDefault();
          if (event.shiftKey) {
            handleNavigate("prev");
          } else {
            handleNavigate("next");
          }
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isActive, handleNavigate, handleClose]);

  const clipPathStyle: React.CSSProperties = {
    "--x": originRect ? `${originRect.left + originRect.width / 2}px` : "50%",
    "--y": originRect ? `${originRect.top + originRect.height / 2}px` : "50%",
  } as React.CSSProperties;

  const containerClasses = `
    fixed inset-0 bg-stone-100 bg-opacity-95 backdrop-blur-sm z-50 dark:bg-black/90
    transition-all duration-500 ease-in-out
    ${isActive && !isClosing ? "animate-clip-in" : "animate-clip-out"}
  `;

  if (!displayedPhoto) return null;

  return (
    <div
      style={clipPathStyle}
      className={containerClasses}
      onMouseMove={handleMouseMove}
    >
      <div className="relative w-full h-full flex flex-col md:flex-row items-center justify-center p-4">
        {/* 加载指示器 */}
        {showLoadingIndicator && imageStatus === "loading" && (
          <div className="absolute inset-0 flex items-center justify-center bg-stone-100/80 dark:bg-black/80">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-600 dark:border-stone-400"></div>
          </div>
        )}

        {/* 导航提示 */}
        <div className="absolute top-6 left-6 text-stone-600 text-sm font-light dark:text-stone-400">
          <span>
            {currentIndex + 1} / {totalCount}
          </span>
        </div>

        {/* 关闭按钮 */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 w-12 h-12 bg-white/70 backdrop-blur-sm rounded-full text-stone-600 hover:bg-white hover:scale-110 hover:shadow-lg transition-all z-10 flex items-center justify-center dark:bg-stone-800/70 dark:text-stone-300 dark:hover:bg-stone-700"
          aria-label="Close photo view"
        >
          <X className="h-6 w-6" strokeWidth={STROKE_WIDTH} />
        </button>

        {/* 左右导航按钮 */}
        <AnimatePresence>
          {showNavButtons && (
            <>
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                onClick={() => handleNavigate("prev")}
                onMouseMove={(e) => {
                  e.stopPropagation();
                  cancelHideTimer();
                }}
                onMouseLeave={startHideTimer}
                className="absolute left-6 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/70 backdrop-blur-sm rounded-full text-stone-600 hover:bg-white hover:scale-110 hover:shadow-lg transition-all z-10 flex items-center justify-center dark:bg-stone-800/70 dark:text-stone-300 dark:hover:bg-stone-700"
                aria-label="Previous photo"
              >
                <ArrowLeft className="h-6 w-6" strokeWidth={STROKE_WIDTH} />
              </motion.button>

              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                onClick={() => handleNavigate("next")}
                onMouseMove={(e) => {
                  e.stopPropagation();
                  cancelHideTimer();
                }}
                onMouseLeave={startHideTimer}
                className="absolute right-6 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/70 backdrop-blur-sm rounded-full text-stone-500 hover:bg-white hover:scale-110 hover:shadow-lg transition-all z-10 flex items-center justify-center dark:bg-stone-800/70 dark:text-stone-300 dark:hover:bg-stone-700"
                aria-label="Next photo"
              >
                <ArrowRight className="h-6 w-6" strokeWidth={STROKE_WIDTH} />
              </motion.button>
            </>
          )}
        </AnimatePresence>

        {/* 主内容区: 图片和文字 - 改为 Grid 布局 */}
        <div className="w-full h-full grid grid-rows-[1fr_auto] p-4 md:p-8">
          {/* 图片容器 - 增加了 min-h-0 来配合 Grid 布局 */}
          <div className="relative w-full flex items-center justify-center min-h-0">
            <AnimatePresence initial={false}>
              <motion.img
                key={displayedPhoto.id}
                ref={imageRef}
                src={imageStatus === "loaded" ? displayedPhoto.src : undefined}
                alt={displayedPhoto.title}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
                className="absolute max-w-full max-h-full object-contain shadow-2xl"
                style={{ opacity: imageStatus === "loaded" ? 1 : 0 }} // 初始渲染透明度控制
              />
            </AnimatePresence>
            {imageStatus === "error" && (
              <div className="absolute inset-0 flex items-center justify-center bg-stone-100/50 dark:bg-black/50">
                <p className="text-red-500">图片加载失败</p>
              </div>
            )}
          </div>

          {/* 文字信息容器 */}
          <div className="w-full text-center py-4 md:py-6 pb-0 md:pb-0 flex-shrink-0">
            <h2 className="text-2xl lg:text-3xl font-thin tracking-widest text-stone-900 mb-2 dark:text-stone-200" data-title={displayedPhoto.title}>
              {displayedPhoto.title}
            </h2>
            <p className="text-sm lg:text-base font-light leading-relaxed text-stone-600 max-w-2xl mx-auto dark:text-stone-400">
              {displayedPhoto.description}
            </p>
          </div>
        </div>

        {/* EXIF 数据视图，绝对定位于右下角 */}
        <ExifDataView photo={displayedPhoto} />
      </div>
    </div>
  );
};

export default PhotoView;
