-- 拾光集行级安全策略 (RLS Policies)

-- 用户资料表策略
CREATE POLICY "用户只能查看自己的资料" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "用户只能更新自己的资料" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "用户可以插入自己的资料" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 每日打卡表策略
CREATE POLICY "用户只能查看自己的打卡记录" ON check_ins
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "用户只能创建自己的打卡记录" ON check_ins
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户只能更新自己的打卡记录" ON check_ins
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "用户只能删除自己的打卡记录" ON check_ins
    FOR DELETE USING (auth.uid() = user_id);

-- 日记表策略
CREATE POLICY "用户只能查看自己的日记" ON diaries
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "用户只能创建自己的日记" ON diaries
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户只能更新自己的日记" ON diaries
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "用户只能删除自己的日记" ON diaries
    FOR DELETE USING (auth.uid() = user_id);

-- 媒体文件表策略
CREATE POLICY "用户只能查看自己的媒体文件" ON media
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "用户只能上传自己的媒体文件" ON media
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户只能更新自己的媒体文件" ON media
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "用户只能删除自己的媒体文件" ON media
    FOR DELETE USING (auth.uid() = user_id);

-- 标签表策略 (所有用户可以查看和创建标签)
CREATE POLICY "所有用户可以查看标签" ON tags
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "认证用户可以创建标签" ON tags
    FOR INSERT TO authenticated WITH CHECK (true);

-- 日记标签关联表策略
CREATE POLICY "用户只能查看自己日记的标签" ON diary_tags
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM diaries
            WHERE diaries.id = diary_tags.diary_id
            AND diaries.user_id = auth.uid()
        )
    );

CREATE POLICY "用户只能为自己的日记添加标签" ON diary_tags
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM diaries
            WHERE diaries.id = diary_tags.diary_id
            AND diaries.user_id = auth.uid()
        )
    );

CREATE POLICY "用户只能删除自己日记的标签" ON diary_tags
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM diaries
            WHERE diaries.id = diary_tags.diary_id
            AND diaries.user_id = auth.uid()
        )
    );