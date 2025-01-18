import {
  Event,
  CreateEventInput,
  EventStatus,
  EventParticipant,
  EventFilters,
} from '@/types/event';
import { Location } from '@/types/location';
import { apiClient } from './api.client';

class EventService {
  private readonly baseUrl = '/events';

  async getEvents(filters?: EventFilters): Promise<Event[]> {
    const response = await apiClient.get<{ events: Event[] }>(this.baseUrl, {
      params: filters,
    });
    return response.data.events;
  }

  async getEvent(eventId: string): Promise<Event> {
    const response = await apiClient.get<{ event: Event }>(
      `${this.baseUrl}/${eventId}`
    );
    return response.data.event;
  }

  async createEvent(data: CreateEventInput): Promise<Event> {
    const response = await apiClient.post<{ event: Event }>(this.baseUrl, data);
    return response.data.event;
  }

  async updateEvent(
    eventId: string,
    data: Partial<CreateEventInput>
  ): Promise<Event> {
    const response = await apiClient.put<{ event: Event }>(
      `${this.baseUrl}/${eventId}`,
      data
    );
    return response.data.event;
  }

  async deleteEvent(eventId: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${eventId}`);
  }

  async joinEvent(eventId: string, userId: string): Promise<Event> {
    const response = await apiClient.post<{ event: Event }>(
      `${this.baseUrl}/${eventId}/join`,
      {
        userId,
      }
    );
    return response.data.event;
  }

  async leaveEvent(eventId: string, userId: string): Promise<Event> {
    const response = await apiClient.post<{ event: Event }>(
      `${this.baseUrl}/${eventId}/leave`,
      {
        userId,
      }
    );
    return response.data.event;
  }

  async checkIn(eventId: string, location?: Location): Promise<void> {
    await apiClient.post(`${this.baseUrl}/${eventId}/check-in`, { location });
  }

  async reportEvent(eventId: string, reason: string): Promise<void> {
    await apiClient.post(`${this.baseUrl}/${eventId}/report`, { reason });
  }

  async getUpcomingEvents(params?: {
    limit?: number;
    offset?: number;
    type?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Event[]> {
    const response = await apiClient.get<{ events: Event[] }>(
      `${this.baseUrl}/upcoming`,
      {
        params,
      }
    );
    return response.data.events;
  }

  async getEventsByCategory(
    category: string,
    params?: {
      page?: number;
      limit?: number;
      sortBy?: 'date' | 'popularity' | 'distance';
      filters?: {
        type?: string;
        startDate?: string;
        endDate?: string;
      };
    }
  ): Promise<Event[]> {
    const response = await apiClient.get<{ events: Event[] }>(
      `${this.baseUrl}/category/${category}`,
      { params }
    );
    return response.data.events;
  }

  async updateEventStatus(
    eventId: string,
    status: EventStatus
  ): Promise<Event> {
    const response = await apiClient.put<{ event: Event }>(
      `${this.baseUrl}/${eventId}/status`,
      {
        status,
      }
    );
    return response.data.event;
  }

  async getEventParticipants(eventId: string): Promise<EventParticipant[]> {
    const response = await apiClient.get<{ participants: EventParticipant[] }>(
      `${this.baseUrl}/${eventId}/participants`
    );
    return response.data.participants;
  }

  async getMyEvents(params?: {
    status?: EventStatus[];
    role?: 'organizer' | 'participant';
  }): Promise<Event[]> {
    const response = await apiClient.get<{ events: Event[] }>(
      `${this.baseUrl}/my-events`,
      {
        params,
      }
    );
    return response.data.events;
  }

  async uploadEventImage(eventId: string, file: File): Promise<string> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await apiClient.post<{ imageUrl: string }>(
      `${this.baseUrl}/${eventId}/image`,
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
    const response = await apiClient.post<{ event: Event }>(
      `${this.baseUrl}/${eventId}/cancel`,
      {
        reason,
      }
    );
    return response.data.event;
  }

  async updateSafetyGuidelines(
    eventId: string,
    guidelines: string[]
  ): Promise<Event> {
    const response = await apiClient.put<{ event: Event }>(
      `${this.baseUrl}/${eventId}/safety-guidelines`,
      { guidelines }
    );
    return response.data.event;
  }

  private handleError(error: unknown): Error {
    if (error instanceof Error) {
      return error;
    }
    return new Error('An unexpected error occurred');
  }
}

export const eventService = new EventService();
