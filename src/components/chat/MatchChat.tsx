import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Match } from '@/types/match';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';
import { Send, Image as ImageIcon, Smile, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { EmojiPicker, Emoji } from '@/components/ui/emoji-picker';
import { MatchSocketService } from '@/services/websocket/match.socket';
import { LocationShareModal } from './LocationShareModal';
import { MessageReactions } from './MessageReactions';

interface Reaction {
  emoji: string;
  count: number;
  users: string[];
}

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  type: 'text' | 'image' | 'location';
  status: 'sending' | 'sent' | 'delivered' | 'read';
  reactions: Record<string, Reaction>;
  metadata?: {
    latitude?: number;
    longitude?: number;
    locationName?: string;
    locationAddress?: string;
  };
}

interface MatchChatProps {
  match: Match;
  onClose: () => void;
}

interface MessageEvent {
  matchId: string;
  message: Message;
}

interface TypingEvent {
  matchId: string;
  userId: string;
  isTyping: boolean;
}

export function MatchChat({ match, onClose }: MatchChatProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locationTransition, setLocationTransition] = useState<'enter' | 'exit' | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketService = MatchSocketService.getInstance();

  useEffect(() => {
    // Load previous messages
    const loadMessages = async () => {
      try {
        const response = await fetch(`/api/matches/${match.id}/messages`);
        if (response.ok) {
          const data = await response.json();
          setMessages(data.messages);
        }
      } catch (error) {
        console.error('Error loading messages:', error);
      }
    };

    void loadMessages();

    // Subscribe to new messages
    const messageUnsub = socketService.subscribeToMessages((data: MessageEvent) => {
      if (data.matchId === match.id) {
        setMessages(prev => [...prev, data.message]);
        scrollToBottom();
      }
    });

    // Subscribe to typing indicators
    const typingUnsub = socketService.subscribeToTyping((data: TypingEvent) => {
      if (data.matchId === match.id && data.userId !== user?.id) {
        setIsTyping(data.isTyping);
      }
    });

    return () => {
      messageUnsub();
      typingUnsub();
    };
  }, [match.id, user?.id, socketService]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!newMessage.trim()) return;

    const tempId = Date.now().toString();
    const tempMessage: Message = {
      id: tempId,
      senderId: user!.id,
      content: newMessage,
      timestamp: new Date().toISOString(),
      type: 'text',
      status: 'sending',
      reactions: {},
    };

    setMessages(prev => [...prev, tempMessage]);
    setNewMessage('');
    scrollToBottom();

    try {
      const response = await fetch(`/api/matches/${match.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newMessage }),
      });

      if (!response.ok) throw new Error('Failed to send message');

      const { message } = await response.json();
      setMessages(prev =>
        prev.map(m => (m.id === tempId ? message : m))
      );
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev =>
        prev.filter(m => m.id !== tempId)
      );
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch(`/api/matches/${match.id}/messages/image`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to upload image');

      const { message } = await response.json();
      setMessages(prev => [...prev, message]);
      scrollToBottom();
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  const handleLocationShare = async (location: {
    latitude: number;
    longitude: number;
    name: string;
    address: string;
  }) => {
    const tempId = Date.now().toString();
    const tempMessage: Message = {
      id: tempId,
      senderId: user!.id,
      content: `📍 Shared a location: ${location.name}`,
      timestamp: new Date().toISOString(),
      type: 'location',
      status: 'sending',
      reactions: {},
      metadata: {
        latitude: location.latitude,
        longitude: location.longitude,
        locationName: location.name,
        locationAddress: location.address,
      },
    };

    setMessages(prev => [...prev, tempMessage]);
    scrollToBottom();

    try {
      const response = await fetch(`/api/matches/${match.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'location',
          content: tempMessage.content,
          metadata: tempMessage.metadata,
        }),
      });

      if (!response.ok) throw new Error('Failed to send location');

      const { message } = await response.json();
      setMessages(prev =>
        prev.map(m => (m.id === tempId ? message : m))
      );
    } catch (error) {
      console.error('Error sending location:', error);
      setMessages(prev =>
        prev.filter(m => m.id !== tempId)
      );
    }
  };

  const handleReaction = async (messageId: string, emoji: string) => {
    const message = messages.find(m => m.id === messageId);
    if (!message) return;

    const existingReaction = message.reactions[emoji];
    const hasReacted = existingReaction?.users.includes(user!.id);

    let updatedReactions = { ...message.reactions };
    if (hasReacted) {
      // Remove reaction
      const updatedUsers = existingReaction.users.filter(id => id !== user!.id);
      if (updatedUsers.length === 0) {
        delete updatedReactions[emoji];
      } else {
        updatedReactions[emoji] = {
          ...existingReaction,
          users: updatedUsers,
          count: existingReaction.count - 1,
        };
      }
    } else {
      // Add reaction
      updatedReactions[emoji] = {
        emoji,
        users: [...(existingReaction?.users || []), user!.id],
        count: (existingReaction?.count || 0) + 1,
      };
    }

    // Optimistically update UI
    setMessages(prev =>
      prev.map(m =>
        m.id === messageId
          ? { ...m, reactions: updatedReactions }
          : m
      )
    );

    try {
      await fetch(`/api/matches/${match.id}/messages/${messageId}/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emoji, action: hasReacted ? 'remove' : 'add' }),
      });
    } catch (error) {
      console.error('Error updating reaction:', error);
      // Revert optimistic update on error
      setMessages(prev =>
        prev.map(m =>
          m.id === messageId
            ? { ...m, reactions: message.reactions }
            : m
        )
      );
    }
  };

  const handleLocationModalOpen = () => {
    setLocationTransition('enter');
    setShowLocationModal(true);
  };

  const handleLocationModalClose = () => {
    setLocationTransition('exit');
    setTimeout(() => {
      setShowLocationModal(false);
      setLocationTransition(null);
    }, 300);
  };

  const renderMessage = (message: Message) => {
    const isOwnMessage = message.senderId === user?.id;

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`group flex flex-col ${
          isOwnMessage ? 'items-end' : 'items-start'
        }`}
      >
        <div
          className={`relative max-w-[70%] rounded-lg p-3 ${
            isOwnMessage ? 'bg-primary text-white' : 'bg-gray-100'
          }`}
        >
          {message.type === 'location' ? (
            <div className="space-y-2">
              <div
                className="relative h-32 w-full rounded-lg bg-cover bg-center cursor-pointer"
                style={{
                  backgroundImage: `url(https://maps.googleapis.com/maps/api/staticmap?center=${message.metadata?.latitude},${message.metadata?.longitude}&zoom=15&size=600x300&markers=color:red%7C${message.metadata?.latitude},${message.metadata?.longitude}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY})`,
                }}
                onClick={() => {
                  if (message.metadata?.latitude && message.metadata?.longitude) {
                    window.open(
                      `https://www.google.com/maps/search/?api=1&query=${message.metadata.latitude},${message.metadata.longitude}`,
                      '_blank'
                    );
                  }
                }}
              >
                <div className="absolute inset-0 bg-black/10 rounded-lg" />
                <div className="absolute bottom-2 left-2 right-2 text-white text-sm">
                  <div className="font-medium">{message.metadata?.locationName}</div>
                  <div className="text-xs truncate">{message.metadata?.locationAddress}</div>
                </div>
              </div>
            </div>
          ) : message.type === 'image' ? (
            <img
              src={message.content}
              alt="Shared image"
              className="rounded-lg max-w-full"
            />
          ) : (
            <p>{message.content}</p>
          )}

          <div
            className={`text-xs mt-1 ${
              isOwnMessage ? 'text-white/70' : 'text-gray-500'
            }`}
          >
            {formatDistanceToNow(new Date(message.timestamp), {
              addSuffix: true,
            })}
            {isOwnMessage && (
              <span className="ml-2">
                {message.status === 'sending' && '⋯'}
                {message.status === 'sent' && '✓'}
                {message.status === 'delivered' && '✓✓'}
                {message.status === 'read' && '✓✓'}
              </span>
            )}
          </div>

          <MessageReactions
            messageId={message.id}
            reactions={Object.values(message.reactions)}
            onReact={handleReaction}
            currentUserId={user!.id}
          />
        </div>
      </motion.div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-xl shadow-lg max-w-2xl mx-auto"
    >
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-3">
          <Avatar userId={user?.id || ''}>
            <img src={match.profileImage} alt={match.name} className="w-8 h-8 rounded-full" />
          </Avatar>
          <div>
            <h3 className="font-semibold">{match.name}</h3>
            <p className="text-sm text-gray-500">
              {match.distance.toFixed(1)}km away
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          ×
        </Button>
      </div>

      {/* Messages */}
      <div className="h-[400px] overflow-y-auto p-4 space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex ${
                message.senderId === user?.id ? 'justify-end' : 'justify-start'
              }`}
            >
              {renderMessage(message)}
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-gray-500"
          >
            {match.name} is typing...
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t">
        <div className="flex items-center space-x-2">
          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
            <ImageIcon className="w-6 h-6 text-gray-500 hover:text-gray-700" />
          </label>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLocationModalOpen}
          >
            <MapPin className="w-6 h-6 text-gray-500 hover:text-gray-700" />
          </Button>

          <div className="relative flex-1">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type a message..."
              className="pr-10"
            />
            <button
              onClick={() => setShowEmoji(!showEmoji)}
              className="absolute right-2 top-1/2 -translate-y-1/2"
            >
              <Smile className="w-6 h-6 text-gray-500 hover:text-gray-700" />
            </button>
          </div>

          <Button onClick={handleSend} size="sm">
            <Send className="w-4 h-4" />
          </Button>
        </div>

        {showEmoji && (
          <div className="absolute bottom-full right-0 mb-2">
            <EmojiPicker
              onEmojiSelect={(emoji: Emoji) => {
                setNewMessage(prev => prev + emoji.native);
                setShowEmoji(false);
              }}
              theme="light"
            />
          </div>
        )}
      </div>

      <LocationShareModal
        isOpen={showLocationModal}
        onClose={handleLocationModalClose}
        onLocationSelect={handleLocationShare}
        transitionState={locationTransition}
      />

      <style jsx global>{`
        .message-reaction-enter {
          transform: scale(0);
          opacity: 0;
        }
        .message-reaction-enter-active {
          transform: scale(1);
          opacity: 1;
          transition: all 300ms ease-out;
        }
        .message-reaction-exit {
          transform: scale(1);
          opacity: 1;
        }
        .message-reaction-exit-active {
          transform: scale(0);
          opacity: 0;
          transition: all 300ms ease-in;
        }
      `}</style>
    </motion.div>
  );
}
