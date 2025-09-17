'use client'

import { useState, useEffect, useRef, memo } from 'react'
import Image from 'next/image'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  quality?: number
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  onLoad?: () => void
  onError?: () => void
}

// Generate a simple blur placeholder
const generateBlurPlaceholder = (width: number = 10, height: number = 10): string => {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (ctx) {
    // Create a simple gradient as placeholder
    const gradient = ctx.createLinearGradient(0, 0, width, height)
    gradient.addColorStop(0, '#f3f4f6')
    gradient.addColorStop(1, '#e5e7eb')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)
  }
  return canvas.toDataURL()
}

// Intersection Observer for lazy loading
const useIntersectionObserver = (
  ref: React.RefObject<HTMLElement>,
  options: IntersectionObserverInit = {}
) => {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [hasIntersected, setHasIntersected] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element || hasIntersected) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isCurrentlyIntersecting = entry.isIntersecting
        setIsIntersecting(isCurrentlyIntersecting)
        if (isCurrentlyIntersecting) {
          setHasIntersected(true)
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options
      }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [ref, options, hasIntersected])

  return { isIntersecting, hasIntersected }
}

// Optimized Image Component with lazy loading
export const OptimizedImage = memo(({
  src,
  alt,
  width = 400,
  height = 300,
  className = '',
  priority = false,
  quality = 75,
  placeholder = 'blur',
  blurDataURL,
  onLoad,
  onError
}: OptimizedImageProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const { hasIntersected } = useIntersectionObserver(containerRef, {
    rootMargin: '100px'
  })
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [localBlurDataURL, setLocalBlurDataURL] = useState(blurDataURL || '')

  useEffect(() => {
    if (!blurDataURL && placeholder === 'blur') {
      setLocalBlurDataURL(generateBlurPlaceholder())
    }
  }, [blurDataURL, placeholder])

  const shouldLoad = priority || hasIntersected

  const handleLoad = () => {
    setIsLoaded(true)
    onLoad?.()
  }

  const handleError = () => {
    setHasError(true)
    onError?.()
  }

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      style={{ width, height }}
    >
      {hasError ? (
        // Error state
        <div className="flex items-center justify-center w-full h-full bg-gray-100 rounded">
          <div className="text-center p-4">
            <svg 
              className="w-12 h-12 mx-auto mb-2 text-gray-400"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm text-gray-500">加载失败</p>
          </div>
        </div>
      ) : shouldLoad ? (
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          quality={quality}
          priority={priority}
          placeholder={placeholder}
          blurDataURL={localBlurDataURL}
          onLoad={handleLoad}
          onError={handleError}
          className={`transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            objectFit: 'cover',
            width: '100%',
            height: '100%'
          }}
        />
      ) : (
        // Skeleton loader
        <div className="animate-pulse w-full h-full bg-gray-200" />
      )}
    </div>
  )
})

OptimizedImage.displayName = 'OptimizedImage'

// Gallery component with optimized loading
interface GalleryImage {
  id: string
  src: string
  alt: string
  width?: number
  height?: number
}

interface OptimizedGalleryProps {
  images: GalleryImage[]
  columns?: number
  gap?: number
  onImageClick?: (image: GalleryImage) => void
}

export const OptimizedGallery = memo(({
  images,
  columns = 3,
  gap = 16,
  onImageClick
}: OptimizedGalleryProps) => {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set())

  const handleImageLoad = (imageId: string) => {
    setLoadedImages(prev => new Set([...prev, imageId]))
  }

  return (
    <div 
      className="grid"
      style={{
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: `${gap}px`
      }}
    >
      {images.map((image, index) => (
        <div 
          key={image.id}
          className="cursor-pointer transition-transform hover:scale-105"
          onClick={() => onImageClick?.(image)}
        >
          <OptimizedImage
            src={image.src}
            alt={image.alt}
            width={image.width || 300}
            height={image.height || 300}
            priority={index < 6} // Load first 6 images with priority
            onLoad={() => handleImageLoad(image.id)}
            className="rounded-lg shadow-md"
          />
        </div>
      ))}
    </div>
  )
})

OptimizedGallery.displayName = 'OptimizedGallery'

// Thumbnail generator for previews
export const generateThumbnail = async (
  file: File,
  maxWidth: number = 200,
  maxHeight: number = 200
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      const img = new window.Image()
      
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        if (!ctx) {
          reject(new Error('Failed to get canvas context'))
          return
        }
        
        // Calculate dimensions
        let width = img.width
        let height = img.height
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width
            width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height
            height = maxHeight
          }
        }
        
        canvas.width = width
        canvas.height = height
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height)
        
        // Convert to compressed JPEG
        const dataURL = canvas.toDataURL('image/jpeg', 0.7)
        resolve(dataURL)
      }
      
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = e.target?.result as string
    }
    
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

// Export utilities
export const imageUtils = {
  // Check if image is in viewport
  isImageInViewport: (element: HTMLElement): boolean => {
    const rect = element.getBoundingClientRect()
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    )
  },
  
  // Preload images
  preloadImages: (urls: string[]): Promise<void[]> => {
    return Promise.all(
      urls.map(url => {
        return new Promise<void>((resolve, reject) => {
          const img = new window.Image()
          img.onload = () => resolve()
          img.onerror = () => reject(new Error(`Failed to preload ${url}`))
          img.src = url
        })
      })
    )
  },
  
  // Get optimized image format
  getOptimizedFormat: (): 'webp' | 'jpeg' => {
    const canvas = document.createElement('canvas')
    canvas.width = 1
    canvas.height = 1
    const ctx = canvas.getContext('2d')
    
    if (!ctx) return 'jpeg'
    
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0
      ? 'webp'
      : 'jpeg'
  }
}