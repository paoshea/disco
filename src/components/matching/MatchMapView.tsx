import React, { useMemo, useState, useCallback, ChangeEvent } from 'react';
import { Match } from '@/types/match';
import { BaseMapView, MapMarker } from '../map/BaseMapView';
import { Button } from '@/components/ui/Button';
import { Slider } from '@/components/ui/Slider';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/Select';
import { Card, CardContent } from '@/components/ui/Card';
import { Search, MapPin, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

interface ExtendedMapMarker extends MapMarker {
  data: Match;
  icon: {
    url: string;
    scaledSize: google.maps.Size;
    anchor: google.maps.Point;
  };
  label?: {
    text: string;
    color: string;
    fontSize: string;
    fontWeight: string;
    className: string;
  };
}

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
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredMatch, setHoveredMatch] = useState<Match | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    radius: 10,
    activity: 'all',
    timeWindow: 'all',
    minAge: 18,
    maxAge: 100,
  });
  const [mapBounds, setMapBounds] = useState<google.maps.LatLngBounds | null>(
    null
  );
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

  const handleBoundsChanged = useCallback(
    (bounds: google.maps.LatLngBounds) => {
      setMapBounds(bounds);
    },
    []
  );

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
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

  const handleAgeRangeChange = (values: number[]) => {
    setFilters(prev => ({
      ...prev,
      minAge: values[0],
      maxAge: values[1],
    }));
  };

  const filteredMarkers = useMemo<ExtendedMapMarker[]>(() => {
    return matches
      .filter(match => {
        // Filter by search query
        if (
          searchQuery &&
          !match.name.toLowerCase().includes(searchQuery.toLowerCase())
        ) {
          return false;
        }

        // Filter by age range
        if (match.age < filters.minAge || match.age > filters.maxAge) {
          return false;
        }

        // Filter by activity type
        if (
          filters.activity !== 'all' &&
          match.activityPreferences?.type !== filters.activity
        ) {
          return false;
        }

        // Filter by time window
        if (
          filters.timeWindow !== 'all' &&
          match.activityPreferences?.timeWindow !== filters.timeWindow
        ) {
          return false;
        }

        // Filter by map bounds
        if (mapBounds) {
          const matchLatLng = new google.maps.LatLng(
            match.location.latitude,
            match.location.longitude
          );
          if (!mapBounds.contains(matchLatLng)) {
            return false;
          }
        }

        return true;
      })
      .map(match => ({
        id: match.id,
        position: {
          lat: match.location.latitude,
          lng: match.location.longitude,
        },
        title: match.name,
        icon: {
          url:
            hoveredMatch === match
              ? '/images/match-marker-active.svg'
              : '/images/match-marker.svg',
          scaledSize: new google.maps.Size(
            hoveredMatch === match ? 48 : 40,
            hoveredMatch === match ? 48 : 40
          ),
          anchor: new google.maps.Point(
            hoveredMatch === match ? 24 : 20,
            hoveredMatch === match ? 48 : 40
          ),
        },
        data: match,
        label:
          hoveredMatch === match
            ? {
                text: match.name,
                color: '#FF4B91',
                fontSize: '14px',
                fontWeight: 'bold',
                className: 'map-marker-label',
              }
            : undefined,
      }));
  }, [matches, searchQuery, filters, mapBounds, hoveredMatch]);

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
    (marker: MapMarker) => {
      const extendedMarker = marker as ExtendedMapMarker;
      if (extendedMarker.data) {
        onMarkerClick(extendedMarker.data);
      }
    },
    [onMarkerClick]
  );

  const handleMarkerMouseEnter = useCallback(
    (marker: MapMarker & { data?: Match }) => {
      if (marker.data) {
        setHoveredMatch(marker.data);
      }
    },
    []
  );

  const handleMarkerMouseLeave = useCallback(() => {
    setHoveredMatch(null);
  }, []);

  const handleFilterChange = useCallback(
    (field: keyof FilterState, value: FilterState[keyof FilterState]) => {
      setFilters(prev => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleFilterApply = () => {
    if (filters.minAge > filters.maxAge) {
      toast({
        title: 'Invalid Age Range',
        description: 'Minimum age cannot be greater than maximum age',
        variant: 'error',
      });
      return;
    }
    setShowFilters(false);
    toast({
      title: 'Filters Applied',
      description: 'Map view has been updated with your filters',
      variant: 'default',
    });
  };

  return (
    <div className="relative h-full">
      <div className="absolute inset-0">
        <BaseMapView
          center={center}
          zoom={zoom}
          markers={filteredMarkers}
          onMarkerClick={handleMarkerClick}
          onMarkerMouseEnter={handleMarkerMouseEnter}
          onMarkerMouseLeave={handleMarkerMouseLeave}
          options={mapOptions}
          onBoundsChanged={handleBoundsChanged}
          enableClustering
          clusterOptions={{
            styles: [
              {
                textColor: 'white',
                textSize: 14,
                width: 40,
                height: 40,
                url: '/images/match-cluster.svg',
              },
            ],
          }}
        />
      </div>

      <div className="absolute top-4 left-4 z-10 space-y-4">
        <Card className="w-80">
          <CardContent className="p-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search matches..."
                className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Select
                value={mapStyle}
                onValueChange={(value: string) => setMapStyle(value)}
                options={mapStyleOptions}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Select
                value={matchDistance}
                onValueChange={(value: string) => setMatchDistance(value)}
                options={distanceOptions}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Activity Type</label>
              <Select
                value={filters.activity}
                onValueChange={handleActivityChange}
                options={[
                  { value: 'all', label: 'All Activities' },
                  { value: 'coffee', label: 'Coffee' },
                  { value: 'lunch', label: 'Lunch' },
                  { value: 'dinner', label: 'Dinner' },
                  { value: 'drinks', label: 'Drinks' },
                ]}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Time Window</label>
              <Select
                value={filters.timeWindow}
                onValueChange={handleTimeWindowChange}
                options={[
                  { value: 'all', label: 'Any Time' },
                  { value: 'now', label: 'Right Now' },
                  { value: '15min', label: 'Next 15 Minutes' },
                  { value: '30min', label: 'Next 30 Minutes' },
                  { value: '1hour', label: 'Next Hour' },
                  { value: 'today', label: 'Today' },
                ]}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Search Radius ({filters.radius}km)
              </label>
              <Slider
                value={[filters.radius]}
                onValueChange={handleRadiusChange}
                min={1}
                max={100}
                step={1}
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
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  {hoveredMatch.profileImage && (
                    <img
                      src={hoveredMatch.profileImage}
                      alt={hoveredMatch.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <h3 className="font-medium">{hoveredMatch.name}</h3>
                    <p className="text-sm text-gray-500">
                      {hoveredMatch.distance}km away
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
