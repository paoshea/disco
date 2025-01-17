import { api } from './api';
import type { ChatRoom, Message } from '@/types/chat';

class ChatService {
  private readonly baseUrl = '/chat';

  async getChats(): Promise<ChatRoom[]> {
    try {
      const response = await api.get<{ chats: ChatRoom[] }>(`${this.baseUrl}/rooms`);
      return response.data.chats;
    } catch (err) {
      throw this.handleError(err);
    }
  }

  async getChatMessages(chatId: string): Promise<Message[]> {
    try {
      const response = await api.get<{ messages: Message[] }>(
        `${this.baseUrl}/rooms/${chatId}/messages`
      );
      return response.data.messages;
    } catch (err) {
      throw this.handleError(err);
    }
  }

  async sendMessage(chatId: string, content: string): Promise<Message> {
    try {
      const response = await api.post<{ message: Message }>(
        `${this.baseUrl}/rooms/${chatId}/messages`,
        { content }
      );
      return response.data.message;
    } catch (err) {
      throw this.handleError(err);
    }
  }

  async createChat(participantId: string): Promise<ChatRoom> {
    try {
      const response = await api.post<{ chat: ChatRoom }>(`${this.baseUrl}/rooms`, {
        participantId,
      });
      return response.data.chat;
    } catch (err) {
      throw this.handleError(err);
    }
  }

  async markAsRead(chatId: string): Promise<void> {
    try {
      await api.post(`${this.baseUrl}/rooms/${chatId}/read`);
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
