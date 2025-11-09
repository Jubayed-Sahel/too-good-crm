/**
 * Vendor-related type definitions
 */

export interface Vendor {
  id: number;
  code?: string;
  name: string;
  company_name?: string;
  vendor_type: VendorType;
  vendor_type_display?: string;
  status: VendorStatus;
  status_display?: string;
  
  // Contact information
  contact_person?: string;
  email?: string;
  phone?: string;
  website?: string;
  
  // Business details
  industry?: string;
  tax_id?: string;
  rating?: number;
  payment_terms?: string;
  credit_limit?: number;
  
  // Address
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  
  // Relationships
  organization?: number;
  user?: number;
  user_id?: number | null;  // For Jitsi video calls
  user_profile?: number;
  assigned_employee?: number;
  assigned_employee_name?: string;
  
  // Metadata
  notes?: string;
  created_at: string;
  updated_at: string;
  
  // Computed fields (may come from backend)
  totalOrders?: number;
  totalSpent?: number;
  lastOrder?: string;
}

export type VendorType = 'supplier' | 'service_provider' | 'contractor' | 'consultant';
export type VendorStatus = 'active' | 'inactive' | 'pending' | 'blacklisted';

export interface VendorFilters {
  search?: string;
  status?: VendorStatus | 'all';
  vendor_type?: VendorType | 'all';
  organization?: number;
  assigned_employee?: number;
  page?: number;
  page_size?: number;
}

export interface CreateVendorData {
  name: string;
  company_name?: string;
  vendor_type?: VendorType;
  contact_person?: string;
  email?: string;
  phone?: string;
  website?: string;
  industry?: string;
  tax_id?: string;
  rating?: number;
  payment_terms?: string;
  credit_limit?: number;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  status?: VendorStatus;
  assigned_employee?: number;
  organization: number;
  notes?: string;
}

export interface UpdateVendorData {
  name?: string;
  company_name?: string;
  vendor_type?: VendorType;
  contact_person?: string;
  email?: string;
  phone?: string;
  website?: string;
  industry?: string;
  tax_id?: string;
  rating?: number;
  payment_terms?: string;
  credit_limit?: number;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  status?: VendorStatus;
  assigned_employee?: number;
  notes?: string;
}

export interface VendorStats {
  total: number;
  active: number;
  inactive: number;
  total_orders?: number;
  average_rating?: number;
}
