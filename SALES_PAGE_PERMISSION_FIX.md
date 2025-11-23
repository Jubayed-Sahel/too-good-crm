# Sales Page Permission Fix

## 🐛 **Problem**

Employee with only `order:read` permission was seeing ALL action buttons on Sales page:
- ✅ View (should show - has `order:read`) 
- ❌ Edit (should hide - no `order:update`)
- ❌ Delete (should hide - no `order:delete`)
- ❌ Create Lead button (should hide - no `order:create`)

**Root Cause**: The Sales page wasn't checking permissions before rendering action buttons.

---

## ✅ **Solution Applied**

### **File**: `web-frontend/src/pages/SalesPage.tsx`

### **Change 1: Use `order` Permissions (line 771-784)**

**Before:**
```typescript
const leadsPermissions = usePermissionActions('leads');
const canCreateLead = isVendor || leadsPermissions.canCreate;
```

**After:**
```typescript
// Sales page uses 'order' permissions (mapped from sales functionality)
const orderPermissions = usePermissionActions('order');

// For vendors, always allow all actions
// Employees need explicit permissions
const canViewOrder = isVendor || orderPermissions.canRead;
const canCreateOrder = isVendor || orderPermissions.canCreate;
const canUpdateOrder = isVendor || orderPermissions.canUpdate;
const canDeleteOrder = isVendor || orderPermissions.canDelete;
```

---

### **Change 2: Add Permission Props to SortableLeadCard (line 217-238)**

**Before:**
```typescript
interface SortableLeadCardProps {
  lead: Lead;
  // ...other props
  onView?: (lead: Lead) => void;
  onEdit?: (lead: Lead) => void;
  onDelete?: (lead: Lead) => void;
}

function SortableLeadCard({ lead, onView, onEdit, onDelete, ... }: SortableLeadCardProps) {
```

**After:**
```typescript
interface SortableLeadCardProps {
  lead: Lead;
  // ...other props
  onView?: (lead: Lead) => void;
  onEdit?: (lead: Lead) => void;
  onDelete?: (lead: Lead) => void;
  // Permission flags
  canView?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
}

function SortableLeadCard({ 
  lead, onView, onEdit, onDelete, 
  canView = true, canEdit = true, canDelete = true, // defaults for vendors
  ... 
}: SortableLeadCardProps) {
```

---

### **Change 3: Conditionally Render Action Buttons (line 327-398)**

**Before:**
```typescript
{onView && (
  <Button onClick={() => onView(lead)}>
    <FiEye />
  </Button>
)}
{onEdit && (
  <Button onClick={() => onEdit(lead)}>
    <FiEdit />
  </Button>
)}
{onDelete && (
  <Button onClick={() => onDelete(lead)}>
    <FiTrash2 />
  </Button>
)}
```

**After:**
```typescript
{/* Only show buttons if user has permission AND callback provided */}
{onView && canView && (
  <Button onClick={() => onView(lead)}>
    <FiEye />
  </Button>
)}
{onEdit && canEdit && (
  <Button onClick={() => onEdit(lead)}>
    <FiEdit />
  </Button>
)}
{onDelete && canDelete && (
  <Button onClick={() => onDelete(lead)}>
    <FiTrash2 />
  </Button>
)}
```

---

### **Change 4: Pass Permission-Based Handlers to StageColumn (line 1870-1883)**

**Before:**
```typescript
<StageColumn
  onLeadView={handleViewLead}
  onLeadEdit={handleEditLead}
  onLeadDelete={handleDeleteLead}
  ...
/>
```

**After:**
```typescript
<StageColumn
  onLeadView={canViewOrder ? handleViewLead : undefined}
  onLeadEdit={canUpdateOrder ? handleEditLead : undefined}
  onLeadDelete={canDeleteOrder ? handleDeleteLead : undefined}
  ...
/>
```

**Result**: If employee doesn't have permission, the handler is `undefined`, so the button won't render.

---

### **Change 5: Pass Permission Flags to SortableLeadCard (line 754-766)**

**Before:**
```typescript
<SortableLeadCard
  onView={onLeadView}
  onEdit={onLeadEdit}
  onDelete={onLeadDelete}
/>
```

**After:**
```typescript
<SortableLeadCard
  onView={onLeadView}
  onEdit={onLeadEdit}
  onDelete={onLeadDelete}
  canView={onLeadView !== undefined}
  canEdit={onLeadEdit !== undefined}
  canDelete={onLeadDelete !== undefined}
/>
```

**Result**: Permission flags are derived from whether handlers exist.

---

### **Change 6: Hide Create Lead Button Without Permission (line 1786)**

**Before:**
```typescript
{canCreateLead && (
  <Button onClick={handleOpenDialog}>
    Create Lead
  </Button>
)}
```

**After:**
```typescript
{canCreateOrder && (
  <Button onClick={handleOpenDialog}>
    Create Lead
  </Button>
)}
```

---

## 🧪 **Testing**

### **Scenario 1: Employee with `order:read` ONLY**

1. Login as employee with role that has:
   - ✅ `order:read`
   - ❌ No `order:create`, `order:update`, `order:delete`

2. Navigate to `/sales`

3. **Expected Result**:
   - ✅ Can see leads/deals
   - ✅ Can click View button (👁️)
   - ❌ **Edit button hidden** (no ✏️)
   - ❌ **Delete button hidden** (no 🗑️)
   - ❌ **"Create Lead" button hidden**

---

### **Scenario 2: Employee with `order:read` and `order:update`**

1. Grant employee role:
   - ✅ `order:read`
   - ✅ `order:update`

2. Navigate to `/sales`

3. **Expected Result**:
   - ✅ Can see leads/deals
   - ✅ View button visible (👁️)
   - ✅ **Edit button visible** (✏️)
   - ❌ **Delete button hidden** (no 🗑️)
   - ❌ **"Create Lead" button hidden**

---

### **Scenario 3: Vendor (Owner)**

1. Login as vendor/owner

2. Navigate to `/sales`

3. **Expected Result**:
   - ✅ Can see leads/deals
   - ✅ View button visible (👁️)
   - ✅ **Edit button visible** (✏️)
   - ✅ **Delete button visible** (🗑️)
   - ✅ **"Create Lead" button visible**

---

## 📊 **Permission → Button Mapping**

| Permission | Button | Action |
|-----------|--------|--------|
| `order:read` | 👁️ View | Navigate to lead detail page |
| `order:update` | ✏️ Edit | Navigate to lead edit page |
| `order:delete` | 🗑️ Delete | Delete lead (with confirmation) |
| `order:create` | ➕ Create Lead | Open create lead dialog |

---

## 🎯 **Key Principles Applied**

1. **Check Permissions at Component Level**: Don't just check on routes - also check before rendering action buttons
2. **Use Correct Resource Name**: Sales = `order` (not `leads`)
3. **Conditional Handler Passing**: Pass `undefined` instead of handler if no permission
4. **Defensive UI**: If handler is `undefined`, don't render the button at all

---

## ✅ **Status: FIXED**

All action buttons now respect RBAC permissions. Employees only see buttons for actions they're permitted to perform.

**Test this now!** 🚀

