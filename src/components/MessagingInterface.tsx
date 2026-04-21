import React, { useState, useEffect, useRef, useMemo, useCallback, type KeyboardEvent } from 'react';
import { Send, ArrowLeft, Bot, Paperclip, X } from 'lucide-react';
import type { User, TaxbotMessage, ApiResponse, TaxbotConversation } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useChat } from '../hooks/useChat';
import { api, apiFetch } from '../services/api';

const TAXBOT_ID = 'ai-taxbot';

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

interface AttachmentState {
  data: string;
  name: string;
  type: string;
}

interface SidebarContact {
  id: string;
  fullName: string;
  profileImage: string | null;
  role: string;
  isBot?: boolean;
  unreadCount?: number;
  lastContent?: string | null;
}

interface MessagingInterfaceProps {
  users: User[];
  onBack: () => void;
  initialContactId?: string;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

function avatarSrc(fullName: string, profileImage: string | null): string {
  return (
    profileImage ??
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(fullName)}`
  );
}

export function MessagingInterface({ onBack, initialContactId }: Omit<MessagingInterfaceProps, 'users'> & { users?: User[] }) {
  const { currentUser } = useAuth();
  const [selectedContactId, setSelectedContactId] = useState<string | null>(
    initialContactId ?? null
  );
  const [messageText, setMessageText] = useState('');
  const [attachment, setAttachment] = useState<AttachmentState | null>(null);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);
  const [pendingContact, setPendingContact] = useState<SidebarContact | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // TaxBot-specific state
  const [taxbotConvId, setTaxbotConvId] = useState<string | null>(null);
  const [taxbotLoading, setTaxbotLoading] = useState(false);
  const [taxbotMessages, setTaxbotMessages] = useState<TaxbotMessage[]>([]);
  const [streamingContent, setStreamingContent] = useState('');
  const [isBotThinking, setIsBotThinking] = useState(false);

  const isBot = selectedContactId === TAXBOT_ID;
  const chatContactId = isBot ? undefined : (selectedContactId ?? undefined);

  const { messages, chats, sendMessage, markAsRead } = useChat(
    currentUser?.id,
    chatContactId
  );

  // When opening a chat with someone not yet in our chats list, fetch their info
  useEffect(() => {
    if (!initialContactId || initialContactId === TAXBOT_ID || !currentUser) return;
    const inChats = chats.some(c => c.otherUser.id === initialContactId);
    if (inChats) return;
    api.get<ApiResponse<User>>(`/users/${initialContactId}`).then(res => {
      const u = res.data;
      setPendingContact({
        id: u.id,
        fullName: u.fullName,
        profileImage: u.profileImage,
        role: u.role,
        unreadCount: 0,
        lastContent: null,
      });
    }).catch(() => {});
  }, [initialContactId, chats, currentUser]);

  // Sidebar contacts: TaxBot first, then contacts from chats API
  const sidebarContacts = useMemo((): SidebarContact[] => {
    const taxbot: SidebarContact = {
      id: TAXBOT_ID,
      fullName: 'TaxBot AI',
      profileImage: 'https://api.dicebear.com/7.x/bottts/svg?seed=taxbot',
      role: 'bot',
      isBot: true,
    };

    const chatContacts: SidebarContact[] = chats.map(c => ({
      id: c.otherUser.id,
      fullName: c.otherUser.fullName,
      profileImage: c.otherUser.profileImage,
      role: c.otherUser.role,
      unreadCount: c.unreadCount ?? 0,
      lastContent: c.lastContent ?? null,
    }));

    const allContacts =
      pendingContact && !chatContacts.some(c => c.id === pendingContact.id)
        ? [...chatContacts, pendingContact]
        : chatContacts;

    return [taxbot, ...allContacts];
  }, [chats, pendingContact]);

  const selectedContact = useMemo(
    () => sidebarContacts.find(c => c.id === selectedContactId),
    [sidebarContacts, selectedContactId]
  );

  // Load TaxBot conversation history when TaxBot is selected
  useEffect(() => {
    if (!isBot || !currentUser) return;

    const load = async () => {
      setTaxbotLoading(true);
      try {
        const listRes = await api.get<ApiResponse<TaxbotConversation[]>>('/taxbot/conversations');
        const existing = listRes.data[0];
        if (existing) {
          setTaxbotConvId(existing.id);
          const convRes = await api.get<ApiResponse<TaxbotConversation>>(
            `/taxbot/conversations/${existing.id}`
          );
          setTaxbotMessages(convRes.data.messages ?? []);
        } else {
          const newRes = await api.post<ApiResponse<TaxbotConversation>>(
            '/taxbot/conversations',
            { topic: 'General Tax Advice' }
          );
          setTaxbotConvId(newRes.data.id);
          setTaxbotMessages([]);
        }
      } catch {
        // fail silently — user can still type, send will be disabled
      } finally {
        setTaxbotLoading(false);
      }
    };

    void load();
  }, [isBot, currentUser]);

  // Mark incoming messages as read when thread opens
  useEffect(() => {
    if (isBot || !currentUser) return;
    const unread = messages.filter(m => !m.isRead && m.receiverId === currentUser.id);
    unread.forEach(m => void markAsRead(m.id));
  }, [isBot, messages, currentUser, markAsRead]);

  // Scroll to bottom on new content
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, taxbotMessages.length, streamingContent, isBotThinking]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAttachmentError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setAttachmentError('File must be under 5MB');
      return;
    }
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      setAttachmentError('Only PDF, images, Word, and Excel files are allowed');
      return;
    }

    const reader = new FileReader();
    reader.onload = ev => {
      setAttachment({ data: ev.target!.result as string, name: file.name, type: file.type });
    };
    reader.readAsDataURL(file);
    // Reset input so same file can be selected again
    e.target.value = '';
  };

  const sendBotMessage = useCallback(
    async (text: string) => {
      if (!taxbotConvId || !currentUser) return;

      const userMsg: TaxbotMessage = {
        id: `local-${Date.now()}`,
        conversationId: taxbotConvId,
        role: 'user',
        content: text,
        createdAt: new Date().toISOString(),
      };
      setTaxbotMessages(prev => [...prev, userMsg]);
      setIsBotThinking(true);
      setStreamingContent('');

      try {
        const response = await apiFetch<Response>(
          `/taxbot/conversations/${taxbotConvId}/messages`,
          { method: 'POST', body: JSON.stringify({ content: text }) }
        );

        const reader = response.body?.getReader();
        if (!reader) return;

        const decoder = new TextDecoder();
        let fullContent = '';

        // eslint-disable-next-line no-constant-condition
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          for (const line of chunk.split('\n')) {
            if (!line.startsWith('data: ')) continue;
            const jsonStr = line.slice(6).trim();
            if (!jsonStr) continue;
            try {
              const parsed = JSON.parse(jsonStr) as { token?: string; done?: boolean };
              if (parsed.done) break;
              if (parsed.token) {
                fullContent += parsed.token;
                setStreamingContent(fullContent);
              }
            } catch {
              // ignore malformed SSE frames
            }
          }
        }

        const assistantMsg: TaxbotMessage = {
          id: `ai-${Date.now()}`,
          conversationId: taxbotConvId,
          role: 'assistant',
          content: fullContent,
          createdAt: new Date().toISOString(),
        };
        setTaxbotMessages(prev => [...prev, assistantMsg]);
      } catch {
        // error is non-critical — the user's message is already shown
      } finally {
        setStreamingContent('');
        setIsBotThinking(false);
      }
    },
    [taxbotConvId, currentUser]
  );

  const handleSend = async () => {
    const text = messageText.trim();
    if (!text || !selectedContactId || !currentUser) return;

    setMessageText('');
    const currentAttachment = attachment;
    setAttachment(null);

    if (isBot) {
      await sendBotMessage(text);
    } else {
      await sendMessage(selectedContactId, text, currentAttachment ?? undefined);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  const isSendDisabled =
    !messageText.trim() ||
    isBotThinking ||
    (isBot && (taxbotLoading || !taxbotConvId));

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-72 bg-white border-r border-gray-200 flex flex-col shrink-0">
        <div className="p-4 border-b border-gray-200">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-3 text-sm font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Profiles
          </button>
          <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
        </div>

        <div className="flex-1 overflow-y-auto">
          {sidebarContacts.map(contact => {
            const isSelected = selectedContactId === contact.id;
            return (
              <button
                key={contact.id}
                onClick={() => setSelectedContactId(contact.id)}
                className={`w-full p-4 text-left border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                  isSelected ? 'bg-blue-50 border-l-4 border-l-blue-600' : 'border-l-4 border-l-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    <img
                      src={avatarSrc(contact.fullName, contact.profileImage)}
                      alt={contact.fullName}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                    {contact.isBot && (
                      <span className="absolute -bottom-0.5 -right-0.5 bg-green-500 rounded-full p-0.5">
                        <Bot className="h-3 w-3 text-white" />
                      </span>
                    )}
                    {(contact.unreadCount ?? 0) > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                        {(contact.unreadCount ?? 0) > 9 ? '9+' : contact.unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{contact.fullName}</p>
                    <p className="text-xs text-gray-500 truncate">
                      {contact.isBot ? 'AI tax advisor · Groq powered' : (contact.lastContent ?? 'Start a conversation')}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {selectedContact ? (
          <>
            {/* Header */}
            <div className="px-5 py-3 border-b border-gray-200 bg-white flex items-center gap-3 shadow-sm">
              <img
                src={avatarSrc(selectedContact.fullName, selectedContact.profileImage)}
                alt={selectedContact.fullName}
                className="h-9 w-9 rounded-full object-cover"
              />
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">{selectedContact.fullName}</h3>
                <p className="text-xs text-gray-500">
                  {selectedContact.isBot
                    ? 'Powered by Groq AI · llama-3.3-70b-versatile'
                    : selectedContact.role === 'ca'
                    ? 'Chartered Accountant'
                    : 'Client'}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {isBot ? (
                <>
                  {taxbotLoading && (
                    <div className="text-center text-gray-400 text-sm mt-8">Loading conversation...</div>
                  )}
                  {!taxbotLoading && taxbotMessages.length === 0 && !isBotThinking && (
                    <div className="text-center mt-12">
                      <Bot className="h-10 w-10 mx-auto text-blue-300 mb-3" />
                      <p className="text-gray-500 text-sm font-medium">Ask TaxBot anything about</p>
                      <p className="text-gray-400 text-sm">Indian income tax, GST, corporate law, or financial planning.</p>
                    </div>
                  )}
                  {taxbotMessages.map(msg => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[72%] px-4 py-2.5 rounded-2xl text-sm whitespace-pre-wrap leading-relaxed ${
                          msg.role === 'user'
                            ? 'bg-blue-600 text-white rounded-br-sm'
                            : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                        }`}
                      >
                        {msg.content}
                        <div className={`text-xs mt-1.5 ${msg.role === 'user' ? 'text-blue-200' : 'text-gray-400'}`}>
                          {formatTime(msg.createdAt)}
                        </div>
                      </div>
                    </div>
                  ))}
                  {streamingContent && (
                    <div className="flex justify-start">
                      <div className="max-w-[72%] px-4 py-2.5 rounded-2xl rounded-bl-sm text-sm bg-gray-100 text-gray-900 whitespace-pre-wrap leading-relaxed">
                        {streamingContent}
                        <span className="inline-block w-0.5 h-4 bg-gray-500 ml-0.5 animate-pulse align-middle" />
                      </div>
                    </div>
                  )}
                  {isBotThinking && !streamingContent && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-sm">
                        <span className="flex gap-1.5 items-center">
                          {[0, 0.15, 0.3].map(delay => (
                            <span
                              key={delay}
                              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                              style={{ animationDelay: `${delay}s` }}
                            />
                          ))}
                        </span>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {messages.length === 0 && (
                    <div className="text-center text-gray-400 text-sm mt-12">
                      No messages yet. Say hello!
                    </div>
                  )}
                  {messages.map(msg => {
                    const isOwn = msg.senderId === currentUser?.id;
                    return (
                      <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${
                            isOwn
                              ? 'bg-blue-600 text-white rounded-br-sm'
                              : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                          }`}
                        >
                          <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                          {msg.attachmentName && (
                            <div
                              className={`mt-2 text-xs flex items-center gap-1 ${
                                isOwn ? 'text-blue-200' : 'text-gray-500'
                              }`}
                            >
                              <Paperclip className="h-3 w-3 shrink-0" />
                              <span className="truncate">{msg.attachmentName}</span>
                            </div>
                          )}
                          <div className={`text-xs mt-1.5 ${isOwn ? 'text-blue-200' : 'text-gray-400'}`}>
                            {formatTime(msg.createdAt)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Attachment preview bar */}
            {attachment && (
              <div className="px-4 py-2 bg-blue-50 border-t border-blue-100 flex items-center gap-2 text-sm text-blue-800">
                <Paperclip className="h-4 w-4 shrink-0" />
                <span className="truncate flex-1">{attachment.name}</span>
                <button
                  onClick={() => setAttachment(null)}
                  className="shrink-0 hover:text-red-500 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            {attachmentError && (
              <div className="px-4 py-2 bg-red-50 text-red-600 text-xs border-t border-red-100">
                {attachmentError}
              </div>
            )}

            {/* Input bar */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex items-center gap-2">
                {!isBot && (
                  <>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.docx,.xlsx"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <button
                      onClick={() => {
                        setAttachmentError(null);
                        fileInputRef.current?.click();
                      }}
                      title="Attach file"
                      className="text-gray-400 hover:text-blue-600 transition-colors p-1 shrink-0"
                    >
                      <Paperclip className="h-5 w-5" />
                    </button>
                  </>
                )}
                <input
                  type="text"
                  value={messageText}
                  onChange={e => setMessageText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    isBot
                      ? 'Ask about Indian taxes, GST, or financial planning...'
                      : `Message ${selectedContact.fullName}...`
                  }
                  disabled={isBotThinking || taxbotLoading}
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
                />
                <button
                  onClick={() => void handleSend()}
                  disabled={isSendDisabled}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-colors shrink-0"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <Bot className="h-12 w-12 mx-auto mb-3 text-gray-200" />
              <p className="text-base font-medium">Select a contact to start messaging</p>
              <p className="text-sm mt-1">Choose TaxBot or a user from the left panel</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
