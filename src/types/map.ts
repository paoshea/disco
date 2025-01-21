// Define our own LatLngLiteral type to avoid dependency issues
export interface LatLngLiteral {
  lat: number;
  lng: number;
}

export interface MapMarker {
  id: string;
  position: LatLngLiteral;
  title: string;
  icon?: {
    url: string;
    scaledSize?: { width: number; height: number };
  };
  onClick?: () => void;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface MapViewport {
  center: LatLngLiteral;
  zoom: number;
  bounds?: MapBounds;
}

export type MapStyle = 'roadmap' | 'satellite' | 'hybrid' | 'terrain';
