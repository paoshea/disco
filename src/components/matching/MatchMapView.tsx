import React, { useEffect, useState } from 'react';
import { GoogleMap, useLoadScript, MarkerF } from '@react-google-maps/api';
import type { Match } from '@/types/match';

interface MatchMapViewProps {
  matches: Match[];
}

const mapContainerStyle = {
  width: '100%',
  height: '600px',
};

const defaultCenter = {
  lat: 37.7749,
  lng: -122.4194,
};

const mapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
};

export function MatchMapView({ matches }: MatchMapViewProps) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  });

  const [userLocation, setUserLocation] = useState(defaultCenter);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        error => {
          console.error('Error getting user location:', error);
        }
      );
    }
  }, []);

  if (loadError) {
    return <div>Error loading maps</div>;
  }

  if (!isLoaded) {
    return <div>Loading maps...</div>;
  }

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      zoom={11}
      center={userLocation}
      options={mapOptions}
    >
      {matches.map(match => {
        if (!match.location) return null;

        return (
          <MarkerF
            key={match.id}
            position={{
              lat: match.location.latitude,
              lng: match.location.longitude,
            }}
            title={match.name}
          />
        );
      })}
      <MarkerF
        position={userLocation}
        icon={{
          url: '/images/user-marker.png',
          scaledSize: new window.google.maps.Size(40, 40),
        }}
      />
    </GoogleMap>
  );
}
