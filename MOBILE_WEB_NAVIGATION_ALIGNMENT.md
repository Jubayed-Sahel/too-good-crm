# Mobile-Web Navigation Alignment

## Overview
This document confirms that the Android mobile app navigation is now fully aligned with the web frontend sidebar navigation structure, and both platforms connect to the same Django backend.

---

## ✅ Navigation Structure Alignment

### Vendor/Employee Mode Navigation

| Order | Menu Item | Web Route | Mobile Route | Icon | Status |
|-------|-----------|-----------|--------------|------|--------|
| 1 | Dashboard | `/dashboard` | `dashboard` | Home | ✅ Aligned |
| 2 | Customers | `/customers` | `customers` | People | ✅ Aligned |
| 3 | Sales | `/sales` | `sales` | TrendingUp | ✅ Aligned |
| 4 | Activities | `/activities` | `activities` | Event | ✅ Aligned |
| 5 | **Messages** | `/messages` | `messages` | Message | ✅ **ADDED** |
| 6 | Issues | `/issues` | `vendor-issues` | ReportProblem | ✅ Aligned |
| 7 | Analytics | `/analytics` | `analytics` | BarChart | ✅ Aligned |
| 8 | Team | `/team` | `team` | Group | ✅ Aligned |
| 9 | Settings | `/settings` | `settings` | Settings | ✅ Aligned |

### Client/Customer Mode Navigation

| Order | Menu Item | Web Route | Mobile Route | Icon | Status |
|-------|-----------|-----------|--------------|------|--------|
| 1 | Dashboard | `/client/dashboard` | `client-dashboard` | Home | ✅ Aligned |
| 2 | My Vendors | `/client/vendors` | `my-vendors` | Store | ✅ Aligned |
| 3 | My Orders | `/client/orders` | `my-orders` | ShoppingBag | ✅ Aligned |
| 4 | Payments | `/client/payments` | `payments` | Payment | ✅ Aligned |
| 5 | **Messages** | `/messages` | `messages` | Message | ✅ **ADDED** |
| 6 | Activities | `/client/activities` | `activities` | Event | ✅ Aligned |
| 7 | Issues | `/client/issues` | `issues` | ReportProblem | ✅ Aligned |
| 8 | Settings | `/client/settings` | `settings` | Settings | ✅ Aligned |

---

## 🔗 Backend Connectivity

### Web Frontend Configuration
- **API Base URL**: `/api/` (relative URL)
- **Full URL**: `http://localhost:8000/api/`
- **Client**: Axios with interceptors
- **Auth**: Token-based authentication
- **Token Header**: `Authorization: Token <token>`

### Mobile Android Configuration
- **API Base URL**: `http://10.0.2.2:8000/api/`
  - `10.0.2.2` is Android emulator's special IP for localhost
- **Client**: Retrofit with OkHttp
- **Auth**: Token-based authentication
- **Token Header**: `Authorization: Token <token>`

### Backend Django Configuration
- **Server**: Django 5.2.7 + DRF
- **Port**: 8000
- **Running**: ✅ `http://127.0.0.1:8000/`
- **API Prefix**: `/api/`

---

## 📱 Mobile Implementation Details

### Files Modified

1. **`AppScaffold.kt`** - Navigation drawer component
   - Updated vendor mode menu to match web sidebar exactly
   - Updated client mode menu to match web sidebar exactly
   - Added Messages menu item for both modes
   - Removed "Deals" and "Leads" standalone items (they're part of Sales)
   - Reordered items to match web order precisely

2. **`MainActivity.kt`** - Navigation routes
   - Added `messages` route composable
   - Connected to `MessagesScreen`
   - Proper navigation callbacks configured

3. **`MessagesScreen.kt`** - NEW screen created
   - Full composable screen with proper scaffold
   - Profile switching support
   - Mode switching support
   - "Coming Soon" UI with feature list
   - Ready for future implementation

---

## 🎨 Visual Consistency

### Color Scheme (Both Platforms)
- **Vendor Mode**: Purple gradient (`#667eea` to `#764ba2`)
- **Client Mode**: Blue gradient (`#3b82f6` to `#2563eb`)
- **Background**: Gray 50 (`#F9FAFB`)
- **Cards**: White with subtle borders

### Logo & Branding (Both Platforms)
- **App Name**: LeadGrid (formerly "Too Good CRM")
- **Icon**: Lightning bolt in gradient box
- **Tagline**: 
  - Vendor: "CRM Platform"
  - Client: "Client Portal"

---

## 🔐 Authentication Flow (Identical)

Both platforms use the same authentication flow:

1. **Login** → POST `/api/auth/login/`
   - Returns: `{ token, user { id, email, profiles[] } }`

2. **Profile Loading** → GET `/api/users/me/`
   - Returns user with all profiles and active profile
   - Organization field now returns full object (not just ID)

3. **Profile Switching** → POST `/api/auth/role-selection/select_role/`
   - Switches active profile
   - Updates session and permissions

4. **API Requests** → All endpoints require token
   - Header: `Authorization: Token <token>`

---

## ✨ Key Features Aligned

### Profile Switching
- **Web**: Dropdown in sidebar with profile badges
- **Mobile**: ProfileSwitcher component above top bar
- **Logic**: Only shows profiles with valid organizations (employees)
- **Backend**: Same `/api/auth/role-selection/` endpoints

### Mode Switching
- **Web**: Toggle between vendor and client views
- **Mobile**: Same toggle with navigation to appropriate dashboard
- **Logic**: Based on user's available profiles

### Permission Filtering
- **Web**: Menu items filtered by permissions (employees see restricted menu)
- **Mobile**: Same logic - AppScaffold filters items by permissions
- **Backend**: Same permission system from Django

---

## 📊 API Endpoints Used (Both Platforms)

### Authentication
- `POST /api/auth/login/` - Login
- `POST /api/auth/logout/` - Logout
- `POST /api/auth/register/` - Register
- `GET /api/users/me/` - Get current user profile

### Role Selection
- `GET /api/auth/role-selection/available_roles/` - Get available profiles
- `POST /api/auth/role-selection/select_role/` - Switch profile
- `GET /api/auth/role-selection/current_role/` - Get current profile

### Analytics (Dashboard)
- `GET /api/analytics/dashboard_stats/` - Dashboard metrics
- Accepts `organization_id` query parameter

### Customers
- `GET /api/customers/` - List customers
- `POST /api/customers/` - Create customer
- `GET /api/customers/{id}/` - Get customer details

### Issues
- `GET /api/issues/` - List issues
- `POST /api/issues/` - Create issue
- `GET /api/issues/{id}/` - Get issue details

*All other endpoints follow same pattern*

---

## 🚀 Next Steps for Messages Feature

When implementing the Messages feature:

1. **Create Backend Endpoints**
   ```python
   # shared-backend/crmApp/views/messages.py
   GET  /api/messages/           # List conversations
   POST /api/messages/           # Create message
   GET  /api/messages/{id}/      # Get conversation
   ```

2. **Update Web Frontend**
   ```typescript
   // web-frontend/src/pages/MessagesPage.tsx
   // Already has route in sidebar, needs implementation
   ```

3. **Update Mobile App**
   ```kotlin
   // app-frontend/.../features/messages/MessagesScreen.kt
   // Already exists, replace "Coming Soon" with real UI
   ```

4. **Consider WebSocket for Real-time**
   - Django Channels for backend
   - Socket.io or similar for web
   - OkHttp WebSocket for Android

---

## 🎯 Summary

### ✅ Completed
- [x] Android navigation drawer matches web sidebar exactly
- [x] Messages menu item added to both vendor and client modes
- [x] MessagesScreen created with proper navigation
- [x] Route added to MainActivity
- [x] Both platforms use same backend API
- [x] Both platforms use same authentication flow
- [x] Both platforms support profile switching
- [x] Both platforms support mode switching
- [x] Visual consistency maintained (colors, branding, icons)

### 📋 Backend Status
- [x] Django server running on port 8000
- [x] UserProfileSerializer fixed (organization as object)
- [x] Authentication endpoints working
- [x] Dashboard stats endpoints working
- [x] All CRUD endpoints available

### 🔄 Synchronized Features
- Navigation structure
- Profile management
- Mode switching (vendor/client)
- Permission system
- Authentication flow
- API connectivity
- Visual design language

---

## 📝 Notes

1. **API Base URL for Physical Devices**: 
   - If testing on physical device, update `ApiClient.kt`:
   ```kotlin
   private const val BASE_URL = "http://<YOUR_IP>:8000/api/"
   ```

2. **Messages Feature**: 
   - Currently shows "Coming Soon" placeholder
   - Backend endpoints need to be created
   - Can be implemented independently on both platforms using same backend API

3. **Permission System**:
   - Employees see filtered menus based on their permissions
   - Vendors and organization owners see full menus
   - Same logic implemented on both web and mobile

4. **Organization Field Fix**:
   - Previously returned integer ID: `"organization": 7`
   - Now returns full object: `"organization": { "id": 7, "name": "...", ... }`
   - This fix resolved Android JSON parsing error
