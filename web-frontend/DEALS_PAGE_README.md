# Deals Page Implementation

## Overview
The Deals page provides a comprehensive sales pipeline management interface with responsive design for mobile, tablet, and desktop devices. It follows the same architecture pattern as the Customers page.

## Features

### 1. Deal Management
- **View all deals** in your sales pipeline
- **Search deals** by title, customer, or owner name
- **Filter by stage**: Lead, Qualified, Proposal, Negotiation, Closed Won, Closed Lost
- **Stage-based color coding** with probability tracking
- **Action buttons**: View, Edit, Delete for each deal

### 2. Statistics Dashboard
Four key metrics displayed at the top:
- **Total Deals**: Overall count of deals in the system
- **Active Deals**: Deals not yet won or lost
- **Won Deals**: Successfully closed deals
- **Total Deal Value**: Weighted value (won deals + probability-weighted active deals)

### 3. Responsive Design
- **Mobile (< 768px)**: Vertical card layout with stacked information
- **Tablet (768px - 1024px)**: Card layout with 2-column stats grid
- **Desktop (> 1024px)**: Full table with 8 columns and 4-column stats grid

### 4. Deal Fields
- **Title**: Name of the deal/opportunity
- **Customer**: Company or customer name
- **Value**: Deal amount in USD
- **Stage**: Current pipeline stage with color-coded badge
- **Probability**: Percentage chance of closing (with visual progress bar)
- **Expected Close Date**: Target closing date
- **Owner**: Sales representative assigned to the deal
- **Created Date**: When the deal was created

## Components

### DealsTable (`components/deals/DealsTable.tsx`)
Displays deals in a responsive table/card layout.

**Props:**
```typescript
interface DealsTableProps {
  deals: Deal[];
  onEdit: (deal: Deal) => void;
  onDelete: (deal: Deal) => void;
  onView: (deal: Deal) => void;
}
```

**Deal Interface:**
```typescript
interface Deal {
  id: string;
  title: string;
  customer: string;
  value: number;
  stage: 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost';
  probability: number;
  expectedCloseDate: string;
  owner: string;
  createdDate: string;
}
```

**Stage Colors:**
- Lead: Gray
- Qualified: Blue
- Proposal: Purple
- Negotiation: Orange
- Closed Won: Green
- Closed Lost: Red

### DealsFilters (`components/deals/DealsFilters.tsx`)
Search bar, stage filter dropdown, and action buttons.

**Props:**
```typescript
interface DealsFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  stageFilter: string;
  onStageFilterChange: (stage: string) => void;
  onAddDeal: () => void;
}
```

### DealsStats (`components/deals/DealsStats.tsx`)
Displays key metrics using StatCard components.

**Props:**
```typescript
interface DealsStatsProps {
  totalDeals: number;
  activeDeals: number;
  wonDeals: number;
  totalValue: number;
}
```

## Current Implementation

### Mock Data
The page currently uses 10 mock deals with realistic data:
- Various deal stages and values
- Multiple sales representatives
- Different probabilities and close dates
- Mix of active and closed deals

### State Management
Uses React hooks for local state:
- `searchQuery`: Search input value
- `stageFilter`: Selected stage filter
- Computed `filteredDeals`: Filtered based on search and stage
- Computed `stats`: Aggregated statistics

### Action Handlers
Placeholder implementations (ready for backend integration):
- `handleEditDeal`: Edit deal details
- `handleDeleteDeal`: Delete deal with confirmation
- `handleViewDeal`: View full deal details
- `handleAddDeal`: Create new deal

## Backend Integration (TODO)

### API Endpoints Needed

```typescript
// Get all deals
GET /api/deals
Response: Deal[]

// Get single deal
GET /api/deals/:id
Response: Deal

// Create deal
POST /api/deals
Body: Omit<Deal, 'id' | 'createdDate'>
Response: Deal

// Update deal
PUT /api/deals/:id
Body: Partial<Deal>
Response: Deal

// Delete deal
DELETE /api/deals/:id
Response: { success: boolean }

// Get deal statistics
GET /api/deals/stats
Response: {
  totalDeals: number;
  activeDeals: number;
  wonDeals: number;
  totalValue: number;
  pipelineByStage: { stage: string; count: number; value: number }[];
}
```

### Integration Steps

1. **Update `services/api.ts`:**
```typescript
export const dealsApi = {
  getAll: () => axios.get<Deal[]>('/api/deals'),
  getById: (id: string) => axios.get<Deal>(`/api/deals/${id}`),
  create: (deal: Omit<Deal, 'id' | 'createdDate'>) => 
    axios.post<Deal>('/api/deals', deal),
  update: (id: string, deal: Partial<Deal>) => 
    axios.put<Deal>(`/api/deals/${id}`, deal),
  delete: (id: string) => axios.delete(`/api/deals/${id}`),
  getStats: () => axios.get<DealsStats>('/api/deals/stats'),
};
```

2. **Create custom hook `hooks/useDeals.ts`:**
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dealsApi } from '../services/api';

export const useDeals = () => {
  return useQuery({
    queryKey: ['deals'],
    queryFn: () => dealsApi.getAll(),
  });
};

export const useDeleteDeal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: dealsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
    },
  });
};

// Add similar hooks for create, update, etc.
```

3. **Update `DealsPage.tsx`:**
```typescript
import { useDeals } from '../hooks/useDeals';

const DealsPage = () => {
  const { data: deals, isLoading, error } = useDeals();
  // ... rest of implementation
};
```

## Responsive Breakpoints

- **base**: 0px - Mobile phones
- **md**: 768px - Tablets
- **lg**: 1024px - Small laptops
- **xl**: 1280px - Desktop monitors

## Styling Notes

### Chakra UI v3 Compatibility
- Uses custom `SimpleProgress` component instead of Chakra's Progress
- Native HTML `<select>` element with inline styles (workaround for Chakra v3)
- Grid/Flex-based layouts instead of deprecated Table components
- IconButtons use size="sm" instead of size="xs"

### Color Scheme
- Background: white cards on gray.50 base
- Primary actions: blue.500
- Destructive actions: red.500
- Success states: green.500
- Warning states: orange.500

## Testing Checklist

- [ ] Search functionality works correctly
- [ ] Stage filter updates deal list
- [ ] All action buttons trigger appropriate handlers
- [ ] Stats calculate correctly
- [ ] Responsive layout works on all screen sizes
- [ ] Mobile touch targets are appropriately sized
- [ ] Empty state displays when no results
- [ ] Probability bars display with correct colors
- [ ] Currency formatting shows properly
- [ ] Date formatting is consistent

## Future Enhancements

1. **Advanced Filtering**
   - Date range filters
   - Value range filters
   - Owner filter
   - Multiple stage selection

2. **Sorting**
   - Sort by value, probability, close date
   - Custom sort orders

3. **Bulk Actions**
   - Select multiple deals
   - Bulk stage updates
   - Bulk delete

4. **Deal Details Modal**
   - Full deal information
   - Activity timeline
   - Related contacts
   - Documents/attachments

5. **Pipeline Visualization**
   - Kanban board view
   - Funnel chart
   - Win rate analytics

6. **Export Functionality**
   - CSV export
   - PDF reports
   - Excel integration

## Related Files

- `src/pages/DealsPage.tsx` - Main page component
- `src/components/deals/DealsTable.tsx` - Table/card layout component
- `src/components/deals/DealsFilters.tsx` - Search and filter component
- `src/components/deals/DealsStats.tsx` - Statistics display component
- `src/components/deals/index.ts` - Barrel export file

## Notes

- Mock data is currently hardcoded in `DealsPage.tsx`
- All action handlers use alerts/confirms for demonstration
- Ready for React Query integration
- Follows the same patterns as CustomersPage for consistency
- Fully type-safe with TypeScript interfaces
