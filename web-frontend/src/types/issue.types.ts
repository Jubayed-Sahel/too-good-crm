/**
 * Issue Types
 * Matches backend API Issue model
 */

export type IssuePriority = 'low' | 'medium' | 'high' | 'critical';
export type IssueCategory = 'general' | 'quality' | 'delivery' | 'billing' | 'payment' | 'communication' | 'technical' | 'other';
export type IssueStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export interface Issue {
  id: number;
  code: string;
  issue_number: string;
  title: string;
  description: string;
  priority: IssuePriority;
  category: IssueCategory;
  status: IssueStatus;
  vendor: number;
  vendor_name?: string;
  order?: number | null;
  order_number?: string;
  organization: number;
  organization_name?: string;
  assigned_to?: number | null;
  assigned_to_name?: string;
  created_by: number;
  resolved_by?: number | null;
  is_client_issue: boolean;
  raised_by_customer?: number | null;
  raised_by_customer_name?: string;
  created_at: string;
  updated_at: string;
  linear_issue_id?: string;
  linear_issue_url?: string;
  synced_to_linear?: boolean;
}

export interface CreateIssueData {
  title: string;
  description: string;
  priority: IssuePriority;
  category: IssueCategory;
  status: IssueStatus;
  vendor?: number | null;
  order?: number | null;
  assigned_to?: number | null;
  organization?: number;
  is_client_issue?: boolean;
  raised_by_customer?: number | null;
}

export interface ClientRaiseIssueData {
  organization: number;
  title: string;
  description: string;
  priority: IssuePriority;
  category: IssueCategory;
  vendor?: number | null;
  order?: number | null;
}

export interface UpdateIssueData extends Partial<CreateIssueData> {}

export interface IssueStats {
  total: number;
  by_status: Record<IssueStatus, number>;
  by_priority: Record<IssuePriority, number>;
  by_category: Record<IssueCategory, number>;
}

export interface IssueFilters {
  vendor?: number;
  order?: number;
  priority?: IssuePriority;
  category?: IssueCategory;
  status?: IssueStatus;
  assigned_to?: number;
  organization?: number;
  search?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
}
