import React, { useEffect, useRef, useState } from 'react';
import { Message } from '@/types/chat';
import { socketService } from '@/services/websocket/socket.service';
import { useAuth } from '@/hooks/useAuth';

interface ChatWindowProps {
  matchId: string;
  recipientId: string;
  recipientName: string;
}

interface ChatTypingData {
  userId: string;
  isTyping: boolean;
}

interface ChatMessageData extends Omit<Message, 'id' | 'timestamp'> {
  matchId: string;
  senderId: string;
  recipientId: string;
  content: string;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ matchId, recipientId, recipientName }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize chat connection
    socketService.emit<{ matchId: string }>('chat:join', { matchId });

    // Listen for new messages
    socketService.on<Message>(`chat:${matchId}`, (message) => {
      setMessages(prev => [...prev, message]);
    });

    // Listen for typing status
    socketService.on<ChatTypingData>(`chat:${matchId}:typing`, (data) => {
      if (data.userId === recipientId) {
        setIsTyping(data.isTyping);
      }
    });

    return () => {
      socketService.emit<{ matchId: string }>('chat:leave', { matchId });
      socketService.off(`chat:${matchId}`);
      socketService.off(`chat:${matchId}:typing`);
    };
  }, [matchId, recipientId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const message: ChatMessageData = {
      matchId,
      senderId: user!.id,
      recipientId,
      content: newMessage.trim(),
    };

    socketService.emit<ChatMessageData>('chat:message', message);
    setNewMessage('');
  };

  const handleTyping = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);
    socketService.emit<ChatTypingData>('chat:typing', {
      matchId,
      userId: user!.id,
      isTyping: e.target.value.length > 0,
    });
  };

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
              className={`flex ${message.senderId === user!.id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-lg ${
                  message.senderId === user!.id
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className="text-xs mt-1 opacity-75">
                  {new Date(message.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
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
            className="flex-1 min-h-[2.5rem] max-h-32 p-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            rows={1}
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="px-4 py-2 text-white bg-primary-500 rounded-lg hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};
