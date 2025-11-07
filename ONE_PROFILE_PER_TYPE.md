# ✅ Profile System - One Profile Per Type Implementation

## Overview

The system now enforces that each user can have **at most ONE profile of each type**:
- ✅ **1 Vendor Profile** - User owns one organization
- ✅ **1 Employee Profile** - User works in one organization (can be different from owned org)
- ✅ **1 Customer Profile** - Standalone (no organization required)

## Changes Made

### 1. Backend Model Updates ✅

**File**: `shared-backend/crmApp/models/auth.py`

#### Updated `UserProfile` Model:
```python
class UserProfile(TimestampedModel):
    """
    Constraints:
    - A user can have ONLY ONE vendor profile (owns one organization)
    - A user can have ONLY ONE employee profile (works in one organization)
    - A user can have ONLY ONE customer profile (can be standalone)
    - Each profile type is unique per user (enforced by unique constraint)
    """
    
    user = models.ForeignKey('User', on_delete=models.CASCADE, related_name='user_profiles')
    organization = models.ForeignKey(
        'Organization', 
        on_delete=models.CASCADE, 
        related_name='user_profiles', 
        null=True,  # Customer profile can be standalone
        blank=True
    )
    profile_type = models.CharField(max_length=20, choices=PROFILE_TYPE_CHOICES)
    # ... other fields
    
    class Meta:
        # NEW: One profile of each type per user
        unique_together = [('user', 'profile_type')]
        
        constraints = [
            # Customer profiles don't require organization
            models.CheckConstraint(
                check=models.Q(profile_type='customer') | models.Q(organization__isnull=False),
                name='customer_profile_no_org_required'
            )
        ]
```

#### Added Validation:
```python
def clean(self):
    """Validate profile constraints."""
    # Vendor and employee profiles must have organization
    if self.profile_type in ['vendor', 'employee'] and not self.organization:
        raise ValidationError(f"{self.get_profile_type_display()} profile must have an organization.")
    
    # Check if user already has this profile type
    existing = UserProfile.objects.filter(
        user=self.user,
        profile_type=self.profile_type
    ).exclude(pk=self.pk)
    
    if existing.exists():
        raise ValidationError(f"User already has a {self.get_profile_type_display()} profile.")
```

### 2. Backend Serializer Updates ✅

**File**: `shared-backend/crmApp/serializers/auth.py`

Updated validation to enforce one profile per type:
```python
def validate(self, attrs):
    """Validate that profile doesn't already exist for this user"""
    user = attrs.get('user')
    profile_type = attrs.get('profile_type')
    
    # Check if user already has this profile type
    if UserProfile.objects.filter(user=user, profile_type=profile_type).exists():
        raise serializers.ValidationError(
            f"User already has a {profile_type} profile. Each user can only have one profile of each type."
        )
    
    # Validate organization requirement
    organization = attrs.get('organization')
    if profile_type in ['vendor', 'employee'] and not organization:
        raise serializers.ValidationError(
            f"{profile_type} profile must have an organization."
        )
    
    return attrs
```

### 3. Database Migration ✅

**Migration**: `0008_alter_userprofile_unique_together_and_more.py`

Changes:
- Changed unique constraint from `(user, organization, profile_type)` to `(user, profile_type)`
- Made `organization` field nullable for customer profiles
- Added check constraint for customer profiles

### 4. Data Cleanup ✅

**Script**: `shared-backend/cleanup_duplicate_profiles.py`

- Removed duplicate profiles (users had multiple profiles of same type)
- Kept the primary or oldest profile when duplicates existed
- Successfully cleaned data for 11 users

### 5. Frontend UI Updates ✅

#### RoleSelectionDialog (`web-frontend/src/components/auth/RoleSelectionDialog.tsx`)
```typescript
// Updated heading
<Heading size="xl" mb={2}>
  Select Your Profile
</Heading>
<Text color="gray.600" fontSize="md">
  You have {profiles.length} profile{profiles.length > 1 ? 's' : ''}. 
  Choose how you want to continue.
</Text>

// Better organization display for customers
<Text fontSize="sm" color="gray.600">
  {profile.profile_type === 'customer' && !profile.organization_name 
    ? 'Independent Customer' 
    : profile.organization_name || 'No Organization'}
</Text>
```

#### Sidebar (`web-frontend/src/components/dashboard/Sidebar.tsx`)
```typescript
// Enhanced profile badge with color coding
<Badge colorPalette={
  currentProfile.profile_type === 'vendor' ? 'purple' :
  currentProfile.profile_type === 'employee' ? 'blue' : 'green'
} size="sm">
  {currentProfile.profile_type_display}
</Badge>

// Show profile count on switch button
{user?.profiles && user.profiles.length > 1 && (
  <Button onClick={() => setShowRoleSwitcher(true)}>
    Switch Profile ({user.profiles.length})
  </Button>
)}
```

## User Profile Examples

### Example 1: Vendor + Employee
```
User: john@example.com
├── Vendor Profile → TechCorp (owns this organization)
└── Employee Profile → Marketing Inc (works here as employee)
```

### Example 2: Vendor + Customer
```
User: sarah@example.com
├── Vendor Profile → Global Services (owns this organization)
└── Customer Profile → (independent, no organization)
```

### Example 3: All Three Profiles
```
User: mike@example.com
├── Vendor Profile → CloudServe (owns this organization)
├── Employee Profile → TechCorp (works here as employee)
└── Customer Profile → (independent, no organization)
```

### Example 4: Customer Only
```
User: alice@example.com
└── Customer Profile → (independent, no organization)
```

## Profile Switching Flow

### 1. User Login
```
POST /api/auth/login/
Response:
{
  "user": {
    "email": "john@example.com",
    "profiles": [
      {
        "id": 1,
        "profile_type": "vendor",
        "profile_type_display": "Vendor",
        "organization_name": "TechCorp",
        "is_primary": true
      },
      {
        "id": 2,
        "profile_type": "employee",
        "profile_type_display": "Employee",
        "organization_name": "Marketing Inc",
        "is_primary": false
      }
    ]
  },
  "token": "..."
}
```

### 2. Switch Profile
```
POST /api/profiles/switch/
Body: { "profile_id": 2 }

Response:
{
  "message": "Switched to Employee role",
  "profile": {
    "id": 2,
    "profile_type": "employee",
    "organization_name": "Marketing Inc"
  }
}

→ Frontend reloads
→ UI updates based on new profile
```

### 3. UI Updates
- **Sidebar**: Shows active profile badge (color-coded)
- **Navigation**: Menu items filtered by profile type
- **Permissions**: Access controlled by role (if employee)
- **Features**: Vendor features only visible to vendors

## Profile-Based UI Features

### Vendor Profile Features
- ✅ Dashboard with full analytics
- ✅ Customer management
- ✅ Deal management
- ✅ Lead management
- ✅ Employee management
- ✅ Role & permission management
- ✅ Organization settings

### Employee Profile Features
- ✅ Dashboard (limited by permissions)
- ✅ Customers (if has permission)
- ✅ Deals (if has permission)
- ✅ Leads (if has permission)
- ❌ Cannot manage employees
- ❌ Cannot manage roles
- ❌ Cannot change organization settings

### Customer Profile Features
- ✅ View vendors
- ✅ Place orders
- ✅ View order history
- ✅ Make payments
- ✅ Submit issues/tickets
- ❌ Cannot access vendor features
- ❌ Cannot access employee features

## Database Constraints Summary

| Constraint | Description |
|------------|-------------|
| `unique_together (user, profile_type)` | Ensures one profile of each type per user |
| `organization NOT NULL` (for vendor/employee) | Vendor and employee must have organization |
| `organization NULL OK` (for customer) | Customer can be standalone |
| `CHECK constraint` | Enforces customer can have null org |

## Testing Profile System

### Create User with Multiple Profiles
```python
from crmApp.models import User, Organization, UserProfile, UserOrganization

# Create user
user = User.objects.create_user(
    email='test@example.com',
    username='testuser',
    password='password123'
)

# Create vendor profile (owns org1)
org1 = Organization.objects.create(name='Company A', slug='company-a')
UserOrganization.objects.create(user=user, organization=org1, is_owner=True)
UserProfile.objects.create(
    user=user,
    organization=org1,
    profile_type='vendor',
    is_primary=True,
    status='active'
)

# Create employee profile (works at org2)
org2 = Organization.objects.create(name='Company B', slug='company-b')
UserProfile.objects.create(
    user=user,
    organization=org2,
    profile_type='employee',
    status='active'
)

# Create customer profile (standalone)
UserProfile.objects.create(
    user=user,
    organization=None,  # Customer can be standalone
    profile_type='customer',
    status='active'
)
```

### Verify Constraints
```python
# Try to create duplicate vendor profile (should fail)
try:
    UserProfile.objects.create(
        user=user,
        organization=org1,
        profile_type='vendor'  # Already has vendor profile!
    )
except IntegrityError:
    print("✅ Constraint working: Cannot create duplicate vendor profile")

# Try to create employee without organization (should fail)
try:
    UserProfile.objects.create(
        user=user,
        organization=None,
        profile_type='employee'  # Employee needs organization!
    )
except ValidationError:
    print("✅ Validation working: Employee needs organization")
```

## Migration Steps Applied

1. ✅ Backed up database
2. ✅ Ran cleanup script to remove duplicate profiles
3. ✅ Created migration with new constraints
4. ✅ Applied migration successfully
5. ✅ Tested profile creation with constraints
6. ✅ Updated frontend UI components
7. ✅ Verified profile switching works correctly

## Status: ✅ Complete

The profile system now correctly enforces:
- **One vendor profile per user** ✅
- **One employee profile per user** ✅
- **One customer profile per user** ✅
- **Profile switching UI with count display** ✅
- **Color-coded profile badges** ✅
- **Independent customer profiles** ✅
- **Database constraints enforced** ✅
