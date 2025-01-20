import React, { useEffect, useRef } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

export interface LatLng {
  lat: number;
  lng: number;
}

export interface MapMarker {
  id: string;
  position: google.maps.LatLngLiteral;
  title: string;
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
  data?: any;
}

interface BaseMapViewProps {
  markers: MapMarker[];
  onMarkerClick: (marker: MapMarker) => void;
  onMarkerMouseEnter: (marker: MapMarker) => void;
  onMarkerMouseLeave: () => void;
  center: google.maps.LatLngLiteral;
  zoom: number;
  options?: google.maps.MapOptions;
  onBoundsChanged?: (bounds: google.maps.LatLngBounds) => void;
  enableClustering?: boolean;
  clusterOptions?: {
    styles?: Array<{
      url: string;
      height: number;
      width: number;
      textColor?: string;
      textSize?: number;
    }>;
    imagePath?: string;
  };
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
  markers,
  onMarkerClick,
  onMarkerMouseEnter,
  onMarkerMouseLeave,
  center,
  zoom,
  options = {},
  onBoundsChanged,
  enableClustering = false,
  clusterOptions = {},
}) => {
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const markerClustererRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initMap = async () => {
      const loader = new Loader({
        apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
        version: 'weekly',
        libraries: ['places', 'geometry'],
      });

      const google = await loader.load();
      
      if (!mapContainerRef.current) return;

      const map = new google.maps.Map(mapContainerRef.current, {
        center,
        zoom,
        ...defaultMapOptions,
        ...options,
      });

      mapRef.current = map;

      if (onBoundsChanged) {
        map.addListener('bounds_changed', () => {
          const bounds = map.getBounds();
          if (bounds) {
            onBoundsChanged(bounds);
          }
        });
      }

      // Initialize MarkerClusterer if enabled
      if (enableClustering) {
        const { MarkerClusterer } = await import('@googlemaps/markerclusterer');
        markerClustererRef.current = new MarkerClusterer({
          map,
          markers: [],
          ...clusterOptions,
        });
      }
    };

    void initMap();

    return () => {
      if (markerClustererRef.current) {
        markerClustererRef.current.clearMarkers();
      }
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];
    };
  }, [center, zoom, options, enableClustering, clusterOptions, onBoundsChanged]);

  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Create new markers
    const newMarkers = markers.map(markerData => {
      const marker = new google.maps.Marker({
        position: markerData.position,
        map: mapRef.current,
        title: markerData.title,
        icon: {
          url: markerData.icon.url,
          scaledSize: markerData.icon.scaledSize,
          anchor: markerData.icon.anchor,
        },
        label: markerData.label ? {
          text: markerData.label.text,
          color: markerData.label.color,
          fontSize: markerData.label.fontSize,
          fontWeight: markerData.label.fontWeight,
          className: markerData.label.className,
        } : undefined,
      });

      marker.addListener('click', () => onMarkerClick(markerData));
      marker.addListener('mouseover', () => onMarkerMouseEnter(markerData));
      marker.addListener('mouseout', onMarkerMouseLeave);

      return marker;
    });

    markersRef.current = newMarkers;

    // Update MarkerClusterer if enabled
    if (enableClustering && markerClustererRef.current) {
      markerClustererRef.current.clearMarkers();
      markerClustererRef.current.addMarkers(newMarkers);
    }
  }, [markers, onMarkerClick, onMarkerMouseEnter, onMarkerMouseLeave]);

  return (
    <div 
      ref={mapContainerRef} 
      className="w-full h-full rounded-lg"
      style={{ minHeight: '400px' }}
    />
  );
};

export type { BaseMapViewProps };
