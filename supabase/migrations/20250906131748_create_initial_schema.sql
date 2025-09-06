-- 拾光集数据库初始化脚本
-- 创建用户资料表
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(50),
    avatar_url TEXT,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建每日打卡表
CREATE TABLE check_ins (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    mood VARCHAR(20) NOT NULL,
    note TEXT,
    created_at DATE DEFAULT CURRENT_DATE,
    UNIQUE(user_id, created_at)
);

-- 创建日记表
CREATE TABLE diaries (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建媒体文件表
CREATE TABLE media (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    file_path TEXT NOT NULL,
    file_type VARCHAR(10) NOT NULL CHECK (file_type IN ('image', 'video')),
    file_size BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建标签表
CREATE TABLE tags (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建日记标签关联表
CREATE TABLE diary_tags (
    diary_id BIGINT REFERENCES diaries(id) ON DELETE CASCADE,
    tag_id BIGINT REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (diary_id, tag_id)
);

-- 创建索引以提高查询性能
CREATE INDEX idx_check_ins_user_date ON check_ins(user_id, created_at);
CREATE INDEX idx_diaries_user_created ON diaries(user_id, created_at DESC);
CREATE INDEX idx_media_user_created ON media(user_id, created_at DESC);
CREATE INDEX idx_media_type ON media(file_type);

-- 启用行级安全策略 (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE diaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE diary_tags ENABLE ROW LEVEL SECURITY;