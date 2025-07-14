/**
 * 环境检测工具函数
 */

/**
 * 检测是否在 CI/CD 环境中
 */
export function isCIEnvironment(): boolean {
  return !!(
    process.env.CI ||
    process.env.VERCEL ||
    process.env.NETLIFY ||
    process.env.GITHUB_ACTIONS ||
    process.env.GITLAB_CI ||
    process.env.DRONE ||
    process.env.BUILDKITE ||
    process.env.CIRCLECI
  );
}

/**
 * 检测是否应该上传到 R2
 * 基于环境变量配置来判断
 */
export function shouldUploadToR2(): boolean {
  // 检查 R2 配置是否完整
  const hasR2Config = !!(
    process.env.ACCOUNT_ID &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY &&
    process.env.R2_BUCKET_NAME &&
    process.env.R2_ENDPOINT
  );

  const assetPrefix = process.env.NEXT_PUBLIC_ASSET_PREFIX;

  // 如果是外部 URL 且有完整的 R2 配置，则上传
  return hasR2Config && !!assetPrefix && assetPrefix.startsWith('https://');
}

/**
 * 获取当前环境信息
 */
export function getEnvironmentInfo() {
  const assetPrefix = process.env.NEXT_PUBLIC_ASSET_PREFIX;
  const shouldUpload = shouldUploadToR2();

  return {
    nodeEnv: process.env.NODE_ENV,
    assetPrefix: assetPrefix || '本地路径',
    shouldUploadToR2: shouldUpload,
    hasR2Config: !!(process.env.ACCOUNT_ID &&
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY &&
      process.env.R2_BUCKET_NAME &&
      process.env.R2_ENDPOINT
    ),
    workingMode: shouldUpload ? 'CDN 模式' : '本地模式',
  };
}

/**
 * 获取 CI 平台名称
 */
export function getCIPlatform(): string {
  if (process.env.VERCEL) return 'Vercel';
  if (process.env.NETLIFY) return 'Netlify';
  if (process.env.GITHUB_ACTIONS) return 'GitHub Actions';
  if (process.env.GITLAB_CI) return 'GitLab CI';
  if (process.env.DRONE) return 'Drone';
  if (process.env.BUILDKITE) return 'Buildkite';
  if (process.env.CIRCLECI) return 'CircleCI';
  if (process.env.CI) return 'Generic CI';
  return 'Local';
}
