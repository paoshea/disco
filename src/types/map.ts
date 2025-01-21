// Define our own LatLngLiteral type to avoid dependency issues
export interface LatLngLiteral {
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
  data?: Record<string, unknown>;
  location?: {
    latitude: number;
    longitude: number;
    name: string;
    address: string;
  };
  scale?: number;
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

export interface RouteInfo {
  mode: google.maps.TravelMode;
  duration: string;
  distance: string;
  steps: {
    instruction: string;
    distance: string;
    duration: string;
    mode: google.maps.TravelMode;
  }[];
  bounds?: google.maps.LatLngBounds;
  copyrights?: string;
  legs?: google.maps.DirectionsLeg[];
  overview_path?: google.maps.LatLng[];
  overview_polyline?: string;
  warnings?: string[];
  waypoint_order?: number[];
}
