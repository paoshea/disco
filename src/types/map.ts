import type { LatLngLiteral } from '@googlemaps/google-maps-services-js';

export interface MapMarker {
  id: string;
  position: LatLngLiteral;
  icon?: {
    url: string;
    scaledSize: google.maps.Size;
    anchor?: google.maps.Point;
  };
  title?: string;
}

export interface MapViewProps {
  center: LatLngLiteral;
  zoom: number;
  markers?: MapMarker[];
}
