@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo 🚀 拾光集 GitHub Release 创建脚本
echo =====================================

REM 检查是否安装了GitHub CLI
gh --version >nul 2>&1
if !errorlevel! neq 0 (
    echo ❌ 未检测到GitHub CLI
    echo 请先安装GitHub CLI: winget install GitHub.cli
    echo 或访问: https://cli.github.com/
    pause
    exit /b 1
)

echo ✅ GitHub CLI 已安装

REM 检查是否已登录
gh auth status >nul 2>&1
if !errorlevel! neq 0 (
    echo 🔐 需要登录GitHub...
    gh auth login
    if !errorlevel! neq 0 (
        echo ❌ GitHub登录失败
        pause
        exit /b 1
    )
)

echo ✅ GitHub 身份验证通过

REM 推送代码到GitHub
echo 📤 推送代码到GitHub...
git push -u origin main
if !errorlevel! neq 0 (
    echo ⚠️  代码推送失败，但继续创建Release
    echo 请手动推送代码: git push -u origin main
)

REM 创建Release
echo 🏷️  创建Release v1.0.1...
gh release create v1.0.1 ^
  --title "拾光集 v1.0.1 - 运行配置优化版本" ^
  --notes-file RELEASE_NOTES_v1.0.1.md ^
  --target main

if !errorlevel! neq 0 (
    echo ❌ Release创建失败
    echo 请检查网络连接和权限设置
    pause
    exit /b 1
)

echo ✅ Release v1.0.1 创建成功！

REM 检查是否有Electron构建产物
if exist "shi-guang-ji\dist" (
    echo 📦 检测到构建产物，正在上传...
    cd shi-guang-ji
    for %%f in (dist\*.exe dist\*.dmg dist\*.AppImage) do (
        if exist "%%f" (
            echo 上传: %%f
            gh release upload v1.0.1 "%%f"
        )
    )
    cd ..
) else (
    echo ℹ️  未检测到Electron构建产物
    echo 如需构建，请运行: cd shi-guang-ji && npm run dist
)

echo.
echo 🎉 操作完成！
echo 📍 访问Release页面: https://github.com/pain-ing/shi-guang-ji/releases/tag/v1.0.1
echo.
pause
