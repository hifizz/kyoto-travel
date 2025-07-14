/**
 * 自定义图片加载器 - 支持多尺寸响应式图片
 * 根据浏览器请求的物理像素宽度选择最优图片尺寸
 * quality = 75
 */
const imageLoader = ({ src, width }) => {
  const baseUrl = process.env.NEXT_PUBLIC_ASSET_PREFIX;

  // 本地开发或无CDN时使用原路径
  if (!baseUrl) {
    return src;
  }

  // 去除扩展名，获取基础文件名
  const baseName = src.replace(/\.[^/.]+$/, '');

  // 6级断点选择，完美覆盖1x/2x/3x屏幕密度
  let targetSize;
  if (width <= 400) {
    targetSize = '400w';
  } else if (width <= 640) {
    targetSize = '640w';
  } else if (width <= 960) {
    targetSize = '960w';
  } else if (width <= 1280) {
    targetSize = '1280w';
  } else if (width <= 1920) {
    targetSize = '1920w';
  } else if (width <= 2880) {
    targetSize = '2880w';
  } else {
    // 超出范围返回原图
    return `${baseUrl}${src}`;
  }

  // 返回对应尺寸的图片URL
  return `${baseUrl}${baseName}_${targetSize}.jpg`;
};

export default imageLoader;
