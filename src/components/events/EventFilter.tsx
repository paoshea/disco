import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';
import { EventCategory, EventFilters } from '@/types/event';
import { Button, Checkbox, Select, TextField } from '@/components/forms';

interface EventFilterProps {
  initialFilters: EventFilters;
  onUpdate: (filters: EventFilters) => void;
}

const categories: { value: EventCategory; label: string }[] = [
  { value: 'social', label: 'Social' },
  { value: 'sports', label: 'Sports' },
  { value: 'music', label: 'Music' },
  { value: 'food', label: 'Food' },
  { value: 'arts', label: 'Arts' },
  { value: 'tech', label: 'Tech' },
  { value: 'outdoors', label: 'Outdoors' },
  { value: 'games', label: 'Games' },
  { value: 'other', label: 'Other' },
];

export const EventFilter: React.FC<EventFilterProps> = ({
  initialFilters,
  onUpdate,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<EventFilters>({
    ...initialFilters,
    filter: initialFilters.filter || {},
  });

  const handleSave = () => {
    onUpdate(filters);
    setIsOpen(false);
  };

  const updateFilters = (updates: Partial<typeof filters.filter>) => {
    setFilters(prev => ({
      ...prev,
      filter: {
        ...prev.filter,
        ...updates,
      },
    }));
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center"
      >
        <AdjustmentsHorizontalIcon className="-ml-1 mr-2 h-5 w-5" />
        Filters
      </Button>

      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        className="fixed inset-0 z-10 overflow-y-auto"
      >
        <div className="flex min-h-screen items-center justify-center">
          <div className="fixed inset-0">
            <div className="absolute inset-0 bg-black opacity-30" />
          </div>

          <div className="relative bg-white rounded-lg max-w-md w-full mx-4 p-6">
            <Dialog.Title className="text-lg font-medium text-gray-900">
              Event Filters
            </Dialog.Title>

            <div className="mt-4 space-y-6">
              <Select
                label="Category"
                name="category"
                options={categories}
                value={filters.filter?.category?.[0] || ''}
                onChange={e =>
                  updateFilters({
                    category: e.target.value
                      ? [e.target.value as EventCategory]
                      : undefined,
                  })
                }
              />

              <div className="grid grid-cols-2 gap-4">
                <TextField
                  label="Start Date"
                  name="startDate"
                  type="date"
                  value={filters.filter?.startDate}
                  onChange={e =>
                    updateFilters({
                      startDate: e.target.value,
                    })
                  }
                />
                <TextField
                  label="End Date"
                  name="endDate"
                  type="date"
                  value={filters.filter?.endDate}
                  min={filters.filter?.startDate}
                  onChange={e =>
                    updateFilters({
                      endDate: e.target.value,
                    })
                  }
                />
              </div>

              <Checkbox
                label="Show only free events"
                name="isFree"
                checked={filters.filter?.isFree}
                onChange={e =>
                  updateFilters({
                    isFree: e.target.checked,
                  })
                }
              />

              {!filters.filter?.isFree && (
                <TextField
                  label="Maximum Price ($)"
                  name="maxPrice"
                  type="number"
                  min="0"
                  value={filters.filter?.maxPrice?.toString()}
                  onChange={e =>
                    updateFilters({
                      maxPrice: parseInt(e.target.value),
                    })
                  }
                />
              )}

              <TextField
                label="Location"
                name="location"
                placeholder="Enter city or address"
                value={filters.filter?.location}
                onChange={e =>
                  updateFilters({
                    location: e.target.value,
                  })
                }
              />

              {filters.filter?.location && (
                <TextField
                  label="Search Radius (km)"
                  name="radius"
                  type="number"
                  min="1"
                  value={filters.filter?.radius?.toString()}
                  onChange={e =>
                    updateFilters({
                      radius: parseInt(e.target.value),
                    })
                  }
                />
              )}

              <Checkbox
                label="Show events with available spots only"
                name="hasAvailableSpots"
                checked={filters.filter?.hasAvailableSpots}
                onChange={e =>
                  updateFilters({
                    hasAvailableSpots: e.target.checked,
                  })
                }
              />

              <div className="mt-6 flex justify-end space-x-3">
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>Apply Filters</Button>
              </div>
            </div>
          </div>
        </div>
      </Dialog>
    </>
  );
};
