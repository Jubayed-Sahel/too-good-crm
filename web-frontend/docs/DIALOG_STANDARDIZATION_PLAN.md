# Dialog Standardization Plan

## Goal
Standardize all "Create" and "Add" buttons across the vendor side to use the same styled popup dialog pattern as the Customer creation dialog.

## Current State Analysis

### ✅ Already Using Proper Dialog Pattern:
1. **Customers** - `CreateCustomerDialog` ✅
   - Location: `components/customers/CreateCustomerDialog.tsx`
   - Trigger: "Add Customer" button in CustomerFilters
   - Status: Perfect reference implementation

2. **Leads** - `CreateLeadDialog` ✅
   - Location: `components/leads/CreateLeadDialog.tsx`
   - Trigger: "Add Lead" button in LeadFilters
   - Status: Already properly styled

3. **Deals** - `CreateDealDialog` ✅
   - Location: `components/deals/CreateDealDialog.tsx`
   - Trigger: "Add Deal" button in DealsFilters
   - Status: Already properly styled

4. **Roles & Permissions** - RolesSettings Dialog ✅
   - Location: `components/settings/RolesSettings.tsx`
   - Trigger: "Create Role" button
   - Status: Already using DialogRoot properly

### ❌ Needs Dialog Implementation:

5. **Activities** - Currently uses inline form or menu
   - Location: `components/activities/ActivityTypeMenu.tsx`
   - Issue: Uses a menu for activity type selection, needs proper dialog
   - Required: Create `CreateActivityDialog.tsx`

6. **Client Issues** - Uses inline form
   - Location: `pages/ClientIssuesPage.tsx`
   - Issue: Form is embedded in the page (lines 230-340)
   - Required: Extract to `CreateIssueDialog.tsx`

7. **Employees** - Needs investigation
   - Location: `pages/EmployeesPage.tsx` or similar
   - Status: Need to check if dialog exists

8. **Orders** - Needs investigation
   - Location: `pages/OrdersPage.tsx` or similar
   - Status: Need to check if exists

9. **Payments** - Needs investigation
   - Location: `pages/PaymentsPage.tsx` or similar
   - Status: Need to check if exists

## Standard Dialog Pattern (from CreateCustomerDialog)

### Structure:
```tsx
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  DialogActionTrigger,
  DialogCloseTrigger,
} from '../ui/dialog';

<DialogRoot 
  open={isOpen} 
  onOpenChange={(details) => !details.open && handleClose()} 
  size={{ base: 'full', md: 'lg' }}
>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>
        <HStack gap={2}>
          <IconComponent size={20} />
          <Text>Create New [Entity]</Text>
        </HStack>
      </DialogTitle>
      <DialogCloseTrigger />
    </DialogHeader>

    <DialogBody>
      <VStack gap={4} align="stretch">
        {/* Form fields */}
      </VStack>
    </DialogBody>

    <DialogFooter>
      <DialogActionTrigger asChild>
        <Button variant="outline" onClick={handleClose}>
          Cancel
        </Button>
      </DialogActionTrigger>
      <Button
        colorPalette="purple"
        onClick={handleSubmit}
        disabled={!isFormValid || isLoading}
        loading={isLoading}
      >
        Create [Entity]
      </Button>
    </DialogFooter>
  </DialogContent>
</DialogRoot>
```

### Key Features:
1. **Responsive size**: `size={{ base: 'full', md: 'lg' }}` - Full screen on mobile, large on desktop
2. **Icon in title**: Visual indicator with entity-specific icon
3. **Purple color palette**: `colorPalette="purple"` for consistency
4. **Form validation**: Disable submit if form invalid
5. **Loading state**: Button shows loading spinner during submission
6. **Clean close**: Reset form data on close
7. **Simple Grid layout**: Use `SimpleGrid columns={{ base: 1, md: 2 }}` for two-column forms

## Implementation Priority

### Phase 1: Critical (No Dialog)
1. ✅ Activities - Create `CreateActivityDialog.tsx`
2. ✅ Client Issues - Create `CreateIssueDialog.tsx`

### Phase 2: Audit & Improve
3. Review Employees page
4. Review Orders page  
5. Review Payments page

### Phase 3: Consistency Check
6. Verify all dialogs use same:
   - Size prop
   - Color palette (purple)
   - Icon in title
   - Footer button layout
   - Form validation pattern

## Files to Create/Modify

### New Files:
- `web-frontend/src/components/activities/CreateActivityDialog.tsx`
- `web-frontend/src/components/client-issues/CreateIssueDialog.tsx`

### Files to Modify:
- `web-frontend/src/pages/ClientIssuesPage.tsx` - Extract inline form
- `web-frontend/src/components/activities/ActivityTypeMenu.tsx` - Convert to dialog

## Next Steps
1. Create CreateActivityDialog component
2. Create CreateIssueDialog component
3. Update ClientIssuesPage to use dialog
4. Update ActivityTypeMenu/pages to use dialog
5. Audit other pages for consistency
6. Test all dialogs for responsive behavior
7. Ensure all use purple color palette
8. Verify loading states work correctly
