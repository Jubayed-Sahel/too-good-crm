import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Heading, Text, VStack, Spinner } from '@chakra-ui/react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { 
  LeadStats, 
  LeadFilters, 
  LeadsTable, 
  CreateLeadDialog 
} from '../components/leads';
import { ConfirmDialog } from '../components/common';
import { 
  useLeads, 
  useLeadStats, 
  useCreateLead, 
  useDeleteLead 
} from '../hooks';
import type { LeadFilters as LeadFiltersType, CreateLeadData, Lead } from '../types';
import { toaster } from '../components/ui/toaster';

export const LeadsPage = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<LeadFiltersType>({});
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);
  
  // Bulk delete dialog state
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [leadsToBulkDelete, setLeadsToBulkDelete] = useState<string[]>([]);

  // Queries
  const { data, isLoading: leadsLoading, error } = useLeads(filters);
  const leads = data?.results ?? [];
  const { data: stats } = useLeadStats();

  // Mutations
  const createLead = useCreateLead();
  const deleteLead = useDeleteLead();

  const handleCreateLead = (data: CreateLeadData) => {
    createLead.mutate(data, {
      onSuccess: () => {
        toaster.create({
          title: 'Lead created successfully',
          type: 'success',
        });
        setIsCreateDialogOpen(false);
      },
      onError: () => {
        toaster.create({
          title: 'Failed to create lead',
          description: 'Please try again',
          type: 'error',
        });
      },
    });
  };

  const handleDeleteLead = (lead: Lead) => {
    setLeadToDelete(lead);
    setDeleteDialogOpen(true);
  };
  
  const confirmDeleteLead = () => {
    if (!leadToDelete) return;

    deleteLead.mutate(leadToDelete.id, {
      onSuccess: () => {
        toaster.create({
          title: 'Lead deleted successfully',
          type: 'success',
        });
        setDeleteDialogOpen(false);
        setLeadToDelete(null);
      },
      onError: () => {
        toaster.create({
          title: 'Failed to delete lead',
          description: 'Please try again',
          type: 'error',
        });
      },
    });
  };
  
  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setLeadToDelete(null);
  };

  const handleConvertLead = (_lead: Lead) => {
    // TODO: Implement convert lead dialog
    toaster.create({
      title: 'Convert Lead',
      description: 'Convert lead feature coming soon',
      type: 'info',
    });
  };

  const handleEditLead = (lead: Lead) => {
    navigate(`/leads/${lead.id}/edit`);
  };

  const handleViewLead = (lead: Lead) => {
    navigate(`/leads/${lead.id}`);
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  const handleAddLead = () => {
    setIsCreateDialogOpen(true);
  };
  
  const handleBulkDelete = (leadIds: string[]) => {
    if (leadIds.length === 0) return;
    setLeadsToBulkDelete(leadIds);
    setBulkDeleteDialogOpen(true);
  };
  
  const confirmBulkDelete = async () => {
    try {
      // Delete leads in parallel
      await Promise.all(
        leadsToBulkDelete.map(id => 
          new Promise((resolve, reject) => {
            deleteLead.mutate(parseInt(id), {
              onSuccess: resolve,
              onError: reject,
            });
          })
        )
      );
      
      toaster.create({
        title: 'Leads deleted successfully',
        description: `${leadsToBulkDelete.length} lead(s) have been removed.`,
        type: 'success',
      });
      
      setBulkDeleteDialogOpen(false);
      setLeadsToBulkDelete([]);
    } catch (error) {
      toaster.create({
        title: 'Failed to delete leads',
        description: 'Please try again.',
        type: 'error',
      });
    }
  };
  
  const closeBulkDeleteDialog = () => {
    setBulkDeleteDialogOpen(false);
    setLeadsToBulkDelete([]);
  };

  if (error) {
    return (
      <DashboardLayout title="Leads">
        <Box textAlign="center" py={12}>
          <Heading size="md" color="red.600" mb={2}>
            Failed to load leads
          </Heading>
          <Text color="gray.500">
            {error.message || 'Please try again later'}
          </Text>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Leads">
      <VStack gap={5} align="stretch">
        {/* Page Header */}
        <Box>
          <Heading size="xl" mb={2}>
            Leads
          </Heading>
          <Text color="gray.600" fontSize="sm">
            Manage your lead pipeline and track conversions
          </Text>
        </Box>

        {/* Statistics Cards */}
        {stats && (
          <LeadStats stats={stats} isLoading={leadsLoading} />
        )}

        {/* Filters */}
        <LeadFilters
          filters={filters}
          onFilterChange={setFilters}
          onClearFilters={handleClearFilters}
          onAddLead={handleAddLead}
        />

        {/* Loading State */}
        {leadsLoading ? (
          <Box display="flex" justifyContent="center" py={12}>
            <Spinner size="xl" color="purple.500" />
          </Box>
        ) : (
          <>
            {/* Leads Table */}
            {leads.length > 0 ? (
              <LeadsTable
                leads={leads}
                isLoading={leadsLoading}
                onView={handleViewLead}
                onEdit={handleEditLead}
                onDelete={handleDeleteLead}
                onConvert={handleConvertLead}
                onBulkDelete={handleBulkDelete}
              />
            ) : (
              <Box
                textAlign="center"
                py={12}
                px={6}
                bg="gray.50"
                borderRadius="lg"
              >
                <Heading size="md" color="gray.600" mb={2}>
                  No leads found
                </Heading>
                <Text color="gray.500">
                  {Object.keys(filters).length > 0
                    ? 'Try adjusting your filters'
                    : 'Get started by adding your first lead'}
                </Text>
              </Box>
            )}
          </>
        )}
      </VStack>

      {/* Create Lead Dialog */}
      <CreateLeadDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSubmit={handleCreateLead}
        isLoading={createLead.isPending}
      />
      
      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={closeDeleteDialog}
        onConfirm={confirmDeleteLead}
        title="Delete Lead"
        message={
          leadToDelete
            ? `Are you sure you want to delete lead "${leadToDelete.name || leadToDelete.email}"? This action cannot be undone.`
            : 'Are you sure you want to delete this lead?'
        }
        confirmText="Delete"
        cancelText="Cancel"
        colorScheme="red"
        isLoading={deleteLead.isPending}
      />
      
      {/* Bulk Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={bulkDeleteDialogOpen}
        onClose={closeBulkDeleteDialog}
        onConfirm={confirmBulkDelete}
        title="Delete Multiple Leads"
        message={`Are you sure you want to delete ${leadsToBulkDelete.length} lead(s)? This action cannot be undone.`}
        confirmText="Delete All"
        cancelText="Cancel"
        colorScheme="red"
        isLoading={deleteLead.isPending}
      />
    </DashboardLayout>
  );
};
