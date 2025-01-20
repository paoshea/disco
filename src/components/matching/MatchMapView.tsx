import React, { useMemo, useState, useCallback } from 'react';
import { Match } from '@/types/match';
import { BaseMapView, MapMarker } from '../map/BaseMapView';
import { Button } from '@/components/ui/Button';
import { Slider } from '@/components/ui/Slider';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/Select';
import { Card, CardContent } from '@/components/ui/Card';
import { Search, MapPin, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

export const MatchMapView: React.FC<MatchMapViewProps> = ({
  matches,
  onMarkerClick,
  center = { lat: 0, lng: 0 },
  zoom = 12,
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredMarkerId, setHoveredMarkerId] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    radius: 10,
    activity: 'all',
    timeWindow: 'all',
    minAge: 18,
    maxAge: 100,
  });
  const [mapBounds, setMapBounds] = useState<google.maps.LatLngBounds | null>(null);

  const handleBoundsChanged = useCallback((bounds: google.maps.LatLngBounds) => {
    setMapBounds(bounds);
  }, []);

  const filteredMarkers = useMemo<ExtendedMapMarker[]>(() => {
    return matches
      .filter(match => {
        // Filter by search query
        if (searchQuery && !match.name.toLowerCase().includes(searchQuery.toLowerCase())) {
          return false;
        }

        // Filter by age range
        if (match.age < filters.minAge || match.age > filters.maxAge) {
          return false;
        }

        // Filter by activity type
        if (filters.activity !== 'all' && match.activityPreferences?.type !== filters.activity) {
          return false;
        }

        // Filter by time window
        if (filters.timeWindow !== 'all' && match.activityPreferences?.timeWindow !== filters.timeWindow) {
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
          url: hoveredMarkerId === match.id 
            ? '/images/match-marker-active.svg'
            : '/images/match-marker.svg',
          scaledSize: new google.maps.Size(
            hoveredMarkerId === match.id ? 48 : 40,
            hoveredMarkerId === match.id ? 48 : 40
          ),
          anchor: new google.maps.Point(
            hoveredMarkerId === match.id ? 24 : 20,
            hoveredMarkerId === match.id ? 48 : 40
          ),
        },
        data: match,
        label: hoveredMarkerId === match.id ? {
          text: match.name,
          color: '#FF4B91',
          fontSize: '14px',
          fontWeight: 'bold',
          className: 'map-marker-label',
        } : undefined,
      }));
  }, [matches, searchQuery, filters, mapBounds, hoveredMarkerId]);

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
      mapTypeId: 'roadmap',
    }),
    []
  );

  const handleMarkerClick = useCallback((marker: ExtendedMapMarker) => {
    onMarkerClick(marker.data);
  }, [onMarkerClick]);

  const handleMarkerMouseEnter = useCallback((marker: ExtendedMapMarker) => {
    setHoveredMarkerId(marker.id);
  }, []);

  const handleMarkerMouseLeave = useCallback(() => {
    setHoveredMarkerId(null);
  }, []);

  return (
    <div className="relative h-full">
      <BaseMapView
        markers={filteredMarkers}
        onMarkerClick={handleMarkerClick}
        onMarkerMouseEnter={handleMarkerMouseEnter}
        onMarkerMouseLeave={handleMarkerMouseLeave}
        center={center}
        zoom={zoom}
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

      {/* Search and Filter Controls */}
      <div className="absolute top-4 left-4 right-4 flex gap-2">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search matches..."
              className="w-full pl-10 pr-4 py-2 bg-white rounded-lg shadow-lg"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="bg-white shadow-lg"
        >
          <Filter className={showFilters ? 'text-primary' : 'text-gray-600'} />
        </Button>
      </div>

      {/* Filter Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, x: -300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            className="absolute left-4 top-16 w-80 bg-white rounded-lg shadow-lg"
          >
            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Distance ({filters.radius}km)</label>
                  <Slider
                    value={[filters.radius]}
                    onValueChange={(value: number[]) =>
                      setFilters(prev => ({ ...prev, radius: value[0] }))
                    }
                    min={1}
                    max={100}
                    step={1}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Activity Type</label>
                  <Select
                    value={filters.activity}
                    onValueChange={(value: string) =>
                      setFilters(prev => ({ ...prev, activity: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select activity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Activities</SelectItem>
                      <SelectItem value="coffee">Coffee</SelectItem>
                      <SelectItem value="lunch">Lunch</SelectItem>
                      <SelectItem value="dinner">Dinner</SelectItem>
                      <SelectItem value="networking">Networking</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Time Window</label>
                  <Select
                    value={filters.timeWindow}
                    onValueChange={(value: string) =>
                      setFilters(prev => ({ ...prev, timeWindow: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any Time</SelectItem>
                      <SelectItem value="now">Right Now</SelectItem>
                      <SelectItem value="15min">Next 15 Minutes</SelectItem>
                      <SelectItem value="30min">Next 30 Minutes</SelectItem>
                      <SelectItem value="1hour">Next Hour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Age Range</label>
                  <div className="flex gap-4">
                    <input
                      type="number"
                      min={18}
                      max={filters.maxAge}
                      value={filters.minAge}
                      onChange={(e) =>
                        setFilters(prev => ({
                          ...prev,
                          minAge: parseInt(e.target.value) || 18,
                        }))
                      }
                      className="w-20 px-2 py-1 border rounded"
                    />
                    <span className="text-gray-500">to</span>
                    <input
                      type="number"
                      min={filters.minAge}
                      max={100}
                      value={filters.maxAge}
                      onChange={(e) =>
                        setFilters(prev => ({
                          ...prev,
                          maxAge: parseInt(e.target.value) || 100,
                        }))
                      }
                      className="w-20 px-2 py-1 border rounded"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Match Count */}
      <div className="absolute bottom-4 left-4 bg-white px-4 py-2 rounded-lg shadow-lg">
        <p className="text-sm font-medium">
          {filteredMarkers.length} matches in view
        </p>
      </div>

      <style jsx global>{`
        .map-marker-label {
          background: white;
          padding: 4px 8px;
          border-radius: 12px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          white-space: nowrap;
          transform: translateY(-48px);
          transition: all 0.2s ease-in-out;
        }
      `}</style>
    </div>
  );
};
