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
}

export interface MessageWithSender extends MessageInfo {
  sender: UserInfo;
}

export interface ChatRoomInfo {
  id: string;
  name: string | null;
  creatorId: string;
  participantId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatRoomWithRelations extends ChatRoomInfo {
  creator: UserInfo;
  participant: UserInfo;
  messages: MessageWithSender[];
}
