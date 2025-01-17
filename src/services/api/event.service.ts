import { AxiosResponse } from 'axios';
import { Event, EventFilters, EventType, EventStatus } from '@/types/event';
import { api } from './api';

interface EventResponse {
  event: Event;
  participants: string[];
}

interface EventSearchParams extends EventFilters {
  page?: number;
  limit?: number;
  sortBy?: 'date' | 'popularity' | 'distance';
}

class EventService {
  async getEvents(filters?: EventFilters): Promise<Event[]> {
    const response: AxiosResponse<Event[]> = await api.get('/events', { params: filters });
    return response.data;
  }

  async getEvent(eventId: string): Promise<Event> {
    const response: AxiosResponse<Event> = await api.get(`/events/${eventId}`);
    return response.data;
  }

  async createEvent(eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>): Promise<Event> {
    const response: AxiosResponse<Event> = await api.post('/events', eventData);
    return response.data;
  }

  async updateEvent(eventId: string, eventData: Partial<Event>): Promise<Event> {
    const response: AxiosResponse<Event> = await api.put(`/events/${eventId}`, eventData);
    return response.data;
  }

  async deleteEvent(eventId: string): Promise<void> {
    await api.delete(`/events/${eventId}`);
  }

  async joinEvent(eventId: string): Promise<Event> {
    const response: AxiosResponse<Event> = await api.post(`/events/${eventId}/join`);
    return response.data;
  }

  async leaveEvent(eventId: string): Promise<Event> {
    const response: AxiosResponse<Event> = await api.post(`/events/${eventId}/leave`);
    return response.data;
  }

  async checkIn(eventId: string, coordinates?: { lat: number; lng: number }): Promise<void> {
    await api.post(`/events/${eventId}/check-in`, coordinates);
  }

  async reportEvent(eventId: string, reason: string): Promise<void> {
    await api.post(`/events/${eventId}/report`, { reason });
  }

  async getUpcomingEvents(params?: EventSearchParams): Promise<Event[]> {
    const response: AxiosResponse<Event[]> = await api.get('/events/upcoming', {
      params,
    });
    return response.data;
  }

  async getEventsByType(type: EventType, params?: EventSearchParams): Promise<Event[]> {
    const response: AxiosResponse<Event[]> = await api.get(`/events/type/${type}`, {
      params,
    });
    return response.data;
  }

  async updateEventStatus(eventId: string, status: EventStatus): Promise<Event> {
    const response: AxiosResponse<Event> = await api.put(`/events/${eventId}/status`, {
      status,
    });
    return response.data;
  }

  async getEventParticipants(eventId: string): Promise<string[]> {
    const response: AxiosResponse<{ participants: string[] }> = await api.get(
      `/events/${eventId}/participants`
    );
    return response.data.participants;
  }

  async getMyEvents(): Promise<Event[]> {
    const response: AxiosResponse<Event[]> = await api.get('/events/my-events');
    return response.data;
  }

  async uploadEventImage(eventId: string, file: File): Promise<string> {
    const formData = new FormData();
    formData.append('image', file);

    const response: AxiosResponse<{ imageUrl: string }> = await api.post(
      `/events/${eventId}/image`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data.imageUrl;
  }

  async cancelEvent(eventId: string, reason: string): Promise<Event> {
    const response: AxiosResponse<Event> = await api.post(`/events/${eventId}/cancel`, { reason });
    return response.data;
  }

  async updateSafetyGuidelines(eventId: string, guidelines: string[]): Promise<Event> {
    const response: AxiosResponse<Event> = await api.put(`/events/${eventId}/safety-guidelines`, {
      guidelines,
    });
    return response.data;
  }
}

export const eventService = new EventService();
