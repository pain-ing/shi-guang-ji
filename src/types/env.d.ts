/// <reference types="node" />

declare namespace NodeJS {
  interface ProcessEnv {
    // Supabase配置
    NEXT_PUBLIC_SUPABASE_URL: string
    NEXT_PUBLIC_SUPABASE_ANON_KEY: string
    SUPABASE_SERVICE_ROLE_KEY?: string
    
    // 应用配置
    NEXT_PUBLIC_APP_URL?: string
    NODE_ENV: 'development' | 'production' | 'test'
    
    // Vercel环境变量
    VERCEL?: string
    VERCEL_ENV?: 'production' | 'preview' | 'development'
    VERCEL_URL?: string
    VERCEL_REGION?: string
    
    // 其他可选配置
    ANALYZE?: string
    NEXT_PUBLIC_GA_ID?: string
  }
}

// 确保文件被视为模块
export {}
