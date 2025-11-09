# Design Consistency Guide

## Phase 1: Design Consistency Standards

### Button Patterns

#### Page Header Buttons
- **Primary Action**: One primary button in PageHeader (Create/Add/New)
  - Variant: `primary`
  - Icon: `FiPlus` (or relevant icon)
  - Text: "Add Customer", "New Deal", "Create Issue", etc.
  - Component: `StandardButton`

- **Secondary Actions**: Refresh, Export, etc.
  - Variant: `secondary`
  - Icon: Relevant icon (e.g., `FiRefreshCw`)
  - Component: `StandardButton`

#### Table Row Actions
- **View/Edit/Delete**: Icon buttons in table rows
  - Component: `IconButton` (Chakra UI)
  - Size: `sm`
  - Variant: `ghost` or `outline`

#### Bulk Actions
- **Export/Delete**: Buttons in bulk actions bar
  - Component: `Button` (Chakra UI)
  - Size: `sm`
  - Variant: `outline` or `solid`

### Page Layout Pattern

All pages should follow this structure:
```
DashboardLayout
  └── VStack (gap={5})
      ├── PageHeader
      │   ├── title
      │   ├── description
      │   └── actions (StandardButton)
      ├── Stats Cards/Grid
      ├── Filters
      ├── Table/Content
      └── Dialogs/Modals
```

### Standardized Components

1. **PageHeader**: Always use `PageHeader` component
2. **StandardButton**: Use for page-level actions
3. **StandardCard**: Use for stat cards
4. **ConfirmDialog**: Use for delete confirmations

### Button Naming Conventions

- **Create/Add/New**: For creating new entities
  - "Add Customer"
  - "New Deal"
  - "Create Issue"
  - "New Lead"
  - "New Activity"
  - "Invite Employee"

- **Actions**: Use action verbs
  - "Refresh"
  - "Export"
  - "Delete"
  - "Edit"
  - "View"

### Removed Redundancies

1. **IssuesPage**: Removed redundant "Raise Issue" button
   - Only "Create Issue" button remains (for vendor/employee)
   - "Raise Issue" is for customers (ClientIssuesPage)

2. **Consistent Button Placement**:
   - Primary action: PageHeader actions
   - Secondary actions: Table row actions
   - Bulk actions: Bulk actions bar

### Pages Standardized

- ✅ CustomersPage: "Add Customer" button
- ✅ DealsPage: "New Deal" button
- ✅ LeadsPage: "New Lead" button
- ✅ IssuesPage: "Create Issue" button (fixed)
- ✅ ActivitiesPage: "New Activity" button
- ✅ EmployeesPage: "Invite Employee" button

### Next Steps

1. Ensure all buttons have working functionality
2. Standardize table action buttons
3. Create consistent empty states
4. Standardize error states

