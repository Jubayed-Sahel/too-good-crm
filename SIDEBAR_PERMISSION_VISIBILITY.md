# Sidebar Permission-Based Visibility

## 📋 Overview

All sidebar menu items are now **permission-aware** and will automatically hide/show based on the user's role and assigned permissions. This provides a clean, intuitive interface where employees only see what they have access to.

---

## ✅ What Changed

### **Before:**
- Only "Sales" menu item was permission-aware
- Other menu items (Customers, Activities, Issues, Team) were always visible to employees, even without permissions
- Led to confusion - employees could see menu items but got "Unauthorized" when clicking

### **After:**
- ✅ **ALL menu items** now respect RBAC permissions
- ✅ Menu items automatically **hide** if employee lacks the required permission
- ✅ Menu items automatically **show** when permissions are granted
- ✅ Vendors/Owners always see all menu items (they have full access)

---

## 🎯 Menu Item Permission Mapping

### **Vendor/Employee Menu**
| Menu Item | Icon | Resource | Required Permission | Always Visible |
|-----------|------|----------|-------------------|----------------|
| Dashboard | 🏠 | - | - | ✅ Always shown |
| Customers | 👥 | `customer` | `customer:read` | Only if permission granted |
| Sales | 📈 | `order` | `order:read` | Only if permission granted |
| Activities | 📊 | `activity` | `activity:read` | Only if permission granted |
| Messages | 💬 | - | - | ✅ Always shown |
| Issues | ⚠️ | `issue` | `issue:read` | Only if permission granted |
| Team | 👨‍👩‍👧‍👦 | `employee` | `employee:read` | Only if permission granted |
| Settings | ⚙️ | - | - | ✅ Always shown |

### **Customer/Client Menu**
| Menu Item | Icon | Resource | Required Permission | Always Visible |
|-----------|------|----------|-------------------|----------------|
| Dashboard | 🏠 | - | - | ✅ Always shown |
| My Vendors | 🛍️ | `vendor` | `vendor:read` | Only if permission granted |
| My Orders | 📦 | `order` | `order:read` | Only if permission granted |
| Messages | 💬 | - | - | ✅ Always shown |
| Issues | ⚠️ | `issue` | `issue:read` | Only if permission granted |
| Settings | ⚙️ | - | - | ✅ Always shown |

---

## 🔧 How It Works

### **Permission Check Logic** (`shouldShowMenuItem` function)

```typescript
const shouldShowMenuItem = (item: MenuItem): boolean => {
  // 1. Always show items marked as alwaysShow (Dashboard, Messages, Settings)
  if (item.alwaysShow) {
    return true;
  }

  // 2. Vendors and owners see everything
  if (isVendor || isOwner) {
    return true;
  }

  // 3. If no resource specified, show it
  if (!item.resource) {
    return true;
  }

  // 4. Check permission using hasPermission helper
  const result = hasPermission(item.resource, item.action || 'read');
  return result.hasPermission;
};
```

### **Filtering Logic**

For **employees**, the menu is filtered at render time:

```typescript
const menuItems = useMemo(() => {
  if (profileType === 'employee') {
    // Filter vendor menu by permissions
    return vendorMenuItems.filter(shouldShowMenuItem);
  }
  return vendorMenuItems; // Vendors see all
}, [profileType, permissions]);
```

---

## 🧪 Example Scenarios

### **Scenario 1: Sales Representative Role**

**Permissions Granted:**
```
✅ customer:read, customer:create, customer:update
✅ order:read, order:create, order:update
✅ activity:read, activity:create, activity:update
❌ employee:* (no employee management)
❌ issue:* (no issue access)
```

**Sidebar Visibility:**
```
✅ Dashboard       (always visible)
✅ Customers       (has customer:read)
✅ Sales           (has order:read)
✅ Activities      (has activity:read)
✅ Messages        (always visible)
❌ Issues          (no issue:read - HIDDEN)
❌ Team            (no employee:read - HIDDEN)
✅ Settings        (always visible)
```

---

### **Scenario 2: Customer Support Role**

**Permissions Granted:**
```
✅ customer:read, customer:update
✅ issue:read, issue:create, issue:update
✅ activity:read, activity:create
❌ order:* (no sales access)
❌ employee:* (no employee management)
```

**Sidebar Visibility:**
```
✅ Dashboard       (always visible)
✅ Customers       (has customer:read)
❌ Sales           (no order:read - HIDDEN)
✅ Activities      (has activity:read)
✅ Messages        (always visible)
✅ Issues          (has issue:read)
❌ Team            (no employee:read - HIDDEN)
✅ Settings        (always visible)
```

---

### **Scenario 3: Read-Only Viewer Role**

**Permissions Granted:**
```
✅ customer:read
✅ order:read
✅ activity:read
✅ issue:read
❌ No create/update/delete permissions
```

**Sidebar Visibility:**
```
✅ Dashboard       (always visible)
✅ Customers       (has customer:read)
✅ Sales           (has order:read)
✅ Activities      (has activity:read)
✅ Messages        (always visible)
✅ Issues          (has issue:read)
❌ Team            (no employee:read - HIDDEN)
✅ Settings        (always visible)
```

**Note:** They can VIEW these pages but won't see "Create" or "Edit" buttons (controlled by separate permission checks in each page).

---

### **Scenario 4: No Permissions Assigned**

**Permissions Granted:**
```
❌ No permissions
```

**Sidebar Visibility:**
```
✅ Dashboard       (always visible)
❌ Customers       (HIDDEN)
❌ Sales           (HIDDEN)
❌ Activities      (HIDDEN)
✅ Messages        (always visible)
❌ Issues          (HIDDEN)
❌ Team            (HIDDEN)
✅ Settings        (always visible)
```

**Result:** Employee only sees Dashboard, Messages, and Settings - a minimal interface until permissions are granted.

---

## 🎯 Benefits

### **For Employees:**
- ✅ **Clear interface** - only see what you can access
- ✅ **No confusion** - no "Unauthorized" surprises
- ✅ **Better UX** - streamlined menu focused on their role

### **For Vendors/Admins:**
- ✅ **Easier permission testing** - see immediate visual feedback
- ✅ **Less support burden** - employees won't click on blocked features
- ✅ **Professional appearance** - clean, role-appropriate UI

### **For System:**
- ✅ **Consistent RBAC** - same permission logic across routing, sidebar, and page-level actions
- ✅ **Maintainable** - single source of truth for permissions
- ✅ **Scalable** - easy to add new menu items with permission requirements

---

## 🔧 Adding New Menu Items

To add a new permission-controlled menu item:

```typescript
{
  icon: FiIcon,
  label: 'New Feature',
  path: '/new-feature',
  resource: CRM_RESOURCES.NEW_RESOURCE,  // Resource name
  action: 'read',                         // Required action
  // alwaysShow: true,                    // Omit this to enable permission check
}
```

**Important:**
1. Set `resource` to a valid `CRM_RESOURCES` constant (singular form)
2. Set `action` to the required permission action (usually `'read'`)
3. Do **NOT** set `alwaysShow: true` if you want permission checking
4. For always-visible items (Dashboard, Messages, Settings), set `alwaysShow: true`

---

## 📊 Testing Checklist

### **Step 1: Create a Test Role**
1. Login as vendor
2. Go to **Settings → Team → Roles**
3. Create a new role "test-role"
4. **Don't assign ANY permissions yet**
5. Assign this role to a test employee

### **Step 2: Test Empty Permissions**
1. Login as the test employee
2. Sidebar should only show:
   - ✅ Dashboard
   - ✅ Messages
   - ✅ Settings
3. All other items should be **HIDDEN**

### **Step 3: Grant Permissions One by One**
1. Login as vendor
2. Go to **Settings → Team → Roles**
3. Edit "test-role"
4. Grant **customer:read**
5. Employee logs out and back in
6. **"Customers"** menu item should now be **VISIBLE**

### **Step 4: Continue Testing**
Repeat Step 3 for each permission:
- Grant `order:read` → **"Sales"** appears
- Grant `activity:read` → **"Activities"** appears
- Grant `issue:read` → **"Issues"** appears
- Grant `employee:read` → **"Team"** appears

---

## ✅ Summary

- ✅ **ALL menu items** now respect RBAC permissions
- ✅ Employees see a **clean, role-appropriate** sidebar
- ✅ **No more "Unauthorized" surprises** - what you see is what you can access
- ✅ **Instant visual feedback** when permissions change
- ✅ **Vendors/Owners** always see full menu (they have all permissions)
- ✅ **Dashboard, Messages, Settings** always visible to everyone

**Result:** Professional, intuitive, permission-aware interface! 🎉

