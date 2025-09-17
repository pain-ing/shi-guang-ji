const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'supabase-cache',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60 // 24 hours
        }
      }
    },
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'images-cache',
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
        }
      }
    },
    {
      urlPattern: /\.(?:js|css)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-resources'
      }
    }
  ]
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    // 优化图片格式
    formats: ['image/avif', 'image/webp'],
    // 减少同时加载的图片数量
    deviceSizes: [640, 750, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96],
  },
  
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // 实验性功能 - 优化内存使用
  experimental: {
    webpackBuildWorker: true,
    // 优化服务器组件
    serverComponentsExternalPackages: ['sharp', 'jimp'],
    // 优化客户端bundle
    optimizeCss: true,
  },
  
  // Webpack优化配置
  webpack: (config, { isServer }) => {
    // 生产环境优化
    if (!isServer) {
      // 替换大型库为轻量替代品
      config.resolve.alias = {
        ...config.resolve.alias,
        // 使用轻量级的moment替代date-fns的部分功能
        '@tiptap/starter-kit': false,
        '@tiptap/extension-image': false,
        '@tiptap/extension-link': false,
      }
      
      // 代码分割策略
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            // 分离大型库
            recharts: {
              test: /[\\/]node_modules[\\/]recharts[\\/]/,
              name: 'recharts',
              priority: 30,
              reuseExistingChunk: true,
            },
            tiptap: {
              test: /[\\/]node_modules[\\/]@tiptap[\\/]/,
              name: 'tiptap',
              priority: 25,
              reuseExistingChunk: true,
            },
            radix: {
              test: /[\\/]node_modules[\\/]@radix-ui[\\/]/,
              name: 'radix',
              priority: 20,
              reuseExistingChunk: true,
            },
            commons: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              priority: 10,
              reuseExistingChunk: true,
              minSize: 20000,
            },
          },
        },
        // 最小化配置
        minimize: true,
        usedExports: true,
        sideEffects: false,
      }
    }
    
    // 忽略不需要的模块
    config.externals = {
      ...config.externals,
      'sharp': 'commonjs sharp',
      'jimp': 'commonjs jimp',
      'electron': 'commonjs electron',
    }
    
    return config
  },
  
  // 压缩配置
  compress: true,
  
  // 生产源码映射优化
  productionBrowserSourceMaps: false,
  
  // SWC编译器优化
  swcMinify: true,
}

module.exports = withPWA(nextConfig)