export interface UserInfo {
  id: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
}

export interface MessageInfo {
  id: string;
  content: string;
  senderId: string;
  chatRoomId: string;
  createdAt: Date;
  updatedAt: Date;
  timestamp: string;
}

export interface MessageWithSender extends MessageInfo {
  sender: UserInfo;
}

export interface ChatRoomInfo {
  id: string;
  name: string | null;
  creatorId: string;
  participantId: string;
  matchId: string;
  participants: string[];
  lastMessage?: MessageInfo;
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
  participantUsers?: UserInfo[];
}

export interface ChatRoomWithRelations extends ChatRoomInfo {
  creator: UserInfo;
  participant: UserInfo;
  messages: MessageWithSender[];
}

// Add type aliases to match imports
export type Message = MessageInfo;
export type ChatRoom = ChatRoomInfo;

export interface ChatParticipant {
  userId: string;
  role: 'creator' | 'participant';
  joinedAt: Date;
}

export function formatTimestamp(timestamp: string): string {
  return new Date(timestamp).toLocaleTimeString();
}
