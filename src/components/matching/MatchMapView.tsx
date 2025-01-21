import React, { useMemo, useState, useCallback } from 'react';
import { Match } from '@/types/match';
import {
  BaseMapView,
  type MapMarker as BaseMapMarker,
} from '../map/BaseMapView';
import { Slider } from '@/components/ui/Slider';
import { Select } from '@/components/ui/Select';
import { Card, CardContent } from '@/components/ui/Card';
import { Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

const matchDataMap = new Map<string, Match>();

interface MatchMapViewProps {
  matches: Match[];
  onMarkerClick: (match: Match) => void;
  center?: google.maps.LatLngLiteral;
  zoom?: number;
}

interface FilterState {
  radius: number;
  activity: string;
  timeWindow: string;
  minAge: number;
  maxAge: number;
}

export const MatchMapView: React.FC<MatchMapViewProps> = ({
  matches,
  onMarkerClick,
  center = { lat: 0, lng: 0 },
  zoom = 12,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredMatch, setHoveredMatch] = useState<Match | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    radius: 10,
    activity: 'all',
    timeWindow: 'all',
    minAge: 18,
    maxAge: 100,
  });
  const [mapStyle, setMapStyle] = useState('roadmap');
  const [matchDistance, setMatchDistance] = useState('10km');

  const { toast } = useToast();

  const mapStyleOptions = [
    { value: 'roadmap', label: 'Roadmap' },
    { value: 'satellite', label: 'Satellite' },
    { value: 'hybrid', label: 'Hybrid' },
    { value: 'terrain', label: 'Terrain' },
  ];

  const distanceOptions = [
    { value: '5km', label: '5km' },
    { value: '10km', label: '10km' },
    { value: '20km', label: '20km' },
    { value: '50km', label: '50km' },
  ];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleRadiusChange = (value: number[]) => {
    setFilters(prev => ({ ...prev, radius: value[0] }));
  };

  const handleActivityChange = (value: string) => {
    setFilters(prev => ({ ...prev, activity: value }));
  };

  const handleTimeWindowChange = (value: string) => {
    setFilters(prev => ({ ...prev, timeWindow: value }));
  };

  const createMarker = useCallback((match: Match) => {
    matchDataMap.set(match.id, match);

    const icon = {
      url: match.profileImage || '/images/markers/default-marker.png',
      scaledSize: new google.maps.Size(40, 40),
      anchor: new google.maps.Point(20, 20),
    };

    return {
      id: match.id,
      position: {
        lat: match.location.latitude,
        lng: match.location.longitude,
      },
      title: match.name,
      icon,
    };
  }, []);

  const markers = useMemo(() => {
    return matches.map(createMarker);
  }, [matches, createMarker]);

  const mapOptions = useMemo(
    () => ({
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }],
        },
      ],
      disableDefaultUI: false,
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
      clickableIcons: false,
      maxZoom: 18,
      minZoom: 3,
      mapTypeId: mapStyle,
    }),
    [mapStyle]
  );

  const handleMarkerClick = useCallback(
    (marker: BaseMapMarker) => {
      const match = matchDataMap.get(marker.id);
      if (match) {
        onMarkerClick(match);
      }
    },
    [onMarkerClick]
  );

  const handleMarkerMouseEnter = useCallback((marker: BaseMapMarker) => {
    const match = matchDataMap.get(marker.id);
    if (match) {
      setHoveredMatch(match);
    }
  }, []);

  const handleMarkerMouseLeave = useCallback(() => {
    setHoveredMatch(null);
  }, []);

  return (
    <div className="relative h-full w-full">
      <div className="absolute inset-0">
        <BaseMapView
          center={center}
          zoom={zoom}
          markers={markers}
          onMarkerClick={handleMarkerClick}
          onMarkerMouseEnter={handleMarkerMouseEnter}
          onMarkerMouseLeave={handleMarkerMouseLeave}
          options={mapOptions}
        />
      </div>

      <div className="absolute top-4 left-4 z-10 w-80">
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search matches..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full rounded-md border border-input bg-background pl-10 pr-4 py-2 text-sm"
              />
            </div>
            <div className="mt-4">
              <Select
                value={mapStyle}
                onValueChange={setMapStyle}
                options={mapStyleOptions}
                placeholder="Map Style"
              />
            </div>
            <div className="mt-4">
              <Select
                value={matchDistance}
                onValueChange={setMatchDistance}
                options={distanceOptions}
                placeholder="Match Distance"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <AnimatePresence>
        {hoveredMatch && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-4 left-4 z-10"
          >
            <Card className="w-80">
              <CardContent className="p-4 flex items-center space-x-4">
                <div className="relative h-16 w-16 rounded-full overflow-hidden">
                  <Image
                    src={
                      hoveredMatch.profileImage || '/images/default-avatar.png'
                    }
                    alt={hoveredMatch.name}
                    width={64}
                    height={64}
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-semibold">{hoveredMatch.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {hoveredMatch.age} • {hoveredMatch.distance}km away
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
