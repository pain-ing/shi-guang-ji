# Git仓库设置和Release发布指南

## 📋 当前状态

✅ **已完成**：
- 项目配置优化和跨平台兼容性修复
- 代码已提交到本地Git仓库
- Next.js构建验证成功
- Release Notes已准备完成

⚠️ **待完成**：
- 设置远程Git仓库
- 推送代码到远程仓库
- 创建GitHub Release
- Electron构建产物生成

## 🚀 操作步骤

### 步骤1：创建GitHub仓库

1. **登录GitHub**并创建新仓库：
   - 仓库名称：`shi-guang-ji`
   - 描述：`拾光集 - 个人生活记录应用`
   - 设置为Public或Private（根据需要）
   - 不要初始化README（因为本地已有代码）

2. **复制仓库URL**（例如）：
   ```
   https://github.com/your-username/shi-guang-ji.git
   ```

### 步骤2：配置远程仓库

在项目根目录执行以下命令：

```bash
# 添加远程仓库
git remote add origin https://github.com/your-username/shi-guang-ji.git

# 验证远程仓库配置
git remote -v

# 推送代码到远程仓库
git push -u origin main
```

如果遇到分支名称问题，可能需要：
```bash
# 检查当前分支
git branch

# 如果是master分支，重命名为main
git branch -M main

# 然后推送
git push -u origin main
```

### 步骤3：创建GitHub Release

#### 方法1：通过GitHub网页界面

1. **访问仓库页面**：`https://github.com/your-username/shi-guang-ji`

2. **点击"Releases"**标签页

3. **点击"Create a new release"**

4. **填写Release信息**：
   - **Tag version**: `v1.0.1`
   - **Release title**: `拾光集 v1.0.1 - 运行配置优化版本`
   - **Description**: 复制`RELEASE_NOTES_v1.0.1.md`的内容

5. **上传构建产物**（如果有）：
   - 拖拽`.exe`、`.dmg`、`.AppImage`文件到附件区域

6. **发布Release**：点击"Publish release"

#### 方法2：通过GitHub CLI（可选）

如果安装了GitHub CLI：

```bash
# 安装GitHub CLI（如果未安装）
# Windows: winget install GitHub.cli
# macOS: brew install gh
# Linux: 参考官方文档

# 登录GitHub
gh auth login

# 创建Release
gh release create v1.0.1 \
  --title "拾光集 v1.0.1 - 运行配置优化版本" \
  --notes-file RELEASE_NOTES_v1.0.1.md
```

### 步骤4：Electron构建故障排除

如果Electron构建失败，尝试以下解决方案：

#### 4.1 检查图标文件
```bash
cd shi-guang-ji
# 确保图标文件存在
ls public/icon.ico
ls public/icon.png
ls public/icon.icns  # macOS需要
```

#### 4.2 清理并重新构建
```bash
cd shi-guang-ji
# 清理缓存
npm run clean  # 如果有这个脚本
rm -rf node_modules/.cache
rm -rf .next

# 重新安装依赖
npm install

# 重新构建
npm run build:standalone
npm run electron:build
```

#### 4.3 检查构建日志
```bash
cd shi-guang-ji
# 查看详细构建日志
npm run electron:build -- --verbose
```

#### 4.4 简化构建配置

如果仍有问题，可以临时修改`electron-builder.config.js`：

```javascript
module.exports = {
  appId: "com.shiguangji.app",
  productName: "拾光集",
  directories: {
    output: "dist"
  },
  files: [
    "electron-main.js",
    "preload.js",
    ".next/standalone/**/*",
    "public/**/*"
  ],
  win: {
    target: "portable"  // 简化为portable版本
  },
  npmRebuild: false,
  nodeGypRebuild: false
};
```

## 🔧 常见问题解决

### Q1: 推送时要求身份验证
**解决方案**：
- 使用Personal Access Token代替密码
- 或配置SSH密钥

### Q2: 分支保护规则阻止推送
**解决方案**：
- 检查仓库设置中的分支保护规则
- 或推送到其他分支后创建Pull Request

### Q3: Electron构建产物未生成
**解决方案**：
- 检查`dist`目录是否在`.gitignore`中
- 确保所有依赖项正确安装
- 查看构建日志中的错误信息

## 📝 下一步建议

1. **设置CI/CD**：
   - 配置GitHub Actions自动构建
   - 自动化测试和部署流程

2. **代码签名**：
   - 为Windows和macOS应用添加代码签名
   - 提升用户安装体验

3. **自动更新**：
   - 集成electron-updater
   - 实现应用自动更新功能

## 🎯 快速执行清单

- [ ] 创建GitHub仓库
- [ ] 配置远程仓库：`git remote add origin <URL>`
- [ ] 推送代码：`git push -u origin main`
- [ ] 创建Release：使用`RELEASE_NOTES_v1.0.1.md`内容
- [ ] 解决Electron构建问题（如需要）
- [ ] 上传构建产物到Release

---

**需要帮助？** 请查看GitHub官方文档或提交Issue获取支持。
