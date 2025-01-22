'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useGeolocation } from '@/hooks/useGeolocation';
import { eventService } from '@/services/event/event.service';
import { useAuth } from '@/hooks/useAuth';

interface EventFormData {
  title: string;
  description: string;
  type: 'social' | 'virtual' | 'hybrid';
  maxParticipants: number;
  startTime: string;
  endTime: string;
  tags: string[];
}

export default function CreateEventPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EventFormData>();
  const { position, error: locationError } = useGeolocation();
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (data: EventFormData) => {
    try {
      if (!position) {
        setError('Location is required to create an event');
        return;
      }

      if (!user) {
        setError('You must be logged in to create an event');
        return;
      }

      const eventData = {
        ...data,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        creatorId: user.id,
        startTime: new Date(data.startTime),
        endTime: data.endTime ? new Date(data.endTime) : undefined,
      };

      const response = await eventService.createEvent(eventData);

      if (!response.success || !response.data) {
        setError(response.error || 'Failed to create event');
        return;
      }

      router.push(`/events/${response.data.id}`);
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
          Location access is required to create an event. Please enable location
          services.
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Title
          </label>
          <input
            type="text"
            {...register('title', { required: true })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
          {errors.title && (
            <span className="text-red-500">Title is required</span>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            {...register('description', { required: true })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
          {errors.description && (
            <span className="text-red-500">Description is required</span>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Event Type
          </label>
          <select
            {...register('type', { required: true })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          >
            <option value="social">Social</option>
            <option value="virtual">Virtual</option>
            <option value="hybrid">Hybrid</option>
          </select>
          {errors.type && (
            <span className="text-red-500">Event type is required</span>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Maximum Participants
          </label>
          <input
            type="number"
            {...register('maxParticipants', { required: true, min: 1 })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
          {errors.maxParticipants && (
            <span className="text-red-500">
              Maximum participants must be at least 1
            </span>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Start Time
          </label>
          <input
            type="datetime-local"
            {...register('startTime', { required: true })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
          {errors.startTime && (
            <span className="text-red-500">Start time is required</span>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            End Time
          </label>
          <input
            type="datetime-local"
            {...register('endTime')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Tags (comma-separated)
          </label>
          <input
            type="text"
            {...register('tags')}
            placeholder="hiking, outdoor, beginner"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>

        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Create Event
        </button>
      </form>
    </div>
  );
}
