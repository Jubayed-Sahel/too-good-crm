/**
 * User Profile and Settings Types
 */

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  avatar?: string;
  phone?: string;
  title?: string;
  department?: string;
  bio?: string;
  location?: string;
  timezone?: string;
  language?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserSettings {
  notifications: {
    email: {
      enabled: boolean;
      dealUpdates: boolean;
      leadAssignments: boolean;
      taskReminders: boolean;
      weeklyReports: boolean;
    };
    push: {
      enabled: boolean;
      dealUpdates: boolean;
      leadAssignments: boolean;
      taskReminders: boolean;
    };
    inApp: {
      enabled: boolean;
      dealUpdates: boolean;
      leadAssignments: boolean;
      taskReminders: boolean;
    };
  };
  preferences: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    timezone: string;
    dateFormat: string;
    timeFormat: '12h' | '24h';
    currency: string;
  };
  privacy: {
    profileVisibility: 'public' | 'organization' | 'private';
    showEmail: boolean;
    showPhone: boolean;
  };
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  title?: string;
  department?: string;
  bio?: string;
  location?: string;
  timezone?: string;
  language?: string;
}

export interface ChangePasswordData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface UpdateSettingsData {
  notifications?: Partial<UserSettings['notifications']>;
  preferences?: Partial<UserSettings['preferences']>;
  privacy?: Partial<UserSettings['privacy']>;
}

export interface Session {
  id: string;
  userId: string;
  deviceName: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  ipAddress: string;
  location?: string;
  isCurrent: boolean;
  lastActiveAt: string;
  createdAt: string;
}
