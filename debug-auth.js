// 调试认证问题的脚本
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('=== 认证调试信息 ===')
console.log('Supabase URL:', supabaseUrl ? '已配置' : '未配置')
console.log('Supabase Anon Key:', supabaseAnonKey ? '已配置' : '未配置')

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ 环境变量未正确配置')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testAuth() {
  try {
    // 测试连接
    console.log('\n=== 测试 Supabase 连接 ===')
    const { data, error } = await supabase.auth.getSession()
    if (error) {
      console.error('连接错误:', error.message)
    } else {
      console.log('✅ 连接成功')
    }

    // 测试用户列表（需要 service role key）
    console.log('\n=== 建议检查项目 ===')
    console.log('1. 检查 Supabase 项目是否正常运行')
    console.log('2. 检查 Auth 设置中的邮箱确认配置')
    console.log('3. 检查用户是否已创建但未确认')
    console.log('4. 检查 RLS 策略是否正确')
    
  } catch (error) {
    console.error('测试失败:', error.message)
  }
}

testAuth()
