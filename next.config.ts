import type { NextConfig } from "next";
import { getEnvironmentInfo } from "./lib/env-utils";

// 获取环境信息
const envInfo = getEnvironmentInfo();

console.log('🔧 Next.js 环境配置:');
console.log('- 环境:', envInfo.nodeEnv);
console.log('- 工作模式:', envInfo.workingMode);
console.log('- Asset Prefix:', envInfo.assetPrefix);

const cdnPrefix = process.env.NEXT_PUBLIC_ASSET_PREFIX;
const shouldUseCDN = cdnPrefix && cdnPrefix.startsWith('https://');

const nextConfig: NextConfig = {

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

};

export default nextConfig;
