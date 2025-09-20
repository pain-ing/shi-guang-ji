'use client';

import React, { useRef, useEffect, useCallback, memo } from 'react';

interface OptimizedSakuraProps {
  enabled?: boolean;
  density?: number; // 10 - 150
  speed?: number; // 0.5 - 2.0 倍速
  butterfliesEnabled?: boolean;
  butterfliesCount?: number; // 1-10
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  color: string;
  type: 'petal' | 'butterfly';
}

class SakuraAnimationEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private particles: Particle[] = [];
  private animationId: number | null = null;
  private lastTime = 0;
  private isVisible = true;
  private config: Required<OptimizedSakuraProps>;

  // 性能优化参数
  private readonly TARGET_FPS = 60;
  private readonly FRAME_TIME = 1000 / this.TARGET_FPS;
  private readonly MAX_PARTICLES = 150;
  private readonly PARTICLE_POOL_SIZE = 200;
  private particlePool: Particle[] = [];
  private activeParticles = 0;

  // 颜色预设
  private readonly PETAL_COLORS = [
    '#FFB6C1', '#FFC0CB', '#FFE4E1', '#F0E6FF', '#E6E6FA'
  ];

  constructor(canvas: HTMLCanvasElement, config: Required<OptimizedSakuraProps>) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.config = config;
    
    this.setupCanvas();
    this.initializeParticlePool();
    this.setupVisibilityDetection();
    
    if (config.enabled) {
      this.start();
    }
  }

  private setupCanvas(): void {
    const updateCanvasSize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = this.canvas.getBoundingClientRect();
      
      this.canvas.width = rect.width * dpr;
      this.canvas.height = rect.height * dpr;
      
      this.ctx.scale(dpr, dpr);
      this.canvas.style.width = rect.width + 'px';
      this.canvas.style.height = rect.height + 'px';
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
  }

  private initializeParticlePool(): void {
    for (let i = 0; i < this.PARTICLE_POOL_SIZE; i++) {
      this.particlePool.push(this.createParticle(i));
    }
  }

  private setupVisibilityDetection(): void {
    // 页面可见性检测
    document.addEventListener('visibilitychange', () => {
      this.isVisible = !document.hidden;
      if (this.isVisible && this.config.enabled) {
        this.start();
      } else {
        this.pause();
      }
    });

    // Intersection Observer 检测 canvas 是否在视口中
    const observer = new IntersectionObserver(
      (entries) => {
        this.isVisible = entries[0].isIntersecting;
        if (this.isVisible && this.config.enabled) {
          this.start();
        } else {
          this.pause();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(this.canvas);
  }

  private createParticle(id: number): Particle {
    const type = Math.random() < 0.95 ? 'petal' : 'butterfly';
    const canvasRect = this.canvas.getBoundingClientRect();
    
    return {
      id,
      x: Math.random() * canvasRect.width,
      y: -20,
      vx: (Math.random() - 0.5) * 2,
      vy: 1 + Math.random() * 2,
      size: type === 'petal' ? 8 + Math.random() * 6 : 12 + Math.random() * 8,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 4,
      opacity: 0.6 + Math.random() * 0.4,
      color: this.PETAL_COLORS[Math.floor(Math.random() * this.PETAL_COLORS.length)],
      type
    };
  }

  private getParticleFromPool(): Particle | null {
    if (this.particlePool.length === 0) return null;
    
    const particle = this.particlePool.pop()!;
    const canvasRect = this.canvas.getBoundingClientRect();
    
    // 重置粒子属性
    particle.x = Math.random() * canvasRect.width;
    particle.y = -20;
    particle.vx = (Math.random() - 0.5) * 2;
    particle.vy = (1 + Math.random() * 2) * this.config.speed;
    particle.rotation = Math.random() * 360;
    particle.opacity = 0.6 + Math.random() * 0.4;
    
    return particle;
  }

  private returnParticleToPool(particle: Particle): void {
    if (this.particlePool.length < this.PARTICLE_POOL_SIZE) {
      this.particlePool.push(particle);
    }
  }

  private updateParticles(deltaTime: number): void {
    const canvasRect = this.canvas.getBoundingClientRect();
    
    // 添加新粒子
    if (this.activeParticles < Math.min(this.config.density, this.MAX_PARTICLES)) {
      if (Math.random() < 0.1) { // 10% 概率每帧添加粒子
        const particle = this.getParticleFromPool();
        if (particle) {
          this.particles.push(particle);
          this.activeParticles++;
        }
      }
    }

    // 更新现有粒子
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      
      // 更新位置
      particle.x += particle.vx * deltaTime * 0.01;
      particle.y += particle.vy * deltaTime * 0.01;
      particle.rotation += particle.rotationSpeed * deltaTime * 0.01;
      
      // 添加风效果
      particle.vx += Math.sin(particle.y * 0.01) * 0.1;
      
      // 移除超出边界的粒子
      if (particle.y > canvasRect.height + 50 || 
          particle.x < -50 || 
          particle.x > canvasRect.width + 50) {
        this.particles.splice(i, 1);
        this.returnParticleToPool(particle);
        this.activeParticles--;
      }
    }
  }

  private renderParticles(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // 批量渲染优化
    this.ctx.save();
    
    for (const particle of this.particles) {
      this.ctx.save();
      this.ctx.translate(particle.x, particle.y);
      this.ctx.rotate(particle.rotation * Math.PI / 180);
      this.ctx.globalAlpha = particle.opacity;
      
      if (particle.type === 'petal') {
        this.renderPetal(particle);
      } else {
        this.renderButterfly(particle);
      }
      
      this.ctx.restore();
    }
    
    this.ctx.restore();
  }

  private renderPetal(particle: Particle): void {
    const size = particle.size;
    
    // 使用路径绘制花瓣形状
    this.ctx.beginPath();
    this.ctx.ellipse(0, 0, size * 0.6, size, 0, 0, Math.PI * 2);
    
    // 渐变填充
    const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, size);
    gradient.addColorStop(0, particle.color);
    gradient.addColorStop(1, particle.color + '80'); // 添加透明度
    
    this.ctx.fillStyle = gradient;
    this.ctx.fill();
    
    // 添加边框
    this.ctx.strokeStyle = particle.color + '40';
    this.ctx.lineWidth = 0.5;
    this.ctx.stroke();
  }

  private renderButterfly(particle: Particle): void {
    if (!this.config.butterfliesEnabled) return;
    
    const size = particle.size;
    this.ctx.fillStyle = '#FFD700';
    
    // 简化的蝴蝶形状
    this.ctx.beginPath();
    this.ctx.ellipse(-size * 0.3, -size * 0.2, size * 0.3, size * 0.2, 0, 0, Math.PI * 2);
    this.ctx.ellipse(size * 0.3, -size * 0.2, size * 0.3, size * 0.2, 0, 0, Math.PI * 2);
    this.ctx.ellipse(-size * 0.2, size * 0.2, size * 0.2, size * 0.15, 0, 0, Math.PI * 2);
    this.ctx.ellipse(size * 0.2, size * 0.2, size * 0.2, size * 0.15, 0, 0, Math.PI * 2);
    this.ctx.fill();
  }

  private animate = (currentTime: number): void => {
    if (!this.isVisible || !this.config.enabled) return;
    
    const deltaTime = currentTime - this.lastTime;
    
    // 帧率控制
    if (deltaTime >= this.FRAME_TIME) {
      this.updateParticles(deltaTime);
      this.renderParticles();
      this.lastTime = currentTime;
    }
    
    this.animationId = requestAnimationFrame(this.animate);
  };

  public start(): void {
    if (this.animationId) return;
    this.lastTime = performance.now();
    this.animationId = requestAnimationFrame(this.animate);
  }

  public pause(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  public updateConfig(newConfig: Partial<OptimizedSakuraProps>): void {
    this.config = { ...this.config, ...newConfig };
    
    if (!this.config.enabled) {
      this.pause();
      this.particles = [];
      this.activeParticles = 0;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    } else if (!this.animationId) {
      this.start();
    }
  }

  public destroy(): void {
    this.pause();
    this.particles = [];
    this.particlePool = [];
    this.activeParticles = 0;
    window.removeEventListener('resize', this.setupCanvas);
  }
}

export const OptimizedSakura = memo<OptimizedSakuraProps>(({
  enabled = true,
  density = 30,
  speed = 1,
  butterfliesEnabled = false,
  butterfliesCount = 2
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<SakuraAnimationEngine | null>(null);

  const config = {
    enabled,
    density: Math.min(Math.max(density, 10), 150),
    speed: Math.min(Math.max(speed, 0.5), 2),
    butterfliesEnabled,
    butterfliesCount: Math.min(Math.max(butterfliesCount, 1), 10)
  };

  useEffect(() => {
    if (!canvasRef.current) return;

    engineRef.current = new SakuraAnimationEngine(canvasRef.current, config);

    return () => {
      engineRef.current?.destroy();
    };
  }, []);

  useEffect(() => {
    engineRef.current?.updateConfig(config);
  }, [enabled, density, speed, butterfliesEnabled, butterfliesCount]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 9999
      }}
    />
  );
});

OptimizedSakura.displayName = 'OptimizedSakura';
