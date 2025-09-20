/**
 * 视频录制与处理服务
 * 支持录制、基础编辑、压缩等功能
 */

export interface VideoMetadata {
  duration: number;
  width: number;
  height: number;
  codec: string;
  bitrate: number;
  size: number;
  thumbnail?: string;
}

export interface VideoEditOptions {
  trimStart?: number;
  trimEnd?: number;
  filter?: 'none' | 'vintage' | 'noir' | 'warm' | 'cold';
  watermark?: string;
  quality?: 'low' | 'medium' | 'high';
}

export interface RecordingOptions {
  video?: boolean;
  audio?: boolean;
  preferredCamera?: 'user' | 'environment';
  maxDuration?: number; // 秒
  maxFileSize?: number; // MB
  quality?: 'low' | 'medium' | 'high';
}

export class VideoService {
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private startTime: number = 0;
  private recordingTimer: NodeJS.Timeout | null = null;

  /**
   * 开始视频录制
   */
  async startRecording(options: RecordingOptions = {}): Promise<void> {
    const {
      video = true,
      audio = true,
      preferredCamera = 'user',
      maxDuration = 300, // 默认最长5分钟
      quality = 'medium'
    } = options;

    try {
      // 获取媒体流
      const constraints: MediaStreamConstraints = {
        video: video ? {
          facingMode: preferredCamera,
          width: this.getQualitySettings(quality).width,
          height: this.getQualitySettings(quality).height
        } : false,
        audio: audio ? {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } : false
      };

      this.stream = await navigator.mediaDevices.getUserMedia(constraints);

      // 配置录制器
      const mimeType = this.getSupportedMimeType();
      const bitrate = this.getQualitySettings(quality).bitrate;

      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType,
        videoBitsPerSecond: bitrate
      });

      // 设置事件处理
      this.recordedChunks = [];
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };

      // 开始录制
      this.startTime = Date.now();
      this.mediaRecorder.start(1000); // 每秒保存一次数据

      // 设置最大时长限制
      if (maxDuration > 0) {
        this.recordingTimer = setTimeout(() => {
          this.stopRecording();
        }, maxDuration * 1000);
      }
    } catch (error) {
      this.cleanup();
      throw new Error(`Failed to start recording: ${error}`);
    }
  }

  /**
   * 停止录制
   */
  async stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
        reject(new Error('No active recording'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.recordedChunks, {
          type: this.mediaRecorder!.mimeType
        });
        this.cleanup();
        resolve(blob);
      };

      this.mediaRecorder.stop();
    });
  }

  /**
   * 暂停录制
   */
  pauseRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.pause();
    }
  }

  /**
   * 恢复录制
   */
  resumeRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'paused') {
      this.mediaRecorder.resume();
    }
  }

  /**
   * 获取录制状态
   */
  getRecordingState(): RecordingState | null {
    if (!this.mediaRecorder) return null;

    return this.mediaRecorder.state as RecordingState;
  }

  /**
   * 获取录制时长（秒）
   */
  getRecordingDuration(): number {
    if (!this.startTime) return 0;
    return Math.floor((Date.now() - this.startTime) / 1000);
  }

  /**
   * 压缩视频
   */
  async compressVideo(blob: Blob, quality: 'low' | 'medium' | 'high' = 'medium'): Promise<Blob> {
    // 使用 WebCodecs API 进行视频压缩（如果支持）
    if ('VideoEncoder' in window) {
      return this.compressWithWebCodecs(blob, quality);
    }
    
    // 降级方案：简单的质量调整
    return this.simpleCompress(blob, quality);
  }

  /**
   * 生成视频缩略图
   */
  async generateThumbnail(blob: Blob, time: number = 0): Promise<string> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      video.src = URL.createObjectURL(blob);
      video.currentTime = time;

      video.onloadedmetadata = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      };

      video.onseeked = () => {
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          canvas.toBlob((thumbnailBlob) => {
            if (thumbnailBlob) {
              resolve(URL.createObjectURL(thumbnailBlob));
            } else {
              reject(new Error('Failed to generate thumbnail'));
            }
            URL.revokeObjectURL(video.src);
          }, 'image/jpeg', 0.8);
        }
      };

      video.onerror = () => {
        URL.revokeObjectURL(video.src);
        reject(new Error('Failed to load video'));
      };
    });
  }

  /**
   * 获取视频元数据
   */
  async getVideoMetadata(blob: Blob): Promise<VideoMetadata> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.src = URL.createObjectURL(blob);

      video.onloadedmetadata = async () => {
        const metadata: VideoMetadata = {
          duration: video.duration,
          width: video.videoWidth,
          height: video.videoHeight,
          codec: this.detectCodec(blob),
          bitrate: Math.round(blob.size * 8 / video.duration / 1000), // kbps
          size: blob.size
        };

        try {
          metadata.thumbnail = await this.generateThumbnail(blob, video.duration / 2);
        } catch (error) {
          console.warn('Failed to generate thumbnail:', error);
        }

        URL.revokeObjectURL(video.src);
        resolve(metadata);
      };

      video.onerror = () => {
        URL.revokeObjectURL(video.src);
        reject(new Error('Failed to load video metadata'));
      };
    });
  }

  /**
   * 简单的视频编辑
   */
  async editVideo(blob: Blob, options: VideoEditOptions): Promise<Blob> {
    // 基础实现，可使用 ffmpeg.wasm 进行更复杂的编辑
    const { trimStart = 0, trimEnd, quality = 'medium' } = options;

    // 如果需要裁剪
    if (trimStart > 0 || trimEnd !== undefined) {
      const trimmedBlob = await this.trimVideo(blob, trimStart, trimEnd);
      return this.compressVideo(trimmedBlob, quality as 'low' | 'medium' | 'high');
    }

    return this.compressVideo(blob, quality as 'low' | 'medium' | 'high');
  }

  /**
   * 裁剪视频
   */
  private async trimVideo(blob: Blob, start: number, end?: number): Promise<Blob> {
    // 简化实现：使用 MediaRecorder API 重新录制指定部分
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      video.src = URL.createObjectURL(blob);
      video.currentTime = start;

      video.onloadedmetadata = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const stream = canvas.captureStream(30); // 30 fps
        const recorder = new MediaRecorder(stream, {
          mimeType: this.getSupportedMimeType()
        });

        const chunks: Blob[] = [];
        recorder.ondataavailable = (e) => chunks.push(e.data);
        recorder.onstop = () => {
          URL.revokeObjectURL(video.src);
          resolve(new Blob(chunks, { type: recorder.mimeType }));
        };

        video.play();
        recorder.start();

        // 定时停止录制
        const duration = (end || video.duration) - start;
        setTimeout(() => {
          video.pause();
          recorder.stop();
        }, duration * 1000);
      };

      video.onseeked = () => {
        if (ctx) {
          // 渲染视频帧到 canvas
          const renderFrame = () => {
            if (!video.paused && !video.ended) {
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              requestAnimationFrame(renderFrame);
            }
          };
          renderFrame();
        }
      };

      video.onerror = () => {
        URL.revokeObjectURL(video.src);
        reject(new Error('Failed to trim video'));
      };
    });
  }

  /**
   * 清理资源
   */
  private cleanup(): void {
    if (this.recordingTimer) {
      clearTimeout(this.recordingTimer);
      this.recordingTimer = null;
    }

    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    this.mediaRecorder = null;
    this.recordedChunks = [];
    this.startTime = 0;
  }

  /**
   * 获取支持的 MIME 类型
   */
  private getSupportedMimeType(): string {
    const types = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm',
      'video/mp4'
    ];

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }

    return 'video/webm'; // 默认值
  }

  /**
   * 获取质量设置
   */
  private getQualitySettings(quality: 'low' | 'medium' | 'high') {
    const settings = {
      low: { width: 640, height: 480, bitrate: 500000 },
      medium: { width: 1280, height: 720, bitrate: 1500000 },
      high: { width: 1920, height: 1080, bitrate: 3000000 }
    };

    return settings[quality];
  }

  /**
   * 检测视频编码
   */
  private detectCodec(blob: Blob): string {
    const type = blob.type;
    if (type.includes('vp9')) return 'VP9';
    if (type.includes('vp8')) return 'VP8';
    if (type.includes('h264')) return 'H.264';
    if (type.includes('h265')) return 'H.265';
    return 'Unknown';
  }

  /**
   * 使用 WebCodecs API 压缩
   */
  private async compressWithWebCodecs(blob: Blob, quality: 'low' | 'medium' | 'high'): Promise<Blob> {
    // WebCodecs API 的简化实现
    // 实际项目中需要更复杂的处理
    console.log('Using WebCodecs for compression');
    return blob; // 暂时返回原始 blob
  }

  /**
   * 简单压缩
   */
  private async simpleCompress(blob: Blob, quality: 'low' | 'medium' | 'high'): Promise<Blob> {
    // 通过重新编码实现简单压缩
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    return new Promise((resolve, reject) => {
      video.src = URL.createObjectURL(blob);

      video.onloadedmetadata = () => {
        const settings = this.getQualitySettings(quality);
        canvas.width = Math.min(video.videoWidth, settings.width);
        canvas.height = Math.min(video.videoHeight, settings.height);

        const stream = canvas.captureStream(30);
        const recorder = new MediaRecorder(stream, {
          mimeType: this.getSupportedMimeType(),
          videoBitsPerSecond: settings.bitrate
        });

        const chunks: Blob[] = [];
        recorder.ondataavailable = (e) => chunks.push(e.data);
        recorder.onstop = () => {
          URL.revokeObjectURL(video.src);
          resolve(new Blob(chunks, { type: recorder.mimeType }));
        };

        video.play();
        recorder.start();

        // 渲染视频到 canvas
        const renderFrame = () => {
          if (!video.paused && !video.ended && ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            requestAnimationFrame(renderFrame);
          } else if (video.ended) {
            recorder.stop();
          }
        };

        renderFrame();
      };

      video.onerror = () => {
        URL.revokeObjectURL(video.src);
        reject(new Error('Failed to compress video'));
      };
    });
  }
}

// 录制状态类型
export type RecordingState = 'inactive' | 'recording' | 'paused';

// 导出单例
export const videoService = new VideoService();