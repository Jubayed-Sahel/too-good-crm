/**
 * Employee Mutation Hooks using React Query
 * Provides reusable mutations for employee operations with automatic cache management
 * 
 * Usage:
 * const createEmployee = useCreateEmployee();
 * createEmployee.mutate({ first_name: 'John', last_name: 'Doe', ... });
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { employeeService, type Employee } from '@/services/employee.service';
import { toaster } from '@/components/ui/toaster';

/**
 * Create Employee Mutation
 * Automatically invalidates employee list cache on success
 */
export function useCreateEmployee() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<Employee>) => employeeService.createEmployee(data),
    onSuccess: (data) => {
      toaster.create({
        title: 'Employee created',
        description: `Employee "${data.first_name} ${data.last_name}" has been created successfully.`,
        type: 'success',
      });
      
      // Invalidate and refetch employee list
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
    onError: (error: any) => {
      // Extract specific backend validation errors
      const errorMessage = 
        error.response?.data?.email?.[0] ||
        error.response?.data?.phone?.[0] ||
        error.response?.data?.first_name?.[0] ||
        error.response?.data?.last_name?.[0] ||
        error.response?.data?.salary?.[0] ||
        error.response?.data?.commission_rate?.[0] ||
        error.response?.data?.hire_date?.[0] ||
        error.response?.data?.non_field_errors?.[0] ||
        'Failed to create employee. Please try again.';
      
      toaster.create({
        title: 'Error creating employee',
        description: errorMessage,
        type: 'error',
      });
    },
  });
}

/**
 * Update Employee Mutation
 * Automatically invalidates both list and detail cache on success
 */
export function useUpdateEmployee() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Employee> }) =>
      employeeService.updateEmployee(id, data),
    onSuccess: (data) => {
      toaster.create({
        title: 'Employee updated',
        description: `Employee "${data.first_name} ${data.last_name}" has been updated successfully.`,
        type: 'success',
      });
      
      // Invalidate both list and detail
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['employee', data.id] });
    },
    onError: (error: any) => {
      const errorMessage = 
        error.response?.data?.email?.[0] ||
        error.response?.data?.phone?.[0] ||
        error.response?.data?.salary?.[0] ||
        error.response?.data?.commission_rate?.[0] ||
        error.response?.data?.non_field_errors?.[0] ||
        'Failed to update employee. Please try again.';
      
      toaster.create({
        title: 'Error updating employee',
        description: errorMessage,
        type: 'error',
      });
    },
  });
}

/**
 * Delete Employee Mutation
 * Automatically removes employee from cache on success
 */
export function useDeleteEmployee() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => employeeService.deleteEmployee(id),
    onSuccess: (_, id) => {
      toaster.create({
        title: 'Employee deleted',
        description: 'Employee has been deleted successfully.',
        type: 'success',
      });
      
      // Invalidate list and remove from cache
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.removeQueries({ queryKey: ['employee', id] });
    },
    onError: (error: any) => {
      toaster.create({
        title: 'Error deleting employee',
        description: error.response?.data?.detail || 'Failed to delete employee. Please try again.',
        type: 'error',
      });
    },
  });
}

/**
 * Invite Employee Mutation
 * Creates user account and employee record, returns temporary password
 */
export function useInviteEmployee() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: {
      email: string;
      first_name: string;
      last_name: string;
      phone?: string;
      department?: string;
      job_title?: string;
      role_id?: number;
    }) => employeeService.inviteEmployee(data),
    onSuccess: (response) => {
      toaster.create({
        title: 'Employee invited',
        description: `Invitation sent to ${response.employee.email}. Temporary password: ${response.temporary_password}`,
        type: 'success',
        duration: 10000, // Show for 10 seconds
      });
      
      // Invalidate employee list
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
    onError: (error: any) => {
      const errorMessage = 
        error.response?.data?.email?.[0] ||
        error.response?.data?.first_name?.[0] ||
        error.response?.data?.last_name?.[0] ||
        error.response?.data?.detail ||
        'Failed to invite employee. Please try again.';
      
      toaster.create({
        title: 'Error inviting employee',
        description: errorMessage,
        type: 'error',
      });
    },
  });
}

/**
 * Terminate Employee Mutation
 * Sets termination date and updates status
 */
export function useTerminateEmployee() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, terminationDate }: { id: number; terminationDate?: string }) =>
      employeeService.terminateEmployee(id, terminationDate),
    onSuccess: (response) => {
      toaster.create({
        title: 'Employee terminated',
        description: `${response.employee.first_name} ${response.employee.last_name} has been terminated.`,
        type: 'success',
      });
      
      // Invalidate both list and detail
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['employee', response.employee.id] });
    },
    onError: (error: any) => {
      toaster.create({
        title: 'Error terminating employee',
        description: error.response?.data?.detail || 'Failed to terminate employee. Please try again.',
        type: 'error',
      });
    },
  });
}

/**
 * Activate Employee Mutation
 * Sets employee status to active
 */
export function useActivateEmployee() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) =>
      employeeService.updateEmployee(id, { status: 'active' }),
    onSuccess: (data) => {
      toaster.create({
        title: 'Employee activated',
        description: `${data.first_name} ${data.last_name} has been activated.`,
        type: 'success',
      });
      
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['employee', data.id] });
    },
    onError: (error: any) => {
      toaster.create({
        title: 'Error activating employee',
        description: error.response?.data?.detail || 'Failed to activate employee.',
        type: 'error',
      });
    },
  });
}

/**
 * Deactivate Employee Mutation
 * Sets employee status to inactive
 */
export function useDeactivateEmployee() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) =>
      employeeService.updateEmployee(id, { status: 'inactive' }),
    onSuccess: (data) => {
      toaster.create({
        title: 'Employee deactivated',
        description: `${data.first_name} ${data.last_name} has been deactivated.`,
        type: 'success',
      });
      
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['employee', data.id] });
    },
    onError: (error: any) => {
      toaster.create({
        title: 'Error deactivating employee',
        description: error.response?.data?.detail || 'Failed to deactivate employee.',
        type: 'error',
      });
    },
  });
}
