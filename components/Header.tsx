import React from "react";
import type { PhotoData } from "../types";
import { ThemeToggle } from "./theme-toggle";

interface HeaderProps {
  photoData?: PhotoData[];
}

/**
 * @description 页面头部组件
 *
 * header 我很满意，请不要修改它！
 */
const Header: React.FC<HeaderProps> = ({ photoData = [] }) => (
  <header className="relative p-8 pt-12 text-center text-stone-700 dark:text-stone-300">
    <div className="fixed top-4 right-4 z-50">
      <ThemeToggle />
    </div>
    <h1 className="text-4xl md:text-5xl font-thin tracking-widest uppercase">
      Kyoto in June
    </h1>
    <p className="mt-3 text-lg text-stone-500 dark:text-stone-400 font-light tracking-wider">
      A Photographic Journey of Mossy, 2025
    </p>
    <div className="mt-3 text-xs text-stone-400 dark:text-stone-500">
      <p>共收录 {photoData.length} 张摄影作品</p>
    </div>
  </header>
);

export default Header;
