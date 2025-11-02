/**
 * Leads Types
 */

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'converted' | 'lost';
export type LeadSource = 'website' | 'referral' | 'cold_call' | 'email' | 'social_media' | 'trade_show' | 'partner' | 'other';
export type LeadPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Lead {
  id: string;
  organizationId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone?: string;
  company?: string;
  title?: string;
  jobTitle?: string;
  website?: string;
  source: LeadSource;
  status: LeadStatus;
  priority: LeadPriority;
  score: number; // 0-100
  estimatedValue?: number;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  description?: string;
  assignedToId?: string;
  assignedToName?: string;
  tags?: string[];
  customFields?: Record<string, any>;
  lastContactedAt?: string;
  nextFollowUpAt?: string;
  convertedAt?: string;
  convertedToCustomerId?: string;
  lostReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeadActivity {
  id: string;
  leadId: string;
  type: 'call' | 'email' | 'meeting' | 'note' | 'status_change' | 'score_change';
  subject: string;
  description?: string;
  outcome?: string;
  duration?: number; // in minutes
  scheduledAt?: string;
  completedAt?: string;
  userId: string;
  userName: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface LeadScoreHistory {
  id: string;
  leadId: string;
  oldScore: number;
  newScore: number;
  reason: string;
  userId: string;
  userName: string;
  createdAt: string;
}

export interface CreateLeadData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  title?: string;
  jobTitle?: string;
  website?: string;
  source: LeadSource;
  status?: LeadStatus;
  priority?: LeadPriority;
  estimatedValue?: number;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  description?: string;
  notes?: string;
  assignedToId?: string;
  tags?: string[];
}

export interface UpdateLeadData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  company?: string;
  title?: string;
  website?: string;
  source?: LeadSource;
  status?: LeadStatus;
  priority?: LeadPriority;
  score?: number;
  estimatedValue?: number;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  description?: string;
  assignedToId?: string;
  tags?: string[];
  nextFollowUpAt?: string;
}

export interface ConvertLeadData {
  createCustomer: boolean;
  createDeal: boolean;
  dealValue?: number;
  dealName?: string;
  notes?: string;
}

export interface LeadFilters {
  status?: LeadStatus;
  source?: LeadSource;
  priority?: LeadPriority;
  assignedToId?: string;
  minScore?: number;
  maxScore?: number;
  tags?: string[];
  search?: string;
}

export interface LeadStats {
  totalLeads: number;
  statusCounts: {
    new: number;
    contacted: number;
    qualified: number;
    proposal: number;
    negotiation: number;
    converted: number;
    lost: number;
  };
  averageScore: number;
  totalEstimatedValue: number;
  conversionRate: number;
}
