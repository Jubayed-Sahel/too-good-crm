/**
 * Analytics types for vendor analytics page
 */

// Revenue Chart Types
export interface RevenueData {
  currentMonth: number;
  previousMonth: number;
  growth: number;
  monthlyData: MonthlyRevenue[];
}

export interface MonthlyRevenue {
  period: string;
  revenue: number;
  deal_count: number;
  start_date: string;
  end_date: string;
}

// Sales Pipeline Types
export interface SalesPipelineData {
  stages: PipelineStage[];
  totalValue: number;
}

export interface PipelineStage {
  name: string;
  count: number;
  value: number;
  color: string;
}

// Top Performers Types
export interface TopPerformer {
  id: number;
  name: string;
  role: string;
  deals: number;
  revenue: number;
  avatar?: string;
}

export interface EmployeePerformance {
  employee: {
    id: number;
    code: string;
    department: string;
    designation: string;
    user?: {
      first_name: string;
      last_name: string;
    };
  };
  customers: number;
  leads: {
    total: number;
    converted: number;
    conversion_rate: number;
  };
  deals: {
    total: number;
    won: number;
    win_rate: number;
  };
  revenue: {
    won: number;
    pipeline: number;
  };
}

// Conversion Funnel Types
export interface ConversionFunnelData {
  stages: FunnelStage[];
  conversion_rates: {
    lead_to_qualified: number;
    qualified_to_opportunity: number;
    opportunity_to_won: number;
    lead_to_won: number;
  };
}

export interface FunnelStage {
  name: string;
  count: number;
  percentage: number;
}

// Recent Activities Types (simplified from Activity model)
export interface RecentActivity {
  id: number;
  activity_type: 'call' | 'email' | 'meeting' | 'telegram' | 'task' | 'note';
  title: string;
  description?: string;
  created_by_name?: string;
  created_at: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  customer_name?: string;
  lead_title?: string;
  deal_title?: string;
}

export interface RecentActivityFormatted {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'deal';
  title: string;
  user: string;
  time: string;
  status?: string;
}
