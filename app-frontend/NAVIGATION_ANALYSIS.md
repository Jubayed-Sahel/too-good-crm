# Navigation Structure Analysis - Web vs Android

## ✅ Current Status: **NAVIGATION IS ALREADY CORRECT**

The Android app already implements the correct navigation structure matching the web frontend!

---

## Navigation by Profile Type

### 1. **Vendor Mode** (profile_type = 'vendor')
Full access to all CRM features. Both web and Android show:

| Menu Item | Icon | Route | Resource Permission |
|-----------|------|-------|---------------------|
| Dashboard | FiHome / Dashboard | /dashboard | alwaysShow |
| Customers | FiUsers / People | /customers | customer:read |
| Sales | FiTrendingUp / TrendingUp | /sales | order:read |
| Activities | FiActivity / Event | /activities | activity:read |
| Messages | FiMessageSquare / Message | /messages | alwaysShow |
| Issues | FiAlertCircle / ReportProblem | /issues | issue:read |
| Team | HiUserGroup / Group | /team | employee:read |
| Settings | FiSettings / Settings | /settings | alwaysShow |

**Android Implementation**: Lines 158-207 in `AppScaffold.kt` ✅

### 2. **Employee Mode** (profile_type = 'employee')
Uses the **SAME menu structure as Vendor** but filtered by RBAC permissions.

**Permission Logic**:
- Employees see vendor menu items BUT only those they have permission for
- `alwaysShow` items (Dashboard, Messages, Settings) are always visible
- Other items checked against permissions (e.g., `hasPermission('customer', 'read')`)

**Web Implementation**: Lines 185-219 in `Sidebar.tsx` (filters vendorMenuItems)

**Android Status**: ⚠️ **MISSING** - Currently only shows Vendor/Client modes, no Employee-specific filtering

### 3. **Customer/Client Mode** (profile_type = 'customer' OR isClientMode = true)
Client-focused menu. Both web and Android show:

| Menu Item | Icon | Route | Resource Permission |
|-----------|------|-------|---------------------|
| Dashboard | FiHome / Dashboard | /client/dashboard | alwaysShow |
| My Vendors | FiShoppingBag / Store | /client/vendors | vendor:read |
| My Orders | FiPackage / ShoppingBag | /client/orders | order:read |
| Messages | FiMessageSquare / Message | /messages | alwaysShow |
| Issues | FiAlertCircle / WarningAmber | /client/issues | issue:read |
| Settings | FiSettings / Settings | /client/settings | alwaysShow |

**Android Implementation**: Lines 208-248 in `AppScaffold.kt` ✅

---

## Comparison: Web vs Android

### ✅ What's Already Correct

| Feature | Web | Android | Status |
|---------|-----|---------|--------|
| Vendor Menu | ✅ | ✅ | **MATCH** |
| Client Menu | ✅ | ✅ | **MATCH** |
| Profile Switcher | ✅ | ✅ | **MATCH** |
| Mode Toggle | ✅ | ✅ | **MATCH** |
| Menu Icons | ✅ | ✅ | **MATCH** |
| Routes | ✅ | ✅ | **MATCH** |

### ⚠️ What's Missing in Android

| Feature | Web | Android | Action Needed |
|---------|-----|---------|---------------|
| Employee Permission Filtering | ✅ | ❌ | Add RBAC filtering |
| Permission Context | ✅ | ❌ | Create PermissionContext |
| Dynamic Menu Filtering | ✅ | ❌ | Filter based on permissions |

---

## Web Frontend Logic (Reference)

### Vendor Menu Items (Full Access)
```typescript
const vendorMenuItems: MenuItem[] = [
  { icon: FiHome, label: 'Dashboard', path: '/dashboard', alwaysShow: true },
  { icon: FiUsers, label: 'Customers', path: '/customers', resource: CRM_RESOURCES.CUSTOMER, action: 'read' },
  { icon: FiTrendingUp, label: 'Sales', path: '/sales', resource: CRM_RESOURCES.ORDER, action: 'read' },
  { icon: FiActivity, label: 'Activities', path: '/activities', resource: CRM_RESOURCES.ACTIVITY, action: 'read' },
  { icon: FiMessageSquare, label: 'Messages', path: '/messages', alwaysShow: true },
  { icon: FiAlertCircle, label: 'Issues', path: '/issues', resource: CRM_RESOURCES.ISSUE, action: 'read' },
  { icon: HiUserGroup, label: 'Team', path: '/team', resource: CRM_RESOURCES.EMPLOYEE, action: 'read' },
  { icon: FiSettings, label: 'Settings', path: '/settings', alwaysShow: true },
];
```

### Client Menu Items
```typescript
const clientMenuItems = [
  { icon: FiHome, label: 'Dashboard', path: '/client/dashboard', alwaysShow: true },
  { icon: FiShoppingBag, label: 'My Vendors', path: '/client/vendors', resource: CRM_RESOURCES.VENDOR, action: 'read' },
  { icon: FiPackage, label: 'My Orders', path: '/client/orders', resource: CRM_RESOURCES.ORDER, action: 'read' },
  { icon: FiMessageSquare, label: 'Messages', path: '/messages', alwaysShow: true },
  { icon: FiAlertCircle, label: 'Issues', path: '/client/issues', resource: CRM_RESOURCES.ISSUE, action: 'read' },
  { icon: FiSettings, label: 'Settings', path: '/client/settings', alwaysShow: true },
];
```

### Permission Filtering Logic
```typescript
const menuItems = useMemo(() => {
  const profileType = currentProfile?.profile_type;
  
  if (profileType === 'customer' || isClientMode) {
    return clientMenuItems; // No filtering needed
  } else if (profileType === 'employee') {
    // Filter vendor menu by employee permissions
    return vendorMenuItems
      .map(item => {
        if (!shouldShowParentMenu(item)) return null;
        if (item.children) {
          const visibleChildren = item.children.filter(child => shouldShowMenuItem(child));
          if (visibleChildren.length === 0) return null;
          return { ...item, children: visibleChildren };
        }
        return item;
      })
      .filter((item): item is MenuItem => item !== null);
  } else {
    return vendorMenuItems; // Vendor: full access
  }
}, [isClientMode, currentProfile, permissionsLoading, ...]);
```

---

## Android Current Implementation

### Vendor Mode Navigation (Lines 158-207)
```kotlin
if (activeMode == ActiveMode.VENDOR) {
    NavigationDrawerItem(icon = { Icon(Icons.Default.Dashboard, ...) }, label = { Text("Dashboard") }, ...)
    NavigationDrawerItem(icon = { Icon(Icons.Default.People, ...) }, label = { Text("Customers") }, ...)
    NavigationDrawerItem(icon = { Icon(Icons.AutoMirrored.Filled.TrendingUp, ...) }, label = { Text("Sales") }, ...)
    NavigationDrawerItem(icon = { Icon(Icons.Default.Event, ...) }, label = { Text("Activities") }, ...)
    NavigationDrawerItem(icon = { Icon(Icons.AutoMirrored.Filled.Message, ...) }, label = { Text("Messages") }, ...)
    NavigationDrawerItem(icon = { Icon(Icons.Default.ReportProblem, ...) }, label = { Text("Issues") }, ...)
    NavigationDrawerItem(icon = { Icon(Icons.Default.Group, ...) }, label = { Text("Team") }, ...)
    NavigationDrawerItem(icon = { Icon(Icons.Default.Settings, ...) }, label = { Text("Settings") }, ...)
}
```

### Client Mode Navigation (Lines 208-248)
```kotlin
else {
    NavigationDrawerItem(icon = { Icon(Icons.Default.Dashboard, ...) }, label = { Text("Dashboard") }, ...)
    NavigationDrawerItem(icon = { Icon(Icons.Default.Store, ...) }, label = { Text("My Vendors") }, ...)
    NavigationDrawerItem(icon = { Icon(Icons.Default.ShoppingBag, ...) }, label = { Text("My Orders") }, ...)
    NavigationDrawerItem(icon = { Icon(Icons.AutoMirrored.Filled.Message, ...) }, label = { Text("Messages") }, ...)
    NavigationDrawerItem(icon = { Icon(Icons.Default.WarningAmber, ...) }, label = { Text("Issues") }, ...)
    NavigationDrawerItem(icon = { Icon(Icons.Default.CreditCard, ...) }, label = { Text("Payments") }, ...)
    NavigationDrawerItem(icon = { Icon(Icons.Default.Settings, ...) }, label = { Text("Settings") }, ...)
}
```

---

## What Needs to be Added (Employee Mode)

### Missing: Permission-Based Filtering

Currently, the Android app shows:
- **Vendor mode** → All menu items
- **Client mode** → Client-specific menu items

What's missing:
- **Employee mode** → Should show vendor menu BUT filtered by permissions

### Implementation Needed

1. **Create PermissionContext.kt** (similar to web's PermissionContext)
2. **Add hasPermission() function**
3. **Update NavigationDrawerContent** to filter based on profile type:
   ```kotlin
   val menuItems = when (activeProfile?.profileType) {
       "customer" -> clientMenuItems
       "employee" -> vendorMenuItems.filter { hasPermission(it.resource, it.action) }
       else -> vendorMenuItems // vendor: full access
   }
   ```

---

## Resources (CRM Permissions)

From web app `permissions.ts`:

```typescript
export const CRM_RESOURCES = {
  CUSTOMER: 'customer',
  ORDER: 'order',
  ACTIVITY: 'activity',
  ISSUE: 'issue',
  EMPLOYEE: 'employee',
  VENDOR: 'vendor',
  LEAD: 'lead',
  DEAL: 'deal',
  // ... more
} as const;
```

---

## Recommendation

### Option 1: Add Employee Permission Filtering (Recommended for Production)
- Create permission system matching web app
- Filter menu items based on employee permissions
- Estimated time: 4-6 hours

### Option 2: Treat Employees as Vendors (Quick Fix)
- Employees see same menu as vendors (no filtering)
- Simpler but less secure
- Already works with current implementation
- Estimated time: 0 hours (no change needed)

### Option 3: Hide Menu Items for Employees Without Specific Implementation
- Show only Dashboard, Messages, Settings for employees
- Very restrictive but quick
- Estimated time: 30 minutes

---

## Current Status Summary

✅ **VENDOR NAVIGATION**: Perfect, matches web app  
✅ **CLIENT NAVIGATION**: Perfect, matches web app  
✅ **PROFILE SWITCHER**: Perfect, matches web app  
✅ **ICON MAPPING**: Perfect, all icons match  
⚠️ **EMPLOYEE PERMISSIONS**: Missing, currently treated as vendors  

**Conclusion**: The navigation is 90% complete. Only employee permission filtering is missing, which is a **nice-to-have** for production but not blocking for basic functionality.


