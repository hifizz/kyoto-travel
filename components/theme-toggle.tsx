"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        className="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center"
        title="主题切换"
        aria-label="主题切换"
      >
        <div className="w-4 h-4 rounded-full bg-stone-400" />
      </button>
    );
  }

  const isDark = theme === "dark";

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <button
      onClick={toggleTheme}
      className="group w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 flex items-center justify-center transition-all duration-300 ease-out"
      aria-label={isDark ? "切换到浅色模式" : "切换到深色模式"}
      title={isDark ? "切换到浅色模式" : "切换到深色模式"}
    >
      <div className="relative w-4 h-4 overflow-hidden">
        {/* 太阳图标 */}
        <div
          className={`absolute inset-0 transition-all duration-300 ease-out ${
            isDark ? 'translate-y-6 opacity-0' : 'translate-y-0 opacity-100'
          }`}
        >
          <div className="w-2 h-2 bg-amber-400 rounded-full absolute top-1 left-1" />
          <div className="w-0.5 h-0.5 bg-amber-400 rounded-full absolute top-0 left-1.5" />
          <div className="w-0.5 h-0.5 bg-amber-400 rounded-full absolute top-0 right-1.5" />
          <div className="w-0.5 h-0.5 bg-amber-400 rounded-full absolute bottom-0 left-1.5" />
          <div className="w-0.5 h-0.5 bg-amber-400 rounded-full absolute bottom-0 right-1.5" />
          <div className="w-0.5 h-0.5 bg-amber-400 rounded-full absolute top-1.5 left-0" />
          <div className="w-0.5 h-0.5 bg-amber-400 rounded-full absolute top-1.5 right-0" />
          <div className="w-0.5 h-0.5 bg-amber-400 rounded-full absolute top-0.5 left-0.5" />
          <div className="w-0.5 h-0.5 bg-amber-400 rounded-full absolute top-0.5 right-0.5" />
          <div className="w-0.5 h-0.5 bg-amber-400 rounded-full absolute bottom-0.5 left-0.5" />
          <div className="w-0.5 h-0.5 bg-amber-400 rounded-full absolute bottom-0.5 right-0.5" />
        </div>

                {/* 月亮图标 */}
        <div
          className={`absolute inset-0 transition-all duration-300 ease-out ${
            isDark ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
          }`}
        >
          <div className="w-3 h-3 bg-stone-300 rounded-full absolute top-0.5 left-0.5 overflow-hidden">
            <div className="w-2 h-3 bg-stone-100 dark:bg-stone-800 absolute top-0 right-0 rounded-full" />
          </div>
        </div>
      </div>
    </button>
  );
}
