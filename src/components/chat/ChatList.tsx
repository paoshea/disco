import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ChatRoom } from '@/types/chat';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';

interface ChatListProps {
  chats: ChatRoom[];
  onChatSelect?: (chatId: string) => void;
  selectedChatId?: string;
  className?: string;
}

export const ChatList: React.FC<ChatListProps> = ({
  chats,
  onChatSelect,
  selectedChatId,
  className = '',
}) => {
  const { user } = useAuth();

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();

    if (date.toDateString() === now.toDateString()) {
      return format(date, 'h:mm a');
    }
    if (date.getFullYear() === now.getFullYear()) {
      return format(date, 'MMM d');
    }
    return format(date, 'MM/dd/yy');
  };

  const getOtherParticipant = (participants: string[]) => {
    return participants.find(id => id !== user?.id) || '';
  };

  if (chats.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-4 text-center text-gray-500">
        <p>No conversations yet</p>
      </div>
    );
  }

  return (
    <div className={`divide-y divide-gray-200 ${className}`}>
      {chats.map(chat => {
        const otherParticipantId = getOtherParticipant(chat.participants);
        const isSelected = chat.matchId === selectedChatId;

        return (
          <Link
            key={chat.matchId}
            to={`/chat/${chat.matchId}`}
            onClick={() => onChatSelect?.(chat.matchId)}
            className={`flex items-center px-4 py-3 hover:bg-gray-50 ${
              isSelected ? 'bg-gray-50' : ''
            }`}
          >
            <div className="relative flex-shrink-0">
              <Avatar userId={otherParticipantId} size="md" className="h-12 w-12" />
              {chat.unreadCount > 0 && (
                <Badge variant="primary" className="absolute -right-1 -top-1">
                  {chat.unreadCount}
                </Badge>
              )}
            </div>
            <div className="min-w-0 flex-1 px-4">
              <div className="flex items-center justify-between">
                <p className="truncate text-sm font-medium text-gray-900">{otherParticipantId}</p>
                {chat.lastMessage && (
                  <p className="text-xs text-gray-500">
                    {formatTimestamp(chat.lastMessage.timestamp)}
                  </p>
                )}
              </div>
              {chat.lastMessage && (
                <p className="mt-1 truncate text-sm text-gray-500">{chat.lastMessage.content}</p>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
};
