/**
 * Notification Preferences Service
 * Handles notification settings API calls
 */
import api from '@/lib/apiClient';

export interface NotificationPreferences {
  id: number;
  user: number;
  organization?: number;
  
  // Email notifications
  email_new_lead: boolean;
  email_new_deal: boolean;
  email_deal_won: boolean;
  email_deal_lost: boolean;
  email_team_activity: boolean;
  email_weekly_summary: boolean;
  email_monthly_report: boolean;
  email_system_updates: boolean;
  
  // Push notifications
  push_new_lead: boolean;
  push_new_deal: boolean;
  push_deal_won: boolean;
  push_deal_lost: boolean;
  push_team_activity: boolean;
  push_mentions: boolean;
  push_tasks_due: boolean;
  
  // Frequency settings
  digest_frequency: 'instant' | 'daily' | 'weekly' | 'never';
  quiet_hours_start?: string;
  quiet_hours_end?: string;
  
  created_at: string;
  updated_at: string;
}

export interface UpdateNotificationPreferencesData {
  email_new_lead?: boolean;
  email_new_deal?: boolean;
  email_deal_won?: boolean;
  email_deal_lost?: boolean;
  email_team_activity?: boolean;
  email_weekly_summary?: boolean;
  email_monthly_report?: boolean;
  email_system_updates?: boolean;
  
  push_new_lead?: boolean;
  push_new_deal?: boolean;
  push_deal_won?: boolean;
  push_deal_lost?: boolean;
  push_team_activity?: boolean;
  push_mentions?: boolean;
  push_tasks_due?: boolean;
  
  digest_frequency?: 'instant' | 'daily' | 'weekly' | 'never';
  quiet_hours_start?: string;
  quiet_hours_end?: string;
}

class NotificationPreferencesService {
  private readonly baseUrl = '/notification-preferences';

  /**
   * Get current user's notification preferences
   */
  async getPreferences(): Promise<NotificationPreferences> {
    return api.get<NotificationPreferences>(`${this.baseUrl}/me/`);
  }

  /**
   * Update notification preferences
   */
  async updatePreferences(data: UpdateNotificationPreferencesData): Promise<NotificationPreferences> {
    return api.patch<NotificationPreferences>(`${this.baseUrl}/me/`, data);
  }

  /**
   * Reset to default preferences
   */
  async resetToDefaults(): Promise<NotificationPreferences> {
    return api.post<NotificationPreferences>(`${this.baseUrl}/reset_defaults/`);
  }

  /**
   * Test email notification
   */
  async sendTestEmail(): Promise<{ message: string }> {
    return api.post<{ message: string }>(`${this.baseUrl}/test_email/`);
  }

  /**
   * Test push notification
   */
  async sendTestPush(): Promise<{ message: string }> {
    return api.post<{ message: string }>(`${this.baseUrl}/test_push/`);
  }
}

export const notificationPreferencesService = new NotificationPreferencesService();
export default notificationPreferencesService;
