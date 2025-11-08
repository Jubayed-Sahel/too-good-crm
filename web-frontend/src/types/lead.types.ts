/**
 * Leads Types
 */

// Backend uses qualification_status with these values
export type LeadQualificationStatus = 'new' | 'contacted' | 'qualified' | 'unqualified' | 'converted' | 'lost';
export type LeadStatus = 'active' | 'inactive';
export type LeadSource = 'website' | 'referral' | 'social_media' | 'email_campaign' | 'cold_call' | 'event' | 'partner' | 'other';

export interface Lead {
  id: number;
  organization: number;
  code: string;
  name: string; // Backend uses single name field
  email: string;
  phone?: string;
  company?: string;
  job_title?: string;
  source: LeadSource;
  status: LeadStatus; // active/inactive
  qualification_status: LeadQualificationStatus; // new/contacted/qualified/etc
  lead_score: number; // 0-100
  estimated_value?: number;
  assigned_to?: {
    id: number;
    full_name: string;
    email: string;
  };
  assigned_to_name?: string; // For list view
  is_converted: boolean;
  converted_at?: string;
  converted_by?: number;
  converted_by_name?: string;
  tags?: string[];
  notes?: string;
  campaign?: string;
  referrer?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  created_at: string;
  updated_at: string;
}

export interface LeadActivity {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'note' | 'status_change' | 'score_change';
  description: string;
  created_at: string;
}

export interface CreateLeadData {
  organization: number;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  job_title?: string;
  source: LeadSource;
  qualification_status?: LeadQualificationStatus;
  estimated_value?: number;
  assigned_to_id?: number;
  tags?: string[];
  notes?: string;
  campaign?: string;
  referrer?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
}

export interface UpdateLeadData {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  job_title?: string;
  source?: LeadSource;
  status?: LeadStatus;
  qualification_status?: LeadQualificationStatus;
  lead_score?: number;
  estimated_value?: number;
  assigned_to_id?: number;
  tags?: string[];
  notes?: string;
  campaign?: string;
  referrer?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
}

export interface ConvertLeadData {
  customer_type?: 'individual' | 'business';
  assigned_to_id?: number;
}

export interface LeadFilters {
  status?: LeadStatus;
  qualification_status?: LeadQualificationStatus;
  source?: LeadSource;
  assigned_to?: number;
  is_converted?: boolean;
  search?: string;
  organization?: number;
}

export interface LeadStats {
  totalLeads: number;
  statusCounts: {
    new: number;
    contacted: number;
    qualified: number;
    unqualified: number;
    converted: number;
    lost: number;
  };
  averageScore: number;
  totalEstimatedValue: number;
  conversionRate: number;
  by_source?: Record<string, number>;
}
