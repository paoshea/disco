# Map Components

This directory contains reusable map components built on top of Google Maps.

## Components

### BaseMapView

A foundational map component that provides core Google Maps functionality with TypeScript support.

```tsx
import { BaseMapView } from '@/components/map/BaseMapView';

<BaseMapView
  center={{ lat: 0, lng: 0 }}
  zoom={14}
  markers={[
    {
      id: 'marker-1',
      position: { lat: 0, lng: 0 },
      title: 'Example Marker',
      icon: {
        url: '/images/custom-marker.png',
        scaledSize: { width: 32, height: 32 },
      },
    },
  ]}
  onClick={(e) => console.log('Map clicked:', e.latLng)}
  onMarkerClick={(markerId) => console.log('Marker clicked:', markerId)}
/>
```

#### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| center | `LatLng` | Yes | Center coordinates of the map |
| zoom | `number` | No | Zoom level (default: 14) |
| markers | `MapMarker[]` | No | Array of markers to display |
| onClick | `(e: google.maps.MapMouseEvent) => void` | No | Handler for map click events |
| onMarkerClick | `(markerId: string) => void` | No | Handler for marker click events |
| mapOptions | `google.maps.MapOptions` | No | Additional Google Maps options |

#### Types

```typescript
interface LatLng {
  lat: number;
  lng: number;
}

interface MapMarker {
  id: string;
  position: LatLng;
  title?: string;
  icon?: {
    url: string;
    scaledSize?: { width: number; height: number };
  };
}
```

### Assets

The following marker icons are available in the `/public/images/` directory:

- `alert-marker.png`: Red marker with warning icon (32x32px)
- `current-location-marker.png`: Blue marker with location dot (32x32px)

## Best Practices

1. Always provide unique IDs for markers
2. Use appropriate marker icons for different use cases
3. Handle click events for both map and markers
4. Consider mobile responsiveness when setting initial zoom levels
