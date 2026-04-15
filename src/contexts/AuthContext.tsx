import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, ApiResponse } from '../types';
import { api } from '../services/api';

const TOKEN_KEY = 'taxtalk_token';

interface SignupData {
  name: string;
  email: string;
  phone?: string;
  password: string;
  userType: 'user' | 'ca';
  workExperience?: number;
  specialization?: string[];
  caNumber?: string;
}

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<User>;
  signup: (userData: SignupData & { [key: string]: unknown }) => Promise<User>;
  logout: () => void;
  updateCurrentUser: (user: User) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setIsLoading(false);
      return;
    }

    api
      .get<ApiResponse<User>>('/auth/me')
      .then(res => {
        if (res.success) setCurrentUser(res.data);
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const res = await api.post<ApiResponse<{ token: string; user: User }>>(
      '/auth/login',
      { email, password },
      { skipAuth: true }
    );
    localStorage.setItem(TOKEN_KEY, res.data.token);
    setCurrentUser(res.data.user);
    return res.data.user;
  };

  const signup = async (userData: SignupData & { [key: string]: unknown }): Promise<User> => {
    const role = userData.userType === 'ca' ? 'ca' : 'client';
    const payload = {
      email: userData.email,
      password: userData.password,
      fullName: userData.name,
      phone: userData.phone,
      role,
      caNumber: userData.caNumber,
      workExperience: userData.workExperience,
      specializations: userData.specialization,
    };

    const res = await api.post<ApiResponse<{ token: string; user: User }>>(
      '/auth/signup',
      payload,
      { skipAuth: true }
    );
    localStorage.setItem(TOKEN_KEY, res.data.token);
    setCurrentUser(res.data.user);
    return res.data.user;
  };

  const logout = () => {
    api.post('/auth/logout', {}).catch(() => null);
    localStorage.removeItem(TOKEN_KEY);
    setCurrentUser(null);
  };

  const updateCurrentUser = (user: User) => {
    setCurrentUser(user);
  };

  const value: AuthContextType = {
    currentUser,
    login,
    signup,
    logout,
    updateCurrentUser,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
