import React from "react";
import { generatePhotoData } from "../utils/photoUtils";

/**
 * @description 页面头部组件
 *
 * header 我很满意，请不要修改它！
 */
const Header: React.FC = () => (
  <header className="p-8 pt-12 text-center text-stone-700">
    <h1 className="text-4xl md:text-5xl font-thin tracking-widest uppercase">
      Kyoto in June
    </h1>
    <p className="mt-2 text-lg text-stone-500 font-light tracking-wider">
      A Photographic Journey of Mossy Memoir
    </p>
    <div className="mt-2 text-xs text-stone-400">
      <p>共收录 {generatePhotoData().length} 张摄影作品</p>

    </div>
  </header>
);

export default Header;
