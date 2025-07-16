import type { NextConfig } from "next";
import { getEnvironmentInfo } from "./lib/env-utils";

// 获取环境信息
const envInfo = getEnvironmentInfo();

console.log('🔧 Next.js 环境配置:');
console.log('- 环境:', envInfo.nodeEnv);
console.log('- 工作模式:', envInfo.workingMode);
console.log('- Asset Prefix:', envInfo.assetPrefix);

const cdnPrefix = process.env.CLOUDFLARE_PUBLIC_PREFIX;
const shouldUseCDN = cdnPrefix && cdnPrefix.startsWith('https://');

const nextConfig: NextConfig = {
  // 优化 serverless function 打包
  experimental: {
    // 减少 serverless function 的包大小
    serverMinification: true,
  },

  // 排除不需要的文件被包含到 serverless function 中
  outputFileTracingExcludes: {
    '*': [
      'node_modules/@swc/core-linux-x64-gnu',
      'node_modules/@swc/core-linux-x64-musl',
      'node_modules/@esbuild/linux-x64',
      'node_modules/@next/swc-linux-x64-gnu',
      'node_modules/@next/swc-linux-x64-musl',
      // 排除图片文件被包含到 serverless function 中
      'public/images/**/*',
      'public/live/**/*',
      'public/audio/**/*',
    ],
  },

  // 配置图片域名
  images: {
    // 只有在启用 CDN 时才配置远程图片域名
    remotePatterns: shouldUseCDN ? [
      {
        protocol: 'https',
        hostname: new URL(cdnPrefix).hostname,
        port: '',
        pathname: '/**',
      }
    ] : [],
  },

  // 压缩输出
  compress: true,

  // 优化构建
  swcMinify: true,
};

export default nextConfig;
