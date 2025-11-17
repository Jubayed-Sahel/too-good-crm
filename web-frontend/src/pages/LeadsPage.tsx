import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { VStack, Box, Spinner, Heading, Text } from '@chakra-ui/react';
import { FiPlus } from 'react-icons/fi';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { 
  LeadStats, 
  LeadFilters, 
  LeadsTable, 
  CreateLeadDialog 
} from '../components/leads';
import { ConfirmDialog, PageHeader, StandardButton, ErrorState } from '../components/common';
import { RequirePermission } from '../components/guards/RequirePermission';
import { usePermissionActions } from '@/hooks/usePermissionActions';
import { 
  useLeads, 
  useLeadStats, 
  useCreateLead, 
  useDeleteLead,
  useConvertLead,
  useConvertLeadToDeal,
} from '../hooks';
import type { LeadFilters as LeadFiltersType, CreateLeadData, Lead } from '../types';
import { toaster } from '../components/ui/toaster';
import { exportData } from '@/utils';
import { transformLeadFormData, cleanFormData } from '@/utils/formTransformers';
import { useProfile } from '@/contexts/ProfileContext';

export const LeadsPage = () => {
  const navigate = useNavigate();
  const { activeOrganizationId } = useProfile();
  const permissions = usePermissionActions('leads');
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
  
  // Check if organization is missing
  if (!activeOrganizationId) {
    return (
      <DashboardLayout title="Leads">
        <ErrorState
          title="Organization Required"
          error={new Error("Please select an active profile with an organization to view leads.")}
          onRetry={() => window.location.reload()}
        />
      </DashboardLayout>
    );
  }

  // Mutations
  const createLead = useCreateLead();
  const deleteLead = useDeleteLead();
  const convertLead = useConvertLead();
  const convertLeadToDeal = useConvertLeadToDeal();

  const handleCreateLead = (data: CreateLeadData) => {
    console.log('🚀 Creating lead with data:', data);
    
    // Get organization ID from active profile
    const organizationId = activeOrganizationId || data.organization;
    
    if (!organizationId) {
      console.error('❌ No organization ID found');
      toaster.create({
        title: 'Unable to create lead',
        description: 'Organization information not found. Please select a profile.',
        type: 'error',
      });
      return;
    }
    
    console.log('📊 Organization ID:', organizationId);
    
    // Transform form data to backend format
    const transformedData = transformLeadFormData(data, organizationId);
    console.log('🔄 Transformed data:', transformedData);
    
    const backendData = cleanFormData(transformedData);
    console.log('✅ Final backend data:', backendData);
    console.log('✅ Stringified payload:', JSON.stringify(backendData, null, 2));
    
    createLead.mutate(backendData as CreateLeadData, {
      onSuccess: (createdLead) => {
        console.log('✅ Lead created successfully:', createdLead);
        toaster.create({
          title: 'Lead created successfully',
          type: 'success',
        });
        setIsCreateDialogOpen(false);
      },
      onError: (err: any) => {
        console.error('❌ Failed to create lead:', err);
        console.error('❌ Error response:', err.response?.data);
        
        const errorMessage = 
          err.response?.data?.email?.[0] ||
          err.response?.data?.name?.[0] ||
          err.response?.data?.organization_name?.[0] ||
          err.response?.data?.non_field_errors?.[0] ||
          err.response?.data?.detail ||
          'Failed to create lead. Please try again.';
        
        toaster.create({
          title: 'Failed to create lead',
          description: errorMessage,
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
    if (!_lead) return;

    convertLead.mutate({ id: _lead.id, data: { customer_type: 'individual' } }, {
      onSuccess: () => {
        toaster.create({ title: 'Lead converted', description: 'Lead converted to customer successfully.', type: 'success' });
      },
      onError: (err: any) => {
        console.error('Failed to convert lead:', err);
        toaster.create({ title: 'Conversion failed', description: err?.message || 'Please try again.', type: 'error' });
      }
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

  const handleBulkConvertToDeal = async (leadIds: string[]) => {
    if (leadIds.length === 0) return;

    const selectedLeads = leads.filter(lead => leadIds.includes(lead.id.toString()));

    if (selectedLeads.length === 0) {
      toaster.create({
        title: 'Conversion unavailable',
        description: 'No matching leads found. Please refresh and try again.',
        type: 'warning',
      });
      return;
    }

    // Filter out already converted leads
    const unconvertedLeads = selectedLeads.filter(lead => !lead.is_converted);
    
    if (unconvertedLeads.length === 0) {
      toaster.create({
        title: 'No leads to convert',
        description: 'All selected leads have already been converted.',
        type: 'warning',
      });
      return;
    }

    if (unconvertedLeads.length < selectedLeads.length) {
      toaster.create({
        title: 'Some leads already converted',
        description: `Converting ${unconvertedLeads.length} of ${selectedLeads.length} selected leads.`,
        type: 'info',
      });
    }

    try {
      // Convert leads to deals in parallel
      const results = await Promise.allSettled(
        unconvertedLeads.map(lead =>
          convertLeadToDeal.mutateAsync({
            id: lead.id,
            data: {
              deal_title: `Deal for ${lead.name}`,
              deal_value: lead.estimated_value,
              description: lead.notes,
            },
          })
        )
      );

      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      if (successful > 0) {
        toaster.create({
          title: 'Leads converted successfully',
          description: `${successful} lead(s) converted to deals${failed > 0 ? `, ${failed} failed` : ''}.`,
          type: 'success',
        });
      }

      if (failed > 0) {
        toaster.create({
          title: 'Some conversions failed',
          description: `${failed} lead(s) could not be converted. Please try again.`,
          type: 'error',
        });
      }
    } catch (error) {
      toaster.create({
        title: 'Conversion failed',
        description: 'Failed to convert leads to deals. Please try again.',
        type: 'error',
      });
    }
  };

  if (error) {
    return (
      <DashboardLayout title="Leads">
        <ErrorState
          title="Failed to load leads"
          error={error}
          onRetry={() => window.location.reload()}
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Leads">
      <RequirePermission resource="leads">
        <VStack gap={5} align="stretch">
        {/* Page Header */}
        <PageHeader
          title="Leads"
          description="Manage your lead pipeline and track conversions"
          actions={
            permissions.canCreate ? (
              <StandardButton
                variant="primary"
                leftIcon={<FiPlus />}
                onClick={() => setIsCreateDialogOpen(true)}
              >
                New Lead
              </StandardButton>
            ) : undefined
          }
        />

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
                onBulkConvertToDeal={handleBulkConvertToDeal}
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
      </RequirePermission>
    </DashboardLayout>
  );
};
