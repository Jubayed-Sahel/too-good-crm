# Unified Security Settings Across All Profile Types

## Overview
All three profile types (Customer, Vendor, Employee) now use the **same unified SecuritySettings component** with **only the Change Password option**. Since all profiles share the same user account and login credentials, changing the password affects all profiles simultaneously.

## Key Principle
**One User = One Password for All Profiles**

When a user has multiple profiles (customer, vendor, employee), they all share:
- ✅ Same email address
- ✅ Same username  
- ✅ Same password
- ✅ Same authentication credentials

## Implementation Summary

### 1. Unified SecuritySettings Component

**Location**: `web-frontend/src/components/settings/SecuritySettings.tsx`

**Features**:
- Change Password form only
- Current password validation
- New password (minimum 5 characters)
- Password confirmation matching
- Success/error notifications
- Form clears after successful change
- Loading states during API calls

**Used By**:
- ✅ Employee Settings
- ✅ Vendor Settings
- ✅ Customer Settings

### 2. Settings Pages Updated

#### Employee Settings
**File**: `web-frontend/src/pages/employee/EmployeeSettingsPage.tsx`

**Tabs**: None (Direct Security view)
**Content**: SecuritySettings component only

```typescript
import { SecuritySettings } from '../../components/settings';

const EmployeeSettingsPage = () => {
  return (
    <DashboardLayout title="Settings">
      <VStack align="stretch" gap={5}>
        <SettingsHeader />
        <SecuritySettings />
      </VStack>
    </DashboardLayout>
  );
};
```

#### Vendor Settings
**File**: `web-frontend/src/pages/vendor/SettingsPage.tsx`

**Tabs**: Organization, Security
**Security Tab**: Uses SecuritySettings component

```typescript
import { SecuritySettings } from '../../components/settings';

const renderTabContent = () => {
  switch (activeTab) {
    case 'organization':
      return <OrganizationSettings />;
    case 'security':
      return <SecuritySettings />;
    // ...
  }
};
```

#### Customer Settings
**Files**: 
- `web-frontend/src/pages/customer/ClientSettingsPage.tsx`
- `web-frontend/src/pages/ClientSettingsPage.tsx`

**Tabs**: Profile, Security
**Security Tab**: Uses SecuritySettings component (changed from ClientSecuritySettings)

```typescript
import { SecuritySettings } from '../../components/settings';
import { ClientProfileSettings } from '../../components/settings/client';

const renderTabContent = () => {
  switch (activeTab) {
    case 'profile':
      return <ClientProfileSettings />;
    case 'security':
      return <SecuritySettings />;
    // ...
  }
};
```

### 3. Backend API

**Endpoint**: `POST /auth/change-password/`

**Authentication**: Required (Token-based)

**Request Body**:
```json
{
  "old_password": "CurrentPassword",
  "new_password": "NewPassword123",
  "new_password_confirm": "NewPassword123"
}
```

**Validation**:
- Old password must match current password
- New password minimum 5 characters
- New password and confirmation must match

**Response (Success)**:
```json
{
  "message": "Password changed successfully."
}
```

**Response (Error)**:
```json
{
  "old_password": ["Old password is incorrect."]
}
```

### 4. How Password Change Works

#### User Flow:
1. User logs in with email/password
2. User can switch between profiles (customer/vendor/employee)
3. User navigates to Settings → Security (in any profile)
4. User fills out password change form:
   - Current password
   - New password
   - Confirm new password
5. User clicks "Update Password"
6. Backend validates and updates password
7. **Password is changed for ALL profiles simultaneously**
8. User must use new password for next login (regardless of active profile)

#### Technical Flow:
```
User Account (email: sahel@gmail.com)
├── Password: Sahel009@ (stored once in User model)
├── Profile 1: Customer @ No Organization
├── Profile 2: Vendor @ ahmed ltd (PRIMARY)
└── Profile 3: Employee @ ahmed ltd

When password changes:
✓ User.password is updated
✓ All 3 profiles automatically use new password
✓ No profile-specific password storage
```

### 5. Test Results

**Test User**: sahel@gmail.com
**Profiles**: 
- Customer @ No Organization
- Vendor @ ahmed ltd (PRIMARY)
- Employee @ ahmed ltd

**Test Results**:
```
✓ All profiles share the same password
✓ Password change affects all profiles simultaneously
✓ Authentication works with the updated password
✓ Old password is correctly invalidated after change
✓ New password works for login across all profiles
```

### 6. Settings Comparison Table

| Feature | Employee | Vendor | Customer |
|---------|----------|--------|----------|
| **Security Tab** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Change Password** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Profile Tab** | ❌ No | ❌ No | ✅ Yes |
| **Organization Tab** | ❌ No | ✅ Yes | ❌ No |
| **Team Tab** | ❌ No | ✅ Yes | ❌ No |
| **Roles Tab** | ❌ No | ✅ Yes | ❌ No |
| **Component Used** | SecuritySettings | SecuritySettings | SecuritySettings |

### 7. Files Modified

#### Web Frontend
1. ✅ `web-frontend/src/pages/employee/EmployeeSettingsPage.tsx` - Uses SecuritySettings
2. ✅ `web-frontend/src/pages/vendor/SettingsPage.tsx` - Uses SecuritySettings
3. ✅ `web-frontend/src/pages/customer/ClientSettingsPage.tsx` - Changed to SecuritySettings
4. ✅ `web-frontend/src/pages/ClientSettingsPage.tsx` - Changed to SecuritySettings
5. ✅ `web-frontend/src/components/settings/SecuritySettings.tsx` - Cleaned (password only)

#### Backend
- ✅ No changes required (already supports unified password management)

### 8. Removed Components

**ClientSecuritySettings** is no longer used:
- Location: `web-frontend/src/components/settings/client/ClientSecuritySettings.tsx`
- Status: Still exists but not imported/used anywhere
- Reason: Replaced by unified SecuritySettings component

### 9. Security Benefits

1. **Consistency**: Same password change experience across all profiles
2. **Simplicity**: Users don't need to manage separate passwords per profile
3. **Security**: One strong password protects all profile access
4. **User-Friendly**: Clear that all profiles are under one account
5. **Maintainability**: Single component to maintain and update

### 10. User Experience

#### Scenario 1: User with Multiple Profiles
```
User: John Doe (john@example.com)
Profiles: Customer, Vendor, Employee

1. John logs in as Vendor
2. Goes to Settings → Security
3. Changes password from "OldPass123" to "NewPass456"
4. Password is updated
5. John switches to Employee profile
6. Later logs out and logs back in
7. Must use "NewPass456" for login (works for all profiles)
```

#### Scenario 2: Password Change Affects All Profiles
```
Before Change:
- Login: user@example.com / Password123
- Can access: Customer, Vendor, Employee profiles

After Change (in any profile):
- New Password: SecurePass456
- Login now requires: user@example.com / SecurePass456
- All profiles (Customer, Vendor, Employee) use new password
```

### 11. API Integration

**React Hook**: `useChangePassword()` from `@/hooks/useUser`

**Usage**:
```typescript
const changePasswordMutation = useChangePassword();

await changePasswordMutation.mutateAsync({
  old_password: currentPassword,
  new_password: newPassword,
  new_password_confirm: confirmPassword,
});
```

**Backend Serializer**: `ChangePasswordSerializer`
**Backend ViewSet**: `ChangePasswordViewSet`
**URL**: `/auth/change-password/`

### 12. Error Handling

**Frontend Validation**:
- ✅ Passwords must match
- ✅ New password minimum 5 characters
- ✅ All fields required

**Backend Validation**:
- ✅ Old password must be correct
- ✅ New password meets requirements
- ✅ User must be authenticated

**Error Messages**:
- "New passwords do not match"
- "Password too short (min. 5 characters)"
- "Old password is incorrect"
- "Failed to change password"

### 13. Mobile App (Android/Kotlin)

**File**: `app-frontend/app/src/main/java/too/good/crm/features/settings/SettingsScreen.kt`

**Implementation**:
- Shows "Security" section with "Change Password" for employees
- Shows full settings for other profile types
- Conditional rendering based on `profileState.activeProfile?.profileType`

```kotlin
val isEmployee = profileState.activeProfile?.profileType == "employee"

if (!isEmployee) {
    // Show additional settings
}
```

## Conclusion

✅ **All three profile types (Customer, Vendor, Employee) now have unified security settings**
✅ **All use the same SecuritySettings component**
✅ **Password change works consistently across all profiles**
✅ **One user account = one password for all profiles**
✅ **Tested and verified working**

The security settings are now consistent, simple, and work correctly across the entire application for all user types.

