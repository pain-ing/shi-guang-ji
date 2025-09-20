'use client';

import React, { memo } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Navigation, 
  Layers,
  ZoomIn,
  ZoomOut,
  Compass,
  Route,
  MapPin
} from 'lucide-react';

interface MapControlsProps {
  mapStyle: string;
  showPaths: boolean;
  showMemories: boolean;
  isTracking: boolean;
  zoomLevel: number;
  onMapStyleChange: (style: string) => void;
  onShowPathsChange: (show: boolean) => void;
  onShowMemoriesChange: (show: boolean) => void;
  onToggleTracking: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onLocateMe: () => void;
}

const MAP_STYLES = {
  default: '默认',
  satellite: '卫星',
  terrain: '地形',
  dark: '暗黑'
};

export const MapControls = memo<MapControlsProps>(({
  mapStyle,
  showPaths,
  showMemories,
  isTracking,
  zoomLevel,
  onMapStyleChange,
  onShowPathsChange,
  onShowMemoriesChange,
  onToggleTracking,
  onZoomIn,
  onZoomOut,
  onLocateMe
}) => {
  return (
    <div className="space-y-4">
      {/* 地图样式选择 */}
      <div>
        <Label className="flex items-center gap-2 mb-2">
          <Layers className="w-4 h-4" />
          地图样式
        </Label>
        <Select value={mapStyle} onValueChange={onMapStyleChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(MAP_STYLES).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 显示选项 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-2">
            <Route className="w-4 h-4" />
            显示路径
          </Label>
          <Switch
            checked={showPaths}
            onCheckedChange={onShowPathsChange}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            显示记忆点
          </Label>
          <Switch
            checked={showMemories}
            onCheckedChange={onShowMemoriesChange}
          />
        </div>
      </div>

      {/* 缩放控制 */}
      <div className="space-y-2">
        <Label>缩放控制</Label>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onZoomIn}
            disabled={zoomLevel >= 18}
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onZoomOut}
            disabled={zoomLevel <= 1}
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="flex items-center px-2 text-sm text-gray-500">
            {zoomLevel}x
          </span>
        </div>
      </div>

      {/* 定位和追踪 */}
      <div className="space-y-2">
        <Button
          variant="outline"
          onClick={onLocateMe}
          className="w-full"
        >
          <Navigation className="w-4 h-4 mr-2" />
          定位到我
        </Button>

        <Button
          variant={isTracking ? "default" : "outline"}
          onClick={onToggleTracking}
          className="w-full"
        >
          <Compass className="w-4 h-4 mr-2" />
          {isTracking ? '停止追踪' : '开始追踪'}
        </Button>
      </div>
    </div>
  );
});

MapControls.displayName = 'MapControls';
