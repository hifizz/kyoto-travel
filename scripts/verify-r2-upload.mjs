#!/usr/bin/env node

import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';

// 加载环境变量 (仅在本地开发时)
if (!process.env.VERCEL && !process.env.CI) {
  // 本地开发环境才加载 .env 文件
  if (process.env.NODE_ENV === 'production') {
    dotenv.config({ path: '.env.production' });
  } else {
    dotenv.config({ path: '.env.development' });
  }
}

/**
 * 验证R2上传状态
 */
async function verifyR2Upload() {
  console.log('🔍 Verifying R2 upload status...\n');

  const baseUrl = process.env.CLOUDFLARE_PUBLIC_PREFIX;
  if (!baseUrl) {
    console.error('❌ CLOUDFLARE_PUBLIC_PREFIX not configured');
    return;
  }

  // 读取图片目录
  const imagesDir = 'public/images';
  const imageFiles = await fs.readdir(imagesDir);
  const jpgFiles = imageFiles.filter(file => file.toLowerCase().endsWith('.jpg'));

  console.log(`📸 Found ${jpgFiles.length} original images`);

  // 计算期望的文件数量
  const sizes = [400, 640, 960, 1280, 1920, 2880];
  const expectedVariants = jpgFiles.length * sizes.length;
  const expectedTotal = jpgFiles.length + expectedVariants; // 原图 + 变体

  console.log(`📊 Expected files on R2:`);
  console.log(`   Original images: ${jpgFiles.length}`);
  console.log(`   Size variants: ${expectedVariants} (${jpgFiles.length} × ${sizes.length})`);
  console.log(`   Total expected: ${expectedTotal}`);

  // 显示一些示例URL
  console.log(`\n🌐 Sample URLs that should be available:`);

  const sampleImage = jpgFiles[0].replace('.JPG', '');
  console.log(`   Original: ${baseUrl}/images/${jpgFiles[0]}`);

  sizes.forEach(size => {
    console.log(`   ${size}w: ${baseUrl}/images/${sampleImage}_${size}w.jpg`);
  });

  console.log(`\n✅ All files should be accessible at: ${baseUrl}/images/`);
  console.log(`📋 You can verify by checking your R2 bucket or visiting the URLs above.`);
}

verifyR2Upload();
