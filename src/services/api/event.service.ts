import { Event, EventFilters } from '@/types/event';
import { api } from './api';

class EventService {
  async getEvents(filters?: EventFilters): Promise<Event[]> {
    const response = await api.get('/events', { params: filters });
    return response.data;
  }

  async getEvent(eventId: string): Promise<Event> {
    const response = await api.get(`/events/${eventId}`);
    return response.data;
  }

  async createEvent(eventData: Partial<Event>): Promise<Event> {
    const response = await api.post('/events', eventData);
    return response.data;
  }

  async updateEvent(eventId: string, eventData: Partial<Event>): Promise<Event> {
    const response = await api.put(`/events/${eventId}`, eventData);
    return response.data;
  }

  async deleteEvent(eventId: string): Promise<void> {
    await api.delete(`/events/${eventId}`);
  }

  async joinEvent(eventId: string): Promise<Event> {
    const response = await api.post(`/events/${eventId}/join`);
    return response.data;
  }

  async leaveEvent(eventId: string): Promise<Event> {
    const response = await api.post(`/events/${eventId}/leave`);
    return response.data;
  }

  async checkIn(eventId: string): Promise<void> {
    await api.post(`/events/${eventId}/check-in`);
  }

  async reportEvent(eventId: string, reason: string): Promise<void> {
    await api.post(`/events/${eventId}/report`, { reason });
  }

  async getUpcomingEvents(): Promise<Event[]> {
    const response = await api.get('/events/upcoming');
    return response.data;
  }

  async getMyEvents(): Promise<Event[]> {
    const response = await api.get('/events/my-events');
    return response.data;
  }

  async uploadEventImage(eventId: string, file: File): Promise<string> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await api.post(`/events/${eventId}/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.imageUrl;
  }

  async cancelEvent(eventId: string, reason: string): Promise<Event> {
    const response = await api.post(`/events/${eventId}/cancel`, { reason });
    return response.data;
  }

  async getEventParticipants(eventId: string): Promise<Event['participants']> {
    const response = await api.get(`/events/${eventId}/participants`);
    return response.data;
  }

  async updateSafetyGuidelines(
    eventId: string,
    guidelines: string[]
  ): Promise<Event> {
    const response = await api.put(`/events/${eventId}/safety-guidelines`, {
      guidelines,
    });
    return response.data;
  }
}

export const eventService = new EventService();
