import React, { useState, useEffect } from 'react';
import { MatchPreview } from '@/types/match';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Icon } from 'leaflet';
import { MatchService } from '@/services/match/match.service';

export interface MatchMapViewProps {
  matches: MatchPreview[];
  loading: boolean;
  onMatchClick: (matchId: string) => void;
}

// Custom marker icon
const customIcon = new Icon({
  iconUrl: '/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

export function MatchMapView({ matches, loading, onMatchClick }: MatchMapViewProps) {
  const [center, setCenter] = useState<[number, number]>([0, 0]);
  const [error, setError] = useState<string | null>(null);
  const matchService = MatchService.getInstance();

  useEffect(() => {
    // Get user's location
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCenter([position.coords.latitude, position.coords.longitude]);
        },
        () => {
          // Fallback: calculate center from matches
          if (matches.length > 0) {
            const validLocations = matches.filter(m => m.location);
            if (validLocations.length > 0) {
              const avgLat = validLocations.reduce((sum, m) => sum + (m.location?.latitude || 0), 0) / validLocations.length;
              const avgLng = validLocations.reduce((sum, m) => sum + (m.location?.longitude || 0), 0) / validLocations.length;
              setCenter([avgLat, avgLng]);
            }
          }
        }
      );
    }
  }, [matches]);

  if (loading) {
    return (
      <div className="h-[600px] bg-gray-200 rounded-lg animate-pulse" />
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="h-[600px] rounded-lg overflow-hidden">
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {matches.map((match) => (
          match.location && (
            <Marker
              key={match.id}
              position={[match.location.latitude, match.location.longitude]}
              icon={customIcon}
              eventHandlers={{
                click: () => onMatchClick(match.id),
              }}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-semibold">{match.name}</h3>
                  <p className="text-sm text-gray-600">
                    {match.distance ? `${Math.round(match.distance)}km away` : 'Distance unknown'}
                  </p>
                  {match.interests.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-500">Interests:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {match.interests.slice(0, 3).map((interest, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full"
                          >
                            {interest}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          )
        ))}
      </MapContainer>
    </div>
  );
}
