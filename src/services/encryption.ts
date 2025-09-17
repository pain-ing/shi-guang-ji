// 加密服务 - 提供端到端加密功能
// 使用 Web Crypto API 实现安全的加密解密

import { EncryptionConfig } from '@/types/features';

export class EncryptionService {
  private config: EncryptionConfig = {
    algorithm: 'AES-256-GCM',
    keyDerivation: 'PBKDF2',
    iterations: 100000,
    saltLength: 16
  };

  // 生成加密密钥
  async generateKey(password: string, salt?: Uint8Array): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);
    
    // 如果没有提供salt，生成新的
    if (!salt) {
      salt = crypto.getRandomValues(new Uint8Array(this.config.saltLength));
    }

    // 导入密码作为密钥材料
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      passwordBuffer,
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );

    // 派生密钥
    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt as BufferSource,
        iterations: this.config.iterations,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );
  }

  // 加密文本
  async encryptText(text: string, password: string): Promise<{
    encrypted: string;
    salt: string;
    iv: string;
  }> {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    
    const salt = crypto.getRandomValues(new Uint8Array(this.config.saltLength));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await this.generateKey(password, salt);

    const encrypted = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv as BufferSource
      },
      key,
      data
    );

    return {
      encrypted: this.arrayBufferToBase64(encrypted),
      salt: this.arrayBufferToBase64(salt),
      iv: this.arrayBufferToBase64(iv)
    };
  }

  // 解密文本
  async decryptText(
    encryptedData: string,
    password: string,
    salt: string,
    iv: string
  ): Promise<string> {
    const key = await this.generateKey(
      password,
      this.base64ToArrayBuffer(salt)
    );

    const ivBuffer = this.base64ToArrayBuffer(iv);
    const encryptedBuffer = this.base64ToArrayBuffer(encryptedData);
    const decrypted = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: ivBuffer as BufferSource
      },
      key,
      encryptedBuffer as BufferSource
    );

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  }

  // 加密文件
  async encryptFile(file: File, password: string): Promise<{
    encrypted: Blob;
    metadata: {
      salt: string;
      iv: string;
      originalName: string;
      originalType: string;
    };
  }> {
    const arrayBuffer = await file.arrayBuffer();
    const salt = crypto.getRandomValues(new Uint8Array(this.config.saltLength));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await this.generateKey(password, salt);

    const encrypted = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv as BufferSource
      },
      key,
      arrayBuffer
    );

    return {
      encrypted: new Blob([encrypted], { type: 'application/octet-stream' }),
      metadata: {
        salt: this.arrayBufferToBase64(salt),
        iv: this.arrayBufferToBase64(iv),
        originalName: file.name,
        originalType: file.type
      }
    };
  }

  // 解密文件
  async decryptFile(
    encryptedBlob: Blob,
    password: string,
    metadata: {
      salt: string;
      iv: string;
      originalName: string;
      originalType: string;
    }
  ): Promise<File> {
    const arrayBuffer = await encryptedBlob.arrayBuffer();
    const key = await this.generateKey(
      password,
      this.base64ToArrayBuffer(metadata.salt)
    );

    const ivBuffer = this.base64ToArrayBuffer(metadata.iv);
    const decrypted = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: ivBuffer as BufferSource
      },
      key,
      arrayBuffer
    );

    return new File([decrypted], metadata.originalName, {
      type: metadata.originalType
    });
  }

  // 生成安全的密码
  generateSecurePassword(length: number = 16): string {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    const randomValues = crypto.getRandomValues(new Uint8Array(length));
    return Array.from(randomValues)
      .map(x => charset[x % charset.length])
      .join('');
  }

  // 哈希密码（用于验证）
  async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return this.arrayBufferToBase64(hash);
  }

  // 辅助函数：ArrayBuffer 转 Base64
  private arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
    const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  // 辅助函数：Base64 转 ArrayBuffer
  private base64ToArrayBuffer(base64: string): Uint8Array {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }
}

// 生物识别认证
export class BiometricAuth {
  // 检查生物识别支持
  async isSupported(): Promise<boolean> {
    if (!window.PublicKeyCredential) {
      return false;
    }
    
    try {
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      return available;
    } catch {
      return false;
    }
  }

  // 注册生物识别
  async register(userId: string, username: string): Promise<any> {
    if (!await this.isSupported()) {
      throw new Error('生物识别不支持');
    }

    const challenge = crypto.getRandomValues(new Uint8Array(32));
    const userIdBuffer = new TextEncoder().encode(userId);

    const publicKey = {
      challenge,
      rp: {
        name: '拾光集',
        id: window.location.hostname
      },
      user: {
        id: userIdBuffer,
        name: username,
        displayName: username
      },
      pubKeyCredParams: [
        { alg: -7, type: 'public-key' as any },
        { alg: -257, type: 'public-key' as any }
      ],
      authenticatorSelection: {
        authenticatorAttachment: 'platform' as any,
        userVerification: 'required' as any
      },
      timeout: 60000
    };

    try {
      const credential = await navigator.credentials.create({ publicKey });
      return credential;
    } catch (error) {
      throw new Error('生物识别注册失败');
    }
  }

  // 生物识别验证
  async verify(credentialId: ArrayBuffer): Promise<boolean> {
    const challenge = crypto.getRandomValues(new Uint8Array(32));
    
    const publicKey = {
      challenge,
      allowCredentials: [{
        id: credentialId,
        type: 'public-key' as any,
        transports: ['internal'] as any
      }],
      userVerification: 'required' as any,
      timeout: 60000
    };

    try {
      const assertion = await navigator.credentials.get({ publicKey });
      return assertion !== null;
    } catch {
      return false;
    }
  }
}

// 本地存储加密
export class SecureStorage {
  private encryptionService: EncryptionService;
  private storageKey: string;

  constructor(storageKey: string = 'secure_diary_data') {
    this.encryptionService = new EncryptionService();
    this.storageKey = storageKey;
  }

  // 保存加密数据
  async save(key: string, data: any, password: string): Promise<void> {
    const jsonString = JSON.stringify(data);
    const encrypted = await this.encryptionService.encryptText(jsonString, password);
    
    const storageData = {
      key,
      ...encrypted,
      timestamp: new Date().toISOString()
    };

    localStorage.setItem(`${this.storageKey}_${key}`, JSON.stringify(storageData));
  }

  // 读取加密数据
  async load(key: string, password: string): Promise<any> {
    const storageItem = localStorage.getItem(`${this.storageKey}_${key}`);
    if (!storageItem) {
      return null;
    }

    const storageData = JSON.parse(storageItem);
    const decrypted = await this.encryptionService.decryptText(
      storageData.encrypted,
      password,
      storageData.salt,
      storageData.iv
    );

    return JSON.parse(decrypted);
  }

  // 删除加密数据
  remove(key: string): void {
    localStorage.removeItem(`${this.storageKey}_${key}`);
  }

  // 清空所有加密数据
  clear(): void {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(this.storageKey)) {
        localStorage.removeItem(key);
      }
    });
  }
}

// 导出单例实例
export const encryptionService = new EncryptionService();
export const biometricAuth = new BiometricAuth();
export const secureStorage = new SecureStorage();