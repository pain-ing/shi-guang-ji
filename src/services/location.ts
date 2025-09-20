/**
 * 地理位置服务模块
 * 提供位置获取、存储、查询和地图相关功能
 */

import { EventEmitter } from 'events';

// 位置数据类型定义
export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude?: number | null;
  altitudeAccuracy?: number | null;
  heading?: number | null;
  speed?: number | null;
  timestamp: number;
  address?: string;
  placeName?: string;
  city?: string;
  country?: string;
  weather?: WeatherInfo;
}

// 天气信息
export interface WeatherInfo {
  temperature: number;
  condition: string;
  humidity?: number;
  windSpeed?: number;
  icon?: string;
}

// 地点记录
export interface PlaceMemory {
  id: string;
  location: LocationData;
  diaryIds: string[];
  visitCount: number;
  firstVisit: Date;
  lastVisit: Date;
  tags: string[];
  photos: string[];
  notes?: string;
  isFavorite: boolean;
}

// 旅行轨迹
export interface TravelPath {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  locations: LocationData[];
  totalDistance: number;
  countries: string[];
  cities: string[];
  highlights: PlaceMemory[];
}

// 位置统计
export interface LocationStats {
  totalPlaces: number;
  totalCountries: number;
  totalCities: number;
  totalDistance: number;
  favoritePlace?: PlaceMemory;
  mostVisitedPlace?: PlaceMemory;
  longestJourney?: TravelPath;
}

// 位置权限状态
export type PermissionStatus = 'granted' | 'denied' | 'prompt' | 'unavailable';

// 位置服务配置
export interface LocationServiceConfig {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  enableWeather?: boolean;
  enableReverseGeocoding?: boolean;
  autoSave?: boolean;
  privacyMode?: boolean;
}

// 地理位置服务类
export class LocationService extends EventEmitter {
  private watchId: number | null = null;
  private currentLocation: LocationData | null = null;
  private locationHistory: LocationData[] = [];
  private placeMemories: Map<string, PlaceMemory> = new Map();
  private travelPaths: Map<string, TravelPath> = new Map();
  private config: LocationServiceConfig;
  private isTracking = false;
  private permissionStatus: PermissionStatus = 'prompt';

  constructor(config?: LocationServiceConfig) {
    super();
    this.config = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
      enableWeather: true,
      enableReverseGeocoding: true,
      autoSave: true,
      privacyMode: false,
      ...config
    };
    
    this.init();
  }

  // 初始化服务
  private async init() {
    await this.checkPermission();
    await this.loadSavedData();
    
    if (this.config.autoSave) {
      this.startAutoSave();
    }
  }

  // 检查位置权限
  async checkPermission(): Promise<PermissionStatus> {
    if (!navigator.geolocation) {
      this.permissionStatus = 'unavailable';
      return 'unavailable';
    }

    try {
      const result = await navigator.permissions.query({ name: 'geolocation' });
      this.permissionStatus = result.state as PermissionStatus;
      
      result.addEventListener('change', () => {
        this.permissionStatus = result.state as PermissionStatus;
        this.emit('permissionChange', this.permissionStatus);
      });
      
      return this.permissionStatus;
    } catch (error) {
      console.error('权限检查失败:', error);
      return 'prompt';
    }
  }

  // 获取当前位置
  async getCurrentLocation(): Promise<LocationData> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('浏览器不支持地理位置'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const locationData = await this.processPosition(position);
          this.currentLocation = locationData;
          this.addToHistory(locationData);
          resolve(locationData);
        },
        (error) => {
          this.handleLocationError(error);
          reject(error);
        },
        {
          enableHighAccuracy: this.config.enableHighAccuracy,
          timeout: this.config.timeout,
          maximumAge: this.config.maximumAge
        }
      );
    });
  }

  // 开始追踪位置
  startTracking(): void {
    if (this.isTracking) return;

    this.watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const locationData = await this.processPosition(position);
        this.currentLocation = locationData;
        this.addToHistory(locationData);
        this.emit('locationUpdate', locationData);
      },
      (error) => {
        this.handleLocationError(error);
      },
      {
        enableHighAccuracy: this.config.enableHighAccuracy,
        timeout: this.config.timeout,
        maximumAge: this.config.maximumAge
      }
    );

    this.isTracking = true;
    this.emit('trackingStarted');
  }

  // 停止追踪位置
  stopTracking(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    
    this.isTracking = false;
    this.emit('trackingStopped');
  }

  // 处理位置数据
  private async processPosition(position: GeolocationPosition): Promise<LocationData> {
    const locationData: LocationData = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      altitude: position.coords.altitude,
      altitudeAccuracy: position.coords.altitudeAccuracy,
      heading: position.coords.heading,
      speed: position.coords.speed,
      timestamp: position.timestamp
    };

    // 反向地理编码
    if (this.config.enableReverseGeocoding && !this.config.privacyMode) {
      try {
        const addressInfo = await this.reverseGeocode(
          locationData.latitude,
          locationData.longitude
        );
        Object.assign(locationData, addressInfo);
      } catch (error) {
        console.error('反向地理编码失败:', error);
      }
    }

    // 获取天气信息
    if (this.config.enableWeather && !this.config.privacyMode) {
      try {
        const weather = await this.getWeatherInfo(
          locationData.latitude,
          locationData.longitude
        );
        locationData.weather = weather;
      } catch (error) {
        console.error('获取天气信息失败:', error);
      }
    }

    return locationData;
  }

  // 反向地理编码
  private async reverseGeocode(lat: number, lng: number): Promise<Partial<LocationData>> {
    // 这里使用 OpenStreetMap Nominatim API（免费）
    // 实际项目中可以使用其他地图服务
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        {
          headers: {
            'User-Agent': 'ShiGuangJi/1.0'
          }
        }
      );
      
      const data = await response.json();
      
      return {
        address: data.display_name,
        placeName: data.name,
        city: data.address?.city || data.address?.town || data.address?.village,
        country: data.address?.country
      };
    } catch (error) {
      throw error;
    }
  }

  // 获取天气信息
  private async getWeatherInfo(lat: number, lng: number): Promise<WeatherInfo> {
    // 这里使用 OpenWeatherMap API（需要API密钥）
    // 示例代码，实际使用需要配置API密钥
    const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
    if (!apiKey) {
      throw new Error('天气API密钥未配置');
    }

    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric`
      );
      
      const data = await response.json();
      
      return {
        temperature: Math.round(data.main.temp),
        condition: data.weather[0].description,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        icon: data.weather[0].icon
      };
    } catch (error) {
      throw error;
    }
  }

  // 添加到历史记录
  private addToHistory(location: LocationData): void {
    this.locationHistory.push(location);
    
    // 限制历史记录大小
    if (this.locationHistory.length > 1000) {
      this.locationHistory = this.locationHistory.slice(-1000);
    }

    // 更新地点记忆
    this.updatePlaceMemory(location);
  }

  // 更新地点记忆
  private updatePlaceMemory(location: LocationData): void {
    const placeId = this.generatePlaceId(location.latitude, location.longitude);
    
    let memory = this.placeMemories.get(placeId);
    if (!memory) {
      memory = {
        id: placeId,
        location,
        diaryIds: [],
        visitCount: 0,
        firstVisit: new Date(location.timestamp),
        lastVisit: new Date(location.timestamp),
        tags: [],
        photos: [],
        isFavorite: false
      };
      this.placeMemories.set(placeId, memory);
    } else {
      memory.visitCount++;
      memory.lastVisit = new Date(location.timestamp);
    }
  }

  // 生成地点ID
  private generatePlaceId(lat: number, lng: number): string {
    // 将经纬度四舍五入到小数点后4位，约11米精度
    const roundedLat = Math.round(lat * 10000) / 10000;
    const roundedLng = Math.round(lng * 10000) / 10000;
    return `${roundedLat}_${roundedLng}`;
  }

  // 处理位置错误
  private handleLocationError(error: GeolocationPositionError): void {
    let message = '获取位置失败';
    
    switch (error.code) {
      case error.PERMISSION_DENIED:
        message = '用户拒绝了位置权限请求';
        this.permissionStatus = 'denied';
        break;
      case error.POSITION_UNAVAILABLE:
        message = '位置信息不可用';
        break;
      case error.TIMEOUT:
        message = '获取位置超时';
        break;
    }
    
    this.emit('locationError', { code: error.code, message });
  }

  // 计算两点间距离（Haversine公式）
  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // 地球半径（千米）
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(value: number): number {
    return value * Math.PI / 180;
  }

  // 创建旅行路径
  createTravelPath(name: string, locations: LocationData[]): TravelPath {
    const path: TravelPath = {
      id: Date.now().toString(),
      name,
      startDate: new Date(locations[0].timestamp),
      endDate: new Date(locations[locations.length - 1].timestamp),
      locations,
      totalDistance: this.calculatePathDistance(locations),
      countries: [...new Set(locations.map(l => l.country).filter(Boolean) as string[])],
      cities: [...new Set(locations.map(l => l.city).filter(Boolean) as string[])],
      highlights: []
    };
    
    this.travelPaths.set(path.id, path);
    this.emit('travelPathCreated', path);
    
    return path;
  }

  // 计算路径总距离
  private calculatePathDistance(locations: LocationData[]): number {
    let totalDistance = 0;
    
    for (let i = 1; i < locations.length; i++) {
      const prev = locations[i - 1];
      const curr = locations[i];
      totalDistance += this.calculateDistance(
        prev.latitude,
        prev.longitude,
        curr.latitude,
        curr.longitude
      );
    }
    
    return totalDistance;
  }

  // 获取位置统计
  getLocationStats(): LocationStats {
    const places = Array.from(this.placeMemories.values());
    const paths = Array.from(this.travelPaths.values());
    
    const stats: LocationStats = {
      totalPlaces: places.length,
      totalCountries: new Set(places.map(p => p.location.country).filter(Boolean)).size,
      totalCities: new Set(places.map(p => p.location.city).filter(Boolean)).size,
      totalDistance: paths.reduce((sum, path) => sum + path.totalDistance, 0),
      favoritePlace: places.find(p => p.isFavorite),
      mostVisitedPlace: places.sort((a, b) => b.visitCount - a.visitCount)[0],
      longestJourney: paths.sort((a, b) => b.totalDistance - a.totalDistance)[0]
    };
    
    return stats;
  }

  // 搜索附近的记忆
  findNearbyMemories(lat: number, lng: number, radiusKm: number = 1): PlaceMemory[] {
    const memories: PlaceMemory[] = [];
    
    this.placeMemories.forEach(memory => {
      const distance = this.calculateDistance(
        lat,
        lng,
        memory.location.latitude,
        memory.location.longitude
      );
      
      if (distance <= radiusKm) {
        memories.push(memory);
      }
    });
    
    return memories.sort((a, b) => {
      const distA = this.calculateDistance(lat, lng, a.location.latitude, a.location.longitude);
      const distB = this.calculateDistance(lat, lng, b.location.latitude, b.location.longitude);
      return distA - distB;
    });
  }

  // 设置地点为收藏
  toggleFavoritePlace(placeId: string): void {
    const memory = this.placeMemories.get(placeId);
    if (memory) {
      memory.isFavorite = !memory.isFavorite;
      this.emit('placeUpdated', memory);
    }
  }

  // 添加地点标签
  addPlaceTag(placeId: string, tag: string): void {
    const memory = this.placeMemories.get(placeId);
    if (memory && !memory.tags.includes(tag)) {
      memory.tags.push(tag);
      this.emit('placeUpdated', memory);
    }
  }

  // 关联日记到地点
  linkDiaryToPlace(placeId: string, diaryId: string): void {
    const memory = this.placeMemories.get(placeId);
    if (memory && !memory.diaryIds.includes(diaryId)) {
      memory.diaryIds.push(diaryId);
      this.emit('placeUpdated', memory);
    }
  }

  // 导出位置数据
  exportLocationData(): string {
    const data = {
      currentLocation: this.currentLocation,
      placeMemories: Array.from(this.placeMemories.values()),
      travelPaths: Array.from(this.travelPaths.values()),
      stats: this.getLocationStats()
    };
    
    return JSON.stringify(data, null, 2);
  }

  // 导入位置数据
  importLocationData(jsonData: string): void {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.placeMemories) {
        data.placeMemories.forEach((memory: PlaceMemory) => {
          this.placeMemories.set(memory.id, memory);
        });
      }
      
      if (data.travelPaths) {
        data.travelPaths.forEach((path: TravelPath) => {
          this.travelPaths.set(path.id, path);
        });
      }
      
      this.emit('dataImported');
    } catch (error) {
      console.error('导入位置数据失败:', error);
      throw error;
    }
  }

  // 清除隐私数据
  clearPrivacyData(): void {
    // 清除详细地址信息，保留大致位置
    this.placeMemories.forEach(memory => {
      delete memory.location.address;
      delete memory.location.placeName;
      delete memory.notes;
      memory.photos = [];
    });
    
    this.locationHistory.forEach(location => {
      delete location.address;
      delete location.placeName;
      delete location.weather;
    });
    
    this.emit('privacyDataCleared');
  }

  // 启动自动保存
  private startAutoSave(): void {
    setInterval(() => {
      this.saveToLocalStorage();
    }, 60000); // 每分钟保存一次
  }

  // 保存到本地存储
  private saveToLocalStorage(): void {
    try {
      const data = {
        placeMemories: Array.from(this.placeMemories.entries()),
        travelPaths: Array.from(this.travelPaths.entries()),
        locationHistory: this.locationHistory.slice(-100) // 只保存最近100条
      };
      
      localStorage.setItem('location_data', JSON.stringify(data));
    } catch (error) {
      console.error('保存位置数据失败:', error);
    }
  }

  // 从本地存储加载
  private async loadSavedData(): Promise<void> {
    try {
      const saved = localStorage.getItem('location_data');
      if (saved) {
        const data = JSON.parse(saved);
        
        if (data.placeMemories) {
          this.placeMemories = new Map(data.placeMemories);
        }
        
        if (data.travelPaths) {
          this.travelPaths = new Map(data.travelPaths);
        }
        
        if (data.locationHistory) {
          this.locationHistory = data.locationHistory;
        }
      }
    } catch (error) {
      console.error('加载位置数据失败:', error);
    }
  }

  // 获取所有地点记忆
  getAllPlaceMemories(): PlaceMemory[] {
    return Array.from(this.placeMemories.values());
  }

  // 获取所有旅行路径
  getAllTravelPaths(): TravelPath[] {
    return Array.from(this.travelPaths.values());
  }

  // 获取当前位置
  getCurrentLocationData(): LocationData | null {
    return this.currentLocation;
  }

  // 获取位置历史
  getLocationHistory(): LocationData[] {
    return this.locationHistory;
  }

  // 获取追踪状态
  getTrackingStatus(): boolean {
    return this.isTracking;
  }

  // 获取权限状态
  getPermissionStatus(): PermissionStatus {
    return this.permissionStatus;
  }

  // 销毁服务
  destroy(): void {
    this.stopTracking();
    this.saveToLocalStorage();
    this.removeAllListeners();
  }
}

// 创建单例实例
export const locationService = new LocationService();