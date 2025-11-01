/**
 * Customer service
 */
import { apiService } from './api.service';
import { API_ENDPOINTS } from '@/config/constants';
import type { Customer, CustomerNote, PaginatedResponse } from '@/types';

class CustomerService {
  /**
   * Get paginated list of customers
   */
  async getCustomers(_params?: Record<string, any>): Promise<PaginatedResponse<Customer>> {
    // Mock data for development
    const mockCustomers: Customer[] = [
      {
        id: 1,
        full_name: 'John Doe',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@acme.com',
        phone: '+1 (555) 123-4567',
        company: 'Acme Corporation',
        job_title: 'CEO',
        status: 'active',
        assigned_to: 1,
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z',
      },
      {
        id: 2,
        full_name: 'Jane Smith',
        first_name: 'Jane',
        last_name: 'Smith',
        email: 'jane.smith@techstart.io',
        phone: '+1 (555) 234-5678',
        company: 'TechStart Inc',
        job_title: 'CTO',
        status: 'active',
        assigned_to: 2,
        created_at: '2024-01-14T09:30:00Z',
        updated_at: '2024-01-16T14:20:00Z',
      },
      {
        id: 3,
        full_name: 'Mike Johnson',
        first_name: 'Mike',
        last_name: 'Johnson',
        email: 'mike.j@globalsolutions.com',
        phone: '+1 (555) 345-6789',
        company: 'Global Solutions Ltd',
        job_title: 'VP Sales',
        status: 'inactive',
        assigned_to: 1,
        created_at: '2024-01-10T08:15:00Z',
        updated_at: '2024-01-10T08:15:00Z',
      },
      {
        id: 4,
        full_name: 'Sarah Williams',
        first_name: 'Sarah',
        last_name: 'Williams',
        email: 'sarah@innovationlabs.com',
        phone: '+1 (555) 456-7890',
        company: 'Innovation Labs',
        job_title: 'Founder',
        status: 'pending',
        assigned_to: 3,
        created_at: '2024-01-18T11:45:00Z',
        updated_at: '2024-01-18T11:45:00Z',
      },
      {
        id: 5,
        full_name: 'David Brown',
        first_name: 'David',
        last_name: 'Brown',
        email: 'david.b@digitaldynamics.net',
        phone: '+1 (555) 567-8901',
        company: 'Digital Dynamics',
        job_title: 'Director',
        status: 'active',
        assigned_to: 2,
        created_at: '2024-01-12T13:20:00Z',
        updated_at: '2024-01-17T16:30:00Z',
      },
    ];

    return Promise.resolve({
      count: mockCustomers.length,
      next: null,
      previous: null,
      results: mockCustomers,
    });
  }

  /**
   * Get customer by ID
   */
  async getCustomer(id: number): Promise<Customer> {
    return apiService.get<Customer>(API_ENDPOINTS.CUSTOMERS.DETAIL(id));
  }

  /**
   * Create new customer
   */
  async createCustomer(data: Partial<Customer>): Promise<Customer> {
    return apiService.post<Customer>(API_ENDPOINTS.CUSTOMERS.LIST, data);
  }

  /**
   * Update customer
   */
  async updateCustomer(id: number, data: Partial<Customer>): Promise<Customer> {
    return apiService.patch<Customer>(API_ENDPOINTS.CUSTOMERS.DETAIL(id), data);
  }

  /**
   * Delete customer
   */
  async deleteCustomer(id: number): Promise<void> {
    return apiService.delete(API_ENDPOINTS.CUSTOMERS.DETAIL(id));
  }

  /**
   * Add note to customer
   */
  async addNote(customerId: number, note: string): Promise<CustomerNote> {
    return apiService.post<CustomerNote>(
      API_ENDPOINTS.CUSTOMERS.ADD_NOTE(customerId),
      { note }
    );
  }

  /**
   * Get customer statistics
   */
  async getStats(): Promise<any> {
    return apiService.get(API_ENDPOINTS.CUSTOMERS.STATS);
  }
}

export const customerService = new CustomerService();
