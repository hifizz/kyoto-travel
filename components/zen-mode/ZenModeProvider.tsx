import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useFullscreen } from '@/hooks/useFullscreen';
import { useMouseIdle } from '@/hooks/useMouseIdle';
import { useDeviceOrientation } from '@/hooks/useDeviceOrientation';

interface ZenModeContextType {
  isZenMode: boolean;
  showControls: boolean;
  enterZenMode: () => void;
  exitZenMode: () => void;
  isFullscreen: boolean;
  isMobile: boolean;
  isLandscape: boolean;
  isSupported: boolean;
}

const ZenModeContext = createContext<ZenModeContextType | undefined>(undefined);

interface ZenModeProviderProps {
  children: ReactNode;
}

export const ZenModeProvider: React.FC<ZenModeProviderProps> = ({ children }) => {
  const [isZenMode, setIsZenMode] = useState(false);
  const { isFullscreen, enterFullscreen, exitFullscreen, isSupported } = useFullscreen();
  const { isIdle } = useMouseIdle({ enabled: isZenMode });
  const { isMobile, isLandscape } = useDeviceOrientation();

  const enterZenMode = useCallback(async () => {
    setIsZenMode(true);
    if (!isMobile && isSupported) {
      await enterFullscreen();
    }
  }, [isMobile, isSupported, enterFullscreen]);

  const exitZenMode = useCallback(async () => {
    setIsZenMode(false);
    if (isFullscreen) {
      await exitFullscreen();
    }
  }, [isFullscreen, exitFullscreen]);

  // 在桌面端，控制按钮根据鼠标空闲状态显示/隐藏
  // 在移动端，控制按钮始终隐藏（除了退出按钮）
  const showControls = isMobile ? false : !isIdle;

  const value: ZenModeContextType = {
    isZenMode,
    showControls,
    enterZenMode,
    exitZenMode,
    isFullscreen,
    isMobile,
    isLandscape,
    isSupported,
  };

  return (
    <ZenModeContext.Provider value={value}>
      {children}
    </ZenModeContext.Provider>
  );
};

export const useZenMode = (): ZenModeContextType => {
  const context = useContext(ZenModeContext);
  if (context === undefined) {
    throw new Error('useZenMode must be used within a ZenModeProvider');
  }
  return context;
};
