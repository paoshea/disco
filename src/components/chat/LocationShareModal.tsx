import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Search, X, Map, ListFilter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BaseMapView, LatLng } from '../map/BaseMapView';
import { PlacesAutocomplete } from '../map/PlacesAutocomplete';
import { PlaceSuggestions } from './PlaceSuggestions';
import { RoutePlanner } from './RoutePlanner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface LocationShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelect: (location: {
    latitude: number;
    longitude: number;
    name: string;
    address: string;
  }) => void;
  transitionState: 'enter' | 'exit' | null;
  matchLocation?: LatLng;
}

const modalVariants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      damping: 25,
      stiffness: 300,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    y: 20,
    transition: {
      duration: 0.2,
    },
  },
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: {
      duration: 0.2,
    },
  },
  exit: { 
    opacity: 0,
    transition: {
      duration: 0.2,
    },
  },
};

const contentVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.1,
      duration: 0.3,
    },
  },
};

export function LocationShareModal({
  isOpen,
  onClose,
  onLocationSelect,
  transitionState,
  matchLocation,
}: LocationShareModalProps) {
  const [currentLocation, setCurrentLocation] = useState<LatLng | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{
    position: LatLng;
    name: string;
    address: string;
  } | null>(null);
  const [mapCenter, setMapCenter] = useState<LatLng>({ lat: 0, lng: 0 });
  const [zoom, setZoom] = useState(15);
  const [searchFocused, setSearchFocused] = useState(false);
  const [activeTab, setActiveTab] = useState<'map' | 'suggestions' | 'route'>('map');
  const [routePath, setRoutePath] = useState<google.maps.LatLng[]>([]);

  useEffect(() => {
    if (isOpen) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCurrentLocation(location);
          setMapCenter(location);
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, [isOpen]);

  const handlePlaceSelect = async (place: google.maps.places.PlaceResult | any) => {
    if ('position' in place) {
      // Handle place from PlaceSuggestions
      setSelectedLocation({
        position: place.position,
        name: place.name,
        address: place.address,
      });
      setMapCenter(place.position);
      setZoom(17);
    } else if (place.geometry?.location) {
      // Handle place from PlacesAutocomplete
      const position = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      };
      setSelectedLocation({
        position,
        name: place.name || '',
        address: place.formatted_address || '',
      });
      setMapCenter(position);
      setZoom(17);
    }
  };

  const handleRouteSelect = (route: any) => {
    // When a route is selected, update the selected location to the destination
    if (selectedLocation) {
      onLocationSelect({
        latitude: selectedLocation.position.lat,
        longitude: selectedLocation.position.lng,
        name: selectedLocation.name,
        address: `${selectedLocation.address} (${route.duration} by ${route.mode.toLowerCase()})`,
      });
      onClose();
    }
  };

  const handleMapClick = async (event: google.maps.MouseEvent) => {
    const lat = event.latLng!.lat();
    const lng = event.latLng!.lng();
    
    try {
      const geocoder = new google.maps.Geocoder();
      const result = await geocoder.geocode({ location: { lat, lng } });
      
      if (result.results[0]) {
        setSelectedLocation({
          position: { lat, lng },
          name: result.results[0].formatted_address,
          address: result.results[0].formatted_address,
        });
      }
    } catch (error) {
      console.error('Error geocoding location:', error);
    }
  };

  const handleShare = () => {
    if (selectedLocation) {
      onLocationSelect({
        latitude: selectedLocation.position.lat,
        longitude: selectedLocation.position.lng,
        name: selectedLocation.name,
        address: selectedLocation.address,
      });
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="modal-overlay"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <motion.div
            key="modal-content"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden"
          >
            <motion.div
              variants={contentVariants}
              className="p-4 border-b flex items-center justify-between"
            >
              <h2 className="text-lg font-semibold">Share Location</h2>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </motion.div>

            <motion.div variants={contentVariants} className="p-4">
              <Tabs
                value={activeTab}
                onValueChange={(value) => setActiveTab(value as any)}
                className="space-y-4"
              >
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="map" className="flex items-center gap-2">
                    <Map className="w-4 h-4" />
                    Map
                  </TabsTrigger>
                  <TabsTrigger value="suggestions" className="flex items-center gap-2">
                    <ListFilter className="w-4 h-4" />
                    Suggestions
                  </TabsTrigger>
                  {matchLocation && (
                    <TabsTrigger value="route" className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Route
                    </TabsTrigger>
                  )}
                </TabsList>

                <TabsContent value="map" className="space-y-4">
                  <div className="mb-4">
                    <div className={`relative transition-all duration-200 ${
                      searchFocused ? 'scale-105' : 'scale-100'
                    }`}>
                      <PlacesAutocomplete
                        onPlaceSelect={handlePlaceSelect}
                        onFocus={() => setSearchFocused(true)}
                        onBlur={() => setSearchFocused(false)}
                      />
                      <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors duration-200 ${
                        searchFocused ? 'text-primary' : 'text-gray-400'
                      }`} />
                    </div>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="relative h-[400px] rounded-lg overflow-hidden"
                  >
                    <BaseMapView
                      center={mapCenter}
                      zoom={zoom}
                      onClick={handleMapClick}
                      markers={[
                        ...(currentLocation
                          ? [{
                              id: 'current',
                              position: currentLocation,
                              title: 'Current Location',
                              icon: {
                                url: '/images/current-location-marker.svg',
                                scaledSize: { width: 40, height: 40 },
                              },
                            }]
                          : []),
                        ...(selectedLocation
                          ? [{
                              id: 'selected',
                              position: selectedLocation.position,
                              title: selectedLocation.name,
                              icon: {
                                url: '/images/selected-location-marker.svg',
                                scaledSize: { width: 40, height: 40 },
                              },
                            }]
                          : []),
                        ...(matchLocation
                          ? [{
                              id: 'match',
                              position: matchLocation,
                              title: 'Match Location',
                              icon: {
                                url: '/images/match-marker.svg',
                                scaledSize: { width: 40, height: 40 },
                              },
                            }]
                          : []),
                      ]}
                      polylines={routePath.length > 0 ? [
                        {
                          path: routePath,
                          options: {
                            strokeColor: '#FF4B91',
                            strokeWeight: 3,
                            strokeOpacity: 0.8,
                          },
                        },
                      ] : []}
                    />

                    {currentLocation && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        <Button
                          variant="secondary"
                          size="sm"
                          className="absolute bottom-4 right-4 shadow-lg"
                          onClick={() => {
                            setMapCenter(currentLocation);
                            setZoom(15);
                          }}
                        >
                          <MapPin className="h-4 w-4 mr-2" />
                          Current Location
                        </Button>
                      </motion.div>
                    )}
                  </motion.div>
                </TabsContent>

                <TabsContent value="suggestions">
                  {currentLocation && matchLocation && (
                    <PlaceSuggestions
                      userLocation={new google.maps.LatLng(
                        currentLocation.lat,
                        currentLocation.lng
                      )}
                      matchLocation={new google.maps.LatLng(
                        matchLocation.lat,
                        matchLocation.lng
                      )}
                      onPlaceSelect={handlePlaceSelect}
                    />
                  )}
                </TabsContent>

                <TabsContent value="route">
                  {currentLocation && matchLocation && selectedLocation && (
                    <RoutePlanner
                      origin={new google.maps.LatLng(
                        currentLocation.lat,
                        currentLocation.lng
                      )}
                      destination={new google.maps.LatLng(
                        selectedLocation.position.lat,
                        selectedLocation.position.lng
                      )}
                      onRouteSelect={handleRouteSelect}
                      onRoutePathUpdate={setRoutePath}
                    />
                  )}
                </TabsContent>
              </Tabs>

              <AnimatePresence mode="wait">
                {selectedLocation && activeTab !== 'route' && (
                  <motion.div
                    key="location-details"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-4"
                  >
                    <motion.div
                      initial={{ scale: 0.9, y: 20 }}
                      animate={{ scale: 1, y: 0 }}
                      className="p-4 bg-gray-50 rounded-lg"
                    >
                      <h3 className="font-medium">{selectedLocation.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {selectedLocation.address}
                      </p>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div
                variants={contentVariants}
                className="mt-4 flex justify-end gap-2"
              >
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  onClick={handleShare}
                  disabled={!selectedLocation}
                  className="relative overflow-hidden"
                >
                  <motion.div
                    initial={false}
                    animate={{
                      backgroundColor: selectedLocation
                        ? 'rgb(var(--primary))' 
                        : 'rgb(var(--primary-light))',
                    }}
                    className="absolute inset-0"
                  />
                  <span className="relative">Share Location</span>
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
