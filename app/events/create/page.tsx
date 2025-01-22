'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useGeolocation } from '@/hooks/useGeolocation';
import { eventService } from '@/services/event/event.service';

interface EventFormData {
  title: string;
  description: string;
  type: string;
  maxParticipants: number;
  startTime: string;
  endTime: string;
  tags: string[];
}

export default function CreateEventPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm<EventFormData>();
  const { position, error: locationError } = useGeolocation();
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (data: EventFormData) => {
    try {
      const eventData = {
        ...data,
        location: position ? {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        } : undefined,
      };

      const event = await eventService.createEvent(eventData);

      router.push(`/events/${event.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create event');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Create New Event</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {locationError && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          Location access is required to create an event. Please enable location services.
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <input
            type="text"
            {...register('title', { required: 'Title is required' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            {...register('description', { required: 'Description is required' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            rows={4}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Type</label>
          <select
            {...register('type', { required: 'Type is required' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          >
            <option value="">Select type</option>
            <option value="social">Social</option>
            <option value="sports">Sports</option>
            <option value="education">Education</option>
            <option value="other">Other</option>
          </select>
          {errors.type && (
            <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Max Participants</label>
          <input
            type="number"
            {...register('maxParticipants', {
              required: 'Max participants is required',
              min: { value: 2, message: 'Minimum 2 participants required' },
            })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
          {errors.maxParticipants && (
            <p className="mt-1 text-sm text-red-600">{errors.maxParticipants.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Start Time</label>
            <input
              type="datetime-local"
              {...register('startTime', { required: 'Start time is required' })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
            {errors.startTime && (
              <p className="mt-1 text-sm text-red-600">{errors.startTime.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">End Time</label>
            <input
              type="datetime-local"
              {...register('endTime', { required: 'End time is required' })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
            {errors.endTime && (
              <p className="mt-1 text-sm text-red-600">{errors.endTime.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Tags</label>
          <input
            type="text"
            {...register('tags')}
            placeholder="Enter tags separated by commas"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            Create Event
          </button>
        </div>
      </form>
    </div>
  );
}
