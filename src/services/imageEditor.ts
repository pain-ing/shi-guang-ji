/**
 * 图片编辑服务
 * 支持滤镜、裁剪、标注、调整等功能
 */

export interface ImageFilterOptions {
  brightness?: number;    // -100 到 100
  contrast?: number;      // -100 到 100
  saturation?: number;    // -100 到 100
  hue?: number;          // -180 到 180
  blur?: number;         // 0 到 20
  sharpen?: number;      // 0 到 100
  grayscale?: boolean;
  sepia?: boolean;
  invert?: boolean;
}

export interface ImageCropOptions {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ImageAnnotation {
  type: 'text' | 'arrow' | 'rectangle' | 'ellipse' | 'line' | 'freehand';
  x: number;
  y: number;
  data: any; // 特定于类型的数据
  color?: string;
  strokeWidth?: number;
  fontSize?: number;
  fontFamily?: string;
}

export interface ImageResizeOptions {
  width?: number;
  height?: number;
  maintainAspectRatio?: boolean;
  quality?: number; // 0 到 1
}

export class ImageEditorService {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private originalImage: ImageData | null = null;
  private currentImage: ImageData | null = null;
  private history: ImageData[] = [];
  private historyIndex: number = -1;
  private maxHistorySize: number = 20;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true })!;
  }

  /**
   * 加载图片
   */
  async loadImage(source: Blob | string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        this.canvas.width = img.width;
        this.canvas.height = img.height;
        this.ctx.drawImage(img, 0, 0);
        
        this.originalImage = this.ctx.getImageData(0, 0, img.width, img.height);
        this.currentImage = this.ctx.getImageData(0, 0, img.width, img.height);
        
        this.addToHistory(this.currentImage);
        resolve();
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      if (typeof source === 'string') {
        img.src = source;
      } else {
        img.src = URL.createObjectURL(source);
      }
    });
  }

  /**
   * 应用滤镜
   */
  applyFilter(options: ImageFilterOptions): void {
    if (!this.currentImage) return;

    const imageData = new ImageData(
      new Uint8ClampedArray(this.currentImage.data),
      this.currentImage.width,
      this.currentImage.height
    );

    const data = imageData.data;

    // 应用各种滤镜效果
    for (let i = 0; i < data.length; i += 4) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];

      // 亮度调整
      if (options.brightness !== undefined) {
        const brightness = options.brightness * 2.55;
        r += brightness;
        g += brightness;
        b += brightness;
      }

      // 对比度调整
      if (options.contrast !== undefined) {
        const contrast = (options.contrast + 100) / 100;
        r = ((r - 128) * contrast) + 128;
        g = ((g - 128) * contrast) + 128;
        b = ((b - 128) * contrast) + 128;
      }

      // 饱和度调整
      if (options.saturation !== undefined) {
        const saturation = (options.saturation + 100) / 100;
        const gray = 0.2989 * r + 0.5870 * g + 0.1140 * b;
        r = gray + saturation * (r - gray);
        g = gray + saturation * (g - gray);
        b = gray + saturation * (b - gray);
      }

      // 灰度
      if (options.grayscale) {
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        r = g = b = gray;
      }

      // 棕褐色
      if (options.sepia) {
        const tr = 0.393 * r + 0.769 * g + 0.189 * b;
        const tg = 0.349 * r + 0.686 * g + 0.168 * b;
        const tb = 0.272 * r + 0.534 * g + 0.131 * b;
        r = tr > 255 ? 255 : tr;
        g = tg > 255 ? 255 : tg;
        b = tb > 255 ? 255 : tb;
      }

      // 反色
      if (options.invert) {
        r = 255 - r;
        g = 255 - g;
        b = 255 - b;
      }

      data[i] = Math.max(0, Math.min(255, r));
      data[i + 1] = Math.max(0, Math.min(255, g));
      data[i + 2] = Math.max(0, Math.min(255, b));
    }

    // 模糊效果
    if (options.blur && options.blur > 0) {
      this.applyBlur(imageData, options.blur);
    }

    // 锐化效果
    if (options.sharpen && options.sharpen > 0) {
      this.applySharpen(imageData, options.sharpen / 100);
    }

    this.currentImage = imageData;
    this.ctx.putImageData(imageData, 0, 0);
    this.addToHistory(imageData);
  }

  /**
   * 裁剪图片
   */
  crop(options: ImageCropOptions): void {
    if (!this.currentImage) return;

    const { x, y, width, height } = options;
    
    // 创建临时画布进行裁剪
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d')!;
    
    tempCanvas.width = width;
    tempCanvas.height = height;
    
    // 放置当前图片到临时画布
    this.ctx.putImageData(this.currentImage, 0, 0);
    
    // 裁剪并绘制到临时画布
    tempCtx.drawImage(
      this.canvas,
      x, y, width, height,
      0, 0, width, height
    );
    
    // 更新主画布尺寸和内容
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx.drawImage(tempCanvas, 0, 0);
    
    this.currentImage = this.ctx.getImageData(0, 0, width, height);
    this.addToHistory(this.currentImage);
  }

  /**
   * 调整大小
   */
  resize(options: ImageResizeOptions): void {
    if (!this.currentImage) return;

    let { width, height } = options;
    const { maintainAspectRatio = true, quality = 0.92 } = options;

    // 计算新尺寸
    if (maintainAspectRatio) {
      const aspectRatio = this.currentImage.width / this.currentImage.height;
      if (width && !height) {
        height = width / aspectRatio;
      } else if (height && !width) {
        width = height * aspectRatio;
      }
    }

    if (!width) width = this.currentImage.width;
    if (!height) height = this.currentImage.height;

    // 创建临时画布进行缩放
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d')!;
    
    tempCanvas.width = width;
    tempCanvas.height = height;
    
    // 使用高质量缩放
    tempCtx.imageSmoothingEnabled = true;
    tempCtx.imageSmoothingQuality = 'high';
    
    // 放置当前图片并缩放
    this.ctx.putImageData(this.currentImage, 0, 0);
    tempCtx.drawImage(this.canvas, 0, 0, width, height);
    
    // 更新主画布
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx.drawImage(tempCanvas, 0, 0);
    
    this.currentImage = this.ctx.getImageData(0, 0, width, height);
    this.addToHistory(this.currentImage);
  }

  /**
   * 旋转图片
   */
  rotate(degrees: number): void {
    if (!this.currentImage) return;

    const radians = (degrees * Math.PI) / 180;
    const sin = Math.abs(Math.sin(radians));
    const cos = Math.abs(Math.cos(radians));
    
    // 计算旋转后的尺寸
    const newWidth = this.currentImage.width * cos + this.currentImage.height * sin;
    const newHeight = this.currentImage.width * sin + this.currentImage.height * cos;
    
    // 创建临时画布
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d')!;
    
    tempCanvas.width = newWidth;
    tempCanvas.height = newHeight;
    
    // 旋转绘制
    tempCtx.translate(newWidth / 2, newHeight / 2);
    tempCtx.rotate(radians);
    
    this.ctx.putImageData(this.currentImage, 0, 0);
    tempCtx.drawImage(
      this.canvas,
      -this.currentImage.width / 2,
      -this.currentImage.height / 2
    );
    
    // 更新主画布
    this.canvas.width = newWidth;
    this.canvas.height = newHeight;
    this.ctx.drawImage(tempCanvas, 0, 0);
    
    this.currentImage = this.ctx.getImageData(0, 0, newWidth, newHeight);
    this.addToHistory(this.currentImage);
  }

  /**
   * 翻转图片
   */
  flip(horizontal: boolean = true): void {
    if (!this.currentImage) return;

    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d')!;
    
    tempCanvas.width = this.currentImage.width;
    tempCanvas.height = this.currentImage.height;
    
    // 应用翻转变换
    if (horizontal) {
      tempCtx.scale(-1, 1);
      tempCtx.translate(-tempCanvas.width, 0);
    } else {
      tempCtx.scale(1, -1);
      tempCtx.translate(0, -tempCanvas.height);
    }
    
    this.ctx.putImageData(this.currentImage, 0, 0);
    tempCtx.drawImage(this.canvas, 0, 0);
    
    // 更新图片
    this.ctx.drawImage(tempCanvas, 0, 0);
    this.currentImage = this.ctx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
    this.addToHistory(this.currentImage);
  }

  /**
   * 添加标注
   */
  addAnnotation(annotation: ImageAnnotation): void {
    if (!this.currentImage) return;

    // 确保当前图片已绘制
    this.ctx.putImageData(this.currentImage, 0, 0);

    // 设置样式
    this.ctx.strokeStyle = annotation.color || '#FF0000';
    this.ctx.fillStyle = annotation.color || '#FF0000';
    this.ctx.lineWidth = annotation.strokeWidth || 2;

    switch (annotation.type) {
      case 'text':
        this.ctx.font = `${annotation.fontSize || 16}px ${annotation.fontFamily || 'Arial'}`;
        this.ctx.fillText(annotation.data.text, annotation.x, annotation.y);
        break;

      case 'arrow':
        this.drawArrow(
          annotation.x,
          annotation.y,
          annotation.data.endX,
          annotation.data.endY
        );
        break;

      case 'rectangle':
        this.ctx.strokeRect(
          annotation.x,
          annotation.y,
          annotation.data.width,
          annotation.data.height
        );
        break;

      case 'ellipse':
        this.ctx.beginPath();
        this.ctx.ellipse(
          annotation.x + annotation.data.width / 2,
          annotation.y + annotation.data.height / 2,
          annotation.data.width / 2,
          annotation.data.height / 2,
          0,
          0,
          2 * Math.PI
        );
        this.ctx.stroke();
        break;

      case 'line':
        this.ctx.beginPath();
        this.ctx.moveTo(annotation.x, annotation.y);
        this.ctx.lineTo(annotation.data.endX, annotation.data.endY);
        this.ctx.stroke();
        break;

      case 'freehand':
        if (annotation.data.points && annotation.data.points.length > 1) {
          this.ctx.beginPath();
          this.ctx.moveTo(annotation.data.points[0].x, annotation.data.points[0].y);
          for (let i = 1; i < annotation.data.points.length; i++) {
            this.ctx.lineTo(annotation.data.points[i].x, annotation.data.points[i].y);
          }
          this.ctx.stroke();
        }
        break;
    }

    // 更新图片数据
    this.currentImage = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    this.addToHistory(this.currentImage);
  }

  /**
   * 撤销
   */
  undo(): void {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.currentImage = this.history[this.historyIndex];
      this.ctx.putImageData(this.currentImage, 0, 0);
    }
  }

  /**
   * 重做
   */
  redo(): void {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      this.currentImage = this.history[this.historyIndex];
      this.ctx.putImageData(this.currentImage, 0, 0);
    }
  }

  /**
   * 重置到原始图片
   */
  reset(): void {
    if (this.originalImage) {
      this.currentImage = new ImageData(
        new Uint8ClampedArray(this.originalImage.data),
        this.originalImage.width,
        this.originalImage.height
      );
      this.canvas.width = this.originalImage.width;
      this.canvas.height = this.originalImage.height;
      this.ctx.putImageData(this.currentImage, 0, 0);
      this.addToHistory(this.currentImage);
    }
  }

  /**
   * 导出图片
   */
  async export(format: 'png' | 'jpeg' | 'webp' = 'png', quality: number = 0.92): Promise<Blob> {
    return new Promise((resolve, reject) => {
      this.canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to export image'));
          }
        },
        `image/${format}`,
        quality
      );
    });
  }

  /**
   * 获取图片数据URL
   */
  getDataURL(format: 'png' | 'jpeg' | 'webp' = 'png', quality: number = 0.92): string {
    return this.canvas.toDataURL(`image/${format}`, quality);
  }

  /**
   * 私有方法：添加到历史记录
   */
  private addToHistory(imageData: ImageData): void {
    // 如果不在历史末尾，删除后面的历史
    if (this.historyIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.historyIndex + 1);
    }

    // 添加新历史
    this.history.push(new ImageData(
      new Uint8ClampedArray(imageData.data),
      imageData.width,
      imageData.height
    ));

    // 限制历史大小
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    } else {
      this.historyIndex++;
    }
  }

  /**
   * 私有方法：应用模糊
   */
  private applyBlur(imageData: ImageData, radius: number): void {
    // 简单的盒式模糊实现
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const output = new Uint8ClampedArray(data);

    const size = Math.ceil(radius) * 2 + 1;
    const half = Math.floor(size / 2);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let r = 0, g = 0, b = 0, a = 0;
        let count = 0;

        for (let dy = -half; dy <= half; dy++) {
          for (let dx = -half; dx <= half; dx++) {
            const ny = y + dy;
            const nx = x + dx;

            if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
              const idx = (ny * width + nx) * 4;
              r += data[idx];
              g += data[idx + 1];
              b += data[idx + 2];
              a += data[idx + 3];
              count++;
            }
          }
        }

        const idx = (y * width + x) * 4;
        output[idx] = r / count;
        output[idx + 1] = g / count;
        output[idx + 2] = b / count;
        output[idx + 3] = a / count;
      }
    }

    for (let i = 0; i < data.length; i++) {
      data[i] = output[i];
    }
  }

  /**
   * 私有方法：应用锐化
   */
  private applySharpen(imageData: ImageData, strength: number): void {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const output = new Uint8ClampedArray(data);

    // 锐化核
    const kernel = [
      0, -strength, 0,
      -strength, 1 + 4 * strength, -strength,
      0, -strength, 0
    ];

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        for (let c = 0; c < 3; c++) {
          let sum = 0;
          for (let ky = -1; ky <= 1; ky++) {
            for (let kx = -1; kx <= 1; kx++) {
              const idx = ((y + ky) * width + (x + kx)) * 4 + c;
              const kernelIdx = (ky + 1) * 3 + (kx + 1);
              sum += data[idx] * kernel[kernelIdx];
            }
          }
          const idx = (y * width + x) * 4 + c;
          output[idx] = Math.max(0, Math.min(255, sum));
        }
      }
    }

    for (let i = 0; i < data.length; i++) {
      data[i] = output[i];
    }
  }

  /**
   * 私有方法：绘制箭头
   */
  private drawArrow(fromX: number, fromY: number, toX: number, toY: number): void {
    const headLength = 10;
    const angle = Math.atan2(toY - fromY, toX - fromX);

    // 绘制线
    this.ctx.beginPath();
    this.ctx.moveTo(fromX, fromY);
    this.ctx.lineTo(toX, toY);
    this.ctx.stroke();

    // 绘制箭头头部
    this.ctx.beginPath();
    this.ctx.moveTo(toX, toY);
    this.ctx.lineTo(
      toX - headLength * Math.cos(angle - Math.PI / 6),
      toY - headLength * Math.sin(angle - Math.PI / 6)
    );
    this.ctx.moveTo(toX, toY);
    this.ctx.lineTo(
      toX - headLength * Math.cos(angle + Math.PI / 6),
      toY - headLength * Math.sin(angle + Math.PI / 6)
    );
    this.ctx.stroke();
  }
}

// 导出单例
export const imageEditor = new ImageEditorService();