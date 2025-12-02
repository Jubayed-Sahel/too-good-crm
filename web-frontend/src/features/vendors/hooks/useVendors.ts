/**
 * useVendors Hook
 * React Query hook for vendor data fetching and management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vendorService } from '../services';
import { toaster } from '@/components/ui/toaster';
import { useProfile } from '@/contexts/ProfileContext';
import type { CreateVendorData, UpdateVendorData, VendorFilters } from '../types';

const VENDORS_QUERY_KEY = 'vendors';

export const useVendors = (filters?: VendorFilters, options?: { includeOrgFilter?: boolean }) => {
  const { activeOrganizationId } = useProfile();
  const organizationId = activeOrganizationId;

  // Include organization ID in filters only if includeOrgFilter is not explicitly false
  // For customer "My Vendors" page, we want all vendors across all orgs they're linked to
  const shouldIncludeOrg = options?.includeOrgFilter !== false;
  
  const queryFilters: VendorFilters = {
    ...filters,
    ...(shouldIncludeOrg && { organization: organizationId || undefined }),
  };

  return useQuery({
    queryKey: [VENDORS_QUERY_KEY, queryFilters],
    queryFn: () => vendorService.getAll(queryFilters),
    enabled: !!organizationId,
  });
};

export const useVendor = (id: number) => {
  return useQuery({
    queryKey: [VENDORS_QUERY_KEY, id],
    queryFn: () => vendorService.getById(id),
    enabled: !!id,
  });
};

export const useVendorStats = (filters?: VendorFilters) => {
  const { activeOrganizationId } = useProfile();
  const organizationId = activeOrganizationId;

  const queryFilters: VendorFilters = {
    ...filters,
    organization: organizationId || undefined,
  };

  return useQuery({
    queryKey: [VENDORS_QUERY_KEY, 'stats', queryFilters],
    queryFn: () => vendorService.getStats(queryFilters),
    enabled: !!organizationId,
  });
};

export const useVendorMutations = () => {
  const queryClient = useQueryClient();
  const { activeOrganizationId } = useProfile();
  const organizationId = activeOrganizationId;

  const createVendor = useMutation({
    mutationFn: (data: CreateVendorData) => {
      // Ensure organization is set
      return vendorService.create({
        ...data,
        organization: organizationId!,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [VENDORS_QUERY_KEY] });
      toaster.create({
        title: 'Vendor Created',
        description: 'Vendor has been created successfully',
        type: 'success',
      });
    },
    onError: (error: any) => {
      toaster.create({
        title: 'Error',
        description: error.message || 'Failed to create vendor',
        type: 'error',
      });
    },
  });

  const updateVendor = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateVendorData }) =>
      vendorService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [VENDORS_QUERY_KEY] });
      toaster.create({
        title: 'Vendor Updated',
        description: 'Vendor has been updated successfully',
        type: 'success',
      });
    },
    onError: (error: any) => {
      toaster.create({
        title: 'Error',
        description: error.message || 'Failed to update vendor',
        type: 'error',
      });
    },
  });

  const deleteVendor = useMutation({
    mutationFn: (id: number) => vendorService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [VENDORS_QUERY_KEY] });
      toaster.create({
        title: 'Vendor Deleted',
        description: 'Vendor has been deleted successfully',
        type: 'success',
      });
    },
    onError: (error: any) => {
      toaster.create({
        title: 'Error',
        description: error.message || 'Failed to delete vendor',
        type: 'error',
      });
    },
  });

  const bulkDeleteVendors = useMutation({
    mutationFn: async (ids: number[]) => {
      await Promise.all(ids.map(id => vendorService.delete(id)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [VENDORS_QUERY_KEY] });
      toaster.create({
        title: 'Vendors Deleted',
        description: 'Selected vendors have been deleted successfully',
        type: 'success',
      });
    },
    onError: (error: any) => {
      toaster.create({
        title: 'Error',
        description: error.message || 'Failed to delete vendors',
        type: 'error',
      });
    },
  });

  return {
    createVendor,
    updateVendor,
    deleteVendor,
    bulkDeleteVendors,
  };
};
