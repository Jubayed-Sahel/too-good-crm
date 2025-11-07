# 🎯 Profile System - Quick Reference Guide

## Profile Types & Constraints

| Profile Type | Max Count | Organization Required | Features |
|--------------|-----------|----------------------|----------|
| **Vendor** 🏢 | 1 per user | ✅ Yes (owns) | Full access: manage employees, roles, all data |
| **Employee** 👥 | 1 per user | ✅ Yes (member) | Limited by role permissions |
| **Customer** 🛍️ | 1 per user | ❌ No (standalone) | View vendors, place orders, track issues |

## Visual Profile Structure

```
┌─────────────────────────────────────────────────────────┐
│  User: john@example.com                                 │
└─────────────────────────────────────────────────────────┘
         │
         ├─── 🏢 VENDOR PROFILE
         │    ├─ Organization: TechCorp Solutions
         │    ├─ Role: Owner (is_owner=true)
         │    ├─ Can: Manage employees, Create roles, Full access
         │    └─ Primary: Yes ⭐
         │
         ├─── 👥 EMPLOYEE PROFILE  
         │    ├─ Organization: Global Marketing Inc
         │    ├─ Role: Sales Manager
         │    ├─ Can: Access based on role permissions
         │    └─ Primary: No
         │
         └─── 🛍️ CUSTOMER PROFILE
              ├─ Organization: None (independent)
              ├─ Can: View vendors, Place orders, Track issues
              └─ Primary: No
```

## UI Components

### Sidebar - Profile Display
```
┌────────────────────────────────────┐
│  LeadGrid CRM                      │
├────────────────────────────────────┤
│  Active Profile                    │
│  ┌──────────────────────────────┐ │
│  │ 🏢 Vendor      [Purple Badge]│ │
│  │ TechCorp Solutions           │ │
│  │ [Switch Profile (3)]         │ │
│  └──────────────────────────────┘ │
├────────────────────────────────────┤
│  📊 Dashboard                      │
│  👥 Customers                      │
│  💼 Deals                          │
│  ...                               │
└────────────────────────────────────┘
```

### Profile Selection Dialog
```
┌───────────────────────────────────────────────────┐
│         Select Your Profile                       │
│  You have 3 profiles. Choose how to continue.    │
├───────────────────────────────────────────────────┤
│                                                   │
│  ⚪ 🏢 Vendor         [Purple Badge] [Primary]   │
│     TechCorp Solutions                           │
│     Manage your organization, employees...       │
│                                                   │
│  ⚪ 👥 Employee       [Blue Badge]               │
│     Global Marketing Inc                         │
│     Access organization resources...             │
│                                                   │
│  ⚪ 🛍️ Customer       [Green Badge]              │
│     Independent Customer                         │
│     View vendors, place orders...                │
│                                                   │
│                        [Continue Button]         │
└───────────────────────────────────────────────────┘
```

## Profile Switching Flow

```
1. USER CLICKS "Switch Profile (3)"
   ↓
2. DIALOG OPENS
   ↓
3. USER SELECTS PROFILE
   ↓
4. POST /api/profiles/switch/ { profile_id: X }
   ↓
5. BACKEND UPDATES SESSION
   ↓
6. PAGE RELOADS
   ↓
7. UI UPDATES
   ├─ Sidebar: Shows new profile badge
   ├─ Menu: Filters items by profile type
   ├─ Permissions: Applies role permissions (if employee)
   └─ Features: Enables/disables based on profile
```

## Database Schema

```sql
-- UserProfile table
CREATE TABLE user_profiles (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    organization_id INTEGER NULL,  -- NULL allowed for customer
    profile_type VARCHAR(20) NOT NULL,  -- vendor, employee, customer
    is_primary BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'active',
    
    -- CONSTRAINTS
    UNIQUE(user_id, profile_type),  -- ONE profile of each type per user
    
    CHECK (
        profile_type = 'customer' OR organization_id IS NOT NULL
    )  -- Vendor/Employee need organization
);
```

## API Endpoints

### Get User Profiles
```http
GET /api/auth/me/
Authorization: Token abc123

Response:
{
  "user": {
    "email": "john@example.com",
    "profiles": [
      {
        "id": 1,
        "profile_type": "vendor",
        "profile_type_display": "Vendor",
        "organization": 1,
        "organization_name": "TechCorp Solutions",
        "is_primary": true,
        "status": "active"
      },
      {
        "id": 2,
        "profile_type": "employee",
        "profile_type_display": "Employee",
        "organization": 2,
        "organization_name": "Global Marketing Inc",
        "is_primary": false,
        "status": "active"
      },
      {
        "id": 3,
        "profile_type": "customer",
        "profile_type_display": "Customer",
        "organization": null,
        "organization_name": null,
        "is_primary": false,
        "status": "active"
      }
    ]
  }
}
```

### Switch Profile
```http
POST /api/profiles/switch/
Authorization: Token abc123
Content-Type: application/json

{
  "profile_id": 2
}

Response:
{
  "message": "Switched to Employee role",
  "profile": {
    "id": 2,
    "profile_type": "employee",
    "organization_name": "Global Marketing Inc"
  }
}
```

## Permission Logic

### Vendor Profile
```
IS VENDOR?
  ├─ Yes → FULL ACCESS
  │        ├─ Manage customers
  │        ├─ Manage deals
  │        ├─ Manage employees
  │        ├─ Create/assign roles
  │        └─ Organization settings
  │
  └─ No → Check other profiles
```

### Employee Profile
```
IS EMPLOYEE?
  ├─ Yes → CHECK ROLE PERMISSIONS
  │        ├─ Has customers:read? → Can view customers
  │        ├─ Has deals:create? → Can create deals
  │        ├─ Has leads:update? → Can update leads
  │        └─ No employees:* → Cannot manage employees
  │
  └─ No → Check customer profile
```

### Customer Profile
```
IS CUSTOMER?
  ├─ Yes → LIMITED ACCESS
  │        ├─ View vendors
  │        ├─ Place orders
  │        ├─ View order history
  │        ├─ Make payments
  │        └─ Submit issues
  │
  └─ No → Access denied
```

## Color Coding

| Profile | Color | Used In |
|---------|-------|---------|
| Vendor | Purple (#667eea) | Badge, buttons, active states |
| Employee | Blue (#3b82f6) | Badge, buttons, active states |
| Customer | Green (#10b981) | Badge, buttons, active states |

## Common Scenarios

### Scenario 1: Freelancer owns company & works for client
```
User: freelancer@example.com
├─ Vendor Profile → My Freelance Business (owns)
└─ Employee Profile → Client Company (works at)

Switch to Vendor → Manage own business
Switch to Employee → Work on client projects
```

### Scenario 2: Business owner who's also a customer
```
User: owner@example.com
├─ Vendor Profile → My Restaurant (owns)
└─ Customer Profile → (orders supplies as customer)

Switch to Vendor → Manage restaurant operations
Switch to Customer → Order from suppliers
```

### Scenario 3: Regular customer
```
User: customer@example.com
└─ Customer Profile → (independent)

No switching needed - single profile
```

## Validation Rules

✅ **Allowed:**
- Create 1 vendor + 1 employee + 1 customer profile
- Vendor profile with organization A
- Employee profile with organization B (different org)
- Customer profile without organization

❌ **Not Allowed:**
- Two vendor profiles (even different orgs)
- Two employee profiles (even different orgs)
- Two customer profiles
- Vendor profile without organization
- Employee profile without organization

## Status Indicators

| Status | Meaning | Display |
|--------|---------|---------|
| `active` | Profile is usable | Show in switcher |
| `inactive` | Profile temporarily disabled | Hide from switcher |
| `suspended` | Profile suspended by admin | Hide from switcher |

## Testing Checklist

- [ ] User with 1 profile: Sidebar doesn't show switch button
- [ ] User with 2+ profiles: Sidebar shows "Switch Profile (X)"
- [ ] Click switch button → Dialog opens with all profiles
- [ ] Select profile → Page reloads with new context
- [ ] Vendor profile → All menu items visible
- [ ] Employee profile → Menu items filtered by permissions
- [ ] Customer profile → Only customer features visible
- [ ] Profile badges show correct colors
- [ ] Organization names display correctly
- [ ] "Independent Customer" shows for customer without org
- [ ] Cannot create duplicate profile of same type

---

**Last Updated**: 2025-11-07
**Status**: ✅ Implemented & Ready for Testing
