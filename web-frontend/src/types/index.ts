/**
 * Centralized type definitions for the application
 */

// Export new types modules
export * from './analytics.types';
export * from './issue.types';
export * from './order.types';
export * from './payment.types';

// Export activity types first (used by Customer interface below)
export * from './activity.types';
export * from './auth.types';  // This exports the correct User type with profiles

// Import types for use in this file
import type { Activity } from './activity.types';
import type { User } from './auth.types';

// Legacy User Profile (deprecated - use UserProfile from auth.types instead)
export interface LegacyUserProfile {
  phone: string;
  avatar: string | null;
  job_title: string;
  department: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
  organization_name?: string; // Optional: creates new organization for vendor
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
  user_id?: number | null;  // For Jitsi video calls
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

export type CustomerStatus = 'active' | 'inactive' | 'prospect' | 'vip' 
// Deal types
export interface Deal {
  id: number;
  title: string;
  customer: number;
  customer_name: string;
  value: string | number;
  stage: DealStage;  // Frontend enum string
  stage_id?: number;  // Backend FK (optional for backward compat)
  stage_name?: string;  // Human-readable stage name (optional)
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

export interface Tag {
  id: number;
  name: string;
  color: string;
}

// Analytics types
export interface DashboardStats {
  customers: CustomerStats;
  leads: LeadStats;
  deals: DealStats;
  revenue: RevenueStats;
}

export interface CustomerStats {
  total: number;
  active: number;
  growth: number;
}

export interface LeadStats {
  total: number;
  qualified: number;
  conversion_rate: number;
}

export interface DealStats {
  total: number;
  active: number;  // Open deals (not yet won or lost)
  won: number;
  win_rate: number;
}

export interface RevenueStats {
  total: number;  // Total revenue from won deals
  pipeline_value: number;  // Value of active deals
  expected: number;  // Expected revenue based on probability
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

// Export Phase 3 types - New models
export * from './vendor.types';
export * from './issue.types';
export * from './order.types';
export * from './payment.types';
