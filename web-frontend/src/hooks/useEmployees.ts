/**
 * Employees data hook
 */
import { useState, useEffect } from 'react';
import { employeeService, type Employee } from '@/services';
import { useAuth } from '@/hooks';

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

interface UseEmployeesParams extends Record<string, any> {
  organization?: number;
  status?: string;
  department?: string;
  search?: string;
}

export const useEmployees = (params?: UseEmployeesParams) => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [pagination, setPagination] = useState<Omit<PaginatedResponse<Employee>, 'results'> | null>(null);

  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Build query params with organization filter
      const queryParams = {
        ...params,
        // Include organization from user's active profile if not provided
        organization: params?.organization || user?.active_profile?.organization,
      };
      
      const response = await employeeService.getEmployees(queryParams);
      
      console.log('📥 Fetched employees response:', response);
      
      // Handle paginated response
      if (response && typeof response === 'object' && 'results' in response) {
        const paginatedResponse = response as unknown as PaginatedResponse<Employee>;
        console.log('📊 Employees from paginated response:', paginatedResponse.results);
        setEmployees(paginatedResponse.results);
        setPagination({
          count: paginatedResponse.count,
          next: paginatedResponse.next,
          previous: paginatedResponse.previous,
        });
      } else if (Array.isArray(response)) {
        console.log('📊 Employees from array response:', response);
        setEmployees(response);
        setPagination(null);
      } else {
        console.warn('⚠️ Unexpected response format:', response);
        setEmployees([]);
        setPagination(null);
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.detail 
        || err?.response?.data?.error
        || err?.message 
        || 'Failed to fetch employees';
      
      setError(new Error(errorMessage));
      console.error('❌ Error fetching employees:', err);
      setEmployees([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [JSON.stringify(params), user?.active_profile?.organization]);

  const inviteEmployee = async (data: { email: string; first_name: string; last_name: string; role_id?: number }) => {
    try {
      const newEmployee = await employeeService.inviteEmployee(data);
      await fetchEmployees(); // Refetch to get updated list
      return newEmployee;
    } catch (err: any) {
      const errorMessage = err?.response?.data?.error
        || err?.response?.data?.detail
        || err?.message
        || 'Failed to invite employee';
      throw new Error(errorMessage);
    }
  };

  const terminateEmployee = async (id: number) => {
    try {
      await employeeService.terminateEmployee(id);
      setEmployees((prev) => prev.filter((employee) => employee.id !== id));
    } catch (err: any) {
      const errorMessage = err?.response?.data?.error
        || err?.response?.data?.detail
        || err?.message
        || 'Failed to terminate employee';
      throw new Error(errorMessage);
    }
  };

  return {
    employees,
    isLoading,
    error,
    pagination,
    refetch: fetchEmployees,
    inviteEmployee,
    terminateEmployee,
  };
};
