/**
 * Centralized type definitions for the application
 */

// User types (Legacy - to be replaced)
export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  profile?: LegacyUserProfile;
  date_joined?: string;
}

export interface LegacyUserProfile {
  phone: string;
  avatar: string | null;
  job_title: string;
  department: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  message: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  password2: string;
  first_name: string;
  last_name: string;
}

// Customer types
export interface Customer {
  id: number;
  full_name: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  company?: string;
  job_title?: string;
  status: CustomerStatus;
  assigned_to?: number | null;
  assigned_to_name?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  notes?: string;
  website?: string;
  created_at: string;
  updated_at: string;
  created_by?: number | null;
  created_by_name?: string;
  customer_notes?: CustomerNote[];
  deals?: Deal[];
  activities?: Activity[];
  tags?: Tag[];
}

export interface CustomerNote {
  id: number;
  customer: number;
  user: number;
  user_name: string;
  note: string;
  created_at: string;
}

export type CustomerStatus = 'active' | 'pending'  | 'inactive' 
// Deal types
export interface Deal {
  id: number;
  title: string;
  customer: number;
  customer_name: string;
  value: string | number;
  stage: DealStage;
  probability: number;
  expected_close_date?: string | null;
  actual_close_date?: string | null;
  assigned_to?: number | null | User;
  assigned_to_name?: string;
  description?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  created_by?: number | null;
  created_by_name?: string;
  is_closed?: boolean;
  is_won?: boolean;
  is_lost?: boolean;
}

export type DealStage = 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost';

// Activity types
export interface Activity {
  id: number;
  customer: number;
  deal?: number;
  activity_type: 'call' | 'email' | 'meeting' | 'note' | 'task';
  subject: string;
  description: string;
  scheduled_at?: string;
  completed_at?: string;
  is_completed: boolean;
  created_by?: User;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: number;
  name: string;
  color: string;
}

// Analytics types
export interface DashboardStats {
  customers: CustomerStats;
  deals: DealStats;
  user_stats: UserStats;
}

export interface CustomerStats {
  total: number;
  new_this_month: number;
  by_status: Record<string, number>;
}

export interface DealStats {
  total: number;
  open: number;
  won: number;
  total_won_value: number;
  pipeline_value: number;
  win_rate: number;
}

export interface UserStats {
  my_customers: number;
  my_deals: number;
}

export interface Statistics {
  total_customers: number;
  by_status: { status: string; count: number }[];
  total_deals: number;
  total_revenue: number;
}

// API types
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ApiError {
  detail?: string;
  message?: string;
  [key: string]: any;
}

// Export Phase 1 types
export * from './organization.types';
export * from './rbac.types';
export * from './user.types';

// Export Phase 2 types
export * from './lead.types';
