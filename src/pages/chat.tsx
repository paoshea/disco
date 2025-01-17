import React, { useEffect, useState } from 'react';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { ChatList } from '@/components/chat/ChatList';
import { Chat, ChatMessage } from '@/types/chat';
import { chatService } from '@/services/api/chat.service';
import { useWebSocket } from '@/hooks/useWebSocket';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';

export default function ChatPage() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { connected, send } = useWebSocket();

  useEffect(() => {
    const fetchChats = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await chatService.getChats();
        setChats(response);
        if (response.length > 0 && !activeChat) {
          setActiveChat(response[0]);
        }
      } catch (err) {
        console.error('Error fetching chats:', err);
        setError(
          err instanceof Error
            ? err.message
            : 'An error occurred while fetching chats. Please try again.'
        );
      } finally {
        setLoading(false);
      }
    };

    void fetchChats();
  }, []);

  const handleChatSelect = (chat: Chat) => {
    setActiveChat(chat);
  };

  const handleSendMessage = async (message: string) => {
    if (!activeChat || !connected) return;

    try {
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        chatId: activeChat.id,
        senderId: 'current-user', // Replace with actual user ID
        content: message,
        timestamp: new Date().toISOString(),
        status: 'sending',
      };

      // Optimistically update UI
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === activeChat.id
            ? {
                ...chat,
                messages: [...(chat.messages || []), newMessage],
                lastMessage: newMessage,
              }
            : chat
        )
      );

      // Send via WebSocket
      send({
        type: 'chat_message',
        payload: {
          chatId: activeChat.id,
          content: message,
        },
      });
    } catch (err) {
      console.error('Error sending message:', err);
      // Handle error - maybe update message status to 'failed'
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="flex h-[calc(100vh-64px)]">
      <div className="w-1/3 border-r border-gray-200">
        <ChatList
          chats={chats}
          activeChat={activeChat}
          onChatSelect={handleChatSelect}
        />
      </div>
      <div className="w-2/3">
        {activeChat ? (
          <ChatWindow
            chat={activeChat}
            onSendMessage={handleSendMessage}
            connected={connected}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Select a chat to start messaging
          </div>
        )}
      </div>
    </div>
  );
}
