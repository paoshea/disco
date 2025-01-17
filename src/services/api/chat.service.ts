import { apiClient } from './api.client';
import type { ChatRoom, Message } from '@/types/chat';

class ChatService {
  private readonly baseUrl = '/chats';

  async getChats(): Promise<ChatRoom[]> {
    try {
      const response = await apiClient.get<{ data: { chats: ChatRoom[] } }>(
        `${this.baseUrl}/rooms`
      );
      return response.data.data.chats;
    } catch (err) {
      throw this.handleError(err);
    }
  }

  async getChatMessages(chatId: string): Promise<Message[]> {
    try {
      const response = await apiClient.get<{ data: { messages: Message[] } }>(
        `${this.baseUrl}/rooms/${chatId}/messages`
      );
      return response.data.data.messages;
    } catch (err) {
      throw this.handleError(err);
    }
  }

  async sendMessage(chatId: string, content: string): Promise<Message> {
    try {
      const response = await apiClient.post<{ data: { message: Message } }>(
        `${this.baseUrl}/rooms/${chatId}/messages`,
        { content }
      );
      return response.data.data.message;
    } catch (err) {
      throw this.handleError(err);
    }
  }

  async createChat(participantId: string): Promise<ChatRoom> {
    try {
      const response = await apiClient.post<{ data: { chat: ChatRoom } }>(`${this.baseUrl}/rooms`, {
        participantId,
      });
      return response.data.data.chat;
    } catch (err) {
      throw this.handleError(err);
    }
  }

  async markAsRead(chatId: string): Promise<void> {
    try {
      await apiClient.post(`${this.baseUrl}/rooms/${chatId}/read`);
    } catch (err) {
      throw this.handleError(err);
    }
  }

  async deleteChat(chatId: string): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/rooms/${chatId}`);
    } catch (err) {
      throw this.handleError(err);
    }
  }

  private handleError(error: unknown): Error {
    if (error instanceof Error) {
      return error;
    }
    return new Error('An unexpected error occurred in chat service');
  }
}

export const chatService = new ChatService();
