# VibeCoding Next.js Scaffold

This is a [Next.js](https://nextjs.org) project scaffold crafted for [VibeCoding](https://vibecoding.com), bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

> **中文版本**: [README-zh.md](./README-zh.md)

## About VibeCoding Scaffold

This scaffold is carefully designed for VibeCoding community developers, integrating modern frontend development best practices and toolchains to help you quickly start high-quality React projects.

## Tech Stack

This project uses a modern frontend technology stack:

- **[Next.js 15](https://nextjs.org)** - React full-stack framework
- **[React 19](https://react.dev)** - User interface library
- **[TypeScript](https://www.typescriptlang.org)** - Type-safe JavaScript
- **[Tailwind CSS v4](https://tailwindcss.com)** - Utility-first CSS framework
- **[shadcn/ui](https://ui.shadcn.com)** - Copy-paste component library
- **[Radix UI](https://www.radix-ui.com)** - Unstyled, accessible UI components
- **[Lucide React](https://lucide.dev)** - Beautiful icon library

## Tailwind CSS

This project uses **Tailwind CSS v4**, a utility-first CSS framework that enables you to rapidly build modern user interfaces.

### Features
- 🎨 Utility-first design philosophy
- 📱 Responsive design support
- 🌙 Dark mode support
- ⚡ Lightning-fast build speed
- 🔧 Highly customizable

### Configuration Files
- CSS variables definition: `app/globals.css`
- PostCSS configuration: `postcss.config.mjs`

### Usage Examples
```tsx
// Basic styling
<div className="flex items-center justify-center min-h-screen bg-background">
  <h1 className="text-4xl font-bold text-foreground">Hello World</h1>
</div>

// Responsive design
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Content */}
</div>
```

## shadcn/ui

shadcn/ui is a component library built on Radix UI and Tailwind CSS, providing beautiful, accessible, and customizable React components.

### Features
- ✅ **Copy & Paste** - Copy component code into your project, full control
- 🎯 **Accessibility** - Built on Radix UI, follows WAI-ARIA standards
- 🎨 **Customizable** - Uses CSS variables, supports theme switching
- 🔧 **TypeScript** - Complete type support
- 📦 **Tree-shakable** - Only use the components you need

### Current Configuration
```json
{
  "style": "new-york",        // Using New York design style
  "baseColor": "neutral",     // Base color tone is neutral
  "cssVariables": true,       // Enable CSS variables
  "iconLibrary": "lucide"     // Use Lucide icon library
}
```

### Pre-installed Components
The project comes pre-installed with the following shadcn/ui components:

**Layout Components**
- `Card` - Card container
- `Separator` - Divider line
- `Sidebar` - Sidebar component
- `Sheet` - Drawer component

**Form Components**
- `Button` - Button
- `Input` - Input field
- `Textarea` - Multi-line input
- `Select` - Selector
- `Checkbox` - Checkbox
- `Radio Group` - Radio button group
- `Switch` - Toggle switch
- `Slider` - Slider

**Navigation Components**
- `Navigation Menu` - Navigation menu
- `Breadcrumb` - Breadcrumb
- `Pagination` - Pagination

**Feedback Components**
- `Alert` - Alert message
- `Alert Dialog` - Alert dialog
- `Dialog` - Dialog
- `Drawer` - Drawer
- `Tooltip` - Tooltip
- `Popover` - Popover
- `Progress` - Progress bar

### Adding New Components
Use shadcn/ui CLI to add new components:

```bash
# Add single component
pnpm dlx shadcn@latest add button

# Add multiple components
pnpm dlx shadcn@latest add card dialog sheet

# View all available components
pnpm dlx shadcn@latest add
```

### Usage Example
```tsx
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export default function Example() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Login</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input placeholder="Email address" type="email" />
        <Input placeholder="Password" type="password" />
        <Button className="w-full">Login</Button>
      </CardContent>
    </Card>
  )
}
```

## Theme System

The project supports dark/light mode switching, implemented through `next-themes`:

```tsx
import { useTheme } from "next-themes"

function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  
  return (
    <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
      Toggle Theme
    </button>
  )
}
```

## Development Guide

### Styling Best Practices
1. **Prioritize Tailwind CSS classes** - Avoid custom CSS
2. **Use CSS variables** - Convenient for theme switching and maintenance
3. **Follow design system** - Use predefined spacing, colors, etc.

### Component Development Workflow
1. Check [shadcn/ui component library](https://ui.shadcn.com/components)
2. Use CLI to add needed components
3. Customize component styles as needed
4. Ensure components support dark mode

## Getting Started

First, run the development server:

```bash
# Recommended: use pnpm
pnpm dev

# Or use other package managers
npm run dev
yarn dev
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Useful Resources

### Tailwind CSS
- [Official Documentation](https://tailwindcss.com/docs)
- [Tailwind UI](https://tailwindui.com) - Official component library
- [Tailwind Play](https://play.tailwindcss.com) - Online playground

### shadcn/ui
- [Official Documentation](https://ui.shadcn.com)
- [Component Library](https://ui.shadcn.com/components)
- [Theme Configuration](https://ui.shadcn.com/themes)
- [CLI Documentation](https://ui.shadcn.com/cli)

### Design Resources
- [Radix Colors](https://www.radix-ui.com/colors) - Color system
- [Lucide Icons](https://lucide.dev) - Icon library
- [Font: Geist](https://vercel.com/font) - Typography

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## VibeCoding Community

- 🌟 [VibeCoding Official Website](https://vibecoding.com)
- 💬 Join our developer community
- 📚 Explore more scaffolds and templates

---

**Happy Coding with VibeCoding! 🚀**
