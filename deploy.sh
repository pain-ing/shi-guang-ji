#!/bin/bash

# 拾光集快速部署脚本

echo "🚀 开始部署拾光集应用..."

# 检查是否在正确的目录
if [ ! -f "package.json" ]; then
    echo "❌ 错误：请在项目根目录运行此脚本"
    exit 1
fi

# 检查 Node.js 版本
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ 错误：需要 Node.js 18 或更高版本"
    exit 1
fi

echo "✅ Node.js 版本检查通过"

# 安装依赖
echo "📦 安装依赖..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ 依赖安装失败"
    exit 1
fi

echo "✅ 依赖安装完成"

# 类型检查
echo "🔍 进行类型检查..."
npm run type-check

if [ $? -ne 0 ]; then
    echo "❌ TypeScript 类型检查失败"
    exit 1
fi

echo "✅ 类型检查通过"

# 代码检查
echo "🔍 进行代码检查..."
npm run lint

if [ $? -ne 0 ]; then
    echo "⚠️  代码检查发现问题，但继续部署"
fi

# 构建项目
echo "🏗️  构建项目..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ 项目构建失败"
    exit 1
fi

echo "✅ 项目构建完成"

# 检查环境变量
echo "🔧 检查环境变量..."
if [ -f ".env.local" ]; then
    echo "✅ 找到本地环境变量文件"
else
    echo "⚠️  未找到 .env.local 文件，请确保在生产环境中配置环境变量"
fi

# Git 操作
echo "📝 提交代码..."
git add .
git status

read -p "是否要提交并推送代码到 GitHub？(y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "请输入提交信息: " commit_message
    git commit -m "$commit_message"
    
    # 检查是否有远程仓库
    if git remote get-url origin > /dev/null 2>&1; then
        echo "📤 推送到 GitHub..."
        git push origin main
        echo "✅ 代码已推送到 GitHub"
    else
        echo "⚠️  未配置远程仓库，请手动添加："
        echo "git remote add origin https://github.com/YOUR_USERNAME/shi-guang-ji.git"
        echo "git push -u origin main"
    fi
fi

echo ""
echo "🎉 部署准备完成！"
echo ""
echo "📋 下一步操作："
echo "1. 在 GitHub 上创建仓库（如果还没有）"
echo "2. 推送代码到 GitHub"
echo "3. 在 Vercel 上连接 GitHub 仓库"
echo "4. 配置环境变量："
echo "   - NEXT_PUBLIC_SUPABASE_URL"
echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "5. 部署应用"
echo ""
echo "📖 详细部署指南请查看 DEPLOYMENT.md 文件"
echo ""
echo "🌐 预期的部署 URL: https://shi-guang-ji.vercel.app"
echo ""
echo "✨ 祝您部署顺利！"
