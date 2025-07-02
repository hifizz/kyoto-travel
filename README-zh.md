# VibeCoding Next.js 脚手架

这是一个专为 VibeCoding 打造的 [Next.js](https://nextjs.org) 项目脚手架，使用 [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app) 创建。

> **English Version**: [README.md](./README.md)

## 关于 VibeCoding 脚手架

本脚手架是为 VibeCoding 社区开发者精心设计的，集成了现代化前端开发的最佳实践和工具链，让您能够快速启动高质量的 React 项目。

## 技术栈

本项目使用了现代化的前端技术栈：

- **[Next.js 15](https://nextjs.org)** - React 全栈框架
- **[React 19](https://react.dev)** - 用户界面库
- **[TypeScript](https://www.typescriptlang.org)** - 类型安全的 JavaScript
- **[Tailwind CSS v4](https://tailwindcss.com)** - 实用程序优先的 CSS 框架
- **[shadcn/ui](https://ui.shadcn.com)** - 可复制粘贴的组件库
- **[Radix UI](https://www.radix-ui.com)** - 无样式、可访问的 UI 组件
- **[Lucide React](https://lucide.dev)** - 精美的图标库

## Tailwind CSS

本项目使用 **Tailwind CSS v4**，这是一个实用程序优先的 CSS 框架，让您能够快速构建现代化的用户界面。

### 特性
- 🎨 实用程序优先的设计理念
- 📱 响应式设计支持
- 🌙 深色模式支持
- ⚡ 极快的构建速度
- 🔧 高度可定制

### 配置文件
- CSS 变量定义：`app/globals.css`
- PostCSS 配置：`postcss.config.mjs`

### 使用示例
```tsx
// 基础样式
<div className="flex items-center justify-center min-h-screen bg-background">
  <h1 className="text-4xl font-bold text-foreground">Hello World</h1>
</div>

// 响应式设计
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* 内容 */}
</div>
```

## shadcn/ui

shadcn/ui 是一个基于 Radix UI 和 Tailwind CSS 构建的组件库，提供了美观、可访问且可定制的 React 组件。

### 特性
- ✅ **可复制粘贴** - 复制组件代码到项目中，完全控制
- 🎯 **可访问性** - 基于 Radix UI，遵循 WAI-ARIA 标准
- 🎨 **可定制** - 使用 CSS 变量，支持主题切换
- 🔧 **TypeScript** - 完整的类型支持
- 📦 **按需引入** - 只使用需要的组件

### 当前配置
```json
{
  "style": "new-york",        // 使用 New York 设计风格
  "baseColor": "neutral",     // 基础色调为中性色
  "cssVariables": true,       // 启用 CSS 变量
  "iconLibrary": "lucide"     // 使用 Lucide 图标库
}
```

### 已安装组件
项目已预装了以下 shadcn/ui 组件：

**布局组件**
- `Card` - 卡片容器
- `Separator` - 分隔线
- `Sidebar` - 侧边栏
- `Sheet` - 抽屉组件

**表单组件**
- `Button` - 按钮
- `Input` - 输入框
- `Textarea` - 多行输入
- `Select` - 选择器
- `Checkbox` - 复选框
- `Radio Group` - 单选按钮组
- `Switch` - 开关
- `Slider` - 滑块

**导航组件**
- `Navigation Menu` - 导航菜单
- `Breadcrumb` - 面包屑
- `Pagination` - 分页

**反馈组件**
- `Alert` - 警告提示
- `Alert Dialog` - 警告对话框
- `Dialog` - 对话框
- `Drawer` - 抽屉
- `Tooltip` - 工具提示
- `Popover` - 弹出框
- `Progress` - 进度条

### 添加新组件
使用 shadcn/ui CLI 添加新组件：

```bash
# 添加单个组件
pnpm dlx shadcn@latest add button

# 添加多个组件
pnpm dlx shadcn@latest add card dialog sheet

# 查看所有可用组件
pnpm dlx shadcn@latest add
```

### 使用示例
```tsx
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export default function Example() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>登录</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input placeholder="邮箱地址" type="email" />
        <Input placeholder="密码" type="password" />
        <Button className="w-full">登录</Button>
      </CardContent>
    </Card>
  )
}
```

## 主题系统

项目支持深色/浅色模式切换，通过 `next-themes` 实现：

```tsx
import { useTheme } from "next-themes"

function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  
  return (
    <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
      切换主题
    </button>
  )
}
```

## 开发指南

### 样式编写建议
1. **优先使用 Tailwind CSS 类名** - 避免自定义 CSS
2. **使用 CSS 变量** - 方便主题切换和维护
3. **遵循设计系统** - 使用预定义的间距、颜色等

### 组件开发流程
1. 查看 [shadcn/ui 组件库](https://ui.shadcn.com/components)
2. 使用 CLI 添加需要的组件
3. 根据需求自定义组件样式
4. 确保组件支持深色模式

## 快速开始

首先，运行开发服务器：

```bash
# 推荐使用 pnpm
pnpm dev

# 或者使用其他包管理器
npm run dev
yarn dev
bun dev
```

在浏览器中打开 [http://localhost:3000](http://localhost:3000) 查看结果。

您可以通过修改 `app/page.tsx` 开始编辑页面。文件修改后页面会自动更新。

本项目使用 [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) 自动优化和加载 [Geist](https://vercel.com/font)，这是 Vercel 的新字体系列。

## 了解更多

要了解更多关于 Next.js 的信息，请查看以下资源：

- [Next.js 文档](https://nextjs.org/docs) - 了解 Next.js 的功能和 API
- [学习 Next.js](https://nextjs.org/learn) - 交互式 Next.js 教程

您可以查看 [Next.js GitHub 仓库](https://github.com/vercel/next.js) - 欢迎您的反馈和贡献！

## 有用资源

### Tailwind CSS
- [官方文档](https://tailwindcss.com/docs)
- [Tailwind UI](https://tailwindui.com) - 官方组件库
- [Tailwind Play](https://play.tailwindcss.com) - 在线试验场

### shadcn/ui
- [官方文档](https://ui.shadcn.com)
- [组件库](https://ui.shadcn.com/components)
- [主题配置](https://ui.shadcn.com/themes)
- [CLI 文档](https://ui.shadcn.com/cli)

### 设计资源
- [Radix Colors](https://www.radix-ui.com/colors) - 色彩系统
- [Lucide Icons](https://lucide.dev) - 图标库
- [Font: Geist](https://vercel.com/font) - 字体

## 部署到 Vercel

部署 Next.js 应用程序最简单的方法是使用 Next.js 创建者提供的 [Vercel 平台](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme)。

查看我们的 [Next.js 部署文档](https://nextjs.org/docs/app/building-your-application/deploying) 了解更多详细信息。

---

**Happy Coding with VibeCoding! 🚀** 