/**
 * Customers data hook
 */
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customerService } from '@/services';
import api from '@/lib/apiClient';
import { useProfile } from '@/contexts/ProfileContext';
import type { Customer, PaginatedResponse, Statistics } from '@/types';

// New service-based hook for simple usage
export const useCustomers = (params?: Record<string, any>) => {
  const { activeOrganizationId } = useProfile();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [pagination, setPagination] = useState<Omit<PaginatedResponse<Customer>, 'results'> | null>(null);

  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Always include organization filter if available
      const filters = {
        ...params,
        ...(activeOrganizationId && { organization: activeOrganizationId }),
      };
      
      const response = await customerService.getCustomers(filters);
      setCustomers(response.results);
      setPagination({
        count: response.count,
        next: response.next,
        previous: response.previous,
      });
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeOrganizationId) {
      fetchCustomers();
    }
  }, [JSON.stringify(params), activeOrganizationId]);

  const createCustomer = async (data: Partial<Customer>) => {
    try {
      const newCustomer = await customerService.createCustomer(data);
      setCustomers((prev) => [newCustomer, ...prev]);
      return newCustomer;
    } catch (err) {
      throw err;
    }
  };

  const updateCustomer = async (id: number, data: Partial<Customer>) => {
    try {
      const updated = await customerService.updateCustomer(id, data);
      setCustomers((prev) =>
        prev.map((customer) => (customer.id === id ? updated : customer))
      );
      return updated;
    } catch (err) {
      throw err;
    }
  };

  const deleteCustomer = async (id: number) => {
    try {
      await customerService.deleteCustomer(id);
      setCustomers((prev) => prev.filter((customer) => customer.id !== id));
    } catch (err) {
      throw err;
    }
  };

  return {
    customers,
    isLoading,
    error,
    pagination,
    refetch: fetchCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
  };
};

// React Query hooks (kept for backwards compatibility)
export const useCustomersQuery = (filters?: Record<string, string>) => {
  return useQuery({
    queryKey: ['customers', filters],
    queryFn: async () => {
      const data = await api.get<Customer[]>('/customers/', { params: filters })
      return data
    },
  })
}

export const useCustomer = (id: number) => {
  return useQuery({
    queryKey: ['customer', id],
    queryFn: async () => {
      const data = await api.get<Customer>(`/customers/${id}/`)
      return data
    },
    enabled: !!id,
  })
}

export const useCreateCustomer = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (customer: Partial<Customer>) => {
      const data = await api.post<Customer>('/customers/', customer)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
    },
  })
}

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, ...customer }: Partial<Customer> & { id: number }) => {
      const data = await api.put<Customer>(`/customers/${id}/`, customer)
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      queryClient.invalidateQueries({ queryKey: ['customer', variables.id] })
    },
  })
}

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/customers/${id}/`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
    },
  })
}

export const useCustomerStats = () => {
  return useQuery({
    queryKey: ['customer-stats'],
    queryFn: async () => {
      const data = await api.get<Statistics>('/customers/statistics/')
      return data
    },
  })
}

