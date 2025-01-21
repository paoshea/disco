import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Map, ListFilter } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { BaseMapView } from '../map/BaseMapView';
import { PlacesAutocomplete } from '../map/PlacesAutocomplete';
import { PlaceSuggestions } from './PlaceSuggestions';
import { RoutePlanner } from './RoutePlanner';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import type { MapMarker } from '@/types/map';

interface LocationShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelect: (location: Location) => void;
  matchLocation?: google.maps.LatLng;
}

interface Location {
  latitude: number;
  longitude: number;
  name: string;
  address: string;
}

interface LocationMapMarker extends MapMarker {
  location: Location;
  scale?: number;
}

interface Place {
  position: google.maps.LatLngLiteral;
  name: string;
  address: string;
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
  anchor: new google.maps.Point(16, 32), // Center bottom anchor point
});

const matchMarkerIcon = createMarkerIcon('/images/markers/match-marker.png');

export function LocationShareModal({
  isOpen,
  onClose,
  onLocationSelect,
  matchLocation,
}: LocationShareModalProps) {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null
  );
  const [userLocation, setUserLocation] = useState<google.maps.LatLng | null>(
    null
  );
  const [markers, setMarkers] = useState<LocationMapMarker[]>([]);

  useEffect(() => {
    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          const location = new google.maps.LatLng(
            position.coords.latitude,
            position.coords.longitude
          );
          setUserLocation(location);
        },
        error => {
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
            lng: Number(matchLocation.lng()),
          },
          title: 'Match Location',
          icon: matchMarkerIcon,
          location: {
            latitude: matchLocation.lat(),
            longitude: matchLocation.lng(),
            name: 'Match Location',
            address: '',
          },
        },
      ]);
    }
  }, [matchLocation]);

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

  // Helper function to convert Location to LatLng
  const locationToLatLng = (loc: Location): google.maps.LatLng => {
    return new google.maps.LatLng(loc.latitude, loc.longitude);
  };

  // Helper function to get current map center
  const getMapCenter = (): google.maps.LatLngLiteral => {
    if (selectedLocation) {
      return {
        lat: selectedLocation.latitude,
        lng: selectedLocation.longitude,
      };
    }
    if (matchLocation) {
      return { lat: matchLocation.lat(), lng: matchLocation.lng() };
    }
    return { lat: defaultCenter.lat(), lng: defaultCenter.lng() };
  };

  const handleMarkerMouseLeave = () => {
    setMarkers(prevMarkers => prevMarkers.map(m => ({ ...m, scale: 1 })));
  };

  const handlePlaceSuggestionsSelect = (place: Place) => {
    const location: Location = {
      latitude: place.position.lat,
      longitude: place.position.lng,
      name: place.name,
      address: place.address,
    };
    setSelectedLocation(location);
    onLocationSelect(location);
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
                  <PlacesAutocomplete onPlaceSelect={handlePlaceSelect} />
                </div>

                <div className="h-96 w-full overflow-hidden rounded-lg">
                  <BaseMapView
                    center={getMapCenter()}
                    zoom={13}
                    markers={markers}
                    onMarkerMouseLeave={handleMarkerMouseLeave}
                  />
                </div>
              </TabsContent>

              <TabsContent value="suggestions" className="mt-4">
                {userLocation && matchLocation ? (
                  <PlaceSuggestions
                    userLocation={userLocation}
                    matchLocation={matchLocation}
                    onPlaceSelect={handlePlaceSuggestionsSelect}
                  />
                ) : (
                  <div className="text-center text-gray-500">
                    Loading locations...
                  </div>
                )}
              </TabsContent>
            </Tabs>

            {selectedLocation && userLocation && (
              <div className="mt-4">
                <RoutePlanner
                  origin={userLocation}
                  destination={locationToLatLng(selectedLocation)}
                />
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
