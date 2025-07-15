import { useState, useEffect, useCallback, useRef } from 'react';

interface UseMouseIdleOptions {
  delay?: number;
  enabled?: boolean;
}

interface UseMouseIdleReturn {
  isIdle: boolean;
  resetIdle: () => void;
}

export const useMouseIdle = ({
  delay = 5000,
  enabled = true
}: UseMouseIdleOptions = {}): UseMouseIdleReturn => {
  const [isIdle, setIsIdle] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const resetIdle = useCallback(() => {
    if (!enabled) return;

    setIsIdle(false);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      setIsIdle(true);
    }, delay);
  }, [delay, enabled]);

  useEffect(() => {
    if (!enabled) {
      setIsIdle(false);
      return;
    }

    const handleMouseMove = () => {
      resetIdle();
    };

    const handleMouseLeave = () => {
      setIsIdle(true);
    };

    // 初始化计时器
    resetIdle();

    // 只监听鼠标移动事件，不监听键盘事件
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [resetIdle, enabled]);

  return { isIdle, resetIdle };
};
