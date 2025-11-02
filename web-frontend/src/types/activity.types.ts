/**
 * Activity types and interfaces
 */

export type ActivityType = 'call' | 'email' | 'telegram' | 'meeting' | 'note' | 'task';
export type ActivityStatus = 'completed' | 'pending' | 'scheduled' | 'failed' | 'cancelled';

export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  customerName: string;
  customerId: string;
  status: ActivityStatus;
  duration?: number; // in minutes
  scheduledAt?: string;
  completedAt?: string;
  createdAt: string;
  createdBy: string;
  notes?: string;
  emailSubject?: string;
  emailBody?: string;
  phoneNumber?: string;
  telegramUsername?: string;
}

export interface CreateActivityData {
  type: ActivityType;
  title: string;
  description: string;
  customerId: string;
  customerName: string;
  scheduledAt?: string;
  duration?: number;
  notes?: string;
  emailSubject?: string;
  emailBody?: string;
  phoneNumber?: string;
  telegramUsername?: string;
}

export interface ActivityFilters {
  type?: ActivityType | 'all';
  status?: ActivityStatus | 'all';
  dateFrom?: string;
  dateTo?: string;
  searchQuery?: string;
}

export interface ActivityStats {
  totalActivities: number;
  completedActivities: number;
  pendingActivities: number;
  scheduledActivities: number;
  callsCount: number;
  emailsCount: number;
  telegramCount: number;
}
