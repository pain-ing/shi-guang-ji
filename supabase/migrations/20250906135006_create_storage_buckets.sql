-- 创建存储桶和相关策略

-- 创建头像存储桶
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true);

-- 创建媒体文件存储桶
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', false);

-- 头像存储桶策略
-- 允许认证用户上传自己的头像
CREATE POLICY "用户可以上传自己的头像" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 允许认证用户更新自己的头像
CREATE POLICY "用户可以更新自己的头像" ON storage.objects
FOR UPDATE TO authenticated USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 允许认证用户删除自己的头像
CREATE POLICY "用户可以删除自己的头像" ON storage.objects
FOR DELETE TO authenticated USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 允许所有人查看头像（公共读取）
CREATE POLICY "所有人可以查看头像" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

-- 媒体文件存储桶策略
-- 允许认证用户上传自己的媒体文件
CREATE POLICY "用户可以上传自己的媒体文件" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (
  bucket_id = 'media' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 允许用户查看自己的媒体文件
CREATE POLICY "用户可以查看自己的媒体文件" ON storage.objects
FOR SELECT TO authenticated USING (
  bucket_id = 'media' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 允许用户更新自己的媒体文件
CREATE POLICY "用户可以更新自己的媒体文件" ON storage.objects
FOR UPDATE TO authenticated USING (
  bucket_id = 'media' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 允许用户删除自己的媒体文件
CREATE POLICY "用户可以删除自己的媒体文件" ON storage.objects
FOR DELETE TO authenticated USING (
  bucket_id = 'media' AND
  auth.uid()::text = (storage.foldername(name))[1]
);