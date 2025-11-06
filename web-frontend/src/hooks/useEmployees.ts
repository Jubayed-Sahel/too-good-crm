/**
 * Employees data hook
 */
import { useState, useEffect } from 'react';
import { employeeService, type Employee } from '@/services';

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export const useEmployees = (params?: Record<string, any>) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [pagination, setPagination] = useState<Omit<PaginatedResponse<Employee>, 'results'> | null>(null);

  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await employeeService.getEmployees(params);
      
      // Handle paginated response
      if (response && typeof response === 'object' && 'results' in response) {
        const paginatedResponse = response as unknown as PaginatedResponse<Employee>;
        setEmployees(paginatedResponse.results);
        setPagination({
          count: paginatedResponse.count,
          next: paginatedResponse.next,
          previous: paginatedResponse.previous,
        });
      } else if (Array.isArray(response)) {
        setEmployees(response);
        setPagination(null);
      } else {
        setEmployees([]);
        setPagination(null);
      }
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching employees:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [JSON.stringify(params)]);

  const inviteEmployee = async (data: { email: string; first_name: string; last_name: string; role?: string }) => {
    try {
      const newEmployee = await employeeService.inviteEmployee(data);
      await fetchEmployees(); // Refetch to get updated list
      return newEmployee;
    } catch (err) {
      throw err;
    }
  };

  const terminateEmployee = async (id: number) => {
    try {
      await employeeService.terminateEmployee(id);
      setEmployees((prev) => prev.filter((employee) => employee.id !== id));
    } catch (err) {
      throw err;
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
