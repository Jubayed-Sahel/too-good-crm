/**
 * Activity Types
 * Matches backend API Activity model
 */

export type ActivityType = 'call' | 'email' | 'telegram' | 'meeting' | 'note' | 'task';
export type ActivityStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Activity {
  id: number;
  organization: number;
  activity_type: ActivityType;
  activity_type_display?: string;
  title: string;
  description?: string;
  customer?: number | null;
  customer_name?: string;
  lead?: number | null;
  lead_name?: string;
  deal?: number | null;
  deal_name?: string;
  assigned_to?: number | null;
  assigned_to_name?: string;
  status: ActivityStatus;
  status_display?: string;
  scheduled_at?: string | null;
  completed_at?: string | null;
  duration_minutes?: number | null;
  
  // Call fields
  phone_number?: string;
  call_duration?: number | null;
  call_recording_url?: string;
  
  // Email fields
  email_subject?: string;
  email_body?: string;
  email_attachments?: string[];
  
  // Telegram fields
  telegram_username?: string;
  telegram_chat_id?: string;
  
  // Meeting fields
  meeting_location?: string;
  meeting_url?: string;
  attendees?: string[];
  
  // Task fields
  task_priority?: TaskPriority;
  task_due_date?: string | null;
  
  // Note fields
  is_pinned?: boolean;
  
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface CreateActivityData {
  activity_type: ActivityType;
  title: string;
  description?: string;
  customer?: number | null;
  customer_name?: string;
  lead?: number | null;
  deal?: number | null;
  assigned_to?: number | null;
  status: ActivityStatus;
  scheduled_at?: string | null;
  duration_minutes?: number | null;
  phone_number?: string;
  call_duration?: number | null;
  call_recording_url?: string;
  email_subject?: string;
  email_body?: string;
  email_attachments?: string[];
  telegram_username?: string;
  telegram_chat_id?: string;
  meeting_location?: string;
  meeting_url?: string;
  attendees?: string[];
  task_priority?: TaskPriority;
  task_due_date?: string | null;
  is_pinned?: boolean;
}

export interface UpdateActivityData extends Partial<CreateActivityData> {
  completed_at?: string | null;
}

export interface ActivityStats {
  total: number;
  by_status: Record<ActivityStatus, number>;
  by_type: Record<ActivityType, number>;
}

export interface ActivityFilters {
  customer?: number;
  lead?: number;
  deal?: number;
  activity_type?: ActivityType;
  status?: ActivityStatus;
  assigned_to?: number;
  search?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
}
