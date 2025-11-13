/**
 * Customer service
 */
import api from '@/lib/apiClient';
import { API_CONFIG, buildQueryString } from '@/config/api.config';
import type { Customer, CustomerNote, PaginatedResponse } from '@/types';

export interface CustomerFilters {
  status?: string;
  customer_type?: string;
  assigned_to?: number;
  organization?: number;
  search?: string;
  page?: number;
  page_size?: number;
  ordering?: string;
  [key: string]: string | number | boolean | undefined;
}

class CustomerService {
  /**
   * Get paginated list of customers
   */
  async getCustomers(params?: CustomerFilters): Promise<PaginatedResponse<Customer>> {
    const endpoint = API_CONFIG.ENDPOINTS.CUSTOMERS.LIST;
    const queryString = params ? buildQueryString(params) : '';
    return api.get<PaginatedResponse<Customer>>(`${endpoint}${queryString}`);
  }

  /**
   * Get all customers (for backward compatibility)
   */
  async getAll(params?: CustomerFilters): Promise<PaginatedResponse<Customer>> {
    return this.getCustomers(params);
  }

  /**
   * Get customer by ID
   */
  async getCustomer(id: number): Promise<Customer> {
    const url = API_CONFIG.ENDPOINTS.CUSTOMERS.DETAIL(id);
    return api.get<Customer>(url);
  }

  /**
   * Get customer by ID (alias)
   */
  async get(id: number): Promise<Customer> {
    return this.getCustomer(id);
  }

  /**
   * Create new customer
   */
  async createCustomer(data: Partial<Customer>): Promise<Customer> {
    return api.post<Customer>(API_CONFIG.ENDPOINTS.CUSTOMERS.LIST, data);
  }

  /**
   * Create new customer (alias)
   */
  async create(data: Partial<Customer>): Promise<Customer> {
    return this.createCustomer(data);
  }

  /**
   * Update customer
   */
  async updateCustomer(id: number, data: Partial<Customer>): Promise<Customer> {
    const url = API_CONFIG.ENDPOINTS.CUSTOMERS.DETAIL(id);
    return api.patch<Customer>(url, data);
  }

  /**
   * Update customer (alias)
   */
  async update(id: number, data: Partial<Customer>): Promise<Customer> {
    return this.updateCustomer(id, data);
  }

  /**
   * Delete customer
   */
  async deleteCustomer(id: number): Promise<void> {
    const url = API_CONFIG.ENDPOINTS.CUSTOMERS.DETAIL(id);
    return api.delete(url);
  }

  /**
   * Delete customer (alias)
   */
  async delete(id: number): Promise<void> {
    return this.deleteCustomer(id);
  }

  /**
   * Add note to customer
   */
  async addNote(customerId: number, note: string): Promise<CustomerNote> {
    const url = API_CONFIG.ENDPOINTS.CUSTOMERS.ADD_NOTE(customerId);
    return api.post<CustomerNote>(url, { note });
  }

  /**
   * Get customer statistics
   */
  async getStats(): Promise<any> {
    return api.get(API_CONFIG.ENDPOINTS.CUSTOMERS.STATS);
  }

  /**
   * Get customer activities (for detail page)
   */
  async getCustomerActivities(customerId: number): Promise<any[]> {
    const url = API_CONFIG.ENDPOINTS.CUSTOMERS.ACTIVITIES(customerId);
    return api.get<any[]>(url);
  }

  /**
   * Get customer notes (for detail page)
   */
  async getCustomerNotes(customerId: number): Promise<CustomerNote[]> {
    const url = API_CONFIG.ENDPOINTS.CUSTOMERS.NOTES(customerId);
    return api.get<CustomerNote[]>(url);
  }

  /**
   * Activate customer
   */
  async activate(customerId: number): Promise<Customer> {
    const url = API_CONFIG.ENDPOINTS.CUSTOMERS.ACTIVATE(customerId);
    return api.post<Customer>(url);
  }

  /**
   * Deactivate customer
   */
  async deactivate(customerId: number): Promise<Customer> {
    const url = API_CONFIG.ENDPOINTS.CUSTOMERS.DEACTIVATE(customerId);
    return api.post<Customer>(url);
  }
}

export const customerService = new CustomerService();
