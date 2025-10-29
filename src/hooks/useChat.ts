import { useState, useEffect } from 'react';
import { Message, Chat } from '../types';

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);

  useEffect(() => {
    const savedMessages = localStorage.getItem('messages');
    const savedChats = localStorage.getItem('chats');
    
    if (savedMessages) {
      const parsedMessages = JSON.parse(savedMessages);
      // Convert timestamp strings back to Date objects
      const messagesWithDates = parsedMessages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }));
      setMessages(messagesWithDates);
    }
    
    if (savedChats) {
      const parsedChats = JSON.parse(savedChats);
      // Convert timestamp strings back to Date objects
      const chatsWithDates = parsedChats.map((chat: any) => ({
        ...chat,
        lastActivity: new Date(chat.lastActivity),
        lastMessage: chat.lastMessage ? {
          ...chat.lastMessage,
          timestamp: new Date(chat.lastMessage.timestamp)
        } : undefined
      }));
      setChats(chatsWithDates);
    }
  }, []);

  const sendMessage = (receiverId: string, content: string, senderId: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      senderId,
      receiverId,
      content,
      timestamp: new Date(),
      read: false,
    };

    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    localStorage.setItem('messages', JSON.stringify(updatedMessages));

    // Update or create chat
    const existingChatIndex = chats.findIndex(chat => 
      chat.participants.includes(senderId) && chat.participants.includes(receiverId)
    );

    if (existingChatIndex >= 0) {
      const updatedChats = [...chats];
      updatedChats[existingChatIndex].lastMessage = newMessage;
      updatedChats[existingChatIndex].lastActivity = new Date();
      setChats(updatedChats);
      localStorage.setItem('chats', JSON.stringify(updatedChats));
    } else {
      const newChat: Chat = {
        id: Date.now().toString(),
        participants: [senderId, receiverId],
        lastMessage: newMessage,
        lastActivity: new Date(),
      };
      
      const updatedChats = [...chats, newChat];
      setChats(updatedChats);
      localStorage.setItem('chats', JSON.stringify(updatedChats));
    }
  };

  const getMessagesForChat = (userId1: string, userId2: string): Message[] => {
    return messages.filter(message => 
      (message.senderId === userId1 && message.receiverId === userId2) ||
      (message.senderId === userId2 && message.receiverId === userId1)
    ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  };

  const getChatForUsers = (userId1: string, userId2: string): Chat | undefined => {
    return chats.find(chat => 
      chat.participants.includes(userId1) && chat.participants.includes(userId2)
    );
  };

  const getUnreadCount = (currentUserId: string, contactId: string): number => {
    return messages.filter(message => 
      message.senderId === contactId && 
      message.receiverId === currentUserId && 
      !message.read
    ).length;
  };

  const markMessagesAsRead = (currentUserId: string, contactId: string) => {
    const updatedMessages = messages.map(message => {
      if (message.senderId === contactId && message.receiverId === currentUserId && !message.read) {
        return { ...message, read: true };
      }
      return message;
    });
    
    setMessages(updatedMessages);
    localStorage.setItem('messages', JSON.stringify(updatedMessages));
  };
  return {
    messages,
    chats,
    sendMessage,
    getMessagesForChat,
    getChatForUsers,
    getUnreadCount,
    markMessagesAsRead,
  };
}