# Safety Components

This directory contains components related to user safety and emergency features.

## Components

### EmergencyAlert

A component for sending emergency alerts with location data.

```tsx
import { EmergencyAlert } from '@/components/safety/EmergencyAlert';

<EmergencyAlert
  onAlertSent={() => console.log('Alert sent')}
  onCancel={() => console.log('Cancelled')}
/>
```

#### Features

- Real-time location tracking
- Visual map display of current location
- Error handling for location services
- Loading states for alert submission
- Accessible button controls

### SafetyAlertNotification

A component for displaying active safety alerts with location information.

```tsx
import { SafetyAlertNotification } from '@/components/safety/SafetyAlertNotification';

<SafetyAlertNotification />
```

#### Features

- Displays emergency alerts with location
- Interactive map view of alert location
- Resolve alert functionality
- Error handling and loading states
- Notification permission management

## Map Integration

Both components use the BaseMapView component with custom markers:

- EmergencyAlert: Uses `current-location-marker.png` (blue)
- SafetyAlertNotification: Uses `alert-marker.png` (red)

## Context Integration

These components integrate with SafetyAlertContext for state management:

```typescript
const { activeAlerts, resolveAlert } = useSafetyAlerts();
```

## Best Practices

1. **Location Services**
   - Always check for location permissions
   - Provide clear feedback when location is unavailable
   - Use high-accuracy mode for emergency features

2. **Alert Handling**
   - Implement proper error handling
   - Show clear loading states
   - Provide feedback on alert status

3. **Map Usage**
   - Use appropriate zoom levels for context
   - Ensure markers are clearly visible
   - Handle map interaction appropriately

4. **Accessibility**
   - Maintain proper contrast ratios
   - Provide clear error messages
   - Ensure keyboard navigation
   - Use appropriate ARIA labels

5. **Performance**
   - Optimize marker rendering
   - Handle background location updates efficiently
   - Manage alert polling carefully

## Error States

Components should handle the following error states:

1. Location services disabled
2. Network errors
3. Permission denied
4. Alert submission failures

## Future Improvements

1. Add support for sharing location with emergency contacts
2. Implement real-time alert updates
3. Add support for custom alert types
4. Enhance map interaction for emergency services
5. Add offline support for critical features
