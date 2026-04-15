export interface User {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  role: 'client' | 'ca';
  bio: string | null;
  profileImage: string | null;
  hourlyRate: number | null;
  caNumber: string | null;
  workExperience: number | null;
  isVerified: boolean;
  createdAt: string;
  specializations: string[];
  avgRating?: number | null;
  ratingCount?: number;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  attachmentData: string | null;
  attachmentName: string | null;
  attachmentType: string | null;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

export interface Chat {
  id: string;
  otherUser: {
    id: string;
    fullName: string;
    profileImage: string | null;
    role: string;
  };
  lastMessageAt: string | null;
  lastContent: string | null;
  unreadCount: number;
}

export interface Appointment {
  id: string;
  clientId: string;
  caId: string;
  scheduledTime: string;
  durationMinutes: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  meetingNotes: string | null;
  createdAt: string;
  updatedAt: string;
  clientName?: string;
  caName?: string;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  body: string | null;
  relatedId: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface Document {
  id: string;
  ownerId: string;
  filename: string;
  fileType: string | null;
  fileSize: number | null;
  category: string | null;
  description: string | null;
  createdAt: string;
  ownerName?: string;
}

export interface Review {
  id: string;
  reviewerId: string;
  caId: string;
  rating: number;
  reviewText: string | null;
  createdAt: string;
  reviewerName?: string;
  reviewerImage?: string | null;
}

export interface TaxbotConversation {
  id: string;
  userId: string;
  topic: string;
  createdAt: string;
  messages?: TaxbotMessage[];
}

export interface TaxbotMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface AvailabilitySlot {
  id: number;
  caId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  meta?: {
    total: number;
    page: number;
    limit: number;
    unreadCount?: number;
  };
}
