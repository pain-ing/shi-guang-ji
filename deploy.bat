@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo 🚀 开始部署拾光集应用...

REM 检查是否在正确的目录
if not exist "package.json" (
    echo ❌ 错误：请在项目根目录运行此脚本
    pause
    exit /b 1
)

echo ✅ 项目目录检查通过

REM 安装依赖
echo 📦 安装依赖...
call npm install

if !errorlevel! neq 0 (
    echo ❌ 依赖安装失败
    pause
    exit /b 1
)

echo ✅ 依赖安装完成

REM 类型检查
echo 🔍 进行类型检查...
call npm run type-check

if !errorlevel! neq 0 (
    echo ❌ TypeScript 类型检查失败
    pause
    exit /b 1
)

echo ✅ 类型检查通过

REM 代码检查
echo 🔍 进行代码检查...
call npm run lint

if !errorlevel! neq 0 (
    echo ⚠️  代码检查发现问题，但继续部署
)

REM 构建项目
echo 🏗️  构建项目...
call npm run build

if !errorlevel! neq 0 (
    echo ❌ 项目构建失败
    pause
    exit /b 1
)

echo ✅ 项目构建完成

REM 检查环境变量
echo 🔧 检查环境变量...
if exist ".env.local" (
    echo ✅ 找到本地环境变量文件
) else (
    echo ⚠️  未找到 .env.local 文件，请确保在生产环境中配置环境变量
)

REM Git 操作
echo 📝 准备提交代码...
git add .
git status

set /p commit_choice="是否要提交并推送代码到 GitHub？(y/n): "
if /i "!commit_choice!"=="y" (
    set /p commit_message="请输入提交信息: "
    git commit -m "!commit_message!"
    
    REM 检查是否有远程仓库
    git remote get-url origin >nul 2>&1
    if !errorlevel! equ 0 (
        echo 📤 推送到 GitHub...
        git push origin main
        echo ✅ 代码已推送到 GitHub
    ) else (
        echo ⚠️  未配置远程仓库，请手动添加：
        echo git remote add origin https://github.com/YOUR_USERNAME/shi-guang-ji.git
        echo git push -u origin main
    )
)

echo.
echo 🎉 部署准备完成！
echo.
echo 📋 下一步操作：
echo 1. 在 GitHub 上创建仓库（如果还没有）
echo 2. 推送代码到 GitHub
echo 3. 在 Vercel 上连接 GitHub 仓库
echo 4. 配置环境变量：
echo    - NEXT_PUBLIC_SUPABASE_URL
echo    - NEXT_PUBLIC_SUPABASE_ANON_KEY
echo 5. 部署应用
echo.
echo 📖 详细部署指南请查看 DEPLOYMENT.md 文件
echo.
echo 🌐 预期的部署 URL: https://shi-guang-ji.vercel.app
echo.
echo ✨ 祝您部署顺利！
echo.
pause
