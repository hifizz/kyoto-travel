import React from 'react';
import { Maximize2 } from 'lucide-react';
import { useZenMode } from './ZenModeProvider';

interface ZenModeToggleProps {
  className?: string;
}

export const ZenModeToggle: React.FC<ZenModeToggleProps> = ({ className = '' }) => {
  const { enterZenMode, isSupported, isMobile } = useZenMode();

  const handleClick = () => {
    enterZenMode();
  };

  // 如果不支持全屏API且不是移动端，则不显示按钮
  if (!isSupported && !isMobile) {
    return null;
  }

  return (
    <button
      onClick={handleClick}
      className={`group flex items-center gap-2 text-xs text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200 transition-colors duration-200 ${className}`}
      title="进入沉浸模式"
      aria-label="进入沉浸模式"
    >
      <Maximize2 className="w-3 h-3" />
      <span className="font-light">沉浸模式</span>
    </button>
  );
};
