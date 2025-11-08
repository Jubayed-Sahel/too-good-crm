# Multi-Profile System Implementation Guide

## 🎯 Understanding the System

### The Scenario:

**admin@crm.com** (User A):
- **Vendor Profile**: Owner of "Admin CRM Org" → Full access to own organization
- **Employee Profile**: Employee at "New Org" (me@me.com's org) → Limited access based on assigned role

**me@me.com** (User B):
- **Vendor Profile**: Owner of "New Org" → Full access to own organization, can see admin@crm.com as employee
- **Employee Profile**: Not an employee anywhere → No data to show

## ✅ What Has Been Implemented

### 1. Profile Context System (`contexts/ProfileContext.tsx`)
- Manages user's multiple profiles (vendor, employee, customer)
- Tracks active profile
- Provides organization context based on active profile
- Persists profile selection in localStorage

### 2. Profile Switcher Component (`components/profile/ProfileSwitcher.tsx`)
- Dropdown showing all user profiles
- Groups by type (Vendor/Employee/Customer)
- Shows organization name and role/owner status
- Allows switching between profiles
- Reloads page to refresh all data with new context

## 📋 Implementation Steps

### Step 1: Wrap App with ProfileProvider

```tsx
// In App.tsx or main.tsx
import { ProfileProvider } from '@/contexts/ProfileContext';

<AuthProvider>
  <ProfileProvider>
    <App />
  </ProfileProvider>
</AuthProvider>
```

### Step 2: Add Profile Switcher to TopBar

```tsx
// In components/layout/TopBar.tsx
import { ProfileSwitcher } from '@/components/profile/ProfileSwitcher';

function TopBar() {
  return (
    <Header>
      {/* Other items */}
      <ProfileSwitcher />
      <UserMenu />
    </Header>
  );
}
```

### Step 3: Filter Data by Active Organization

```tsx
// In any page/component
import { useProfile } from '@/contexts/ProfileContext';

function CustomersPage() {
  const { activeOrganizationId, activeProfileType } = useProfile();
  
  // Fetch customers for active organization only
  const { customers } = useCustomers({
    organization: activeOrganizationId
  });
  
  return (
    <>
      {activeProfileType === 'vendor' && <VendorView />}
      {activeProfileType === 'employee' && <EmployeeView />}
    </>
  );
}
```

### Step 4: Update API Calls to Include Organization Filter

```tsx
// Update hooks to use active organization
import { useProfile } from '@/contexts/ProfileContext';

export const useCustomers = () => {
  const { activeOrganizationId } = useProfile();
  
  const fetchCustomers = async () => {
    const response = await api.get('/customers/', {
      params: { organization: activeOrganizationId }
    });
    return response;
  };
  
  // ...
};
```

### Step 5: Update Permission Hook to Use Active Organization

```tsx
// In hooks/usePermissions.ts
import { useProfile } from '@/contexts/ProfileContext';

export const usePermissions = () => {
  const { activeOrganizationId } = useProfile();
  
  // Use activeOrganizationId instead of primaryOrganizationId
  const fetchPermissions = async () => {
    if (!activeOrganizationId) return;
    
    const data = await api.get(
      `/user-context/permissions/?organization=${activeOrganizationId}`
    );
    // ...
  };
};
```

## 🔄 How It Works

### Scenario 1: admin@crm.com Logs In

**Initial State:**
- System loads all profiles for admin@crm.com
- Finds 2 profiles:
  1. Vendor profile (owner of "Admin CRM Org")
  2. Employee profile (employee at "New Org")
- Defaults to Vendor profile (owner profile takes priority)

**Vendor Profile Active:**
```
Active Organization: "Admin CRM Org"
Permissions: ALL (owner)
Can See: All data in "Admin CRM Org"
Can Do: Everything (manage employees, customers, deals, etc.)
```

**Switch to Employee Profile:**
```
Active Organization: "New Org" (me@me.com's org)
Permissions: Based on assigned role by me@me.com
Can See: Data in "New Org" only
Can Do: Only actions allowed by role
```

### Scenario 2: me@me.com Logs In

**Initial State:**
- System loads all profiles for me@me.com
- Finds 1 profile:
  1. Vendor profile (owner of "New Org")
- Defaults to Vendor profile

**Vendor Profile Active:**
```
Active Organization: "New Org"
Permissions: ALL (owner)
Can See:
  - admin@crm.com listed as employee
  - All customers, deals, leads in "New Org"
Can Do:
  - Assign role to admin@crm.com
  - Manage all data in "New Org"
```

**Employee Profile:**
```
Not available (me@me.com is not an employee anywhere)
Profile switcher shows only Vendor profile
```

## 🎨 UI Updates Needed

### 1. TopBar - Add Profile Switcher
Location: Between search and user menu

### 2. Data Filtering - All Pages
Every page should filter by `activeOrganizationId`:
- Customers
- Deals
- Leads
- Employees
- Activities
- Orders
- Payments
- Issues

### 3. Empty States
Show appropriate message when no data for current profile:
```tsx
{activeProfileType === 'employee' && employees.length === 0 && (
  <EmptyState 
    title="No employee data"
    description="You haven't been invited to any organization as an employee"
  />
)}
```

## 🔐 Security Considerations

### Backend Already Handles:
✅ Employee queryset filters by user's organizations
✅ Permission decorators check organization context
✅ UserProfile model links user to organizations

### Frontend Must:
1. ✅ Always send `organization` parameter in API calls
2. ✅ Use `activeOrganizationId` from ProfileContext
3. ✅ Check permissions based on active profile
4. ✅ Hide features not available in current profile

## 📊 Complete Flow Diagram

```
User Logs In
    ↓
Load All UserProfiles
    ↓
┌─────────────────────────────────┐
│ Has Multiple Profiles?          │
├─────────────────────────────────┤
│ ✅ Vendor (Own Org)             │
│ ✅ Employee (Other Org 1)       │
│ ✅ Employee (Other Org 2)       │
└─────────────────────────────────┘
    ↓
Select Default Profile
(Vendor/Owner if available)
    ↓
Set Active Organization Context
    ↓
┌─────────────────────────────────┐
│ All API Calls Include:          │
│ ?organization={activeOrgId}     │
└─────────────────────────────────┘
    ↓
Backend Filters Data
    ↓
Frontend Shows Profile-Specific Data
    ↓
User Can Switch Profile
    ↓
Page Reloads with New Context
```

## ✅ Testing Checklist

### Test as admin@crm.com:
- [ ] Login → Should default to Vendor profile (own org)
- [ ] See profile switcher with 2 options (Vendor + Employee)
- [ ] In Vendor profile: See own organization data
- [ ] Switch to Employee profile
- [ ] See "New Org" data
- [ ] Verify limited access based on role
- [ ] Verify cannot create/delete if role doesn't allow

### Test as me@me.com:
- [ ] Login → Should default to Vendor profile
- [ ] See profile switcher with 1 option (Vendor only)
- [ ] See admin@crm.com as employee
- [ ] Can assign role to admin@crm.com
- [ ] Can see all data in "New Org"
- [ ] No Employee profile option (not employee anywhere)

### Test Role Permissions:
- [ ] Create role "Support" with only `customer.read`, `customer.create`
- [ ] Assign to admin@crm.com
- [ ] Login as admin@crm.com → Employee profile
- [ ] Can view and create customers
- [ ] Cannot delete customers (button hidden)
- [ ] Cannot access other features (deals, employees, etc.)

## 🚀 Ready to Integrate!

The system is designed and ready. Next steps:
1. Wrap App with ProfileProvider
2. Add ProfileSwitcher to TopBar
3. Update all data hooks to use `activeOrganizationId`
4. Test with both users

This will complete the multi-profile, multi-organization system! 🎉
