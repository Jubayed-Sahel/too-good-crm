/**
 * Employee Service
 * Handles employee-related API calls
 */
import api from '@/lib/apiClient';

export interface Employee {
  id: number;
  code: string;  // From CodeMixin
  organization: number;
  user?: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  profile_image?: string;
  department?: string;
  job_title?: string;
  role?: number;
  role_name?: string;  // From serializer
  employment_type?: 'full-time' | 'part-time' | 'contract' | 'intern';
  hire_date?: string;
  termination_date?: string;
  status: 'active' | 'inactive' | 'on-leave' | 'terminated';
  emergency_contact?: string;
  salary?: string;
  commission_rate?: string;
  manager?: number;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  created_at: string;
  updated_at: string;
}

export interface InviteEmployeeRequest {
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  department?: string;
  job_title?: string;
  role_id?: number;
}

export interface InviteEmployeeResponse {
  message: string;
  employee: Employee;
  temporary_password: string;
  note: string;
}

export interface EmployeeFilters {
  organization?: number;
  status?: string;
  department?: string;
  search?: string;
}

class EmployeeService {
  private readonly baseUrl = '/employees';

  /**
   * Get all employees
   */
  async getEmployees(filters?: EmployeeFilters): Promise<Employee[]> {
    const response = await api.get<any>(this.baseUrl, { params: filters });
    // Handle both paginated and non-paginated responses
    if (response.results) {
      return response.results;
    }
    return Array.isArray(response) ? response : [];
  }

  /**
   * Get employee by ID
   */
  async getEmployee(id: number): Promise<Employee> {
    return api.get<Employee>(`${this.baseUrl}/${id}/`);
  }

  /**
   * Create employee
   */
  async createEmployee(data: Partial<Employee>): Promise<Employee> {
    return api.post<Employee>(this.baseUrl, data);
  }

  /**
   * Update employee
   */
  async updateEmployee(id: number, data: Partial<Employee>): Promise<Employee> {
    return api.patch<Employee>(`${this.baseUrl}/${id}/`, data);
  }

  /**
   * Delete employee
   */
  async deleteEmployee(id: number): Promise<void> {
    return api.delete(`${this.baseUrl}/${id}/`);
  }

  /**
   * Invite employee to join organization
   * Creates user account and employee record automatically
   */
  async inviteEmployee(data: InviteEmployeeRequest): Promise<InviteEmployeeResponse> {
    return api.post<InviteEmployeeResponse>(`${this.baseUrl}/invite/`, data);
  }

  /**
   * Get list of departments
   */
  async getDepartments(): Promise<string[]> {
    return api.get<string[]>(`${this.baseUrl}/departments/`);
  }

  /**
   * Terminate employee
   */
  async terminateEmployee(id: number, terminationDate?: string): Promise<{ message: string; employee: Employee }> {
    return api.post<{ message: string; employee: Employee }>(
      `${this.baseUrl}/${id}/terminate/`,
      { termination_date: terminationDate }
    );
  }
}

export const employeeService = new EmployeeService();
