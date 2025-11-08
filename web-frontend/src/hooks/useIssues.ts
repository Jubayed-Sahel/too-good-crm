/**
 * useIssues Hook
 * React Query hook for issue data fetching and management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { issueService } from '../services';
import { toaster } from '../components/ui/toaster';
import { useProfile } from '@/contexts/ProfileContext';
import type { CreateIssueData, UpdateIssueData, IssueFilters } from '../types';

const ISSUES_QUERY_KEY = 'issues';

export const useIssues = (filters?: IssueFilters) => {
  const { activeOrganizationId } = useProfile();
  const organizationId = activeOrganizationId;

  const queryFilters: IssueFilters = {
    ...filters,
    organization: organizationId || undefined,
  };

  return useQuery({
    queryKey: [ISSUES_QUERY_KEY, queryFilters],
    queryFn: () => issueService.getAll(queryFilters),
    enabled: !!organizationId,
  });
};

export const useIssue = (id: number) => {
  return useQuery({
    queryKey: [ISSUES_QUERY_KEY, id],
    queryFn: () => issueService.getById(id),
    enabled: !!id,
  });
};

export const useIssueStats = (filters?: IssueFilters) => {
  const { activeOrganizationId } = useProfile();
  const organizationId = activeOrganizationId;

  const queryFilters: IssueFilters = {
    ...filters,
    organization: organizationId || undefined,
  };

  return useQuery({
    queryKey: [ISSUES_QUERY_KEY, 'stats', queryFilters],
    queryFn: () => issueService.getStats(),
    enabled: !!organizationId,
  });
};

export const useIssueMutations = () => {
  const queryClient = useQueryClient();

  const createIssue = useMutation({
    mutationFn: (data: CreateIssueData) => {
      return issueService.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ISSUES_QUERY_KEY] });
      toaster.create({
        title: 'Issue Created',
        description: 'Issue has been logged successfully',
        type: 'success',
      });
    },
    onError: (error: any) => {
      toaster.create({
        title: 'Error',
        description: error.message || 'Failed to create issue',
        type: 'error',
      });
    },
  });

  const updateIssue = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateIssueData }) =>
      issueService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ISSUES_QUERY_KEY] });
      toaster.create({
        title: 'Issue Updated',
        description: 'Issue has been updated successfully',
        type: 'success',
      });
    },
    onError: (error: any) => {
      toaster.create({
        title: 'Error',
        description: error.message || 'Failed to update issue',
        type: 'error',
      });
    },
  });

  const deleteIssue = useMutation({
    mutationFn: (id: number) => issueService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ISSUES_QUERY_KEY] });
      toaster.create({
        title: 'Issue Deleted',
        description: 'Issue has been deleted successfully',
        type: 'success',
      });
    },
    onError: (error: any) => {
      toaster.create({
        title: 'Error',
        description: error.message || 'Failed to delete issue',
        type: 'error',
      });
    },
  });

  const raiseIssue = useMutation({
    mutationFn: (data: any) => issueService.raise(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ISSUES_QUERY_KEY] });
      toaster.create({
        title: 'Issue Raised',
        description: 'Issue has been raised successfully',
        type: 'success',
      });
    },
    onError: (error: any) => {
      toaster.create({
        title: 'Error',
        description: error.message || 'Failed to raise issue',
        type: 'error',
      });
    },
  });

  const resolveIssue = useMutation({
    mutationFn: ({ issueId, resolutionNotes }: { issueId: number; resolutionNotes: string }) => 
      issueService.resolve(issueId, resolutionNotes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ISSUES_QUERY_KEY] });
      toaster.create({
        title: 'Issue Resolved',
        description: 'Issue has been marked as resolved',
        type: 'success',
      });
    },
    onError: (error: any) => {
      toaster.create({
        title: 'Error',
        description: error.message || 'Failed to resolve issue',
        type: 'error',
      });
    },
  });

  const reopenIssue = useMutation({
    mutationFn: (id: number) => issueService.reopen(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ISSUES_QUERY_KEY] });
      toaster.create({
        title: 'Issue Reopened',
        description: 'Issue has been reopened',
        type: 'info',
      });
    },
    onError: (error: any) => {
      toaster.create({
        title: 'Error',
        description: error.message || 'Failed to reopen issue',
        type: 'error',
      });
    },
  });

  return {
    createIssue,
    updateIssue,
    deleteIssue,
    raiseIssue,
    resolveIssue,
    reopenIssue,
  };
};
