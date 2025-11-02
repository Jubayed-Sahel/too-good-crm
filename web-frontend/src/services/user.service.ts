/**
 * User Profile and Settings Service with Mock Data
 */

import type {
  UserProfile,
  UserSettings,
  Session,
  UpdateProfileData,
  ChangePasswordData,
  UpdateSettingsData,
} from '@/types';

// Mock user profile
const mockUserProfile: UserProfile = {
  id: '1',
  username: 'johndoe',
  email: 'john.doe@acmecorp.com',
  firstName: 'John',
  lastName: 'Doe',
  fullName: 'John Doe',
  phone: '+1 (555) 123-4567',
  avatar: 'https://i.pravatar.cc/150?img=12',
  title: 'Sales Manager',
  department: 'Sales',
  bio: 'Experienced sales professional with 10+ years in B2B SaaS.',
  location: 'New York, NY',
  timezone: 'America/New_York',
  language: 'en',
  isActive: true,
  isEmailVerified: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-03-15T10:30:00Z',
  lastLoginAt: '2024-03-20T09:15:00Z',
};

// Mock user settings
const mockUserSettings: UserSettings = {
  notifications: {
    email: {
      enabled: true,
      dealUpdates: true,
      leadAssignments: true,
      taskReminders: true,
      weeklyReports: true,
    },
    push: {
      enabled: true,
      dealUpdates: true,
      leadAssignments: true,
      taskReminders: true,
    },
    inApp: {
      enabled: true,
      dealUpdates: true,
      leadAssignments: true,
      taskReminders: true,
    },
  },
  preferences: {
    theme: 'light',
    language: 'en',
    timezone: 'America/New_York',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    currency: 'USD',
  },
  privacy: {
    profileVisibility: 'organization',
    showEmail: true,
    showPhone: false,
  },
};

// Mock sessions
const mockSessions: Session[] = [
  {
    id: '1',
    userId: '1',
    deviceName: 'Windows Desktop',
    deviceType: 'desktop',
    browser: 'Chrome 122',
    ipAddress: '192.168.1.100',
    location: 'New York, USA',
    isCurrent: true,
    lastActiveAt: new Date().toISOString(),
    createdAt: '2024-03-20T09:15:00Z',
  },
  {
    id: '2',
    userId: '1',
    deviceName: 'iPhone 15 Pro',
    deviceType: 'mobile',
    browser: 'Safari 17',
    ipAddress: '192.168.1.101',
    location: 'New York, USA',
    isCurrent: false,
    lastActiveAt: '2024-03-19T18:30:00Z',
    createdAt: '2024-03-15T08:00:00Z',
  },
  {
    id: '3',
    userId: '1',
    deviceName: 'Office Desktop',
    deviceType: 'desktop',
    browser: 'Edge 122',
    ipAddress: '10.0.0.5',
    location: 'Office - New York',
    isCurrent: false,
    lastActiveAt: '2024-03-18T17:45:00Z',
    createdAt: '2024-03-10T09:00:00Z',
  },
];

// Simulated delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

class UserService {
  /**
   * Get user profile
   */
  async getUserProfile(userId: string): Promise<UserProfile> {
    await delay(400);
    if (userId !== mockUserProfile.id) {
      throw new Error('User not found');
    }
    return mockUserProfile;
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, data: UpdateProfileData): Promise<UserProfile> {
    await delay(600);
    
    if (userId !== mockUserProfile.id) {
      throw new Error('User not found');
    }

    Object.assign(mockUserProfile, {
      ...data,
      updatedAt: new Date().toISOString(),
    });

    return mockUserProfile;
  }

  /**
   * Upload profile avatar
   */
  async uploadAvatar(userId: string, file: File): Promise<string> {
    await delay(1000);
    
    if (userId !== mockUserProfile.id) {
      throw new Error('User not found');
    }

    // Simulate avatar upload - in real app, would upload to storage service
    const avatarUrl = URL.createObjectURL(file);
    mockUserProfile.avatar = avatarUrl;
    mockUserProfile.updatedAt = new Date().toISOString();

    return avatarUrl;
  }

  /**
   * Change password
   */
  async changePassword(_userId: string, data: ChangePasswordData): Promise<void> {
    await delay(800);
    
    // Simulate password validation
    if (data.currentPassword !== 'password123') {
      throw new Error('Current password is incorrect');
    }

    if (data.newPassword.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }

    // In real app, would hash and save new password
    console.log('Password changed successfully');
  }

  /**
   * Get user settings
   */
  async getUserSettings(userId: string): Promise<UserSettings> {
    await delay(300);
    
    if (userId !== mockUserProfile.id) {
      throw new Error('User not found');
    }

    return mockUserSettings;
  }

  /**
   * Update user settings
   */
  async updateSettings(userId: string, data: UpdateSettingsData): Promise<UserSettings> {
    await delay(500);
    
    if (userId !== mockUserProfile.id) {
      throw new Error('User not found');
    }

    // Deep merge settings
    if (data.notifications) {
      Object.assign(mockUserSettings.notifications, {
        email: { ...mockUserSettings.notifications.email, ...data.notifications.email },
        push: { ...mockUserSettings.notifications.push, ...data.notifications.push },
        inApp: { ...mockUserSettings.notifications.inApp, ...data.notifications.inApp },
      });
    }

    if (data.preferences) {
      Object.assign(mockUserSettings.preferences, data.preferences);
    }

    if (data.privacy) {
      Object.assign(mockUserSettings.privacy, data.privacy);
    }

    return mockUserSettings;
  }

  /**
   * Get active sessions
   */
  async getSessions(userId: string): Promise<Session[]> {
    await delay(400);
    
    if (userId !== mockUserProfile.id) {
      throw new Error('User not found');
    }

    return mockSessions;
  }

  /**
   * Revoke session
   */
  async revokeSession(userId: string, sessionId: string): Promise<void> {
    await delay(500);
    
    if (userId !== mockUserProfile.id) {
      throw new Error('User not found');
    }

    const index = mockSessions.findIndex(s => s.id === sessionId);
    if (index === -1) {
      throw new Error('Session not found');
    }

    if (mockSessions[index].isCurrent) {
      throw new Error('Cannot revoke current session');
    }

    mockSessions.splice(index, 1);
  }

  /**
   * Revoke all sessions except current
   */
  async revokeAllSessions(userId: string): Promise<void> {
    await delay(600);
    
    if (userId !== mockUserProfile.id) {
      throw new Error('User not found');
    }

    const currentSessionIndex = mockSessions.findIndex(s => s.isCurrent);
    if (currentSessionIndex !== -1) {
      const currentSession = mockSessions[currentSessionIndex];
      mockSessions.length = 0;
      mockSessions.push(currentSession);
    }
  }

  /**
   * Get current user (helper method)
   */
  async getCurrentUser(): Promise<UserProfile> {
    return this.getUserProfile('1');
  }

  /**
   * Get current user settings (helper method)
   */
  async getCurrentUserSettings(): Promise<UserSettings> {
    return this.getUserSettings('1');
  }
}

export const userService = new UserService();
