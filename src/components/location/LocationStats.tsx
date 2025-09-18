'use client';

import React, { memo, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  MapPin, 
  Globe,
  Route,
  Star,
  TrendingUp
} from 'lucide-react';
import { PlaceMemory, TravelPath } from '@/services/location';

interface LocationStatsProps {
  places: PlaceMemory[];
  paths: TravelPath[];
}

export const LocationStats = memo<LocationStatsProps>(({ places, paths }) => {
  const stats = useMemo(() => {
    const totalPlaces = places.length;
    const totalCountries = new Set(places.map(p => p.location.country).filter(Boolean)).size;
    const totalCities = new Set(places.map(p => p.location.city).filter(Boolean)).size;
    const totalDistance = paths.reduce((sum, path) => sum + path.totalDistance, 0);
    
    const favoritePlace = places.find(p => p.isFavorite);
    const mostVisitedPlace = places.reduce((max, place) => 
      place.visitCount > (max?.visitCount || 0) ? place : max, null as PlaceMemory | null
    );
    
    const longestJourney = paths.reduce((max, path) => 
      path.totalDistance > (max?.totalDistance || 0) ? path : max, null as TravelPath | null
    );

    return {
      totalPlaces,
      totalCountries,
      totalCities,
      totalDistance,
      favoritePlace,
      mostVisitedPlace,
      longestJourney
    };
  }, [places, paths]);

  const StatCard = ({ icon: Icon, title, value, subtitle, progress }: {
    icon: React.ElementType;
    title: string;
    value: string | number;
    subtitle?: string;
    progress?: number;
  }) => (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {subtitle && (
              <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
            )}
            {progress !== undefined && (
              <Progress value={progress} className="h-1 mt-2" />
            )}
          </div>
          <Icon className="w-8 h-8 text-blue-500" />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      {/* 基础统计 */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard
          icon={MapPin}
          title="总地点数"
          value={stats.totalPlaces}
          subtitle="个记录地点"
        />
        
        <StatCard
          icon={Globe}
          title="访问城市"
          value={stats.totalCities}
          subtitle={`${stats.totalCountries} 个国家`}
        />
        
        <StatCard
          icon={Route}
          title="总里程"
          value={`${(stats.totalDistance / 1000).toFixed(1)}km`}
          subtitle="旅行距离"
        />
        
        <StatCard
          icon={Star}
          title="收藏地点"
          value={places.filter(p => p.isFavorite).length}
          subtitle="个特别地点"
        />
      </div>

      {/* 详细统计 */}
      <div className="space-y-3">
        {stats.mostVisitedPlace && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                最常访问
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    {stats.mostVisitedPlace.location.placeName || 
                     stats.mostVisitedPlace.location.city || '未知地点'}
                  </p>
                  <p className="text-sm text-gray-500">
                    访问了 {stats.mostVisitedPlace.visitCount} 次
                  </p>
                </div>
                <Progress 
                  value={(stats.mostVisitedPlace.visitCount / Math.max(...places.map(p => p.visitCount))) * 100} 
                  className="w-20 h-2" 
                />
              </div>
            </CardContent>
          </Card>
        )}

        {stats.longestJourney && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Route className="w-4 h-4" />
                最长旅程
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div>
                <p className="font-medium">{stats.longestJourney.name}</p>
                <p className="text-sm text-gray-500">
                  {(stats.longestJourney.totalDistance / 1000).toFixed(1)}km · 
                  {stats.longestJourney.countries.length} 个国家
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(stats.longestJourney.startDate).toLocaleDateString()} - 
                  {new Date(stats.longestJourney.endDate).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* 活跃度指标 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">探索活跃度</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>地点多样性</span>
              <span>{Math.min(100, (stats.totalCities / 50) * 100).toFixed(0)}%</span>
            </div>
            <Progress value={Math.min(100, (stats.totalCities / 50) * 100)} className="h-2" />
            
            <div className="flex justify-between text-sm">
              <span>旅行里程</span>
              <span>{Math.min(100, (stats.totalDistance / 100000) * 100).toFixed(0)}%</span>
            </div>
            <Progress value={Math.min(100, (stats.totalDistance / 100000) * 100)} className="h-2" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

LocationStats.displayName = 'LocationStats';
