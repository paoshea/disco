import React, { useEffect, useRef, useState } from 'react';
import { Message, TypingStatus } from '@/types/chat';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { useAuth } from '@/hooks/useAuth';
import type { User } from '@/types/user';

interface ChatWindowProps {
  matchId: string;
  recipientId: string;
  recipientName: string;
}

type ChatEvent = 
  | 'chat:join'
  | 'chat:leave'
  | 'chat:message'
  | 'chat:typing'
  | `chat:${string}`
  | `chat:${string}:typing`;

interface ChatJoinPayload {
  matchId: string;
}

interface ChatMessagePayload extends Omit<Message, 'id' | 'timestamp'> {
  matchId: string;
  senderId: string;
  recipientId: string;
  content: string;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ matchId, recipientId, recipientName }) => {
  const { user, isLoading } = useAuth();
  const { send, subscribe } = useWebSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user?.id) return;

    // Initialize chat connection
    send('chat:join', { matchId });

    // Listen for new messages
    const unsubscribeMessage = subscribe(`chat:${matchId}`, (message: Message) => {
      setMessages(prev => [...prev, message]);
    });

    // Listen for typing status
    const unsubscribeTyping = subscribe(`chat:${matchId}:typing`, (data: TypingStatus) => {
      if (data.userId === recipientId) {
        setIsTyping(data.isTyping);
      }
    });

    return () => {
      send('chat:leave', { matchId });
      unsubscribeMessage();
      unsubscribeTyping();
    };
  }, [matchId, recipientId, user?.id, send, subscribe]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user?.id) return;

    const message: ChatMessagePayload = {
      matchId,
      senderId: user.id,
      recipientId,
      content: newMessage.trim(),
    };

    send('chat:message', message);
    setNewMessage('');
  };

  const handleTyping = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!user?.id) return;
    
    setNewMessage(e.target.value);
    send('chat:typing', {
      matchId,
      userId: user.id,
      isTyping: e.target.value.length > 0,
    } as TypingStatus);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Please log in to chat</div>;
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg">
      {/* Chat Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">{recipientName}</h3>
        {isTyping && <p className="text-sm text-gray-500">Typing...</p>}
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
          {messages.map(message => (
            <div
              key={message.id}
              className={`flex ${message.senderId === user.id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-lg ${
                  message.senderId === user.id
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p>{message.content}</p>
                <p className="text-xs mt-1 opacity-75">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
        <div className="flex space-x-4">
          <textarea
            value={newMessage}
            onChange={handleTyping}
            placeholder="Type a message..."
            className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            rows={1}
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};
