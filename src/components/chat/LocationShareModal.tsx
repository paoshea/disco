import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Search, X, Map, ListFilter } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { BaseMapView, LatLng, MapMarker } from '../map/BaseMapView';
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
  matchLocation?: google.maps.LatLng;
}

interface Location {
  latitude: number;
  longitude: number;
  name: string;
  address: string;
}

interface RoutePolyline {
  path: google.maps.LatLng[];
  options: google.maps.PolylineOptions;
}

const defaultCenter = new google.maps.LatLng(0, 0);

const modalVariants = {
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.2,
      ease: 'easeOut',
    },
  },
  hidden: {
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: 0.1,
      ease: 'easeIn',
    },
  },
};

const contentVariants = {
  visible: { opacity: 1, y: 0 },
  hidden: { opacity: 0, y: 20 },
  exit: { opacity: 0 },
};

const createMarkerIcon = (url: string) => ({
  url,
  scaledSize: new google.maps.Size(32, 32),
  anchor: new google.maps.Point(16, 32) // Center bottom anchor point
});

const searchMarkerIcon = createMarkerIcon('/images/markers/search-marker.png');
const selectedMarkerIcon = createMarkerIcon('/images/markers/selected-marker.png');
const matchMarkerIcon = createMarkerIcon('/images/markers/match-marker.png');

export function LocationShareModal({
  isOpen,
  onClose,
  onLocationSelect,
  transitionState,
  matchLocation,
}: LocationShareModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [userLocation, setUserLocation] = useState<google.maps.LatLng | null>(null);
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [polylines, setPolylines] = useState<RoutePolyline[]>([]);

  useEffect(() => {
    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = new google.maps.LatLng(
            position.coords.latitude,
            position.coords.longitude
          );
          setUserLocation(location);
        },
        (error) => {
          console.error('Error getting user location:', error);
        }
      );
    }
  }, []);

  useEffect(() => {
    if (matchLocation) {
      setMarkers([
        {
          id: 'match',
          position: {
            lat: Number(matchLocation.lat()),
            lng: Number(matchLocation.lng())
          },
          title: 'Match Location',
          icon: matchMarkerIcon
        }
      ]);
    }
  }, [matchLocation]);

  const handleMapClick = async (event: google.maps.MapMouseEvent) => {
    if (!event.latLng) return;
    
    const geocoder = new google.maps.Geocoder();
    const latlng = event.latLng.toJSON();
    
    try {
      const response = await geocoder.geocode({ location: latlng });
      if (response.results[0]) {
        const place = response.results[0];
        const location = {
          latitude: latlng.lat,
          longitude: latlng.lng,
          name: place.formatted_address,
          address: place.formatted_address
        };
        setSelectedLocation(location);
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }
  };

  const handlePlaceSelect = (place: google.maps.places.PlaceResult) => {
    if (place.geometry?.location) {
      const location = {
        latitude: place.geometry.location.lat(),
        longitude: place.geometry.location.lng(),
        name: place.name || '',
        address: place.formatted_address || '',
      };
      setSelectedLocation(location);
      onLocationSelect(location);
    }
  };

  const updateMarkers = (location: google.maps.LatLng) => {
    const newMarkers: MapMarker[] = [
      ...(matchLocation
        ? [
            {
              id: 'match',
              position: {
                lat: Number(matchLocation.lat()),
                lng: Number(matchLocation.lng())
              },
              title: 'Match Location',
              icon: matchMarkerIcon
            }
          ]
        : []),
      {
        id: 'selected',
        position: {
          lat: Number(location.lat()),
          lng: Number(location.lng())
        },
        title: 'Selected Location',
        icon: selectedMarkerIcon
      }
    ];
    setMarkers(newMarkers);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  // Helper function to convert Location to LatLng
  const locationToLatLng = (loc: Location): google.maps.LatLng => {
    return new google.maps.LatLng(loc.latitude, loc.longitude);
  };

  // Helper function to get current map center
  const getMapCenter = (): google.maps.LatLngLiteral => {
    if (selectedLocation) {
      return { lat: selectedLocation.latitude, lng: selectedLocation.longitude };
    }
    if (matchLocation) {
      return { lat: matchLocation.lat(), lng: matchLocation.lng() };
    }
    return { lat: defaultCenter.lat(), lng: defaultCenter.lng() };
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          <div className="absolute inset-0 bg-black/50" onClick={onClose} />
          <motion.div
            className="relative w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl"
            variants={contentVariants}
          >
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-4 top-4"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>

            <div className="mb-6">
              <h2 className="text-2xl font-semibold">Share Location</h2>
              <p className="text-sm text-gray-500">
                Select a location to share with your match
              </p>
            </div>

            <Tabs defaultValue="map" className="w-full">
              <TabsList>
                <TabsTrigger value="map">
                  <Map className="mr-2 h-4 w-4" />
                  Map View
                </TabsTrigger>
                <TabsTrigger value="suggestions">
                  <ListFilter className="mr-2 h-4 w-4" />
                  Suggestions
                </TabsTrigger>
              </TabsList>

              <TabsContent value="map" className="mt-4">
                <div className="mb-4">
                  <PlacesAutocomplete
                    onPlaceSelect={handlePlaceSelect}
                    placeholder="Search for a location"
                    className="w-full"
                  />
                </div>

                <div className="h-[400px] overflow-hidden rounded-lg border">
                  <BaseMapView
                    center={getMapCenter()}
                    zoom={14}
                    markers={markers}
                    onMarkerClick={() => {}}
                    onMarkerMouseEnter={() => {}}
                    onMarkerMouseLeave={() => {}}
                  />
                </div>
              </TabsContent>

              <TabsContent value="suggestions">
                <PlaceSuggestions
                  onPlaceSelect={handlePlaceSelect}
                  matchLocation={matchLocation || defaultCenter}
                  userLocation={userLocation || defaultCenter}
                />
              </TabsContent>
            </Tabs>

            {selectedLocation && matchLocation && (
              <div className="mt-4">
                <RoutePlanner
                  origin={matchLocation}
                  destination={locationToLatLng(selectedLocation)}
                  onRoutePathUpdate={(path: google.maps.LatLng[]) => {
                    setPolylines([{
                      path,
                      options: {
                        strokeColor: '#4A90E2',
                        strokeOpacity: 0.8,
                        strokeWeight: 3
                      }
                    }]);
                  }}
                  onRouteSelect={() => {}}
                />
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
