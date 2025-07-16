/**
 * 根据 EXIF orientation 获取正确的显示尺寸
 * @param {number} width 原始宽度
 * @param {number} height 原始高度
 * @param {number} orientation EXIF orientation 值
 * @returns {{width: number, height: number}} 正确的显示尺寸
 */
export function getCorrectDimensions(width, height, orientation = 1) {
  // EXIF orientation 值：
  // 1 = 0° (正常)
  // 3 = 180°
  // 6 = 90° CW (需要交换宽高)
  // 8 = 270° CW / 90° CCW (需要交换宽高)

  if (orientation === 6 || orientation === 8) {
    // 需要旋转 90° 或 270°，交换宽高
    return { width: height, height: width };
  }

  return { width, height };
}
