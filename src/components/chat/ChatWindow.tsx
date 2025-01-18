import React, { useEffect, useRef, useState } from 'react';
import { Message } from '@/types/chat';
import { useAuth } from '@/contexts/AuthContext';
import { chatService } from '@/services/api/chat.service';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';

interface ChatWindowProps {
  chatId: string;
  participants: string[];
  onSendMessage: (content: string) => Promise<void>;
  isConnected: boolean;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  chatId,
  participants,
  onSendMessage,
  isConnected,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        setError(null);
        const chatMessages = await chatService.getChatMessages(chatId);
        setMessages(chatMessages);
      } catch (err) {
        console.error('Error fetching messages:', err);
        setError(err instanceof Error ? err.message : 'An error occurred while fetching messages');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages().catch(err => {
      console.error('Error in fetchMessages:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while fetching messages');
    });
  }, [chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getOtherParticipant = () => {
    return participants.find(id => id !== user?.id) || '';
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <ErrorMessage message={error} />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-gray-200 p-4">
        <h2 className="text-lg font-semibold">Chat with {getOtherParticipant()}</h2>
        {!isConnected && (
          <p className="text-sm text-red-500">
            Disconnected - Messages will be sent when reconnected
          </p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {messages.map(message => (
          <div
            key={message.id}
            className={`mb-4 flex ${
              message.senderId === user?.id ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`rounded-lg px-4 py-2 ${
                message.senderId === user?.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p>{message.content}</p>
              <p className="mt-1 text-xs opacity-75">
                {new Date(message.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={(e: React.FormEvent) => {
          e.preventDefault();
          if (!newMessage.trim() || !isConnected) return;

          void (async () => {
            try {
              setIsSubmitting(true);
              await onSendMessage(newMessage.trim());
              setNewMessage('');
            } catch (err) {
              console.error('Error sending message:', err);
            } finally {
              setIsSubmitting(false);
            }
          })();
        }}
        className="border-t border-gray-200 p-4"
      >
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none"
          />
          <Button
            type="submit"
            disabled={!isConnected || !newMessage.trim() || isSubmitting}
            className="whitespace-nowrap"
          >
            Send Message
          </Button>
        </div>
      </form>
    </div>
  );
};
