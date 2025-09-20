# 🚀 拾光集部署检查清单

## 📋 部署前准备

### ✅ 代码准备
- [ ] 所有功能开发完成
- [ ] TypeScript 类型检查通过 (`npm run type-check`)
- [ ] ESLint 检查通过 (`npm run lint`)
- [ ] 项目构建成功 (`npm run build`)
- [ ] 本地测试通过 (`npm run dev`)

### ✅ Git 仓库
- [ ] 代码已提交到本地 Git 仓库
- [ ] 创建了 GitHub 仓库
- [ ] 代码已推送到 GitHub

### ✅ Supabase 配置
- [ ] 创建了 Supabase 项目
- [ ] 运行了数据库迁移
- [ ] 配置了存储桶 (avatars, media)
- [ ] 测试了数据库连接
- [ ] 获取了项目 URL 和 API 密钥

## 🌐 部署步骤

### 1. GitHub 仓库设置
```bash
# 创建并推送到 GitHub
git remote add origin https://github.com/YOUR_USERNAME/shi-guang-ji.git
git branch -M main
git push -u origin main
```

### 2. Vercel 部署
- [ ] 访问 [Vercel](https://vercel.com) 并登录
- [ ] 点击 "New Project"
- [ ] 导入 GitHub 仓库
- [ ] 配置项目设置：
  - Framework: Next.js
  - Build Command: `npm run build`
  - Output Directory: `.next`
  - Install Command: `npm install`

### 3. 环境变量配置
在 Vercel 项目设置中添加：

| 变量名 | 值 | 说明 |
|--------|----|----|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxx.supabase.co` | Supabase 项目 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIs...` | Supabase 匿名密钥 |

### 4. 部署验证
- [ ] 部署成功完成
- [ ] 网站可以正常访问
- [ ] 用户注册功能正常
- [ ] 用户登录功能正常
- [ ] 数据库读写正常
- [ ] 文件上传功能正常

## 🔧 部署后配置

### 1. 域名配置（可选）
- [ ] 在 Vercel 中添加自定义域名
- [ ] 配置 DNS 记录
- [ ] 验证 SSL 证书

### 2. 监控设置
- [ ] 启用 Vercel Analytics
- [ ] 配置错误监控
- [ ] 设置性能监控

### 3. 安全检查
- [ ] 检查环境变量安全性
- [ ] 验证 RLS 策略
- [ ] 测试文件上传权限

## 🧪 功能测试清单

### 用户认证
- [ ] 用户注册
- [ ] 邮箱验证
- [ ] 用户登录
- [ ] 密码重置
- [ ] 用户登出

### 个人资料
- [ ] 查看个人信息
- [ ] 编辑个人信息
- [ ] 上传头像
- [ ] 更新头像

### 每日打卡
- [ ] 选择心情打卡
- [ ] 添加打卡备注
- [ ] 查看打卡历史
- [ ] 查看统计数据
- [ ] 打卡日历显示

### 日记功能
- [ ] 创建新日记
- [ ] 富文本编辑
- [ ] Markdown 支持
- [ ] 保存日记
- [ ] 查看日记列表
- [ ] 查看日记详情
- [ ] 编辑现有日记
- [ ] 删除日记
- [ ] 搜索日记

### 媒体库
- [ ] 上传图片
- [ ] 上传视频
- [ ] 上传音频
- [ ] 上传文档
- [ ] 文件预览
- [ ] 文件下载
- [ ] 文件删除
- [ ] 批量操作
- [ ] 搜索文件
- [ ] 筛选文件类型

### 响应式设计
- [ ] 桌面端显示正常
- [ ] 平板端显示正常
- [ ] 手机端显示正常
- [ ] 触摸操作正常

## 🚨 常见问题解决

### 构建失败
```bash
# 检查类型错误
npm run type-check

# 检查语法错误
npm run lint

# 清理缓存重新构建
rm -rf .next node_modules
npm install
npm run build
```

### 环境变量问题
- 检查变量名拼写
- 确保没有多余空格
- 验证 Supabase 配置

### 数据库连接问题
- 检查 Supabase 项目状态
- 验证 URL 和密钥
- 检查网络连接

### 文件上传问题
- 检查存储桶配置
- 验证 RLS 策略
- 检查文件大小限制

## 📊 性能优化

### 图片优化
- [ ] 启用 Next.js Image 优化
- [ ] 配置图片压缩
- [ ] 使用 WebP 格式

### 缓存策略
- [ ] 配置 CDN 缓存
- [ ] 启用浏览器缓存
- [ ] 使用 SWR 缓存

### 代码优化
- [ ] 代码分割
- [ ] 懒加载组件
- [ ] 优化包大小

## 🎯 部署完成确认

- [ ] 所有功能测试通过
- [ ] 性能指标达标
- [ ] 安全检查完成
- [ ] 监控配置就绪
- [ ] 文档更新完成

## 🎉 部署成功！

恭喜您成功部署了拾光集应用！

### 下一步
1. 分享应用链接给用户
2. 收集用户反馈
3. 持续优化和更新
4. 监控应用性能

### 维护建议
- 定期备份数据
- 监控错误日志
- 更新依赖包
- 优化性能指标

---

**部署 URL**: https://shi-guang-ji.vercel.app
**GitHub 仓库**: https://github.com/YOUR_USERNAME/shi-guang-ji
**Supabase 项目**: https://app.supabase.com/project/YOUR_PROJECT_ID
