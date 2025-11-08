/**
 * Issue Types
 * Matches backend API Issue model
 */

export type IssuePriority = 'low' | 'medium' | 'high' | 'critical';
export type IssueCategory = 'quality' | 'delivery' | 'payment' | 'communication' | 'other';
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
  assigned_to?: number | null;
  assigned_to_name?: string;
  created_by: number;
  resolved_by?: number | null;
  created_at: string;
  updated_at: string;
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
