/**
 * Activity Service with Mock Data
 */

import type {
  Activity,
  CreateActivityData,
  ActivityFilters,
  ActivityStats,
  ActivityStatus,
} from '@/types/activity.types';

// Mock activities data
const mockActivities: Activity[] = [
  {
    id: '1',
    type: 'call',
    title: 'Follow-up call with Sarah Johnson',
    description: 'Discuss enterprise CRM implementation timeline',
    customerName: 'Sarah Johnson',
    customerId: '1',
    status: 'completed',
    duration: 25,
    phoneNumber: '+1 (555) 234-5678',
    completedAt: '2024-03-20T14:30:00Z',
    createdAt: '2024-03-20T14:00:00Z',
    createdBy: 'John Doe',
    notes: 'Customer confirmed budget approval. Next steps: Send proposal.',
  },
  {
    id: '2',
    type: 'email',
    title: 'Proposal sent to Michael Chen',
    description: 'Enterprise package proposal with custom pricing',
    customerName: 'Michael Chen',
    customerId: '2',
    status: 'completed',
    emailSubject: 'Your Custom CRM Proposal - StartupXYZ',
    emailBody: 'Dear Michael, Please find attached our custom proposal...',
    completedAt: '2024-03-21T10:15:00Z',
    createdAt: '2024-03-21T10:00:00Z',
    createdBy: 'John Doe',
  },
  {
    id: '3',
    type: 'telegram',
    title: 'Quick update to Emily Rodriguez',
    description: 'Sent demo link and setup instructions',
    customerName: 'Emily Rodriguez',
    customerId: '3',
    status: 'completed',
    telegramUsername: '@emily_marketing',
    completedAt: '2024-03-21T15:45:00Z',
    createdAt: '2024-03-21T15:40:00Z',
    createdBy: 'Jane Smith',
  },
  {
    id: '4',
    type: 'call',
    title: 'Discovery call with David Williams',
    description: 'Understand requirements and pain points',
    customerName: 'David Williams',
    customerId: '4',
    status: 'scheduled',
    duration: 30,
    phoneNumber: '+1 (555) 567-8901',
    scheduledAt: '2024-03-25T11:00:00Z',
    createdAt: '2024-03-22T09:00:00Z',
    createdBy: 'John Doe',
  },
  {
    id: '5',
    type: 'email',
    title: 'Contract documents to Lisa Thompson',
    description: 'Final contract and terms of service',
    customerName: 'Lisa Thompson',
    customerId: '5',
    status: 'pending',
    emailSubject: 'Contract Documents - HealthTech Solutions',
    scheduledAt: '2024-03-23T09:00:00Z',
    createdAt: '2024-03-22T16:00:00Z',
    createdBy: 'John Doe',
  },
  {
    id: '6',
    type: 'meeting',
    title: 'Product demo with Acme Corp',
    description: 'Live demonstration of CRM features',
    customerName: 'Acme Corporation',
    customerId: '6',
    status: 'scheduled',
    duration: 60,
    scheduledAt: '2024-03-24T14:00:00Z',
    createdAt: '2024-03-20T11:00:00Z',
    createdBy: 'Jane Smith',
  },
  {
    id: '7',
    type: 'telegram',
    title: 'Urgent support message',
    description: 'Technical issue resolution',
    customerName: 'TechStart Inc',
    customerId: '7',
    status: 'failed',
    telegramUsername: '@techstart_support',
    createdAt: '2024-03-22T18:00:00Z',
    createdBy: 'Support Team',
    notes: 'Message failed to deliver. Customer unreachable on Telegram.',
  },
  {
    id: '8',
    type: 'call',
    title: 'Check-in call with existing client',
    description: 'Monthly satisfaction survey',
    customerName: 'Global Enterprises',
    customerId: '8',
    status: 'completed',
    duration: 15,
    phoneNumber: '+1 (555) 789-0123',
    completedAt: '2024-03-19T16:00:00Z',
    createdAt: '2024-03-19T15:45:00Z',
    createdBy: 'Jane Smith',
    notes: 'Customer very satisfied. Interested in additional modules.',
  },
  {
    id: '9',
    type: 'email',
    title: 'Welcome email to new customer',
    description: 'Onboarding information and resources',
    customerName: 'Innovation Labs',
    customerId: '9',
    status: 'completed',
    emailSubject: 'Welcome to Our CRM Platform!',
    emailBody: 'Welcome! We are excited to have you on board...',
    completedAt: '2024-03-18T10:00:00Z',
    createdAt: '2024-03-18T09:30:00Z',
    createdBy: 'System',
  },
  {
    id: '10',
    type: 'task',
    title: 'Prepare Q1 report',
    description: 'Compile quarterly sales and activity metrics',
    customerName: 'Internal',
    customerId: '0',
    status: 'pending',
    scheduledAt: '2024-03-31T17:00:00Z',
    createdAt: '2024-03-15T12:00:00Z',
    createdBy: 'John Doe',
  },
];

// In-memory storage
let activities: Activity[] = [...mockActivities];
let nextId = 11;

// Simulated API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Get all activities with optional filters
 */
export const getActivities = async (filters?: ActivityFilters): Promise<Activity[]> => {
  await delay(300);
  
  let filtered = [...activities];

  if (filters?.type && filters.type !== 'all') {
    filtered = filtered.filter(a => a.type === filters.type);
  }

  if (filters?.status && filters.status !== 'all') {
    filtered = filtered.filter(a => a.status === filters.status);
  }

  if (filters?.searchQuery) {
    const query = filters.searchQuery.toLowerCase();
    filtered = filtered.filter(a =>
      a.title.toLowerCase().includes(query) ||
      a.description.toLowerCase().includes(query) ||
      a.customerName.toLowerCase().includes(query)
    );
  }

  if (filters?.dateFrom) {
    filtered = filtered.filter(a => new Date(a.createdAt) >= new Date(filters.dateFrom!));
  }

  if (filters?.dateTo) {
    filtered = filtered.filter(a => new Date(a.createdAt) <= new Date(filters.dateTo!));
  }

  // Sort by creation date, newest first
  return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

/**
 * Get a single activity by ID
 */
export const getActivity = async (id: string): Promise<Activity | undefined> => {
  await delay(200);
  return activities.find(activity => activity.id === id);
};

/**
 * Create a new activity
 */
export const createActivity = async (input: CreateActivityData): Promise<Activity> => {
  await delay(500);
  
  const newActivity: Activity = {
    id: (nextId++).toString(),
    type: input.type,
    title: input.title,
    description: input.description,
    customerName: input.customerName,
    customerId: input.customerId,
    status: input.scheduledAt ? 'scheduled' : 'pending',
    duration: input.duration,
    scheduledAt: input.scheduledAt,
    createdAt: new Date().toISOString(),
    createdBy: 'Current User',
    notes: input.notes,
    emailSubject: input.emailSubject,
    emailBody: input.emailBody,
    phoneNumber: input.phoneNumber,
    telegramUsername: input.telegramUsername,
  };
  
  activities.unshift(newActivity);
  return newActivity;
};

/**
 * Update activity status
 */
export const updateActivityStatus = async (id: string, status: ActivityStatus): Promise<Activity | null> => {
  await delay(300);
  
  const index = activities.findIndex(a => a.id === id);
  if (index === -1) return null;

  activities[index] = {
    ...activities[index],
    status,
    completedAt: status === 'completed' ? new Date().toISOString() : activities[index].completedAt,
  };

  return activities[index];
};

/**
 * Delete an activity
 */
export const deleteActivity = async (id: string): Promise<boolean> => {
  await delay(300);
  
  const index = activities.findIndex(a => a.id === id);
  if (index === -1) return false;

  activities.splice(index, 1);
  return true;
};

/**
 * Get activity statistics
 */
export const getActivityStats = async (): Promise<ActivityStats> => {
  await delay(200);
  
  return {
    totalActivities: activities.length,
    completedActivities: activities.filter(a => a.status === 'completed').length,
    pendingActivities: activities.filter(a => a.status === 'pending').length,
    scheduledActivities: activities.filter(a => a.status === 'scheduled').length,
    callsCount: activities.filter(a => a.type === 'call').length,
    emailsCount: activities.filter(a => a.type === 'email').length,
    telegramCount: activities.filter(a => a.type === 'telegram').length,
  };
};

/**
 * Send email (simulated)
 */
export const sendEmail = async (data: {
  customerId: string;
  customerName: string;
  subject: string;
  body: string;
}): Promise<Activity> => {
  return createActivity({
    type: 'email',
    title: `Email to ${data.customerName}`,
    description: data.subject,
    customerId: data.customerId,
    customerName: data.customerName,
    emailSubject: data.subject,
    emailBody: data.body,
  });
};

/**
 * Make call (simulated)
 */
export const makeCall = async (data: {
  customerId: string;
  customerName: string;
  phoneNumber: string;
  notes?: string;
}): Promise<Activity> => {
  return createActivity({
    type: 'call',
    title: `Call to ${data.customerName}`,
    description: `Phone call to ${data.phoneNumber}`,
    customerId: data.customerId,
    customerName: data.customerName,
    phoneNumber: data.phoneNumber,
    notes: data.notes,
  });
};

/**
 * Send Telegram message (simulated)
 */
export const sendTelegramMessage = async (data: {
  customerId: string;
  customerName: string;
  username: string;
  message: string;
}): Promise<Activity> => {
  return createActivity({
    type: 'telegram',
    title: `Telegram to ${data.customerName}`,
    description: data.message.substring(0, 100),
    customerId: data.customerId,
    customerName: data.customerName,
    telegramUsername: data.username,
    notes: data.message,
  });
};
