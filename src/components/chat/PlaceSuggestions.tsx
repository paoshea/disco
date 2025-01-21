import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coffee, Utensils, Briefcase, Beer, MapPin } from 'lucide-react';
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

type GooglePlaceType = 'cafe' | 'restaurant' | 'bar' | 'establishment';

type PlaceCategory = {
  id: GooglePlaceType;
  label: string;
  icon: React.ElementType;
};

const CATEGORIES: PlaceCategory[] = [
  { id: 'cafe', label: 'Coffee', icon: Coffee },
  { id: 'restaurant', label: 'Restaurant', icon: Utensils },
  { id: 'bar', label: 'Bar', icon: Beer },
  { id: 'establishment', label: 'Business', icon: Briefcase },
];

export function PlaceSuggestions({
  userLocation,
  matchLocation,
  onPlaceSelect,
}: PlaceSuggestionsProps) {
  const [selectedCategory, setSelectedCategory] = useState<PlaceCategory['id'] | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPlaces = async (categoryId: PlaceCategory['id']) => {
    setLoading(true);
    setSelectedCategory(categoryId);

    try {
      // Calculate midpoint between user and match
      const midpoint = {
        lat: (userLocation.lat() + matchLocation.lat()) / 2,
        lng: (userLocation.lng() + matchLocation.lng()) / 2,
      };

      // Create Places Service
      const service = new google.maps.places.PlacesService(
        document.createElement('div')
      );

      // Search for places
      const request: google.maps.places.PlaceSearchRequest = {
        location: midpoint,
        radius: 1000, // 1km radius
        type: categoryId, // This is already the correct string literal type
      };

      service.nearbySearch(
        request,
        (
          results: google.maps.places.PlaceResult[] | null,
          status: google.maps.places.PlacesServiceStatus
        ) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && results) {
            const mappedPlaces: Place[] = results
              .filter(result => result.geometry && result.name)
              .map(result => ({
                id: result.place_id || Math.random().toString(),
                name: result.name || 'Unknown Place',
                address: result.vicinity || '',
                category: categoryId,
                rating: result.rating || 0,
                priceLevel: result.price_level || 0,
                position: {
                  lat: result.geometry!.location!.lat(),
                  lng: result.geometry!.location!.lng(),
                },
              }));
            setPlaces(mappedPlaces);
          }
          setLoading(false);
        }
      );
    } catch (error) {
      console.error('Error fetching places:', error);
      setLoading(false);
    }
  };

  const handleCategoryClick = (categoryId: PlaceCategory['id']) => {
    if (categoryId === selectedCategory) {
      setSelectedCategory(null);
      setPlaces([]);
    } else {
      void fetchPlaces(categoryId);
    }
  };

  const renderPlaceCard = (place: Place) => {
    const CategoryIcon = CATEGORIES.find(c => c.id === place.category)?.icon || MapPin;

    return (
      <motion.div
        key={place.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="mb-4 cursor-pointer rounded-lg border p-4 transition-shadow hover:shadow-md"
        onClick={() => onPlaceSelect(place)}
      >
        <div className="flex items-start space-x-4">
          <div className="rounded-full bg-primary/10 p-2">
            <CategoryIcon className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium">{place.name}</h3>
            <p className="text-sm text-gray-500">{place.address}</p>
            <div className="mt-2 flex items-center space-x-2">
              {place.rating > 0 && (
                <Badge variant="secondary">
                  {place.rating.toFixed(1)} ★
                </Badge>
              )}
              {place.priceLevel > 0 && (
                <Badge variant="secondary">
                  {'$'.repeat(place.priceLevel)}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex space-x-2">
        {CATEGORIES.map(({ id, label, icon: Icon }) => (
          <Button
            key={id}
            variant={selectedCategory === id ? 'primary' : 'outline'}
            size="sm"
            onClick={() => handleCategoryClick(id)}
          >
            <Icon className="mr-2 h-4 w-4" />
            {label}
          </Button>
        ))}
      </div>

      <ScrollArea className="h-[400px]">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center py-8"
            >
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </motion.div>
          ) : places.length > 0 ? (
            <div>{places.map(renderPlaceCard)}</div>
          ) : selectedCategory ? (
            <motion.div
              key="no-results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-8 text-center text-gray-500"
            >
              No places found in this category
            </motion.div>
          ) : (
            <motion.div
              key="select-category"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-8 text-center text-gray-500"
            >
              Select a category to see suggestions
            </motion.div>
          )}
        </AnimatePresence>
      </ScrollArea>
    </div>
  );
}
