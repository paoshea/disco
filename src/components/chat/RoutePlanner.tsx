import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Car, Train, Walk } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

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
  onRouteSelect: (route: RouteInfo) => void;
  onRoutePathUpdate: (path: google.maps.LatLng[]) => void;
}

const TRAVEL_MODES = [
  { mode: google.maps.TravelMode.DRIVING, icon: Car, label: 'Drive' },
  { mode: google.maps.TravelMode.TRANSIT, icon: Train, label: 'Transit' },
  { mode: google.maps.TravelMode.WALKING, icon: Walk, label: 'Walk' },
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

  const fetchRoute = async (mode: google.maps.TravelMode) => {
    setLoading(true);
    setSelectedMode(mode);

    try {
      const directionsService = new google.maps.DirectionsService();
      const result = await directionsService.route({
        origin,
        destination,
        travelMode: mode,
        alternatives: true,
      });

      const routesInfo: RouteInfo[] = result.routes.map((route) => {
        const duration = route.legs[0].duration?.text || '';
        const distance = route.legs[0].distance?.text || '';

        const steps = route.legs[0].steps.map((step) => ({
          instruction: step.instructions.replace(/<[^>]*>/g, ''),
          distance: step.distance?.text || '',
          duration: step.duration?.text || '',
          mode: step.travel_mode,
        }));

        // Update the route path on the map
        const path = route.overview_path.map(
          (point) => new google.maps.LatLng(point.lat(), point.lng())
        );
        onRoutePathUpdate(path);

        return {
          mode,
          duration,
          distance,
          steps,
        };
      });

      setRoutes(routesInfo);
    } catch (error) {
      console.error('Error fetching route:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoute(selectedMode);
  }, [origin, destination]);

  const getModeIcon = (mode: google.maps.TravelMode) => {
    switch (mode) {
      case google.maps.TravelMode.DRIVING:
        return Car;
      case google.maps.TravelMode.TRANSIT:
        return Train;
      case google.maps.TravelMode.WALKING:
        return Walk;
      default:
        return Car;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {TRAVEL_MODES.map(({ mode, icon: Icon, label }) => (
          <Button
            key={mode}
            variant={selectedMode === mode ? 'default' : 'outline'}
            className="flex-1"
            onClick={() => fetchRoute(mode)}
          >
            <Icon className="w-4 h-4 mr-2" />
            {label}
          </Button>
        ))}
      </div>

      <ScrollArea className="h-[300px]">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center h-full"
            >
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {routes.map((route, index) => (
                <motion.div
                  key={index}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  whileHover={{ scale: 1.02 }}
                  className="p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                  onClick={() => onRouteSelect(route)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      {React.createElement(getModeIcon(route.mode), {
                        className: 'w-5 h-5',
                      })}
                      <span className="font-medium">Route {index + 1}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        <Clock className="w-4 h-4 mr-1" />
                        {route.duration}
                      </Badge>
                      <Badge variant="outline">{route.distance}</Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {route.steps.map((step, stepIndex) => (
                      <motion.div
                        key={stepIndex}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: stepIndex * 0.1 }}
                        className="flex items-start gap-2 text-sm"
                      >
                        <div className="mt-1">
                          {React.createElement(getModeIcon(step.mode), {
                            className: 'w-4 h-4 text-gray-500',
                          })}
                        </div>
                        <div>
                          <p>{step.instruction}</p>
                          <p className="text-xs text-gray-500">
                            {step.distance} • {step.duration}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </ScrollArea>
    </div>
  );
}
