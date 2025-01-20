import React, { useEffect, useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Message, MessageWithSender } from '@/types/chat';
import { MatchSocketService } from '@/services/websocket/match.socket';
import { useToast } from '@/components/ui/use-toast';
import { Avatar } from '@/components/ui/Avatar';
import { MessageReactions } from './MessageReactions';
import { EmojiPicker, Emoji } from '@/components/ui/emoji-picker';
import { Button } from '@/components/ui/Button';
import { LocationShareModal } from './LocationShareModal';
import { WebSocketMessage, WebSocketEventType } from '@/types/websocket';

interface MessageEvent {
  matchId: string;
  message: MessageWithSender;
}

interface TypingEvent {
  matchId: string;
  userId: string;
  isTyping: boolean;
}

interface Reaction {
  id: string;
  emoji: string;
  userId: string;
  messageId: string;
  createdAt: Date;
}

interface ExtendedMessageWithSender extends MessageWithSender {
  reactions?: Reaction[];
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
  const { data: session } = useSession();
  const [messages, setMessages] = useState<ExtendedMessageWithSender[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const socketService = MatchSocketService.getInstance();

  useEffect(() => {
    if (!session?.user?.id || !chatRoomId) return;

    // Load initial messages
    const fetchMessages = async () => {
      try {
        const response = await fetch(`/api/chat/messages/${chatRoomId}`);
        if (!response.ok) throw new Error('Failed to fetch messages');
        const data = await response.json();
        setMessages(data.messages);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    void fetchMessages();

    // Subscribe to WebSocket events
    const handleWebSocketEvent = (event: WebSocketMessage) => {
      switch (event.type) {
        case WebSocketEventType.MESSAGE:
          if (event.matchId === matchId) {
            setMessages(prev => [...prev, event.message]);
            scrollToBottom();
          }
          break;
        case WebSocketEventType.TYPING:
          if (event.matchId === matchId && event.userId === otherUserId) {
            setIsTyping(event.isTyping);
          }
          break;
        default:
          console.error('Unknown WebSocket event type:', event.type);
      }
    };

    socketService.subscribe(handleWebSocketEvent);

    return () => {
      socketService.unsubscribe(handleWebSocketEvent);
    };
  }, [session?.user?.id, chatRoomId, otherUserId, matchId, socketService]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !session?.user?.id) return;

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
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleReaction = async (messageId: string, emoji: string) => {
    try {
      const response = await fetch(`/api/chat/messages/${messageId}/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emoji }),
      });

      if (!response.ok) throw new Error('Failed to add reaction');

      const updatedMessage = await response.json();
      setMessages(prev =>
        prev.map(msg =>
          msg.id === messageId ? { ...msg, reactions: updatedMessage.reactions } : msg
        )
      );
    } catch (error) {
      console.error('Error adding reaction:', error);
      toast({
        title: 'Error',
        description: 'Failed to add reaction. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleEmojiSelect = (emoji: Emoji) => {
    setMessage(prev => prev + emoji.native);
  };

  const handleLocationShare = async (latitude: number, longitude: number) => {
    try {
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: `📍 Location shared: https://maps.google.com/?q=${latitude},${longitude}`,
          chatRoomId,
          matchId,
          type: 'location',
          metadata: { latitude, longitude },
        }),
      });

      if (!response.ok) throw new Error('Failed to share location');

      setShowLocationModal(false);
    } catch (error) {
      console.error('Error sharing location:', error);
      toast({
        title: 'Error',
        description: 'Failed to share location. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.senderId === session?.user?.id ? 'justify-end' : 'justify-start'
            }`}
          >
            {message.senderId !== session?.user?.id && (
              <Avatar 
                userId={message.sender.id}
                imageUrl={message.sender.avatar}
                size="sm"
              />
            )}

            <div className="max-w-[70%] mx-2">
              <div
                className={`rounded-lg px-4 py-2 ${
                  message.senderId === session?.user?.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <p>{message.content}</p>
              </div>
              <MessageReactions
                messageId={message.id}
                reactions={message.reactions || []}
                currentUserId={session?.user?.id || ''}
                onReactionAdd={handleReaction}
                onReactionRemove={handleReaction}
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
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            😊
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowLocationModal(true)}
          >
            📍
          </Button>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type a message..."
            className="flex-1 bg-background rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <Button onClick={handleSendMessage}>Send</Button>
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
          onLocationSelect={({ latitude, longitude }) => 
            handleLocationShare(latitude, longitude)
          }
        />
      )}
    </div>
  );
};
