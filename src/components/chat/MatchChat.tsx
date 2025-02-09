import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import type { MessageWithSender } from '@/types/chat';
import { MatchSocketService } from '@/services/websocket/match.socket';
import { toast } from '@/hooks/use-toast';
import { Avatar } from '@/components/ui/Avatar';
import { MessageReactions } from './MessageReactions';
import { EmojiPicker, type Emoji } from '@/components/ui/emoji-picker';
import { Button } from '@/components/ui/Button';
import { LocationShareModal } from './LocationShareModal';

interface Reaction {
  id: string;
  emoji: string;
  userId: string;
  messageId: string;
  count: number;
  users: string[];
}

interface ExtendedMessageWithSender extends MessageWithSender {
  reactions: Reaction[];
}

interface MatchChatProps {
  matchId: string;
  chatRoomId: string;
  otherUserId: string;
}

export const MatchChat: React.FC<MatchChatProps> = ({
  matchId,
  chatRoomId,
  otherUserId,
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ExtendedMessageWithSender[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketService = MatchSocketService.getInstance();

  useEffect(() => {
    if (!user?.id || !chatRoomId) return;

    const fetchMessages = async () => {
      try {
        const response = await fetch(`/api/chat/messages/${chatRoomId}`);
        if (!response.ok) throw new Error('Failed to fetch messages');
        const data = (await response.json()) as {
          messages: ExtendedMessageWithSender[];
        };
        setMessages(data.messages);
      } catch (error) {
        console.error('Error fetching messages:', error);
        toast.error('Failed to fetch messages. Please try again.');
      }
    };

    void fetchMessages();

    const messageUnsub = socketService.subscribeToMessages(
      (data: { matchId: string; message: MessageWithSender }) => {
        if (data.matchId === matchId) {
          const messageWithReactions: ExtendedMessageWithSender = {
            ...data.message,
            reactions: [],
          };
          setMessages(prev => [...prev, messageWithReactions]);
          scrollToBottom();
        }
      }
    );

    const typingUnsub = socketService.subscribeToTyping(
      (event: { matchId: string; userId: string; isTyping: boolean }) => {
        if (event.matchId === matchId && event.userId === otherUserId) {
          setIsTyping(event.isTyping);
        }
      }
    );

    return () => {
      messageUnsub();
      typingUnsub();
    };
  }, [user?.id, chatRoomId, otherUserId, matchId, socketService]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !user?.id) return;

    try {
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: message,
          chatRoomId,
          matchId,
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');

      setMessage('');
      setShowEmojiPicker(false);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
    }
  };

  const handleReaction = async (messageId: string, emoji: string) => {
    try {
      const response = await fetch(
        `/api/chat/messages/${messageId}/reactions`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ emoji }),
        }
      );

      if (!response.ok) throw new Error('Failed to add reaction');

      const updatedMessage = (await response.json()) as {
        reactions: Reaction[];
      };
      setMessages(prev =>
        prev.map(msg =>
          msg.id === messageId
            ? { ...msg, reactions: updatedMessage.reactions }
            : msg
        )
      );
    } catch (error) {
      console.error('Error adding reaction:', error);
      toast.error('Failed to add reaction. Please try again.');
    }
  };

  const handleEmojiSelect = (emoji: Emoji) => {
    setMessage(prev => prev + emoji.native);
    setShowEmojiPicker(false);
  };

  const handleLocationShare = async (location: {
    latitude: number;
    longitude: number;
    name: string;
    address: string;
  }) => {
    try {
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: `📍 Location shared: ${location.name}\n${location.address}`,
          chatRoomId,
          matchId,
          type: 'location',
          metadata: {
            latitude: location.latitude,
            longitude: location.longitude,
            name: location.name,
            address: location.address,
          },
        }),
      });

      if (!response.ok) throw new Error('Failed to share location');

      setShowLocationModal(false);
    } catch (error) {
      console.error('Error sharing location:', error);
      toast.error('Failed to share location. Please try again.');
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(message => (
          <div
            key={message.id}
            className={`flex ${
              message.senderId === user?.id ? 'justify-end' : 'justify-start'
            }`}
            onClick={() => {
              void (async () => {
                // Handle click
              })();
            }}
          >
            {message.senderId !== user?.id && (
              <Avatar
                userId={message.sender.id}
                imageUrl={message.sender.avatar || undefined}
                size="sm"
              />
            )}

            <div className="max-w-[70%] mx-2">
              <div
                className={`rounded-lg px-4 py-2 ${
                  message.senderId === user?.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <p>{message.content}</p>
              </div>
              <MessageReactions
                messageId={message.id}
                reactions={message.reactions}
                currentUserId={user?.id || ''}
                onReactionAdd={emoji => {
                  void handleReaction(message.id, emoji);
                }}
                onReactionRemove={emoji => {
                  void handleReaction(message.id, emoji);
                }}
              />
              <div className="text-xs text-muted-foreground mt-1">
                {new Date(message.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {isTyping && (
        <div className="px-4 py-2 text-sm text-muted-foreground">
          Someone is typing...
        </div>
      )}

      <div className="border-t p-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              void setShowEmojiPicker(!showEmojiPicker);
            }}
          >
            😊
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              void setShowLocationModal(true);
            }}
          >
            📍
          </Button>
          <input
            type="text"
            value={message}
            onChange={e => setMessage(e.target.value)}
            onKeyPress={e => {
              if (e.key === 'Enter') void handleSendMessage();
            }}
            placeholder="Type a message..."
            className="flex-1 bg-background rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <Button
            onClick={() => {
              void handleSendMessage();
            }}
          >
            Send
          </Button>
        </div>

        {showEmojiPicker && (
          <div className="absolute bottom-20 right-4">
            <EmojiPicker onEmojiSelect={handleEmojiSelect} />
          </div>
        )}
      </div>

      {showLocationModal && (
        <LocationShareModal
          isOpen={showLocationModal}
          onClose={() => setShowLocationModal(false)}
          onLocationSelect={location => {
            void handleLocationShare(location);
          }}
        />
      )}
    </div>
  );
};
