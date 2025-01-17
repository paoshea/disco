import React from 'react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';

export interface LatLng {
  lat: number;
  lng: number;
}

export interface MapMarker {
  id: string;
  position: LatLng;
  title?: string;
  icon?: {
    url: string;
    scaledSize?: { width: number; height: number };
  };
}

export interface BaseMapViewProps {
  center: LatLng;
  zoom?: number;
  markers?: MapMarker[];
  onClick?: (e: google.maps.MapMouseEvent) => void;
  onMarkerClick?: (markerId: string) => void;
  mapOptions?: google.maps.MapOptions;
}

const defaultMapOptions: google.maps.MapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: true,
  styles: [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }],
    },
  ],
};

const containerStyle = {
  width: '100%',
  height: '100%',
};

export const BaseMapView: React.FC<BaseMapViewProps> = ({
  center,
  zoom = 14,
  markers = [],
  onClick,
  onMarkerClick,
  mapOptions = {},
}) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  });

  const handleMarkerClick = React.useCallback(
    (markerId: string) => {
      if (onMarkerClick) {
        onMarkerClick(markerId);
      }
    },
    [onMarkerClick]
  );

  if (!isLoaded) {
    return <div>Loading map...</div>;
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={zoom}
      onClick={onClick}
      options={{ ...defaultMapOptions, ...mapOptions }}
    >
      {markers.map(marker => (
        <Marker
          key={marker.id}
          position={marker.position}
          title={marker.title}
          icon={
            marker.icon
              ? {
                  url: marker.icon.url,
                  scaledSize: marker.icon.scaledSize
                    ? new google.maps.Size(
                        marker.icon.scaledSize.width,
                        marker.icon.scaledSize.height
                      )
                    : undefined,
                }
              : undefined
          }
          onClick={() => handleMarkerClick(marker.id)}
        />
      ))}
    </GoogleMap>
  );
};
