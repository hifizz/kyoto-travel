import exifr from "exifr";
import type { PhotoData } from "../types";

// 读取图片的EXIF数据
export const readExifData = async (imageSrc: string): Promise<PhotoData['exifData']> => {
  try {
    const exif = await exifr.parse(imageSrc, {
      tiff: true,
      exif: true,
      gps: false,
      interop: false,
      ifd1: false,
      sanitize: false,
    });

    if (!exif) return {};

    // 格式化相机信息
    const camera = exif.Make && exif.Model ? `${exif.Make} ${exif.Model}` : exif.Model || '未知';

    // 格式化镜头信息
    const lens = exif.LensModel || exif.LensInfo || '未知';

    // 格式化光圈值
    const aperture = exif.FNumber ? `f/${exif.FNumber}` : exif.ApertureValue ? `f/${Math.round(Math.pow(2, exif.ApertureValue / 2) * 10) / 10}` : '未知';

    // 格式化快门速度
    let shutterSpeed = '未知';
    if (exif.ExposureTime) {
      if (exif.ExposureTime >= 1) {
        shutterSpeed = `${exif.ExposureTime}s`;
      } else {
        shutterSpeed = `1/${Math.round(1 / exif.ExposureTime)}`;
      }
    }

    // 格式化焦距
    const focalLength = exif.FocalLength ? `${exif.FocalLength}mm` : '未知';

    // 格式化拍摄时间
    let shootingDate = '未知';
    if (exif.DateTimeOriginal) {
      const date = new Date(exif.DateTimeOriginal);
      shootingDate = date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }

    return {
      camera,
      lens,
      iso: exif.ISO?.toString() || 'Unknown',
      aperture,
      shutterSpeed,
      focalLength,
      shootingDate,
      // 保存原始EXIF数据以备需要
      rawExif: exif,
    };
  } catch (error) {
    console.error(`Failed to read EXIF data for ${imageSrc}:`, error);
    return {};
  }
};

// 生成图片数据的函数
export const generatePhotoData = (): PhotoData[] => {
  const photos: PhotoData[] = [];

  // 从 _DSC1166 到 _DSC1402 的所有图片
  for (let i = 1166; i <= 1402; i++) {
    // 跳过一些不存在的编号（根据实际文件列表）
    if (i === 1182 || i === 1183 || i === 1184 || i === 1185 || i === 1186 ||
        i === 1187 || i === 1188 || i === 1189 || i === 1190 || i === 1265) {
      continue;
    }

    const filename = `_DSC${i}.JPG`;
    const titles = [
      "光影流转", "深林小径", "静谧时光", "自然纹理", "晨光微露", "细节之美",
      "森林深处", "绿意盎然", "阳光斑驳", "树影婆娑", "微风轻拂", "生机勃勃",
      "宁静致远", "自然之美", "光影交错", "绿叶如茵", "清晨时光", "自然韵律",
      "光线柔和", "自然色彩", "树木参天", "绿色世界", "光影变幻", "自然景观"
    ];

    const descriptions = [
      "阳光透过树叶的缝隙，在地面上投下斑驳的影子。",
      "蜿蜒的小径通向森林深处，两旁绿意盎然。",
      "在这个安静的角落，时间仿佛停止了流动。",
      "大自然的纹理和色彩，展现着生命的美好。",
      "清晨的第一缕阳光，轻柔地洒在每一个角落。",
      "在微小的细节中，发现生活的美好瞬间。",
      "森林中的静谧与美好，让人心旷神怡。",
      "绿色的世界里，每一片叶子都在诉说着生命的故事。",
      "光影的交错，构成了大自然最美的画卷。",
      "在这片绿意中，感受着生命的力量和美好。"
    ];

    photos.push({
      id: String(i),
      title: titles[i % titles.length],
      description: descriptions[i % descriptions.length],
      thumbnail: `/images/${filename}`,
      original: `/images/${filename}`,
      width: 0, // Placeholder, to be filled by metadata script
      height: 0, // Placeholder, to be filled by metadata script
      blurDataURL: '', // Placeholder, to be filled by metadata script
    });
  }

  return photos;
};
