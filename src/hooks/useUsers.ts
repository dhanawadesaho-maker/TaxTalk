import { useState, useEffect } from 'react';
import { User } from '../types';

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    // Initialize with some mock data if none exists
    const savedUsers = localStorage.getItem('users');
    if (!savedUsers || JSON.parse(savedUsers).length === 0) {
      const mockUsers: (User & { password: string })[] = [
        {
          id: '1',
          name: 'Rajesh Kumar',
          email: 'rajesh.kumar@ca.com',
          password: 'ca123456',
          phone: '+91 98765 43210',
          profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rajesh',
          userType: 'ca',
          workExperience: 8,
          specialization: ['GST', 'Income Tax', 'Corporate Law'],
          rating: 4.8,
          caNumber: 'CA123456',
          isVerified: true,
        },
        {
          id: '2',
          name: 'Priya Sharma',
          email: 'priya.sharma@ca.com',
          password: 'ca789012',
          phone: '+91 98765 43211',
          profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
          userType: 'ca',
          workExperience: 12,
          specialization: ['Auditing', 'Taxation', 'Financial Planning'],
          rating: 4.9,
          caNumber: 'CA789012',
          isVerified: true,
        },
        {
          id: '3',
          name: 'Amit Patel',
          email: 'amit.patel@email.com',
          password: 'user123456',
          phone: '+91 98765 43212',
          profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Amit',
          userType: 'user',
        },
        {
          id: '4',
          name: 'Sneha Gupta',
          email: 'sneha.gupta@ca.com',
          password: 'ca345678',
          phone: '+91 98765 43213',
          profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sneha',
          userType: 'ca',
          workExperience: 6,
          specialization: ['GST', 'TDS', 'Company Law'],
          rating: 4.7,
          caNumber: 'CA345678',
          isVerified: true,
        },
        {
          id: '5',
          name: 'Vikash Singh',
          email: 'vikash.singh@email.com',
          password: 'user789012',
          phone: '+91 98765 43214',
          profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Vikash',
          userType: 'user',
        },
      ];
      
      console.log('Initializing users with passwords:', mockUsers.map(u => ({ email: u.email, password: u.password })));
      localStorage.setItem('users', JSON.stringify(mockUsers));
      setUsers(mockUsers.map(({ password, ...user }) => user));
    } else {
      const parsedUsers = JSON.parse(savedUsers);
      setUsers(parsedUsers.map((user: any) => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      }));
    }
  }, []);

  return { users };
}