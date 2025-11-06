import { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import type { Customer } from '@/types';

/**
 * Customer statistics interface
 */
export interface CustomerStats {
  totalCustomers: number;
  activeCustomers: number;
  inactiveCustomers: number;
  totalRevenue: number;
}

/**
 * Mapped customer data for table display
 */
export interface MappedCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: 'active' | 'inactive' | 'pending';
  totalValue: number;
  lastContact: string;
}

/**
 * Return type for useCustomersPage hook
 */
export interface UseCustomersPageReturn {
  // Filter state
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  
  // Dialog state
  isCreateDialogOpen: boolean;
  setIsCreateDialogOpen: (open: boolean) => void;
  
  // Computed data
  filteredCustomers: Customer[];
  mappedCustomers: MappedCustomer[];
  stats: CustomerStats;
}

/**
 * Custom hook for CustomersPage state management and business logic
 * 
 * Responsibilities:
 * - Manages filter state (search query, status filter)
 * - Manages dialog state (create customer)
 * - Filters customers based on search and status
 * - Calculates customer statistics
 * - Transforms API data to table format
 * - Handles route state (e.g., opening create dialog from dashboard)
 * 
 * @param customers - Array of customers from API
 * @returns Customer page state and computed values
 */
export const useCustomersPage = (customers: Customer[] | undefined): UseCustomersPageReturn => {
  const location = useLocation();
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Dialog state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Handle route state - open create dialog if navigated from dashboard
  useEffect(() => {
    if (location.state?.openNewCustomer) {
      setIsCreateDialogOpen(true);
      // Clear the state to prevent dialog from reopening on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // Filter customers based on search and status
  const filteredCustomers = useMemo(() => {
    if (!customers) return [];
    
    return customers.filter((customer) => {
      // Search filter - matches name, email, or company
      const matchesSearch =
        searchQuery === '' ||
        customer.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (customer.company && customer.company.toLowerCase().includes(searchQuery.toLowerCase()));

      // Status filter
      const matchesStatus =
        statusFilter === 'all' || customer.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [customers, searchQuery, statusFilter]);

  // Calculate customer statistics
  const stats = useMemo((): CustomerStats => {
    if (!customers) {
      return {
        totalCustomers: 0,
        activeCustomers: 0,
        inactiveCustomers: 0,
        totalRevenue: 0,
      };
    }

    const total = customers.length;
    const active = customers.filter((c) => c.status?.toLowerCase() === 'active').length;
    const inactive = customers.filter((c) => c.status?.toLowerCase() === 'inactive').length;
    const revenue = 0; // Backend doesn't provide this field yet

    return {
      totalCustomers: total,
      activeCustomers: active,
      inactiveCustomers: inactive,
      totalRevenue: revenue,
    };
  }, [customers]);

  // Map API customers to table format
  const mappedCustomers = useMemo((): MappedCustomer[] => {
    if (!customers) return [];
    
    return filteredCustomers.map((customer) => ({
      id: customer.id.toString(),
      name: customer.full_name,
      email: customer.email,
      phone: customer.phone || '',
      company: customer.company || '',
      status: (customer.status?.toLowerCase() || 'active') as 'active' | 'inactive' | 'pending',
      totalValue: 0, // Backend doesn't provide this yet
      lastContact: customer.updated_at || customer.created_at,
    }));
  }, [customers, filteredCustomers]);

  return {
    // Filter state
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    
    // Dialog state
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    
    // Computed data
    filteredCustomers,
    mappedCustomers,
    stats,
  };
};
