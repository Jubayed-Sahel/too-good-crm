/**
 * Customer feature type definitions
 */

import type { Activity } from '@/types/activity.types';

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
  deals?: any[];  // Avoid circular dependency with Deal
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

export type CustomerStatus = 'active' | 'pending' | 'inactive';

export interface CustomerStats {
  total_customers: number;
  active_customers: number;
  new_this_month: number;
  total_revenue: number;
}

export interface Tag {
  id: number;
  name: string;
  color?: string;
}

// API Data Transfer Objects
export interface CreateCustomerData {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  company?: string;
  job_title?: string;
  assigned_to?: number | null;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  notes?: string;
  website?: string;
}

export interface UpdateCustomerData extends Partial<CreateCustomerData> {
  status?: CustomerStatus;
}
