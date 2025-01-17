# Matching Components

This directory contains components specific to the matching functionality of the application.

## Components

### MatchMapView

A specialized map component for displaying matches on a map, built on top of BaseMapView.

```tsx
import { MatchMapView } from '@/components/matching/MatchMapView';

<MatchMapView
  matches={matches}
  onMarkerClick={handleMarkerClick}
  center={{ lat: 0, lng: 0 }}
  zoom={12}
/>;
```

#### Props

| Prop          | Type                        | Required | Description                                        |
| ------------- | --------------------------- | -------- | -------------------------------------------------- |
| matches       | `Match[]`                   | Yes      | Array of match objects to display                  |
| onMarkerClick | `(matchId: string) => void` | Yes      | Handler for match marker clicks                    |
| center        | `LatLng`                    | No       | Center coordinates (default: `{ lat: 0, lng: 0 }`) |
| zoom          | `number`                    | No       | Zoom level (default: 12)                           |

#### Features

1. Automatically converts match data to map markers
2. Uses profile images as marker icons
3. Provides fallback marker for matches without profile images
4. Optimized marker rendering with useMemo

## Integration with Match Types

The component expects matches to conform to the following type:

```typescript
interface Match {
  id: string;
  name: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  profileImage?: string;
}
```

## Best Practices

1. Always handle marker clicks to show match details
2. Provide appropriate fallback UI when location data is missing
3. Consider loading states for profile images
4. Handle errors gracefully when location or profile data is unavailable
