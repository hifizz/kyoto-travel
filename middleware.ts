import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 保护管理员路由
  if (pathname.startsWith('/admin')) {
    // 检查是否为开发环境
    const isDevelopment = process.env.NODE_ENV === 'development';

    if (!isDevelopment) {
      // 生产环境禁止访问管理页面
      console.warn(`Unauthorized access attempt to admin route: ${pathname}`);
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // 保护管理员API路由
  if (pathname.startsWith('/api/admin')) {
    const isDevelopment = process.env.NODE_ENV === 'development';
    const hasAdminSecret = process.env.ADMIN_SECRET &&
      request.headers.get('x-admin-secret') === process.env.ADMIN_SECRET;

    if (!isDevelopment && !hasAdminSecret) {
      console.warn(`Unauthorized API access attempt: ${pathname}`);
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // 匹配所有管理员路由
    '/admin/:path*',
    // 匹配所有管理员API路由
    '/api/admin/:path*'
  ]
};
