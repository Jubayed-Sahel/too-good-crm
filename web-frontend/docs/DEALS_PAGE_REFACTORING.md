# DealsPage Refactoring - Separation of Concerns

## Overview

The DealsPage has been refactored to follow **proper separation of concerns** using the **Container/Presenter pattern** and **custom hooks** for business logic.

---

## Architecture

### Before Refactoring ❌

```
DealsPage.tsx (270 lines)
├── Data fetching logic
├── State management (filters, dialogs)
├── Business logic (filtering, stats calculation)
├── Data transformation (API → UI format)
├── Action handlers (CRUD operations)
└── UI rendering (JSX)
```

**Problems**:
- ❌ Single massive component (270 lines)
- ❌ Mixed concerns (data, logic, UI)
- ❌ Hard to test individual pieces
- ❌ Difficult to reuse logic
- ❌ Poor maintainability

---

### After Refactoring ✅

```
DealsPage.tsx (80 lines) - Container Component
├── Uses: useDeals() - Data fetching
├── Uses: useDealsPage() - State & filtering
├── Uses: useDealActions() - CRUD operations
└── Renders: DealsPageContent - Presentation

Custom Hooks:
├── useDeals.ts - Data fetching from API
├── useDealsPage.ts - Page state & filtering logic
└── useDealActions.ts - Create/Update/Delete operations

Presentation Components:
├── DealsPageContent.tsx - Main UI layout
└── DealsPageLoading.tsx - Loading state
```

**Benefits**:
- ✅ Single Responsibility Principle
- ✅ Easy to test (hooks can be tested in isolation)
- ✅ Reusable logic (hooks can be used elsewhere)
- ✅ Better maintainability (small, focused files)
- ✅ Clear separation of concerns

---

## File Structure

### 1. **DealsPage.tsx** - Container Component (80 lines)

**Responsibilities**:
- Compose hooks together
- Pass props to presentation components
- No business logic
- No UI implementation details

```typescript
const DealsPage = () => {
  // Data fetching
  const { deals, isLoading, refetch } = useDeals({ page_size: 1000 });
  
  // State management
  const { mappedDeals, stats, ... } = useDealsPage(deals);
  
  // Actions
  const { handleEditDeal, ... } = useDealActions({ onSuccess: refetch });

  return <DealsPageContent {...allProps} />;
};
```

---

### 2. **useDealsPage.ts** - State Management Hook

**Responsibilities**:
- Filter state (search, stage filter)
- Dialog state (create, edit)
- Data transformation (API → UI format)
- Statistics calculation
- Route state handling (openNewDeal)

**Key Functions**:
```typescript
export const useDealsPage = (deals: Deal[]): UseDealsPageReturn => {
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  
  // Computed values
  const filteredDeals = useMemo(() => { /* filtering logic */ }, [deals, searchQuery, stageFilter]);
  const stats = useMemo(() => { /* statistics calculation */ }, [deals]);
  const mappedDeals = useMemo(() => { /* data transformation */ }, [filteredDeals]);
  
  return { searchQuery, setSearchQuery, filteredDeals, mappedDeals, stats, ... };
};
```

**Benefits**:
- ✅ All filtering logic in one place
- ✅ Memoized calculations for performance
- ✅ Easy to test filtering independently
- ✅ Can be reused in other components

---

### 3. **useDealActions.ts** - CRUD Operations Hook

**Responsibilities**:
- Create deal
- Update deal
- Delete deal
- View deal navigation
- Edit dialog state management
- Error handling
- Success callbacks

**Key Functions**:
```typescript
export const useDealActions = ({ onSuccess }: UseDealActionsProps): UseDealActionsReturn => {
  const [selectedDeal, setSelectedDeal] = useState<EditDealData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleUpdateDeal = async (data: EditDealData) => {
    try {
      setIsSubmitting(true);
      await dealService.updateDeal(dealId, data);
      alert('Deal updated successfully!');
      onSuccess?.();
    } catch (error) {
      alert('Error updating deal');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return { handleEditDeal, handleUpdateDeal, handleDeleteDeal, ... };
};
```

**Benefits**:
- ✅ All CRUD operations centralized
- ✅ Consistent error handling
- ✅ Loading state management
- ✅ Easy to add new operations
- ✅ Can be tested with mocked services

---

### 4. **DealsPageContent.tsx** - Presentation Component

**Responsibilities**:
- Pure UI rendering
- No business logic
- Receives all data/handlers as props
- Stateless

```typescript
export const DealsPageContent: React.FC<DealsPageContentProps> = ({
  mappedDeals,
  stats,
  searchQuery,
  onSearchChange,
  onEditDeal,
  ...
}) => {
  return (
    <VStack>
      <DealsStats totalDeals={stats.total} ... />
      <DealsFilters searchQuery={searchQuery} onSearchChange={onSearchChange} ... />
      <DealsTable deals={mappedDeals} onEdit={onEditDeal} ... />
    </VStack>
  );
};
```

**Benefits**:
- ✅ Easy to test (just props in, JSX out)
- ✅ Can be used in Storybook
- ✅ No side effects
- ✅ Clear prop interface

---

### 5. **DealsPageLoading.tsx** - Loading State Component

**Responsibilities**:
- Display loading spinner
- Pure presentation

```typescript
export const DealsPageLoading: React.FC = () => {
  return (
    <Box>
      <Spinner size="xl" />
      <Text>Loading deals...</Text>
    </Box>
  );
};
```

---

## Separation of Concerns Breakdown

### Layer 1: Data Fetching
```
useDeals hook (from useDeals.ts)
├── API calls via dealService
├── Loading state
├── Error handling
└── Pagination data
```

### Layer 2: Business Logic
```
useDealsPage hook
├── Filtering (search, stage)
├── Statistics calculation
├── Data transformation
└── Dialog state

useDealActions hook
├── CRUD operations
├── Navigation
├── Confirmation dialogs
└── Success/error feedback
```

### Layer 3: Presentation
```
DealsPageContent component
├── Layout
├── Component composition
└── Event delegation

DealsPageLoading component
├── Loading UI
```

### Layer 4: Container
```
DealsPage
├── Orchestrates all layers
├── Connects hooks to components
└── Minimal logic
```

---

## Testing Strategy

### Unit Testing Hooks

**Test useDealsPage**:
```typescript
describe('useDealsPage', () => {
  it('filters deals by search query', () => {
    const { result } = renderHook(() => useDealsPage(mockDeals));
    
    act(() => {
      result.current.setSearchQuery('Acme');
    });
    
    expect(result.current.filteredDeals).toHaveLength(2);
  });
  
  it('calculates statistics correctly', () => {
    const { result } = renderHook(() => useDealsPage(mockDeals));
    
    expect(result.current.stats.total).toBe(10);
    expect(result.current.stats.won).toBe(3);
  });
});
```

**Test useDealActions**:
```typescript
describe('useDealActions', () => {
  it('calls onSuccess after update', async () => {
    const onSuccess = jest.fn();
    const { result } = renderHook(() => useDealActions({ onSuccess }));
    
    await act(async () => {
      await result.current.handleUpdateDeal(mockDeal);
    });
    
    expect(onSuccess).toHaveBeenCalled();
  });
});
```

### Component Testing

**Test DealsPageContent**:
```typescript
describe('DealsPageContent', () => {
  it('renders stats correctly', () => {
    render(<DealsPageContent stats={{ total: 10, active: 7, won: 3, totalValue: 50000 }} ... />);
    
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('$50,000')).toBeInTheDocument();
  });
  
  it('calls onEditDeal when edit clicked', () => {
    const onEditDeal = jest.fn();
    render(<DealsPageContent onEditDeal={onEditDeal} ... />);
    
    fireEvent.click(screen.getByText('Edit'));
    
    expect(onEditDeal).toHaveBeenCalled();
  });
});
```

---

## Code Metrics

### Before vs After

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Main component lines | 270 | 80 | -70% |
| Number of files | 1 | 5 | Better organization |
| Testable units | 1 | 5 | +400% |
| Reusable hooks | 0 | 3 | ♾️ |
| Cyclomatic complexity | High | Low | Much simpler |

### File Sizes

| File | Lines | Purpose |
|------|-------|---------|
| `DealsPage.tsx` | 80 | Container |
| `useDealsPage.ts` | 150 | State & filtering |
| `useDealActions.ts` | 160 | CRUD operations |
| `DealsPageContent.tsx` | 120 | Presentation |
| `DealsPageLoading.tsx` | 15 | Loading state |

**Total**: 525 lines (vs 270 before)
- But now **highly maintainable and testable**
- Each piece has **single responsibility**
- Logic is **reusable**

---

## Benefits Achieved

### 1. **Single Responsibility Principle** ✅
Each file/hook has one clear purpose:
- `useDeals` → Data fetching
- `useDealsPage` → Filtering & state
- `useDealActions` → CRUD operations
- `DealsPageContent` → UI rendering

### 2. **Testability** ✅
- Hooks can be tested with `renderHook()`
- Components can be tested with `render()`
- No need to mount entire page for unit tests

### 3. **Reusability** ✅
- `useDealActions` can be used in DealDetailPage
- `useDealsPage` filtering logic can be reused
- Components can be used in different contexts

### 4. **Maintainability** ✅
- Easy to find code (clear file structure)
- Easy to modify (small, focused files)
- Easy to extend (add new hooks/components)

### 5. **Performance** ✅
- Memoized calculations in hooks
- Prevent unnecessary re-renders
- Optimized filtering logic

---

## Migration Guide

### For Other Pages

To refactor other pages with the same pattern:

1. **Extract Data Fetching**:
   ```typescript
   const { data, isLoading, refetch } = useYourDataHook();
   ```

2. **Extract Business Logic**:
   ```typescript
   const { filteredData, stats, ... } = useYourPageHook(data);
   ```

3. **Extract Actions**:
   ```typescript
   const { handleCreate, handleUpdate, handleDelete } = useYourActionsHook({ onSuccess: refetch });
   ```

4. **Create Presentation Component**:
   ```typescript
   <YourPageContent data={filteredData} stats={stats} onEdit={handleUpdate} ... />
   ```

---

## Next Steps

### Recommended Improvements

1. **Add Error Boundary**:
   ```typescript
   <ErrorBoundary fallback={<ErrorPage />}>
     <DealsPage />
   </ErrorBoundary>
   ```

2. **Add React Query** (instead of manual data fetching):
   ```typescript
   const { data, isLoading } = useQuery(['deals'], dealService.getDeals);
   ```

3. **Add Toast Notifications** (instead of alerts):
   ```typescript
   toast.success('Deal updated successfully!');
   ```

4. **Add Loading States** (for mutations):
   ```typescript
   <Button isLoading={isSubmitting}>Update Deal</Button>
   ```

5. **Add Optimistic Updates**:
   ```typescript
   queryClient.setQueryData(['deals'], (old) => [...old, newDeal]);
   ```

---

## Conclusion

The DealsPage refactoring demonstrates **proper separation of concerns** by:

✅ Separating **data**, **logic**, and **presentation**  
✅ Using **custom hooks** for business logic  
✅ Following **Container/Presenter pattern**  
✅ Making code **testable** and **reusable**  
✅ Improving **maintainability** and **scalability**

This pattern should be applied to **all pages** in the application for consistency and code quality.
