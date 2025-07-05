import React from "react";
import { generatePhotoData } from "../utils/photoUtils";
import { ThemeToggle } from "./theme-toggle";

/**
 * @description 页面头部组件
 *
 * header 我很满意，请不要修改它！
 */
const Header: React.FC = () => (
  <header className="relative p-8 pt-12 text-center text-stone-700 dark:text-stone-300">
    <div className="absolute top-4 right-4">
      <ThemeToggle />
    </div>
    <h1 className="text-4xl md:text-5xl font-thin tracking-widest uppercase">
      Kyoto in June, 2025
    </h1>
    <p className="mt-2 text-lg text-stone-500 dark:text-stone-400 font-light tracking-wider">
      A Photographic Journey of Mossy
    </p>
    <div className="mt-2 text-xs text-stone-400 dark:text-stone-500">
      <p>共收录 {generatePhotoData().length} 张摄影作品</p>
    </div>
  </header>
);

export default Header;
