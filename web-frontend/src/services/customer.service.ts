/**
 * Customer service
 */
import type { Customer, CustomerNote, PaginatedResponse } from '@/types';
import { mockCustomers, getCustomerById, getCustomerActivities, getCustomerNotes } from './mockData';

class CustomerService {
  /**
   * Get paginated list of customers
   */
  async getCustomers(_params?: Record<string, any>): Promise<PaginatedResponse<Customer>> {
    // Using mock data for development - feels dynamic without backend
    return Promise.resolve({
      count: mockCustomers.length,
      next: null,
      previous: null,
      results: mockCustomers as Customer[],
    });
  }

  /**
   * Get customer by ID
   */
  async getCustomer(id: number): Promise<Customer> {
    const customer = getCustomerById(id);
    if (!customer) {
      throw new Error(`Customer with ID ${id} not found`);
    }
    return Promise.resolve(customer as Customer);
  }

  /**
   * Create new customer
   */
  async createCustomer(data: Partial<Customer>): Promise<Customer> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newCustomer = {
      id: mockCustomers.length + 1,
      ...data,
      full_name: `${data.first_name} ${data.last_name}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as Customer;
    
    mockCustomers.push(newCustomer as any);
    return Promise.resolve(newCustomer);
  }

  /**
   * Update customer
   */
  async updateCustomer(id: number, data: Partial<Customer>): Promise<Customer> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const index = mockCustomers.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error(`Customer with ID ${id} not found`);
    }
    
    mockCustomers[index] = {
      ...mockCustomers[index],
      ...data,
      updated_at: new Date().toISOString(),
    };
    
    return Promise.resolve(mockCustomers[index] as Customer);
  }

  /**
   * Delete customer
   */
  async deleteCustomer(id: number): Promise<void> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const index = mockCustomers.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error(`Customer with ID ${id} not found`);
    }
    
    mockCustomers.splice(index, 1);
    return Promise.resolve();
  }

  /**
   * Add note to customer
   */
  async addNote(customerId: number, note: string): Promise<CustomerNote> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const newNote: CustomerNote = {
      id: Date.now(),
      customer: customerId,
      user: 1,
      user_name: 'Current User',
      note: note,
      created_at: new Date().toISOString(),
    };
    
    return Promise.resolve(newNote);
  }

  /**
   * Get customer statistics
   */
  async getStats(): Promise<any> {
    const total = mockCustomers.length;
    const active = mockCustomers.filter(c => c.status === 'active').length;
    const inactive = mockCustomers.filter(c => c.status === 'inactive').length;
    const pending = mockCustomers.filter(c => c.status === 'pending').length;
    
    return Promise.resolve({
      total,
      active,
      inactive,
      pending,
      total_value: mockCustomers.reduce((sum, c: any) => sum + (c.total_value || 0), 0),
      lifetime_value: mockCustomers.reduce((sum, c: any) => sum + (c.lifetime_value || 0), 0),
    });
  }

  /**
   * Get customer activities (for detail page)
   */
  async getCustomerActivities(customerId: number): Promise<any[]> {
    return Promise.resolve(getCustomerActivities(customerId));
  }

  /**
   * Get customer notes (for detail page)
   */
  async getCustomerNotes(customerId: number): Promise<any[]> {
    return Promise.resolve(getCustomerNotes(customerId));
  }
}

export const customerService = new CustomerService();
