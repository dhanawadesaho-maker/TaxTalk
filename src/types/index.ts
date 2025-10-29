export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  profileImage: string;
  userType: 'ca' | 'user';
  // CA-specific fields
  workExperience?: number;
  specialization?: string[];
  rating?: number;
  caNumber?: string;
  isVerified?: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  read: boolean;
}

export interface Chat {
  id: string;
  participants: string[];
  lastMessage?: Message;
  lastActivity: Date;
}