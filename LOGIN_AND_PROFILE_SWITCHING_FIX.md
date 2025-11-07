# Login and Profile Switching Fix

## Issues Identified

### 1. **Login Redirect Loop**
**Problem:** Users were being redirected back to login page after successful authentication.

**Root Cause:** Users had no `UserProfile` records in the database. The authentication system requires users to have at least one profile (vendor, employee, or customer) to determine which dashboard to show.

**Fix:** 
- Created `fix_user_profiles.py` to automatically create profiles for all users
- Each user gets three profiles: vendor (primary), employee, and customer
- All profiles are active by default

### 2. **Profile Switching Not Working**
**Problem:** When switching profiles, the sidebar and UI didn't update to reflect the new profile.

**Root Causes:**
- After switching profiles, the page wasn't reloading to reflect changes
- State updates weren't forcing component re-renders
- AccountModeContext wasn't detecting profile changes properly

**Fixes Applied:**

#### a) `useAuth.ts` - Force Page Reload on Profile Switch
```typescript
const switchRole = async (profileId: number) => {
  // ... switch profile logic ...
  
  // Force page reload to ensure all components re-render
  window.location.href = targetRoute;
};
```

**Why:** A full page reload ensures:
- All components remount with fresh data
- localStorage is read again
- No stale state in any component
- Sidebar menu items update correctly
- AccountModeContext resets to correct mode

#### b) `AccountModeContext.tsx` - Better Profile Tracking
```typescript
useEffect(() => {
  if (user && user.primaryProfile) {
    const primaryProfile = user.primaryProfile;
    const newMode = primaryProfile.profile_type === 'customer' ? 'client' : 'vendor';
    
    if (mode !== newMode) {
      setMode(newMode);
    }
  }
}, [user?.id, user?.primaryProfile?.id, user?.primaryProfile?.profile_type]);
```

**Why:** 
- More specific dependency array prevents unnecessary updates
- Checks for actual profile changes
- Better logging for debugging

#### c) `Sidebar.tsx` - Cleaner Error Handling
```typescript
const handleSwitchRole = async (profileId: number) => {
  setIsSwitching(true);
  try {
    await switchRole(profileId);
    // Page will reload, no need to reset state
  } catch (error) {
    console.error('Failed to switch role:', error);
    setIsSwitching(false);
    // Only reset on error
  }
};
```

#### d) `RoleSelectionDialog.tsx` - Async Handling
```typescript
const handleConfirm = async () => {
  if (selectedProfileId) {
    try {
      await onSelectRole(selectedProfileId);
      // Page will reload, dialog will disappear
    } catch (error) {
      console.error('Failed to switch role:', error);
    }
  }
};
```

## Backend Profile Switching Flow

### API Endpoint: `POST /api/auth/role-selection/select_role/`

**Request:**
```json
{
  "profile_id": 123
}
```

**Response:**
```json
{
  "message": "Switched to Employee role",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "profiles": [
      {
        "id": 123,
        "profile_type": "employee",
        "is_primary": true,
        "status": "active",
        "organization_name": "My Org"
      },
      // ... other profiles
    ]
  },
  "active_profile": {
    "id": 123,
    "profile_type": "employee",
    "is_primary": true
  }
}
```

**What happens on backend:**
1. Sets all user's profiles to `is_primary=False`
2. Sets selected profile to `is_primary=True`
3. Returns updated user data with all profiles
4. Frontend processes this to set `user.primaryProfile`

## Testing the Fix

### 1. Verify User Profiles
```bash
cd shared-backend
python verify_user_profiles.py
```

This will show:
- All users and their profiles
- Which profile is primary
- What the API returns for each user

### 2. Test Login Flow
1. Start backend: `python manage.py runserver`
2. Start frontend: `npm run dev`
3. Login with credentials:
   - Username: `me`, Password: `me`
   - Username: `admin`, Password: `admin123`
4. Should redirect to appropriate dashboard

### 3. Test Profile Switching
1. Login successfully
2. Click profile switcher in sidebar (click on user name/profile)
3. Select a different profile
4. Click "Continue"
5. **Expected:** Page reloads and shows correct dashboard for selected profile
6. **Verify:** 
   - Sidebar menu items match profile type
   - Dashboard content is appropriate
   - Profile name shows correctly in sidebar

## Profile Types and Dashboards

| Profile Type | Dashboard Route | Sidebar Menu |
|-------------|-----------------|--------------|
| Vendor | `/dashboard` | Full CRM (Customers, Deals, Leads, Analytics, Team) |
| Employee | `/dashboard` | Filtered by permissions |
| Customer | `/client/dashboard` | Client view (Vendors, Orders, Payments, Issues) |

## Files Modified

### Frontend
1. ✅ `src/hooks/useAuth.ts` - Force page reload on profile switch
2. ✅ `src/contexts/AccountModeContext.tsx` - Better profile tracking
3. ✅ `src/components/dashboard/Sidebar.tsx` - Cleaner error handling
4. ✅ `src/components/auth/RoleSelectionDialog.tsx` - Async handling

### Backend (Already Working)
- ✅ `crmApp/viewsets/role_selection.py` - Profile switching API
- ✅ `crmApp/serializers/auth.py` - User serialization with profiles

### Utility Scripts Created
1. ✅ `fix_user_profiles.py` - Auto-create profiles for users
2. ✅ `verify_user_profiles.py` - Check profile setup
3. ✅ `fix_all_passwords.py` - Reset user passwords
4. ✅ `test_user_password.py` - Test authentication

## Common Issues and Solutions

### Issue: "Still redirecting to login"
**Solution:** User has no profiles. Run `fix_user_profiles.py`

### Issue: "Sidebar not updating after switch"
**Solution:** Check browser console for errors. The page should reload. If not, check if `window.location.href` is being called.

### Issue: "Wrong dashboard after switch"
**Solution:** Check that `user.primaryProfile` is being set correctly. Verify with browser DevTools > Application > LocalStorage > user object.

### Issue: "Dialog doesn't close"
**Solution:** It shouldn't need to close manually - page will reload. If page isn't reloading, check error in console.

## Why Page Reload Instead of State Update?

**Considered approaches:**
1. ❌ **State-only update:** Doesn't guarantee all components re-render
2. ❌ **React Router navigate:** Can leave stale state in components
3. ✅ **Full page reload:** Ensures complete refresh of all state

**Benefits of page reload:**
- Guaranteed fresh state everywhere
- No stale cached data
- Sidebar remounts completely
- PermissionContext reinitializes
- AccountModeContext syncs correctly
- Simpler code, less edge cases

**Downside:**
- Slightly slower (1-2 seconds)
- User sees brief white screen

For a CRM application, the reliability of full state refresh outweighs the minor UX impact.

## Future Improvements

1. **Loading state during reload:** Show a loading overlay during `window.location.href` navigation
2. **Optimistic UI:** Pre-switch UI before reload for better perceived performance
3. **Service Worker:** Cache static assets to speed up page reload
4. **WebSocket:** Real-time profile updates if switched from another device

## Quick Reference Commands

```bash
# Backend
cd shared-backend
python manage.py runserver

# Fix user profiles
python fix_user_profiles.py

# Verify setup
python verify_user_profiles.py

# Reset passwords
python fix_all_passwords.py

# Frontend
cd web-frontend
npm run dev
```

## Test Accounts

| Username | Password | Profiles |
|----------|----------|----------|
| me | me | Vendor (primary), Employee, Customer |
| admin | admin123 | Vendor (primary), Employee, Customer |
| john.vendor | vendor123 | Vendor (primary), Employee, Customer |
| sarah.manager | manager123 | Vendor (primary), Employee, Customer |
| mike.employee | employee123 | Vendor (primary), Employee, Customer |

---

**Status:** ✅ All issues resolved and tested
**Date:** November 7, 2025
