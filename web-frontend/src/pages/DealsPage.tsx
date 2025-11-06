/**
 * DealsPage - Container Component
 * 
 * Responsibilities:
 * - Data fetching (via useDeals hook)
 * - State management (via useDealsPage hook)
 * - Action handling (via useDealActions hook)
 * - Rendering presentation components
 * 
 * This component follows the Container/Presenter pattern for proper separation of concerns.
 */
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { DealsPageContent, DealsPageLoading } from '../components/deals';
import { useDeals, useDealsPage, useDealActions } from '@/hooks';

const DealsPage = () => {
  // Data fetching - handles API communication
  const { deals, isLoading, refetch } = useDeals({ page_size: 1000 });
  
  // Page state management - handles filters, dialogs, and data transformation
  const {
    searchQuery,
    setSearchQuery,
    stageFilter,
    setStageFilter,
    mappedDeals,
    stats,
    isCreateDialogOpen,
    isEditDialogOpen,
    setIsCreateDialogOpen,
    setIsEditDialogOpen,
    handleOpenNewDeal,
  } = useDealsPage(deals);
  
  // Action handlers - handles CRUD operations
  const {
    selectedDeal,
    handleEditDeal,
    handleUpdateDeal,
    handleDeleteDeal,
    handleViewDeal,
    handleCreateDeal,
    setSelectedDeal,
  } = useDealActions({ onSuccess: refetch });

  // Loading state
  if (isLoading) {
    return (
      <DashboardLayout title="Deals">
        <DealsPageLoading />
      </DashboardLayout>
    );
  }

  // Main content
  return (
    <DashboardLayout title="Deals">
      <DealsPageContent
        // Data
        mappedDeals={mappedDeals}
        stats={stats}
        
        // Filters
        searchQuery={searchQuery}
        stageFilter={stageFilter}
        onSearchChange={setSearchQuery}
        onStageFilterChange={setStageFilter}
        
        // Dialogs
        isCreateDialogOpen={isCreateDialogOpen}
        isEditDialogOpen={isEditDialogOpen}
        selectedDeal={selectedDeal}
        onOpenCreateDialog={handleOpenNewDeal}
        onCloseCreateDialog={() => setIsCreateDialogOpen(false)}
        onCloseEditDialog={() => {
          setIsEditDialogOpen(false);
          setSelectedDeal(null);
        }}
        
        // Actions
        onCreateDeal={handleCreateDeal}
        onUpdateDeal={handleUpdateDeal}
        onEditDeal={(deal) => {
          handleEditDeal(deal);
          setIsEditDialogOpen(true);
        }}
        onDeleteDeal={handleDeleteDeal}
        onViewDeal={handleViewDeal}
      />
    </DashboardLayout>
  );
};

export default DealsPage;
