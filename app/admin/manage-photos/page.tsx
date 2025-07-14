'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PhotoManager from '@/components/admin/PhotoManager';

export default function ManagePhotosPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 检查环境和权限
    const isDev = process.env.NODE_ENV === 'development';

    if (!isDev) {
      // 生产环境禁止访问
      alert('管理界面仅在开发环境可用');
      router.push('/');
      return;
    }

    setIsAuthorized(true);
    setIsLoading(false);
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">验证权限中...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">访问被拒绝</h1>
          <p className="text-muted-foreground">此页面仅在开发环境下可用</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">图片管理系统</h1>
              <p className="text-sm text-muted-foreground">
                管理京都旅行照片的地点和描述信息
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                开发环境
              </span>
              <button
                onClick={() => router.push('/')}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                返回首页
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <PhotoManager />
      </main>
    </div>
  );
}
