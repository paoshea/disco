import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { MarkerClusterer as GoogleMarkerClusterer } from '@googlemaps/markerclusterer';

// Export MapMarker interface for use in other components
export interface MapMarker {
  id: string;
  position: {
    lat: number;
    lng: number;
  };
  title?: string;
  icon?: string | google.maps.Icon | google.maps.Symbol;
  onClick?: () => void;
}

interface MarkerClusterer {
  clearMarkers: () => void;
  addMarkers: (markers: google.maps.Marker[]) => void;
}

export interface BaseMapViewProps {
  markers: MapMarker[];
  onMarkerClick?: (marker: MapMarker) => void;
  onMarkerMouseEnter?: (marker: MapMarker) => void;
  onMarkerMouseLeave?: () => void;
  center?: google.maps.LatLngLiteral;
  zoom?: number;
  options?: google.maps.MapOptions;
  onBoundsChanged?: (bounds: google.maps.LatLngBounds) => void;
  enableClustering?: boolean;
  clusterOptions?: {
    gridSize?: number;
    maxZoom?: number;
    styles?: Array<{
      url: string;
      height: number;
      width: number;
      textColor?: string;
      textSize?: number;
      backgroundPosition?: string;
    }>;
    imagePath?: string;
  };
  className?: string;
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

export function BaseMapView({
  markers,
  onMarkerClick,
  onMarkerMouseEnter,
  onMarkerMouseLeave,
  center = { lat: 37.7749, lng: -122.4194 }, // Default to San Francisco
  zoom = 12,
  options = {},
  onBoundsChanged,
  enableClustering = true,
  clusterOptions = {},
  className = '',
}: BaseMapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markerClusterer, setMarkerClusterer] =
    useState<MarkerClusterer | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const googleMarkersRef = useRef<google.maps.Marker[]>([]);

  // Initialize Google Maps
  useEffect(() => {
    if (!mapRef.current || isLoaded) return;

    const loader = new Loader({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '',
      version: 'weekly',
      libraries: ['places', 'visualization'],
    });

    void loader.load().then(() => {
      if (!mapRef.current) return;

      const mapInstance = new google.maps.Map(mapRef.current, {
        center,
        zoom,
        ...defaultMapOptions,
        ...options,
      });

      setMap(mapInstance);
      setIsLoaded(true);

      // Initialize MarkerClusterer if enabled
      if (enableClustering) {
        const markerCluster = new GoogleMarkerClusterer({
          map: mapInstance,
          ...clusterOptions,
        });
        setMarkerClusterer(markerCluster);
      }

      if (onBoundsChanged) {
        mapInstance.addListener('bounds_changed', () => {
          const bounds = mapInstance.getBounds();
          if (bounds) {
            onBoundsChanged(bounds);
          }
        });
      }
    });
  }, [
    center,
    zoom,
    isLoaded,
    enableClustering,
    options,
    onBoundsChanged,
    clusterOptions,
  ]);

  // Update markers when they change
  useEffect(() => {
    if (!map || !isLoaded) return;

    // Clear existing markers
    googleMarkersRef.current.forEach(marker => marker.setMap(null));
    googleMarkersRef.current = [];

    // Create new markers
    const newGoogleMarkers = markers.map(markerData => {
      const marker = new google.maps.Marker({
        position: markerData.position,
        map: enableClustering ? null : map,
        title: markerData.title,
        icon: markerData.icon,
      });

      if (onMarkerClick) {
        marker.addListener('click', () => onMarkerClick(markerData));
      }

      if (onMarkerMouseEnter) {
        marker.addListener('mouseover', () => onMarkerMouseEnter(markerData));
      }

      if (onMarkerMouseLeave) {
        marker.addListener('mouseout', onMarkerMouseLeave);
      }

      return marker;
    });

    googleMarkersRef.current = newGoogleMarkers;

    // Update marker clusterer if enabled
    if (markerClusterer && enableClustering) {
      markerClusterer.clearMarkers();
      markerClusterer.addMarkers(newGoogleMarkers);
    }
  }, [
    markers,
    map,
    isLoaded,
    onMarkerClick,
    onMarkerMouseEnter,
    onMarkerMouseLeave,
    enableClustering,
    markerClusterer,
  ]);

  return (
    <div ref={mapRef} className={`w-full h-full min-h-[400px] ${className}`} />
  );
}
