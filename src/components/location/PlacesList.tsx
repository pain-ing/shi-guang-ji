'use client';

import React, { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MapPin, 
  Star,
  Clock,
  Camera
} from 'lucide-react';
import { motion } from 'framer-motion';
import { PlaceMemory } from '@/services/location';

interface PlacesListProps {
  places: PlaceMemory[];
  onPlaceClick: (place: PlaceMemory) => void;
  onToggleFavorite: (id: string) => void;
}

export const PlacesList = memo<PlacesListProps>(({
  places,
  onPlaceClick,
  onToggleFavorite
}) => {
  if (places.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>暂无地点记录</p>
        <p className="text-sm mt-1">开始记录你的足迹吧</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {places.map((place) => (
        <PlaceCard
          key={place.id}
          place={place}
          onClick={() => onPlaceClick(place)}
          onToggleFavorite={() => onToggleFavorite(place.id)}
        />
      ))}
    </div>
  );
});

interface PlaceCardProps {
  place: PlaceMemory;
  onClick: () => void;
  onToggleFavorite: () => void;
}

const PlaceCard = memo<PlaceCardProps>(({ place, onClick, onToggleFavorite }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card 
        className="cursor-pointer hover:shadow-md transition-shadow"
        onClick={onClick}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <h3 className="font-medium text-sm">
                  {place.location.placeName || place.location.city || '未知地点'}
                </h3>
                {place.isFavorite && (
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                )}
              </div>
              
              <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  访问 {place.visitCount} 次
                </span>
                {place.photos.length > 0 && (
                  <span className="flex items-center gap-1">
                    <Camera className="w-3 h-3" />
                    {place.photos.length} 张照片
                  </span>
                )}
              </div>

              {place.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {place.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {place.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{place.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}

              <p className="text-xs text-gray-400">
                最后访问：{new Date(place.lastVisit).toLocaleDateString()}
              </p>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite();
              }}
              className="ml-2"
            >
              <Star 
                className={`w-4 h-4 ${
                  place.isFavorite 
                    ? 'text-yellow-500 fill-current' 
                    : 'text-gray-400'
                }`} 
              />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});

PlaceCard.displayName = 'PlaceCard';
PlacesList.displayName = 'PlacesList';
