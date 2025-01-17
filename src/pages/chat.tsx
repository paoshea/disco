import React, { useEffect, useState } from 'react';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { ChatList } from '@/components/chat/ChatList';
import type { ChatRoom, Message } from '@/types/chat';
import { chatService } from '@/services/api/chat.service';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';

export default function ChatPage() {
  const [chats, setChats] = useState<ChatRoom[]>([]);
  const [activeChat, setActiveChat] = useState<ChatRoom | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isConnected, send } = useWebSocket();

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
        setError(err instanceof Error ? err.message : 'An error occurred while fetching chats');
      } finally {
        setLoading(false);
      }
    };

    void fetchChats();
  }, [activeChat]);

  const handleChatSelect = (chatId: string) => {
    const selectedChat = chats.find(chat => chat.matchId === chatId);
    if (selectedChat) {
      setActiveChat(selectedChat);
      void chatService.markAsRead(chatId);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!activeChat) return;

    try {
      const message = await chatService.sendMessage(activeChat.matchId, content);

      // Update the last message in the chat list
      setChats(prevChats =>
        prevChats.map(chat =>
          chat.matchId === activeChat.matchId ? { ...chat, lastMessage: message } : chat
        )
      );

      // Send the message through WebSocket
      send({
        type: 'chat_message',
        payload: {
          chatId: activeChat.matchId,
          content,
        },
      });
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while sending the message');
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
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
    <div className="flex h-screen">
      <div className="w-1/3 border-r border-gray-200">
        <ChatList
          chats={chats}
          selectedChatId={activeChat?.matchId}
          onChatSelect={handleChatSelect}
        />
      </div>
      <div className="flex-1">
        {activeChat ? (
          <ChatWindow
            chatId={activeChat.matchId}
            participants={activeChat.participants}
            onSendMessage={handleSendMessage}
            isConnected={isConnected}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-500">
            <p>Select a chat to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
}
