import { useState, useEffect } from 'react';

interface UseDeviceOrientationReturn {
  isLandscape: boolean;
  isMobile: boolean;
  orientation: 'portrait' | 'landscape';
}

export const useDeviceOrientation = (): UseDeviceOrientationReturn => {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      return /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    };

    setIsMobile(checkMobile());

    const handleOrientationChange = () => {
      const isLandscape = window.innerWidth > window.innerHeight;
      setOrientation(isLandscape ? 'landscape' : 'portrait');
    };

    // 初始检查
    handleOrientationChange();

    // 监听窗口大小变化
    window.addEventListener('resize', handleOrientationChange);

    // 监听设备方向变化
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', handleOrientationChange);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  return {
    isLandscape: orientation === 'landscape',
    isMobile,
    orientation,
  };
};
