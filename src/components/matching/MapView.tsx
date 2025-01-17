import React, { useEffect, useRef } from 'react';
import { Match } from '@/types/match';
import { Loader } from '@googlemaps/js-api-loader';

interface MapViewProps {
  matches: Match[];
  onMarkerClick: (matchId: string) => void;
  center?: google.maps.LatLngLiteral;
  zoom?: number;
}

export const MapView: React.FC<MapViewProps> = ({
  matches,
  onMarkerClick,
  center = { lat: 0, lng: 0 },
  zoom = 12,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<Map<string, google.maps.Marker>>(new Map());

  useEffect(() => {
    const initMap = async () => {
      const loader = new Loader({
        apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
        version: 'weekly',
        libraries: ['places'],
      });

      const google = await loader.load();

      if (mapRef.current && !mapInstanceRef.current) {
        mapInstanceRef.current = new google.maps.Map(mapRef.current, {
          center,
          zoom,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }],
            },
          ],
          disableDefaultUI: true,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
        });
      }
    };

    initMap();
  }, [center, zoom]);

  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current.clear();

    // Add new markers
    matches.forEach(match => {
      if (!match.location || !mapInstanceRef.current) return;

      const marker = new google.maps.Marker({
        position: {
          lat: match.location.latitude,
          lng: match.location.longitude,
        },
        map: mapInstanceRef.current,
        title: match.name,
        icon: {
          url: match.profileImage || '/images/default-marker.png',
          scaledSize: new google.maps.Size(40, 40),
        },
      });

      marker.addListener('click', () => {
        onMarkerClick(match.id);
      });

      markersRef.current.set(match.id, marker);
    });

    // Fit bounds to show all markers
    if (matches.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      matches.forEach(match => {
        if (match.location) {
          bounds.extend({
            lat: match.location.latitude,
            lng: match.location.longitude,
          });
        }
      });
      mapInstanceRef.current.fitBounds(bounds);
    }
  }, [matches, onMarkerClick]);

  return (
    <div className="relative w-full h-full min-h-[400px]">
      <div ref={mapRef} className="absolute inset-0 rounded-lg shadow-md" />
    </div>
  );
};
