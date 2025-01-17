export interface Message {
  id: string;
  matchId: string;
  senderId: string;
  recipientId: string;
  content: string;
  timestamp: string;
}

export interface ChatRoom {
  matchId: string;
  participants: string[];
  lastMessage?: Message;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface TypingStatus {
  userId: string;
  matchId: string;
  isTyping: boolean;
}
