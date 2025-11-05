/**
 * Customers Service
 * Handles customer-related API calls
 */
import api from '@/lib/apiClient';
import { API_CONFIG, buildUrl } from '@/config/api.config';

export interface Customer {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  company?: string;
  status: 'active' | 'inactive' | 'lead';
  source?: string;
  assigned_to?: number;
  assigned_to_name?: string;
  organization: number;
  tags?: string[];
  created_at: string;
  updated_at: string;
  last_contact?: string;
  notes_count?: number;
  activities_count?: number;
}

export interface CustomerStats {
  total: number;
  active: number;
  inactive: number;
  leads: number;
  new_this_month: number;
  conversion_rate: number;
}

export interface CustomerActivity {
  id: number;
  type: 'call' | 'email' | 'meeting' | 'note';
  title: string;
  description?: string;
  customer: number;
  created_by: number;
  created_by_name: string;
  created_at: string;
}

export interface CustomerNote {
  id: number;
  content: string;
  customer: number;
  created_by: number;
  created_by_name: string;
  created_at: string;
  updated_at: string;
}

export interface CustomerFilters {
  status?: string;
  source?: string;
  assigned_to?: number;
  tags?: string;
  search?: string;
  page?: number;
  page_size?: number;
  ordering?: string;
  [key: string]: string | number | boolean | undefined;
}

export interface CustomerCreateData {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  company?: string;
  status?: 'active' | 'inactive' | 'lead';
  source?: string;
  assigned_to?: number;
  tags?: string[];
  notes?: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

class CustomersService {
  /**
   * Get all customers with optional filters
   */
  async getCustomers(filters?: CustomerFilters): Promise<PaginatedResponse<Customer>> {
    const url = buildUrl(API_CONFIG.ENDPOINTS.CUSTOMERS.LIST, filters);
    return api.get<PaginatedResponse<Customer>>(url);
  }

  /**
   * Get a single customer by ID
   */
  async getCustomer(id: number): Promise<Customer> {
    const url = API_CONFIG.ENDPOINTS.CUSTOMERS.DETAIL(id);
    return api.get<Customer>(url);
  }

  /**
   * Create a new customer
   */
  async createCustomer(data: CustomerCreateData): Promise<Customer> {
    return api.post<Customer>(API_CONFIG.ENDPOINTS.CUSTOMERS.LIST, data);
  }

  /**
   * Update a customer
   */
  async updateCustomer(id: number, data: Partial<CustomerCreateData>): Promise<Customer> {
    const url = API_CONFIG.ENDPOINTS.CUSTOMERS.DETAIL(id);
    return api.patch<Customer>(url, data);
  }

  /**
   * Delete a customer
   */
  async deleteCustomer(id: number): Promise<void> {
    const url = API_CONFIG.ENDPOINTS.CUSTOMERS.DETAIL(id);
    return api.delete(url);
  }

  /**
   * Get customer statistics
   */
  async getStats(): Promise<CustomerStats> {
    return api.get<CustomerStats>(API_CONFIG.ENDPOINTS.CUSTOMERS.STATS);
  }

  /**
   * Activate a customer
   */
  async activateCustomer(id: number): Promise<Customer> {
    const url = API_CONFIG.ENDPOINTS.CUSTOMERS.ACTIVATE(id);
    return api.post<Customer>(url);
  }

  /**
   * Deactivate a customer
   */
  async deactivateCustomer(id: number): Promise<Customer> {
    const url = API_CONFIG.ENDPOINTS.CUSTOMERS.DEACTIVATE(id);
    return api.post<Customer>(url);
  }

  /**
   * Get customer activities
   */
  async getCustomerActivities(
    customerId: number,
    params?: CustomerFilters
  ): Promise<PaginatedResponse<CustomerActivity>> {
    const url = buildUrl(
      `/customers/${customerId}/activities/`,
      params
    );
    return api.get<PaginatedResponse<CustomerActivity>>(url);
  }

  /**
   * Get customer notes
   */
  async getCustomerNotes(
    customerId: number,
    params?: CustomerFilters
  ): Promise<PaginatedResponse<CustomerNote>> {
    const url = buildUrl(
      `/customers/${customerId}/notes/`,
      params
    );
    return api.get<PaginatedResponse<CustomerNote>>(url);
  }

  /**
   * Add a note to a customer
   */
  async addNote(customerId: number, content: string): Promise<CustomerNote> {
    return api.post<CustomerNote>(`/customers/${customerId}/notes/`, {
      content,
      customer: customerId,
    });
  }

  /**
   * Update a customer note
   */
  async updateNote(customerId: number, noteId: number, content: string): Promise<CustomerNote> {
    return api.patch<CustomerNote>(`/customers/${customerId}/notes/${noteId}/`, {
      content,
    });
  }

  /**
   * Delete a customer note
   */
  async deleteNote(customerId: number, noteId: number): Promise<void> {
    return api.delete(`/customers/${customerId}/notes/${noteId}/`);
  }

  /**
   * Bulk update customers
   */
  async bulkUpdate(customerIds: number[], data: Partial<CustomerCreateData>): Promise<Customer[]> {
    return api.post<Customer[]>('/customers/bulk_update/', {
      ids: customerIds,
      data,
    });
  }

  /**
   * Export customers to CSV
   */
  async exportCustomers(filters?: CustomerFilters): Promise<Blob> {
    const url = buildUrl('/customers/export/', filters);
    return api.get<Blob>(url, {
      responseType: 'blob',
    });
  }

  /**
   * Import customers from CSV
   */
  async importCustomers(file: File): Promise<{ success: number; failed: number; errors: string[] }> {
    const formData = new FormData();
    formData.append('file', file);

    return api.post('/customers/import/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
}

export const customersService = new CustomersService();
