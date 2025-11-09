/**
 * DealsPageContent - Presentation Component
 * Pure UI component that receives all data and handlers as props
 */
import React from 'react';
import { VStack, Box, Heading, Text } from '@chakra-ui/react';
import { FiPlus } from 'react-icons/fi';
import { 
  DealsTable, 
  DealsFilters, 
  DealsStats, 
  CreateDealDialog,
  EditDealDialog,
  type EditDealData 
} from '../deals';
import { PageHeader, StandardButton } from '@/components/common';
import type { MappedDeal } from '@/hooks/useDealsPage';

interface DealsPageContentProps {
  // Data
  mappedDeals: MappedDeal[];
  stats: {
    total: number;
    active: number;
    won: number;
    totalValue: number;
  };
  
  // Filters
  searchQuery: string;
  stageFilter: string;
  onSearchChange: (query: string) => void;
  onStageFilterChange: (stage: string) => void;
  
  // Dialogs
  isCreateDialogOpen: boolean;
  isEditDialogOpen: boolean;
  selectedDeal: EditDealData | null;
  onOpenCreateDialog: () => void;
  onCloseCreateDialog: () => void;
  onCloseEditDialog: () => void;
  
  // Actions
  onCreateDeal: (data: any) => Promise<void>;
  onUpdateDeal: (data: EditDealData) => Promise<void>;
  onEditDeal: (deal: any) => void;
  onDeleteDeal: (deal: any) => void;
  onBulkDelete?: (dealIds: string[]) => void;
  onBulkExport?: (dealIds: string[], allDeals: MappedDeal[]) => void;
  onViewDeal: (deal: any) => void;
}

export const DealsPageContent: React.FC<DealsPageContentProps> = ({
  mappedDeals,
  stats,
  searchQuery,
  stageFilter,
  onSearchChange,
  onStageFilterChange,
  isCreateDialogOpen,
  isEditDialogOpen,
  selectedDeal,
  onOpenCreateDialog,
  onCloseCreateDialog,
  onCloseEditDialog,
  onCreateDeal,
  onUpdateDeal,
  onEditDeal,
  onDeleteDeal,
  onBulkDelete,
  onBulkExport,
  onViewDeal,
}) => {
  return (
    <VStack gap={5} align="stretch">
      {/* Page Header */}
      <PageHeader
        title="Deals"
        description="Track your sales pipeline, manage deal progress, and close more deals"
        actions={
          <StandardButton
            variant="primary"
            leftIcon={<FiPlus />}
            onClick={onOpenCreateDialog}
          >
            New Deal
          </StandardButton>
        }
      />

      {/* Statistics Cards */}
      <DealsStats
        totalDeals={stats.total}
        activeDeals={stats.active}
        wonDeals={stats.won}
        totalValue={stats.totalValue}
      />

      {/* Filters */}
      <DealsFilters
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        stageFilter={stageFilter}
        onStageFilterChange={onStageFilterChange}
        onAddDeal={onOpenCreateDialog}
      />

      {/* Deals Table */}
      {mappedDeals.length > 0 ? (
        <DealsTable
          deals={mappedDeals}
          onEdit={onEditDeal}
          onDelete={onDeleteDeal}
          onView={onViewDeal}
          onBulkDelete={onBulkDelete}
          onBulkExport={onBulkExport ? (ids) => onBulkExport(ids, mappedDeals) : undefined}
        />
      ) : (
        <Box
          py={12}
          px={6}
          textAlign="center"
          bg="gray.50"
          borderRadius="lg"
        >
          <Heading size="md" color="gray.600" mb={2}>
            No deals found
          </Heading>
          <Text color="gray.500">
            {searchQuery || stageFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Get started by adding your first deal'}
          </Text>
        </Box>
      )}

      {/* Create Deal Dialog */}
      <CreateDealDialog
        isOpen={isCreateDialogOpen}
        onClose={onCloseCreateDialog}
        onSubmit={onCreateDeal}
      />

      {/* Edit Deal Dialog */}
      <EditDealDialog
        isOpen={isEditDialogOpen}
        onClose={onCloseEditDialog}
        onSubmit={onUpdateDeal}
        deal={selectedDeal}
      />
    </VStack>
  );
};
