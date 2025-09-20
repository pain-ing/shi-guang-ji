import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    const title = formData.get('title') as string
    const text = formData.get('text') as string
    const url = formData.get('url') as string
    const files = formData.getAll('files') as File[]

    console.log('收到分享数据:', { title, text, url, files: files.length })

    // 这里可以处理分享的内容
    // 例如：保存到数据库、上传文件等
    
    // 重定向到相应的页面
    if (files.length > 0) {
      // 有文件分享，重定向到媒体页面
      return NextResponse.redirect(new URL('/media', request.url))
    } else if (text || title) {
      // 有文本内容，重定向到日记创建页面
      const searchParams = new URLSearchParams()
      if (title) searchParams.set('title', title)
      if (text) searchParams.set('content', text)
      if (url) searchParams.set('url', url)
      
      return NextResponse.redirect(new URL(`/diary/new?${searchParams.toString()}`, request.url))
    } else {
      // 默认重定向到仪表板
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  } catch (error) {
    console.error('处理分享数据时出错:', error)
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
}

export async function GET(request: NextRequest) {
  // 处理GET请求，重定向到仪表板
  return NextResponse.redirect(new URL('/dashboard', request.url))
}
