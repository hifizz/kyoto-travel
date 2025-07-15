import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import type { PhotoContentConfig } from '@/types';

// 开发环境检查
function isDevelopment() {
  return process.env.NODE_ENV === 'development' || process.env.ADMIN_SECRET === process.env.ADMIN_SECRET_VALUE;
}

// GET: 读取配置
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_request: NextRequest) {
  if (!isDevelopment()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const configPath = path.join(process.cwd(), 'data/content-config.json');
    const configData = await fs.readFile(configPath, 'utf-8');
    const config = JSON.parse(configData);

    return NextResponse.json({
      success: true,
      data: config
    });
  } catch (error) {
    console.error('读取配置失败:', error);
    return NextResponse.json(
      { error: '读取配置失败' },
      { status: 500 }
    );
  }
}

// POST: 保存配置
export async function POST(request: NextRequest) {
  if (!isDevelopment()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { filename, config } = body as {
      filename: string;
      config: PhotoContentConfig;
    };

    if (!filename || !config) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }

    // 读取现有配置
    const configPath = path.join(process.cwd(), 'data/content-config.json');
    let existingConfig: Record<string, PhotoContentConfig> = {};

    try {
      const configData = await fs.readFile(configPath, 'utf-8');
      existingConfig = JSON.parse(configData);
    } catch {
      console.warn('配置文件不存在，将创建新文件');
    }

    // 更新配置
    existingConfig[filename] = config;

    // 保存配置
    await fs.writeFile(
      configPath,
      JSON.stringify(existingConfig, null, 2),
      'utf-8'
    );

    return NextResponse.json({
      success: true,
      message: '配置保存成功'
    });

  } catch (error) {
    console.error('保存配置失败:', error);
    return NextResponse.json(
      { error: '保存配置失败' },
      { status: 500 }
    );
  }
}

// PUT: 批量更新配置
export async function PUT(request: NextRequest) {
  if (!isDevelopment()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { configs } = body as {
      configs: Record<string, PhotoContentConfig>;
    };

    if (!configs) {
      return NextResponse.json(
        { error: '缺少配置数据' },
        { status: 400 }
      );
    }

    const configPath = path.join(process.cwd(), 'data/content-config.json');

    // 保存整个配置
    await fs.writeFile(
      configPath,
      JSON.stringify(configs, null, 2),
      'utf-8'
    );

    return NextResponse.json({
      success: true,
      message: '批量保存成功'
    });

  } catch (error) {
    console.error('批量保存失败:', error);
    return NextResponse.json(
      { error: '批量保存失败' },
      { status: 500 }
    );
  }
}
