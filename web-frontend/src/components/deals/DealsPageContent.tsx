/**
 * DealsPageContent - Presentation Component
 * Pure UI component that receives all data and handlers as props
 */
import { Box, Heading, Text, VStack } from '@chakra-ui/react';
import { 
  DealsTable, 
  DealsFilters, 
  DealsStats, 
  CreateDealDialog,
  EditDealDialog,
  type EditDealData 
} from '../deals';

interface DealsPageContentProps {
  // Data
  mappedDeals: any[];
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
  onDeleteDeal: (deal: any) => Promise<void>;
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
  onViewDeal,
}) => {
  return (
    <VStack gap={5} align="stretch">
      {/* Page Header */}
      <Box>
        <Heading size="xl" mb={2}>
          Deals
        </Heading>
        <Text color="gray.600" fontSize="sm">
          Track your sales pipeline and manage deal progress
        </Text>
      </Box>

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
