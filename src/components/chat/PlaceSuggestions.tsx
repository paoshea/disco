import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coffee, Utensils, Briefcase, Beer, Star, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ScrollArea } from '@/components/ui/ScrollArea';

interface Place {
  id: string;
  name: string;
  address: string;
  category: string;
  rating: number;
  priceLevel: number;
  position: {
    lat: number;
    lng: number;
  };
}

interface PlaceSuggestionsProps {
  userLocation: google.maps.LatLng;
  matchLocation: google.maps.LatLng;
  onPlaceSelect: (place: Place) => void;
}

const CATEGORIES = [
  { id: 'coffee', label: 'Coffee', icon: Coffee },
  { id: 'restaurant', label: 'Restaurant', icon: Utensils },
  { id: 'bar', label: 'Bar', icon: Beer },
  { id: 'business', label: 'Business', icon: Briefcase },
];

export function PlaceSuggestions({
  userLocation,
  matchLocation,
  onPlaceSelect,
}: PlaceSuggestionsProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPlaces = async (category: string) => {
    setLoading(true);
    setSelectedCategory(category);

    // Calculate midpoint between user and match
    const midpoint = {
      lat: (userLocation.lat() + matchLocation.lat()) / 2,
      lng: (userLocation.lng() + matchLocation.lng()) / 2,
    };

    try {
      const service = new google.maps.places.PlacesService(
        document.createElement('div')
      );

      const request = {
        location: new google.maps.LatLng(midpoint.lat, midpoint.lng),
        radius: 1000, // 1km radius
        type: category,
        rankBy: google.maps.places.RankBy.DISTANCE,
      };

      const results = await new Promise<google.maps.places.PlaceResult[]>(
        (resolve, reject) => {
          service.nearbySearch(request, (results, status) => {
            if (
              status === google.maps.places.PlacesServiceStatus.OK &&
              results
            ) {
              resolve(results);
            } else {
              reject(new Error('Failed to fetch places'));
            }
          });
        }
      );

      const placesData = results.map(place => ({
        id: place.place_id!,
        name: place.name!,
        address: place.vicinity!,
        category,
        rating: place.rating || 0,
        priceLevel: place.price_level || 0,
        position: {
          lat: place.geometry!.location!.lat(),
          lng: place.geometry!.location!.lng(),
        },
      }));

      setPlaces(placesData);
    } catch (error) {
      console.error('Error fetching places:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto pb-2">
        {CATEGORIES.map(({ id, label, icon: Icon }) => (
          <Button
            key={id}
            variant={selectedCategory === id ? 'primary' : 'outline'}
            className="flex-shrink-0"
            onClick={() => fetchPlaces(id)}
          >
            <Icon className="w-4 h-4 mr-2" />
            {label}
          </Button>
        ))}
      </div>

      <ScrollArea className="h-[200px]">
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
              className="space-y-2"
            >
              {places.map(place => (
                <motion.div
                  key={place.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  whileHover={{ scale: 1.02 }}
                  className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                  onClick={() => onPlaceSelect(place)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{place.name}</h3>
                      <p className="text-sm text-gray-600">{place.address}</p>
                    </div>
                    <Badge variant="secondary">{place.rating} ★</Badge>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="text-xs text-gray-500">
                      <MapPin className="w-3 h-3 inline mr-1" />
                      {Math.round(
                        google.maps.geometry.spherical.computeDistanceBetween(
                          new google.maps.LatLng(
                            place.position.lat,
                            place.position.lng
                          ),
                          userLocation
                        ) / 1000
                      )}
                      km away
                    </div>
                    {place.priceLevel > 0 && (
                      <div className="text-xs text-gray-500">
                        {'$'.repeat(place.priceLevel)}
                      </div>
                    )}
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
