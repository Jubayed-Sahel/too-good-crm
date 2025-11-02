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

  // Queries
  const { data: leads = [], isLoading: leadsLoading, error } = useLeads(filters);
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

  const handleDeleteLead = (leadId: string) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;

    deleteLead.mutate(leadId, {
      onSuccess: () => {
        toaster.create({
          title: 'Lead deleted successfully',
          type: 'success',
        });
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
          <Heading size="2xl" mb={2}>
            Leads
          </Heading>
          <Text color="gray.600" fontSize="md">
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
    </DashboardLayout>
  );
};
