'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MapPin, 
  Navigation, 
  Layers,
  ZoomIn,
  ZoomOut,
  Compass,
  Globe,
  Camera,
  Star,
  Clock,
  TrendingUp,
  Map as MapIcon,
  Route,
  Home,
  Plane
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { locationService, LocationData, PlaceMemory, TravelPath } from '@/services/location';

interface MapViewProps {
  userId: string;
  onLocationSelect?: (location: LocationData) => void;
  onPlaceClick?: (place: PlaceMemory) => void;
}

// 地图样式配置
const MAP_STYLES = {
  default: '默认',
  satellite: '卫星',
  terrain: '地形',
  dark: '暗黑'
};

// 模拟地图数据（实际项目中应使用真实地图SDK）
interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  type: 'current' | 'memory' | 'favorite';
  data: LocationData | PlaceMemory;
}

export const MapView: React.FC<MapViewProps> = ({ 
  userId, 
  onLocationSelect,
  onPlaceClick 
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [placeMemories, setPlaceMemories] = useState<PlaceMemory[]>([]);
  const [travelPaths, setTravelPaths] = useState<TravelPath[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<PlaceMemory | null>(null);
  const [mapStyle, setMapStyle] = useState('default');
  const [showPaths, setShowPaths] = useState(true);
  const [showMemories, setShowMemories] = useState(true);
  const [isTracking, setIsTracking] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(12);
  const [viewMode, setViewMode] = useState<'map' | 'list' | 'stats'>('map');

  // 初始化地图
  useEffect(() => {
    initMap();
    loadLocationData();

    // 监听位置更新
    const handleLocationUpdate = (location: LocationData) => {
      setCurrentLocation(location);
      updateMapCenter(location.latitude, location.longitude);
    };

    locationService.on('locationUpdate', handleLocationUpdate);

    return () => {
      locationService.off('locationUpdate', handleLocationUpdate);
    };
  }, []);

  // 初始化地图（这里是模拟，实际应集成地图SDK）
  const initMap = async () => {
    // 模拟地图加载
    setTimeout(() => {
      setMapLoaded(true);
    }, 1000);

    // 获取当前位置
    try {
      const location = await locationService.getCurrentLocation();
      setCurrentLocation(location);
    } catch (error) {
      console.error('获取位置失败:', error);
    }
  };

  // 加载位置数据
  const loadLocationData = () => {
    const memories = locationService.getAllPlaceMemories();
    const paths = locationService.getAllTravelPaths();
    setPlaceMemories(memories);
    setTravelPaths(paths);
  };

  // 更新地图中心
  const updateMapCenter = (lat: number, lng: number) => {
    // 实际项目中调用地图SDK的方法
    console.log('更新地图中心:', lat, lng);
  };

  // 切换追踪模式
  const toggleTracking = () => {
    if (isTracking) {
      locationService.stopTracking();
    } else {
      locationService.startTracking();
    }
    setIsTracking(!isTracking);
  };

  // 定位到当前位置
  const locateMe = async () => {
    try {
      const location = await locationService.getCurrentLocation();
      setCurrentLocation(location);
      updateMapCenter(location.latitude, location.longitude);
      setZoomLevel(15);
    } catch (error) {
      console.error('定位失败:', error);
    }
  };

  // 切换地点收藏状态
  const toggleFavorite = (placeId: string) => {
    locationService.toggleFavoritePlace(placeId);
    loadLocationData(); // 重新加载数据
  };

  // 计算统计数据
  const getStats = () => {
    const stats = locationService.getLocationStats();
    return stats;
  };

  // 渲染地图视图
  const renderMapView = () => {
    if (!mapLoaded) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Globe className="w-12 h-12 mx-auto mb-4 animate-spin text-primary" />
            <p>加载地图中...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="relative h-96 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
        {/* 模拟地图容器 */}
        <div ref={mapContainerRef} className="w-full h-full">
          {/* 这里应该是真实的地图渲染 */}
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <MapIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">地图视图</p>
              <p className="text-sm text-gray-400 mt-2">
                实际项目中这里会显示真实地图
              </p>
            </div>
          </div>
        </div>

        {/* 地图控制按钮 */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <Button
            size="sm"
            variant="secondary"
            className="rounded-full w-10 h-10 p-0"
            onClick={() => setZoomLevel(Math.min(20, zoomLevel + 1))}
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="rounded-full w-10 h-10 p-0"
            onClick={() => setZoomLevel(Math.max(1, zoomLevel - 1))}
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="rounded-full w-10 h-10 p-0"
            onClick={locateMe}
          >
            <Navigation className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="rounded-full w-10 h-10 p-0"
          >
            <Layers className="w-4 h-4" />
          </Button>
        </div>

        {/* 当前位置信息 */}
        {currentLocation && (
          <div className="absolute bottom-4 left-4 right-4">
            <Card className="bg-white/95 dark:bg-gray-900/95 backdrop-blur">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-red-500" />
                    <div>
                      <p className="text-sm font-semibold">当前位置</p>
                      <p className="text-xs text-gray-500">
                        {currentLocation.city || '未知城市'} • 
                        精度 {currentLocation.accuracy.toFixed(0)}米
                      </p>
                    </div>
                  </div>
                  {currentLocation.weather && (
                    <div className="text-right">
                      <p className="text-sm">
                        {currentLocation.weather.temperature}°C
                      </p>
                      <p className="text-xs text-gray-500">
                        {currentLocation.weather.condition}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 追踪状态指示器 */}
        {isTracking && (
          <div className="absolute top-4 left-4">
            <Badge className="bg-green-500 text-white animate-pulse">
              <Navigation className="w-3 h-3 mr-1" />
              追踪中
            </Badge>
          </div>
        )}
      </div>
    );
  };

  // 渲染地点列表
  const renderListView = () => {
    const favoriteMemories = placeMemories.filter(p => p.isFavorite);
    const regularMemories = placeMemories.filter(p => !p.isFavorite);

    return (
      <div className="space-y-4">
        {favoriteMemories.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-500" />
              收藏地点
            </h3>
            <div className="grid gap-2">
              {favoriteMemories.map(memory => (
                <PlaceCard
                  key={memory.id}
                  memory={memory}
                  onToggleFavorite={toggleFavorite}
                  onClick={() => {
                    setSelectedPlace(memory);
                    onPlaceClick?.(memory);
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {regularMemories.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              所有地点 ({regularMemories.length})
            </h3>
            <div className="grid gap-2">
              {regularMemories.map(memory => (
                <PlaceCard
                  key={memory.id}
                  memory={memory}
                  onToggleFavorite={toggleFavorite}
                  onClick={() => {
                    setSelectedPlace(memory);
                    onPlaceClick?.(memory);
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {placeMemories.length === 0 && (
          <div className="text-center py-8">
            <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">还没有记录的地点</p>
            <p className="text-sm text-gray-400 mt-2">
              开始记录你的足迹吧
            </p>
          </div>
        )}
      </div>
    );
  };

  // 渲染统计视图
  const renderStatsView = () => {
    const stats = getStats();

    return (
      <div className="space-y-6">
        {/* 统计卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={MapPin}
            label="访问地点"
            value={stats.totalPlaces}
            color="text-blue-500"
          />
          <StatCard
            icon={Globe}
            label="到访国家"
            value={stats.totalCountries}
            color="text-green-500"
          />
          <StatCard
            icon={Home}
            label="到访城市"
            value={stats.totalCities}
            color="text-purple-500"
          />
          <StatCard
            icon={Route}
            label="总里程"
            value={`${stats.totalDistance.toFixed(0)}km`}
            color="text-orange-500"
          />
        </div>

        {/* 最爱地点 */}
        {stats.favoritePlace && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                最爱的地方
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">
                    {stats.favoritePlace.location.placeName || '未知地点'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {stats.favoritePlace.location.city}, {stats.favoritePlace.location.country}
                  </p>
                </div>
                <Badge>{stats.favoritePlace.visitCount} 次访问</Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 最常访问地点 */}
        {stats.mostVisitedPlace && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                最常访问
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">
                    {stats.mostVisitedPlace.location.placeName || '未知地点'}
                  </p>
                  <p className="text-sm text-gray-500">
                    最后访问: {new Date(stats.mostVisitedPlace.lastVisit).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant="secondary">
                  {stats.mostVisitedPlace.visitCount} 次
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 最长旅程 */}
        {stats.longestJourney && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Plane className="w-5 h-5 text-indigo-500" />
                最长旅程
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <p className="font-semibold">{stats.longestJourney.name}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <span>🗓️ {new Date(stats.longestJourney.startDate).toLocaleDateString()}</span>
                  <span>📍 {stats.longestJourney.cities.length} 个城市</span>
                  <span>🚗 {stats.longestJourney.totalDistance.toFixed(0)} km</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* 工具栏 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant={isTracking ? 'destructive' : 'outline'}
            size="sm"
            onClick={toggleTracking}
          >
            <Navigation className="w-4 h-4 mr-2" />
            {isTracking ? '停止追踪' : '开始追踪'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={locateMe}
          >
            <Compass className="w-4 h-4 mr-2" />
            定位
          </Button>
        </div>

        {/* 视图切换 */}
        <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <Button
            variant={viewMode === 'map' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('map')}
          >
            地图
          </Button>
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            列表
          </Button>
          <Button
            variant={viewMode === 'stats' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('stats')}
          >
            统计
          </Button>
        </div>
      </div>

      {/* 主内容区域 */}
      <Card>
        <CardContent className="p-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={viewMode}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {viewMode === 'map' && renderMapView()}
              {viewMode === 'list' && renderListView()}
              {viewMode === 'stats' && renderStatsView()}
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* 选中地点详情 */}
      {selectedPlace && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">地点详情</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="font-semibold">
                  {selectedPlace.location.placeName || '未知地点'}
                </p>
                <p className="text-sm text-gray-500">
                  {selectedPlace.location.address}
                </p>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span>📍 访问 {selectedPlace.visitCount} 次</span>
                <span>📅 首次 {new Date(selectedPlace.firstVisit).toLocaleDateString()}</span>
              </div>
              {selectedPlace.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {selectedPlace.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
              {selectedPlace.notes && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedPlace.notes}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// 地点卡片组件
const PlaceCard: React.FC<{
  memory: PlaceMemory;
  onToggleFavorite: (id: string) => void;
  onClick: () => void;
}> = ({ memory, onToggleFavorite, onClick }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card 
        className="cursor-pointer hover:shadow-md transition-shadow"
        onClick={onClick}
      >
        <CardContent className="p-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <p className="font-medium text-sm">
                  {memory.location.placeName || memory.location.city || '未知地点'}
                </p>
              </div>
              <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                <span>访问 {memory.visitCount} 次</span>
                <span>最后 {new Date(memory.lastVisit).toLocaleDateString()}</span>
                {memory.diaryIds.length > 0 && (
                  <span>{memory.diaryIds.length} 篇日记</span>
                )}
              </div>
              {memory.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {memory.tags.slice(0, 3).map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="p-1"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(memory.id);
              }}
            >
              <Star 
                className={`w-4 h-4 ${
                  memory.isFavorite 
                    ? 'fill-yellow-500 text-yellow-500' 
                    : 'text-gray-400'
                }`} 
              />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// 统计卡片组件
const StatCard: React.FC<{
  icon: React.ElementType;
  label: string;
  value: number | string;
  color: string;
}> = ({ icon: Icon, label, value, color }) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
          <Icon className={`w-8 h-8 ${color} opacity-20`} />
        </div>
      </CardContent>
    </Card>
  );
};

export default MapView;