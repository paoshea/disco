import { Event } from '@/types/event';
import { api } from './api';

interface EventCreateData {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  maxParticipants?: number;
  category: string;
}

interface EventUpdateData extends Partial<EventCreateData> {}

class EventService {
  async getEvents(): Promise<Event[]> {
    try {
      const response = await api.get<{ events: Event[] }>('/events');
      return response.data.events;
    } catch (err) {
      throw this.handleError(err);
    }
  }

  async getEvent(id: string): Promise<Event> {
    try {
      const response = await api.get<{ event: Event }>(`/events/${id}`);
      return response.data.event;
    } catch (err) {
      throw this.handleError(err);
    }
  }

  async createEvent(data: EventCreateData): Promise<Event> {
    try {
      const response = await api.post<{ event: Event }>('/events', data);
      return response.data.event;
    } catch (err) {
      throw this.handleError(err);
    }
  }

  async updateEvent(id: string, data: EventUpdateData): Promise<Event> {
    try {
      const response = await api.put<{ event: Event }>(`/events/${id}`, data);
      return response.data.event;
    } catch (err) {
      throw this.handleError(err);
    }
  }

  async deleteEvent(id: string): Promise<void> {
    try {
      await api.delete(`/events/${id}`);
    } catch (err) {
      throw this.handleError(err);
    }
  }

  async joinEvent(id: string): Promise<Event> {
    try {
      const response = await api.post<{ event: Event }>(`/events/${id}/join`);
      return response.data.event;
    } catch (err) {
      throw this.handleError(err);
    }
  }

  async leaveEvent(id: string): Promise<Event> {
    try {
      const response = await api.post<{ event: Event }>(`/events/${id}/leave`);
      return response.data.event;
    } catch (err) {
      throw this.handleError(err);
    }
  }

  async checkIn(eventId: string, coordinates?: { lat: number; lng: number }): Promise<void> {
    await api.post(`/events/${eventId}/check-in`, coordinates);
  }

  async reportEvent(eventId: string, reason: string): Promise<void> {
    await api.post(`/events/${eventId}/report`, { reason });
  }

  async getUpcomingEvents(params?: { page?: number; limit?: number; sortBy?: 'date' | 'popularity' | 'distance' }): Promise<Event[]> {
    const response: any = await api.get('/events/upcoming', {
      params,
    });
    return response.data;
  }

  async getEventsByType(type: string, params?: { page?: number; limit?: number; sortBy?: 'date' | 'popularity' | 'distance' }): Promise<Event[]> {
    const response: any = await api.get(`/events/type/${type}`, {
      params,
    });
    return response.data;
  }

  async updateEventStatus(eventId: string, status: string): Promise<Event> {
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

  private handleError(error: unknown): Error {
    if (error instanceof Error) {
      return error;
    }
    return new Error('An unexpected error occurred');
  }
}

export const eventService = new EventService();
