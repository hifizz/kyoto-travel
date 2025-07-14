import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import type { PhotoManagementItem, PhotoContentConfig } from '@/types';

// 开发环境检查
function isDevelopment() {
  return process.env.NODE_ENV === 'development' || process.env.ADMIN_SECRET === process.env.ADMIN_SECRET_VALUE;
}

export async function GET(request: NextRequest) {
  // 安全检查：只允许开发环境或有正确密钥访问
  if (!isDevelopment()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 读取图片目录
    const imagesDir = path.join(process.cwd(), 'public/images');
    const files = await fs.readdir(imagesDir);
    const imageFiles = files.filter(file =>
      /\.(jpg|jpeg|png|webp)$/i.test(file)
    ).sort();

    // 读取现有配置
    const configPath = path.join(process.cwd(), 'data/content-config.json');
    let existingConfig: Record<string, PhotoContentConfig> = {};

    try {
      const configData = await fs.readFile(configPath, 'utf-8');
      existingConfig = JSON.parse(configData);
    } catch (error) {
      console.warn('无法读取配置文件，将创建新配置');
    }

    // 构建管理数据
    const managementItems: PhotoManagementItem[] = imageFiles.map(filename => ({
      filename,
      configured: filename in existingConfig,
      config: existingConfig[filename]
    }));

    return NextResponse.json({
      success: true,
      data: {
        total: imageFiles.length,
        configured: Object.keys(existingConfig).length,
        items: managementItems
      }
    });

  } catch (error) {
    console.error('获取图片列表失败:', error);
    return NextResponse.json(
      { error: '获取图片列表失败' },
      { status: 500 }
    );
  }
}
