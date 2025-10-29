import React, { useState, useEffect, useRef, useMemo, type KeyboardEvent } from 'react';
import { Send, ArrowLeft, Bot, Lightbulb } from 'lucide-react';
import type { User } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useChat } from '../hooks/useChat';
import { getTaxBotResponse, getFollowUpSuggestions } from '../utils/taxbotResponses';

/**
 * Notes on fix:
 * - Avoided using the selectedContact object in useEffect dependency array.
 *   selectedContact was being recomputed each render (new object identity)
 *   causing the effect to run repeatedly and producing the "Maximum update depth exceeded" error.
 * - Memoized availableContacts and selectedContact so references are stable.
 * - Only call markMessagesAsRead when there are unread messages. This avoids unnecessary state churn.
 * - Kept debug logs to help trace if any further loops appear.
 */

interface LocalMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: number;
}

interface MessagingInterfaceProps {
  users: User[];
  onBack: () => void;
  initialContactId?: string;
}

export function MessagingInterface({ users, onBack, initialContactId }: MessagingInterfaceProps) {
  const { currentUser } = useAuth();
  const { sendMessage, getMessagesForChat, getChatForUsers, getUnreadCount, markMessagesAsRead } = useChat();

  const [selectedContactId, setSelectedContactId] = useState<string | null>(initialContactId || null);
  const [messageText, setMessageText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [localMessages, setLocalMessages] = useState<LocalMessage[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const aiChatbot: User = {
    id: 'ai-chatbot',
    name: 'TaxBot AI',
    email: 'ai@taxtalk.com',
    phone: 'AI Assistant',
    profileImage: 'https://api.dicebear.com/7.x/bottts/svg?seed=ai',
    userType: 'ca',
  };

  // Memoize availableContacts so identity doesn't change each render
  const availableContacts = useMemo(() => {
    return [
      aiChatbot,
      ...users.filter(user => {
        if (!currentUser) return false;
        if (currentUser.userType === 'user') {
          return user.userType === 'ca' && user.id !== currentUser.id;
        } else {
          return user.userType === 'user' && user.id !== currentUser.id;
        }
      })
    ];
  }, [users, currentUser]);

  // Memoize selectedContact based on selectedContactId and memoized availableContacts
  const selectedContact = useMemo(() => {
    return selectedContactId ? availableContacts.find(c => c.id === selectedContactId) : undefined;
  }, [selectedContactId, availableContacts]);

  // robust send wrapper (keeps previous behavior)
  const trySend = async (receiverId: string, content: string, senderId: string) => {
    if (!sendMessage) {
      console.error('useChat.sendMessage is not available');
      throw new Error('sendMessage missing');
    }

    try {
      // preferred signature: (receiver, content, sender)
      // @ts-ignore
      const res = await sendMessage(receiverId, content, senderId);
      console.debug('sendMessage succeeded as (receiver, content, sender)', { receiverId, content, senderId, res });
      return res;
    } catch (err1) {
      console.debug('sendMessage (receiver, content, sender) failed:', err1);
      try {
        // alternate signature: (sender, receiver, content)
        // @ts-ignore
        const res2 = await sendMessage(senderId, receiverId, content);
        console.debug('sendMessage succeeded as (sender, receiver, content)', { senderId, receiverId, content, res2 });
        return res2;
      } catch (err2) {
        console.error('sendMessage failed for both tried signatures', err1, err2);
        throw err2;
      }
    }
  };

  // reload canonical messages and merge with optimistic local messages
  const reloadMessages = () => {
    if (!currentUser || !selectedContactId) {
      setLocalMessages([]);
      return;
    }
    try {
      const fetched = (getMessagesForChat(currentUser.id, selectedContactId) || []) as any[];
      const normalizedFetched: LocalMessage[] = fetched.map(m => ({
        id: m.id ?? `${m.senderId}-${m.timestamp}-${Math.random()}`,
        senderId: m.senderId,
        receiverId: m.receiverId ?? (m.senderId === currentUser.id ? selectedContactId : currentUser.id),
        content: m.content,
        timestamp: m.timestamp ?? Date.now()
      }));

      // Merge fetched + optimistic local messages that are not yet in fetched
      const fetchedIds = new Set(normalizedFetched.map(m => m.id));
      const merged = [
        ...normalizedFetched,
        ...localMessages.filter(local => {
          if (fetchedIds.has(local.id)) return false;
          return !normalizedFetched.some(f => f.content === local.content && Math.abs(f.timestamp - local.timestamp) < 2000);
        })
      ];

      merged.sort((a, b) => a.timestamp - b.timestamp);
      setLocalMessages(merged);
    } catch (err) {
      console.error('reloadMessages failed:', err);
    }
  };

  useEffect(() => {
    reloadMessages();
    // only depend on stable values — avoid object references that change each render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedContactId, currentUser?.id, refreshKey]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [localMessages.length, isTyping]);

  // Mark messages as read and show suggestions — IMPORTANT: depend only on id/currentUser to avoid loops
  useEffect(() => {
    if (!selectedContactId || !currentUser) return;

    try {
      // Only call markMessagesAsRead if there are unread messages to avoid triggering unnecessary state updates
      const unread = getUnreadCount(currentUser.id, selectedContactId);
      if (unread && unread > 0) {
        markMessagesAsRead(currentUser.id, selectedContactId);
      }
    } catch (err) {
      console.warn('markMessagesAsRead failed:', err);
    }

    // handle suggestions + AI welcome
    if (selectedContactId === 'ai-chatbot') {
      const initialSuggestions = [
        "How to file Income Tax Return?",
        "GST registration process",
        "Tax saving investment options",
        "TDS rates and compliance"
      ];
      setSuggestions(initialSuggestions);
      setShowSuggestions(true);

      const existingMessages = getMessagesForChat(currentUser.id, 'ai-chatbot') || [];
      if (existingMessages.length === 0) {
        setTimeout(async () => {
          const welcomeMessage = "Hello! 👋 I'm TaxBot, your AI tax assistant. I'm here to help you with tax filing, GST queries, business registration, and much more. What would you like to know about taxes today?";
          const aiMsg: LocalMessage = {
            id: `ai-${Date.now()}-${Math.random()}`,
            senderId: 'ai-chatbot',
            receiverId: currentUser.id,
            content: welcomeMessage,
            timestamp: Date.now()
          };
          setLocalMessages(prev => [...prev, aiMsg]);
          try {
            await trySend(currentUser.id, welcomeMessage, 'ai-chatbot');
            setRefreshKey(k => k + 1);
          } catch (err) {
            console.error('persist AI welcome failed:', err);
          }
        }, 500);
      }
    } else if (selectedContact) {
      // For CAs show starter suggestions
      if (selectedContact.userType === 'ca') {
        const caBaseSuggestions = [
          selectedContact.specialization ? `Tell me about your experience with ${selectedContact.specialization}` : 'Tell me about your expertise',
          'What documents do you need for tax filing?',
          'How do you charge for consultations?',
          'Can you help with GST registration?'
        ];
        setSuggestions(caBaseSuggestions);
        setShowSuggestions(true);
      } else {
        setShowSuggestions(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedContactId, currentUser?.id]);

  const makeUserLocalMessage = (content: string): LocalMessage => ({
    id: `local-${Date.now()}-${Math.random()}`,
    senderId: currentUser!.id,
    receiverId: selectedContactId!,
    content,
    timestamp: Date.now()
  });

  const debugLog = (...args: any[]) => console.debug('[MessagingInterface debug]', ...args);

  const sendUserMessageTo = async (receiverId: string, userMessage: string) => {
    debugLog('sendUserMessageTo', { receiverId, userMessage, currentUserId: currentUser?.id });
    const localMsg: LocalMessage = {
      id: `local-${Date.now()}-${Math.random()}`,
      senderId: currentUser!.id,
      receiverId,
      content: userMessage,
      timestamp: Date.now()
    };
    setLocalMessages(prev => [...prev, localMsg]);
    try {
      await trySend(receiverId, userMessage, currentUser!.id);
      setRefreshKey(k => k + 1);
    } catch (err) {
      console.error('Failed to persist user message:', err);
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedContactId || !currentUser) return;
    const userMessage = messageText.trim();
    setMessageText('');
    setShowSuggestions(false);

    await sendUserMessageTo(selectedContactId, userMessage);

    if (selectedContactId === 'ai-chatbot') {
      setIsTyping(true);
      setTimeout(async () => {
        try {
          const aiResponse = getTaxBotResponse(userMessage, currentUser!.id);
          debugLog('AI generated response', aiResponse);
          const aiLocal: LocalMessage = {
            id: `ai-${Date.now()}-${Math.random()}`,
            senderId: 'ai-chatbot',
            receiverId: currentUser!.id,
            content: aiResponse,
            timestamp: Date.now()
          };
          setLocalMessages(prev => [...prev, aiLocal]);
          try {
            await trySend(currentUser!.id, aiResponse, 'ai-chatbot');
            setRefreshKey(k => k + 1);
          } catch (err) {
            console.error('Failed to persist AI response:', err);
          }
          const followUp = getFollowUpSuggestions(userMessage);
          setSuggestions(followUp);
          setShowSuggestions(true);
        } catch (err) {
          console.error('AI generation error:', err);
        } finally {
          setIsTyping(false);
        }
      }, 800);
    }
  };

  const handleSuggestionClick = async (suggestion: string, receiverId: string) => {
    if (!currentUser || !receiverId) return;
    debugLog('handleSuggestionClick', { suggestion, receiverId });
    await sendUserMessageTo(receiverId, suggestion);

    if (receiverId === 'ai-chatbot') {
      setIsTyping(true);
      setTimeout(async () => {
        try {
          const aiResponse = getTaxBotResponse(suggestion, currentUser!.id);
          debugLog('AI response for suggestion', aiResponse);
          const aiLocal: LocalMessage = {
            id: `ai-${Date.now()}-${Math.random()}`,
            senderId: 'ai-chatbot',
            receiverId: currentUser!.id,
            content: aiResponse,
            timestamp: Date.now()
          };
          setLocalMessages(prev => [...prev, aiLocal]);
          try {
            await trySend(currentUser!.id, aiResponse, 'ai-chatbot');
            setRefreshKey(k => k + 1);
          } catch (err) {
            console.error('Failed to persist AI suggestion response:', err);
          }
          const followUp = getFollowUpSuggestions(suggestion);
          setSuggestions(followUp);
          setShowSuggestions(true);
        } catch (err) {
          console.error('AI suggestion handling error:', err);
        } finally {
          setIsTyping(false);
        }
      }, 800);
    } else {
      // human CA: keep suggestions visible by default
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if ((e as KeyboardEvent).key === 'Enter' && !((e as KeyboardEvent).shiftKey)) {
      e.preventDefault();
      void handleSendMessage();
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <button onClick={onBack} className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Profiles</span>
          </button>
          <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
        </div>

        <div className="flex-1 overflow-y-auto">
          {availableContacts.map(contact => {
            const chat = currentUser ? getChatForUsers(currentUser.id, contact.id) : undefined;
            const unreadCount = currentUser ? getUnreadCount(currentUser.id, contact.id) : 0;
            const isSelected = selectedContactId === contact.id;

            return (
              <button
                key={contact.id}
                onClick={() => setSelectedContactId(contact.id)}
                className={`w-full p-4 text-left border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200 ${isSelected ? 'bg-blue-50 border-blue-200' : ''}`}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <img className="h-12 w-12 rounded-full" src={contact.profileImage} alt={contact.name} />
                    {contact.id === 'ai-chatbot' && (
                      <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                        <Bot className="h-3 w-3 text-white" />
                      </div>
                    )}
                    {unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">{contact.name}</div>
                    <div className={`text-sm truncate ${unreadCount > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                      {contact.id === 'ai-chatbot' ? 'AI Assistant for tax queries' : chat?.lastMessage ? chat.lastMessage.content : 'Start a conversation'}
                    </div>
                    {chat?.lastMessage && (
                      <div className="text-xs text-gray-400 mt-1">
                        {new Date(chat.lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {selectedContact ? (
          <>
            <div className="p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center space-x-3">
                <img className="h-10 w-10 rounded-full" src={selectedContact.profileImage} alt={selectedContact.name} />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{selectedContact.name}</h3>
                  <p className="text-sm text-gray-500">{selectedContact.id === 'ai-chatbot' ? 'AI Assistant' : selectedContact.phone}</p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {localMessages.length === 0 ? (
                <div className="text-center text-gray-500 mt-8"><p>Start a conversation with {selectedContact.name}</p></div>
              ) : (
                localMessages.map(message => {
                  const isOwn = message.senderId === currentUser?.id;
                  const otherId = message.senderId === currentUser?.id ? message.receiverId : message.senderId;
                  if (otherId !== selectedContactId && message.receiverId !== selectedContactId && message.senderId !== selectedContactId) {
                    return null;
                  }
                  return (
                    <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${isOwn ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-900'}`}>
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        <p className={`text-xs mt-1 ${isOwn ? 'text-blue-100' : 'text-gray-500'}`}>{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                  );
                })
              )}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-200 text-gray-900 max-w-xs lg:max-w-md px-4 py-2 rounded-lg">
                    <p className="text-sm"><span className="inline-flex space-x-1"><span className="animate-bounce">.</span><span className="animate-bounce" style={{ animationDelay: '0.1s' }}>.</span><span className="animate-bounce" style={{ animationDelay: '0.2s' }}>.</span></span></p>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {selectedContact && (selectedContact.id === 'ai-chatbot' || selectedContact.userType === 'ca') && showSuggestions && suggestions.length > 0 && (
              <div className="px-4 py-2 bg-blue-50 border-t border-blue-100">
                <div className="flex items-center space-x-2 mb-2">
                  <Lightbulb className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Suggested questions:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((suggestion, index) => (
                    <button key={index} onClick={() => handleSuggestionClick(suggestion, selectedContact.id)} className="text-xs bg-white text-blue-700 px-3 py-1 rounded-full border border-blue-200 hover:bg-blue-100 transition-colors duration-200">
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex space-x-2">
                <input type="text" value={messageText} onChange={(e) => setMessageText(e.target.value)} onKeyPress={handleKeyPress} placeholder={`Message ${selectedContact.name}...`} className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                <button onClick={() => void handleSendMessage()} disabled={!messageText.trim()} className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white p-2 rounded-lg transition-colors duration-200">
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <p className="text-lg">Select a contact to start messaging</p>
              <p className="text-sm mt-2">Choose from the list on the left</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}