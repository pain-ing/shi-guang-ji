# Supabase 设置指南

## 1. 创建 Supabase 项目

1. 访问 [Supabase](https://supabase.com) 并注册账户
2. 点击 "New Project" 创建新项目
3. 选择组织，输入项目名称：`shi-guang-ji`
4. 设置数据库密码（请记住此密码）
5. 选择地区（建议选择离您最近的地区）
6. 点击 "Create new project"

## 2. 获取项目配置

项目创建完成后：

1. 在项目仪表板中，点击左侧的 "Settings" → "API"
2. 复制以下信息：
   - **Project URL**: `https://your-project-id.supabase.co`
   - **anon public key**: `eyJ...` (很长的字符串)

## 3. 配置环境变量

1. 复制 `.env.example` 文件为 `.env.local`
2. 替换环境变量：

```bash
# 替换为您的实际配置
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 4. 运行数据库迁移

### 方法一：使用 Supabase CLI（推荐）

```bash
# 关联远程项目
npx supabase link --project-ref your-project-id

# 推送迁移到远程数据库
npx supabase db push
```

### 方法二：手动执行 SQL

1. 在 Supabase 仪表板中，点击左侧的 "SQL Editor"
2. 依次执行以下迁移文件中的 SQL：
   - `supabase/migrations/20250906131748_create_initial_schema.sql`
   - `supabase/migrations/20250906131825_create_rls_policies.sql`
   - `supabase/migrations/20250906131855_create_profile_trigger.sql`

## 5. 配置存储桶

1. 在 Supabase 仪表板中，点击左侧的 "Storage"
2. 点击 "Create a new bucket"
3. 创建名为 `media` 的存储桶
4. 设置为 Private（私有）
5. 在存储桶设置中添加以下策略：

```sql
-- 允许认证用户上传文件
CREATE POLICY "用户可以上传自己的文件" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (
  bucket_id = 'media' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 允许用户查看自己的文件
CREATE POLICY "用户可以查看自己的文件" ON storage.objects
FOR SELECT TO authenticated USING (
  bucket_id = 'media' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 允许用户删除自己的文件
CREATE POLICY "用户可以删除自己的文件" ON storage.objects
FOR DELETE TO authenticated USING (
  bucket_id = 'media' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);
```

## 6. 验证设置

运行以下命令验证配置：

```bash
npm run dev
```

如果没有错误，说明 Supabase 配置成功！

## 故障排除

### 常见问题

1. **环境变量错误**：确保 `.env.local` 文件在项目根目录，且变量名正确
2. **迁移失败**：检查 SQL 语法，确保按顺序执行
3. **连接失败**：检查项目 URL 和 API 密钥是否正确

### 获取帮助

- [Supabase 官方文档](https://supabase.com/docs)
- [Next.js + Supabase 教程](https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs)
