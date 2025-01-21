import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Car, Train, PersonStanding } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ScrollArea } from '@/components/ui/ScrollArea';

interface RouteInfo {
  mode: google.maps.TravelMode;
  duration: string;
  distance: string;
  steps: {
    instruction: string;
    distance: string;
    duration: string;
    mode: google.maps.TravelMode;
  }[];
}

interface RoutePlannerProps {
  origin: google.maps.LatLng;
  destination: google.maps.LatLng;
  onRouteSelect?: (route: RouteInfo) => void;
  onRoutePathUpdate?: (path: google.maps.LatLng[]) => void;
}

const TRAVEL_MODES = [
  { mode: google.maps.TravelMode.DRIVING, icon: Car, label: 'Drive' },
  { mode: google.maps.TravelMode.TRANSIT, icon: Train, label: 'Transit' },
  { mode: google.maps.TravelMode.WALKING, icon: PersonStanding, label: 'Walk' },
];

export function RoutePlanner({
  origin,
  destination,
  onRouteSelect,
  onRoutePathUpdate,
}: RoutePlannerProps) {
  const [selectedMode, setSelectedMode] = useState<google.maps.TravelMode>(
    google.maps.TravelMode.DRIVING
  );
  const [routes, setRoutes] = useState<RouteInfo[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchRoutes = async () => {
      setLoading(true);
      try {
        const directionsService = new google.maps.DirectionsService();
        const result = await directionsService.route({
          origin,
          destination,
          travelMode: selectedMode,
          provideRouteAlternatives: true,
        });

        if (result.routes && result.routes.length > 0) {
          const routeInfos: RouteInfo[] = result.routes
            .map(route => {
              const leg = route.legs[0];
              if (!leg) return null;

              const path = route.overview_path;
              if (onRoutePathUpdate && path) {
                onRoutePathUpdate(path);
              }

              return {
                mode: selectedMode,
                duration: leg.duration?.text || '',
                distance: leg.distance?.text || '',
                steps:
                  leg.steps?.map(step => ({
                    instruction: step.instructions || '',
                    distance: step.distance?.text || '',
                    duration: step.duration?.text || '',
                    mode: step.travel_mode,
                  })) || [],
              };
            })
            .filter((route): route is RouteInfo => route !== null);

          setRoutes(routeInfos);
          if (onRouteSelect && routeInfos.length > 0) {
            onRouteSelect(routeInfos[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching routes:', error);
      } finally {
        setLoading(false);
      }
    };

    if (origin && destination) {
      fetchRoutes();
    }
  }, [origin, destination, selectedMode, onRouteSelect, onRoutePathUpdate]);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {TRAVEL_MODES.map(({ mode, icon: Icon, label }) => (
          <Button
            key={mode}
            variant={selectedMode === mode ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setSelectedMode(mode)}
            className="flex items-center gap-2"
          >
            <Icon className="h-4 w-4" />
            {label}
          </Button>
        ))}
      </div>

      <ScrollArea className="h-[200px]">
        <div className="space-y-2">
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900" />
            </div>
          ) : (
            routes.map((route, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="rounded-lg border p-4 hover:bg-gray-50 cursor-pointer"
                onClick={() => onRouteSelect?.(route)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">{route.duration}</span>
                    <Badge variant="secondary" className="ml-2">
                      {route.distance}
                    </Badge>
                  </div>
                </div>

                <div className="mt-2 space-y-1">
                  {route.steps.slice(0, 3).map((step, stepIndex) => (
                    <div
                      key={stepIndex}
                      className="text-sm text-gray-600"
                      dangerouslySetInnerHTML={{ __html: step.instruction }}
                    />
                  ))}
                  {route.steps.length > 3 && (
                    <div className="text-sm text-gray-500">
                      + {route.steps.length - 3} more steps
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
