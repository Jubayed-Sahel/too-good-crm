export interface Customer {
  id: number
  first_name: string
  last_name: string
  full_name: string
  email: string
  phone?: string
  company?: string
  status: 'new' | 'contacted' | 'qualified' | 'lost' | 'customer'
  address?: string
  city?: string
  state?: string
  country?: string
  postal_code?: string
  assigned_to?: User
  notes?: string
  created_at: string
  updated_at: string
  deals?: Deal[]
  activities?: Activity[]
  tags?: Tag[]
}

export interface Deal {
  id: number
  title: string
  customer: number
  customer_name: string
  value: string
  stage: 'prospecting' | 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost'
  probability: number
  expected_close_date?: string
  actual_close_date?: string
  assigned_to?: User
  description?: string
  created_at: string
  updated_at: string
  is_won: boolean
  is_lost: boolean
}

export interface Activity {
  id: number
  customer: number
  deal?: number
  activity_type: 'call' | 'email' | 'meeting' | 'note' | 'task'
  subject: string
  description: string
  scheduled_at?: string
  completed_at?: string
  is_completed: boolean
  created_by?: User
  created_at: string
  updated_at: string
}

export interface Tag {
  id: number
  name: string
  color: string
}

export interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
}

export interface Statistics {
  total_customers: number
  by_status: { status: string; count: number }[]
  total_deals: number
  total_revenue: number
}
