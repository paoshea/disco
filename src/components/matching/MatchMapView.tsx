import React, { useMemo } from 'react';
import { Match } from '@/types/match';
import { BaseMapView, LatLng, MapMarker } from '../map/BaseMapView';

interface MatchMapViewProps {
  matches: Match[];
  onMarkerClick: (matchId: string) => void;
  center?: LatLng;
  zoom?: number;
}

export const MatchMapView: React.FC<MatchMapViewProps> = ({
  matches,
  onMarkerClick,
  center = { lat: 0, lng: 0 },
  zoom = 12,
}) => {
  const markers: MapMarker[] = useMemo(
    () =>
      matches
        .filter((match) => match.location)
        .map((match) => ({
          id: match.id,
          position: {
            lat: match.location!.latitude,
            lng: match.location!.longitude,
          },
          title: match.name,
          icon: match.profileImage
            ? {
                url: match.profileImage,
                scaledSize: { width: 40, height: 40 },
              }
            : {
                url: '/images/default-marker.png',
                scaledSize: { width: 40, height: 40 },
              },
        })),
    [matches]
  );

  const mapOptions = useMemo(
    () => ({
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
    }),
    []
  );

  return (
    <BaseMapView
      center={center}
      zoom={zoom}
      markers={markers}
      onMarkerClick={onMarkerClick}
      mapOptions={mapOptions}
    />
  );
};
