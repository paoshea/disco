import { useMemo, useState, useCallback } from 'react';
import { Match } from '@/types/match';
import { BaseMapView, type MapMarker } from '../map/BaseMapView';
import { Card, CardContent } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface MatchMapViewProps {
  matches: Match[];
  onMarkerClick: (match: Match) => void;
  center?: google.maps.LatLngLiteral;
  zoom?: number;
}

export const MatchMapView: React.FC<MatchMapViewProps> = ({
  matches,
  onMarkerClick,
  center = { lat: 0, lng: 0 },
  zoom = 12,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredMatch, setHoveredMatch] = useState<Match | null>(null);
  const [mapStyle, setMapStyle] = useState('roadmap');
  const [matchDistance, setMatchDistance] = useState('10km');

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

  const createMarker = useCallback((match: Match): MapMarker => {
    return {
      id: match.id,
      position: {
        lat: match.location.latitude,
        lng: match.location.longitude,
      },
      title: match.name,
      icon: {
        url: match.profileImage || '/images/markers/default-marker.png',
        scaledSize: new google.maps.Size(40, 40),
        anchor: new google.maps.Point(20, 20),
      },
    };
  }, []);

  const markers = useMemo(
    () => matches.map(match => createMarker(match)),
    [matches, createMarker]
  );

  const filteredMarkers = useMemo(() => {
    if (!searchQuery) return markers;
    return markers.filter(marker =>
      marker.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [markers, searchQuery]);

  const handleMarkerClick = useCallback(
    (marker: MapMarker) => {
      const match = matches.find(m => m.id === marker.id);
      if (match) {
        onMarkerClick(match);
      }
    },
    [matches, onMarkerClick]
  );

  const handleMarkerMouseEnter = useCallback(
    (marker: MapMarker) => {
      const match = matches.find(m => m.id === marker.id);
      if (match) {
        setHoveredMatch(match);
      }
    },
    [matches]
  );

  const handleMarkerMouseLeave = useCallback(() => {
    setHoveredMatch(null);
  }, []);

  return (
    <div className="relative h-full">
      <div className="absolute top-4 left-4 right-4 z-10 flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search matches..."
            className="w-full pl-10 pr-4 py-2 bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
        </div>
        <Select
          value={mapStyle}
          onValueChange={setMapStyle}
          options={mapStyleOptions}
          className="w-32"
        />
        <Select
          value={matchDistance}
          onValueChange={setMatchDistance}
          options={distanceOptions}
          className="w-24"
        />
      </div>

      <BaseMapView
        markers={filteredMarkers}
        onMarkerClick={handleMarkerClick}
        onMarkerMouseEnter={handleMarkerMouseEnter}
        onMarkerMouseLeave={handleMarkerMouseLeave}
        center={center}
        zoom={zoom}
        options={{
          mapTypeId: mapStyle as google.maps.MapTypeId,
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          clickableIcons: false,
        }}
      />

      <AnimatePresence>
        {hoveredMatch && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-4 left-4 right-4"
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="relative h-16 w-16 rounded-full overflow-hidden">
                    <Image
                      src={
                        hoveredMatch.profileImage ||
                        '/images/default-avatar.png'
                      }
                      alt={hoveredMatch.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold">{hoveredMatch.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {hoveredMatch.bio || 'No bio available'}
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
