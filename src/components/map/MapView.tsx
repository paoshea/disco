import React from 'react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';

interface LatLng {
  lat: number;
  lng: number;
}

interface MapMarker {
  position: LatLng;
  title?: string;
}

interface MapViewProps {
  center: LatLng;
  zoom?: number;
  markers?: MapMarker[];
  onClick?: (e: google.maps.MapMouseEvent) => void;
}

const containerStyle = {
  width: '100%',
  height: '100%',
};

export const MapView: React.FC<MapViewProps> = ({
  center,
  zoom = 14,
  markers = [],
  onClick,
}) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  });

  const [map, setMap] = React.useState<google.maps.Map | null>(null);

  const onLoad = React.useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = React.useCallback(() => {
    setMap(null);
  }, []);

  if (!isLoaded) {
    return <div>Loading map...</div>;
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={zoom}
      onLoad={onLoad}
      onUnmount={onUnmount}
      onClick={onClick}
      options={{
        disableDefaultUI: true,
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: false,
      }}
    >
      {markers.map((marker, index) => (
        <Marker
          key={index}
          position={marker.position}
          title={marker.title}
        />
      ))}
    </GoogleMap>
  );
};
