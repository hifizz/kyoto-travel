#!/usr/bin/env node

import dotenv from 'dotenv';

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
 * 检查R2配置是否完整
 */
function checkR2Config() {
  console.log('🔍 Checking R2 configuration...\n');

  const requiredVars = [
    'NEXT_PUBLIC_ASSET_PREFIX',
    'ACCOUNT_ID',
    'R2_ACCESS_KEY_ID',
    'R2_SECRET_ACCESS_KEY',
    'R2_BUCKET_NAME',
    'R2_ENDPOINT'
  ];

  const results = {};
  let allConfigured = true;

  requiredVars.forEach(varName => {
    const value = process.env[varName];
    results[varName] = {
      configured: !!value,
      value: value ? (varName.includes('SECRET') ? '***HIDDEN***' : value) : 'NOT SET'
    };

    if (!value) allConfigured = false;
  });

  // 显示结果
  console.log('📋 Environment Variables:');
  requiredVars.forEach(varName => {
    const result = results[varName];
    const status = result.configured ? '✅' : '❌';
    console.log(`${status} ${varName}: ${result.value}`);
  });

  console.log('\n📊 Configuration Status:');
  if (allConfigured) {
    console.log('✅ R2 configuration is COMPLETE');
    console.log('🚀 Running `pnpm build` will upload to R2');
  } else {
    console.log('❌ R2 configuration is INCOMPLETE');
    console.log('🏠 Running `pnpm build` will use local mode');
    console.log('\n💡 To enable R2 upload:');
    console.log('1. Create .env.production file with all required variables');
    console.log('2. Or set environment variables manually');
    console.log('3. Or run `pnpm build:force-r2` (still needs config)');
  }

  return allConfigured;
}

/**
 * 检查是否应该上传到R2
 */
function shouldUploadToR2() {
  const hasR2Config = !!(
    process.env.ACCOUNT_ID &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY &&
    process.env.R2_BUCKET_NAME &&
    process.env.R2_ENDPOINT
  );

  const assetPrefix = process.env.NEXT_PUBLIC_ASSET_PREFIX;

  return hasR2Config && !!assetPrefix && assetPrefix.startsWith('https://');
}

const isConfigured = checkR2Config();
const shouldUpload = shouldUploadToR2();

console.log('\n🎯 Final Decision:');
console.log(`   shouldUploadToR2(): ${shouldUpload}`);
console.log(`   Reason: ${!isConfigured ? 'Missing configuration' : 'All checks passed'}`);
