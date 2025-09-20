# 拾光集 - 个人时光记录应用

一个现代化的个人时光记录应用，帮助您记录生活中的美好时光。

## 🚀 最新版本 v1.1.0 性能优化版

### 📥 快速下载

**Windows 用户**：[下载 v1.1.0 优化版](https://github.com/pain-ing/shi-guang-ji/releases/tag/v1.1.0-optimized)

1. 下载 `拾光集-v1.1.0-optimized-win64.zip`
2. 解压后运行 `拾光集.exe`
3. 首次运行可能需要管理员权限

### 🎯 性能优化亮点

- **组件复杂度降低 78%** - ShareCardGenerator 从 733 行优化至 157 行
- **Canvas 动画系统** - 使用对象池技术优化樱花动画性能
- **虚拟滚动** - 实现高性能大数据集渲染
- **内存泄漏修复** - 修复定时器和事件监听器内存泄漏问题
- **实时性能监控** - 集成 FPS 和内存使用监控

### 💻 系统要求

#### Windows 桌面版
- Windows 10/11 (64位)
- 内存: 4GB 以上推荐
- 磁盘空间: 500MB 可用空间

#### Web 版本
- 现代浏览器 (Chrome 90+, Firefox 88+, Safari 14+)
- 支持 PWA 安装

## ✨ 功能特色

### 🎯 核心功能
- **每日打卡** - 记录每天的心情状态，支持8种心情选择
- **日记编写** - 富文本编辑器，支持 Markdown 语法
- **媒体库** - 上传和管理图片、视频、音频、文档
- **个人资料** - 完整的用户信息管理

### 📊 数据统计
- 连续打卡天数统计
- 心情分布分析
- 写作统计和进度跟踪
- 媒体文件存储统计

### 🎨 用户体验
- 响应式设计，完美适配桌面端和移动端
- 自动保存功能，防止数据丢失
- 搜索和筛选功能
- 批量操作支持


## 🌸 装饰系统（DecorationsProvider）
- 全局统一承载樱花、星光等装饰效果；支持在主题设置中开关与调节
- 路由范围：支持 all / include / exclude，列表项为路由前缀（如 /dashboard）
- 参数建议：
  - 樱花密度 30~60，速度 1.0；移动端或性能较弱设备建议密度 ≤ 30
  - 星光密度 10~40；与樱花可叠加
- 生产构建：测试文件不会打包；且已通过 .eslintignore 排除测试文件的构建期 ESLint 校验


## 🛠️ 技术栈

- **前端框架**: Next.js 14 + TypeScript
- **样式**: Tailwind CSS + Shadcn/ui
- **状态管理**: Zustand
- **数据库**: Supabase (PostgreSQL)
- **认证**: Supabase Auth
- **存储**: Supabase Storage
- **富文本编辑**: TipTap
- **桌面应用**: Electron
- **PWA**: Service Worker + 离线支持
- **性能优化**: React.memo, useMemo, useCallback
- **动画系统**: Canvas + 对象池技术
- **虚拟化**: 自定义虚拟滚动组件
- **部署**: Vercel

## 🚀 快速开始

### 方式一：下载桌面版（推荐）

直接下载最新的 [Windows 桌面版](https://github.com/pain-ing/shi-guang-ji/releases/tag/v1.1.0-optimized)，无需安装依赖。

### 方式二：本地开发

#### 环境要求
- Node.js 18+
- npm 或 yarn

#### 安装依赖
```bash
npm install
```

### 环境配置
创建 `.env.local` 文件并配置以下环境变量：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 启动开发服务器
```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

### 构建生产版本
```bash
npm run build
npm start
```

#### 构建桌面版

```bash
# 构建 Windows 版本
npm run electron:build:win

# 构建 macOS 版本
npm run electron:build:mac

# 构建 Linux 版本
npm run electron:build:linux
```

## 📁 项目结构

```
shi-guang-ji/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # 认证相关页面
│   │   └── (dashboard)/       # 仪表板页面
│   ├── components/            # React 组件
│   │   ├── ui/               # UI 基础组件
│   │   ├── auth/             # 认证组件
│   │   ├── check-in/         # 打卡组件
│   │   ├── diary/            # 日记组件
│   │   ├── media/            # 媒体组件
│   │   ├── layout/           # 布局组件
│   │   ├── common/           # 通用组件 (VirtualList 等)
│   │   ├── analytics/        # 数据分析组件
│   │   ├── decorations/      # 装饰动画组件
│   │   └── performance/      # 性能监控组件
│   ├── stores/               # Zustand 状态管理
│   ├── hooks/                # 自定义 Hooks
│   ├── lib/                  # 工具库
│   ├── utils/                # 工具函数
│   │   └── performanceMonitor.ts  # 性能监控工具
│   └── types/                # TypeScript 类型定义
├── supabase/                 # Supabase 配置和迁移
├── docs/                     # 项目文档
├── electron-main.js          # Electron 主进程
└── electron-builder.config.js # Electron 构建配置
```

## 🗄️ 数据库设计

### 主要数据表
- `profiles` - 用户资料
- `check_ins` - 每日打卡记录
- `diaries` - 日记内容
- `media_files` - 媒体文件信息

### 安全策略
- 行级安全策略 (RLS) 确保数据隔离
- JWT 认证保护 API 访问
- 文件上传权限控制

## ⚡ 性能优化详情

### React 优化
- 全面使用 `React.memo`、`useMemo`、`useCallback`
- 组件拆分和模块化设计
- 避免不必要的重渲染

### 动画优化
- Canvas 基础的粒子动画系统
- 对象池技术减少 GC 压力
- 帧率控制和可见性检测

### 内存管理
- 定时器生命周期管理
- 事件监听器自动清理
- 内存泄漏检测和修复

### 构建优化
- Webpack 配置优化
- 代码分割和懒加载
- Bundle 大小优化

## 🎨 设计系统

使用 Shadcn/ui 组件库，提供：
- 一致的设计语言
- 可访问性支持
- 暗色主题支持
- 响应式设计

## 📱 功能截图

### 每日打卡
- 心情选择器
- 打卡日历
- 统计分析

### 日记编写
- 富文本编辑器
- Markdown 支持
- 自动保存

### 媒体库
- 拖拽上传
- 文件预览
- 批量管理

## 🚀 部署

### Vercel 部署
1. 连接 GitHub 仓库
2. 配置环境变量
3. 自动部署

### 环境变量配置
在 Vercel 中配置以下环境变量：
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 🙏 致谢

感谢以下开源项目：
- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Shadcn/ui](https://ui.shadcn.com/)
- [TipTap](https://tiptap.dev/)
