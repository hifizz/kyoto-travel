import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import type { PhotoManagementItem, PhotoContentConfig } from '@/types';

// 开发环境检查
function isDevelopment() {
  return process.env.NODE_ENV === 'development' || process.env.ADMIN_SECRET === process.env.ADMIN_SECRET_VALUE;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_request: NextRequest) {
  // 安全检查：只允许开发环境或有正确密钥访问
  if (!isDevelopment()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 使用构建时生成的 photo-metadata.json 文件，而不是运行时读取文件系统
    const metadataPath = path.join(process.cwd(), 'data/photo-metadata.json');
    let photoMetadata: Record<string, {
      description: string;
      location: string;
      width: number;
      height: number;
      blurDataURL: string;
      thumbnail: string;
      original: string;
    }> = {};

    try {
      const metadataData = await fs.readFile(metadataPath, 'utf-8');
      photoMetadata = JSON.parse(metadataData);
    } catch (error) {
      console.error('无法读取 photo-metadata.json:', error);
      return NextResponse.json(
        { error: '无法读取图片元数据，请先运行构建脚本' },
        { status: 500 }
      );
    }

    // 从 photo-metadata.json 中获取图片文件列表
    const imageFiles = Object.keys(photoMetadata).sort();

    // 读取现有配置
    const configPath = path.join(process.cwd(), 'data/content-config.json');
    let existingConfig: Record<string, PhotoContentConfig> = {};

    try {
      const configData = await fs.readFile(configPath, 'utf-8');
      existingConfig = JSON.parse(configData);
    } catch {
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
