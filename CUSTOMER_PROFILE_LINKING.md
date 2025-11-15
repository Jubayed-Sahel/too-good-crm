# Customer Profile Linking Implementation

## Overview
Modified the system to automatically create and link Customer records to user's customer profile during signup and prevent duplicate customer records.

## Changes Made

### 1. Signup Flow Enhancement (`crmApp/serializers/auth.py`)
**What**: During user registration, now creates both Vendor AND Customer records linked to their respective profiles.

**How it works**:
- Creates 3 UserProfiles: vendor (primary), employee, customer
- Creates Vendor record linked to vendor profile
- **NEW**: Creates Customer record linked to customer profile
- Uses `get_or_create` to prevent duplicates

**Customer record creation**:
```python
Customer.objects.get_or_create(
    user=user,
    organization=organization,
    defaults={
        'user_profile': customer_profile,
        'name': user.get_full_name() or user.username,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'email': user.email,
        'customer_type': 'individual',
        'status': 'active'
    }
)
```

### 2. Customer Creation Smart Linking (`crmApp/serializers/customer.py`)
**What**: When creating a customer with a user_id, checks if that user already has a customer record in the organization.

**Behavior**:
- **If user already has customer record in organization**: Returns existing customer (no duplicate)
- **If user has no customer record**: Creates new customer and links to user's customer profile
- **If no user_id provided**: Creates standalone customer record

**Benefits**:
- Prevents duplicate customer records for the same user in the same organization
- Automatically references existing customer profiles
- Maintains data integrity

### 3. Automatic Profile Linking (Already existed in `crmApp/models/customer.py`)
**What**: Customer.save() method automatically links to customer UserProfile.

**How**:
1. When saving customer with user but no user_profile:
2. Searches for existing customer UserProfile for that user
3. If found: Links to it (updates organization if needed)
4. If not found: Creates new customer UserProfile
5. Links customer record to the profile

## Database Constraints

### Unique Constraints
```python
unique_together = [
    ('organization', 'code'),  # Customer code unique per organization
    ('organization', 'user'),  # User can only be customer ONCE per organization
]
```

### UserProfile Constraint
```python
unique_together = [('user', 'profile_type')]  # One profile type per user
```

## Usage Examples

### Example 1: New User Signup
```python
# User signs up
POST /api/users/
{
    "email": "john@example.com",
    "username": "john",
    "first_name": "John",
    "last_name": "Doe",
    "password": "SecurePass123",
    "organization_name": "John's Business"
}

# Automatically creates:
# 1. User account
# 2. Organization
# 3. 3 UserProfiles (vendor, employee, customer)
# 4. Vendor record (linked to vendor profile)
# 5. Customer record (linked to customer profile) ✨ NEW
```

### Example 2: Create Customer for Existing User
```python
# Attempt to create customer for user who already has customer record
POST /api/customers/
{
    "user_id": 5,
    "organization": 10,
    "email": "john@example.com",
    "customer_type": "individual"
}

# Result: Returns existing customer record (no duplicate created) ✨
```

### Example 3: Create Customer Without User
```python
# Create standalone customer (not linked to user account)
POST /api/customers/
{
    "organization": 10,
    "name": "Jane Smith",
    "email": "jane@example.com",
    "customer_type": "individual"
}

# Result: Creates new customer record without user link
```

## Benefits

1. **No Duplicates**: Same user can't be customer twice in same organization
2. **Auto-Linking**: Customer records automatically reference user's customer profile
3. **Data Consistency**: User's profile and customer record stay in sync
4. **Multi-Organization Support**: User can be customer in multiple organizations (different Customer records)
5. **Backward Compatible**: Existing customer creation still works

## Testing Recommendations

1. Test signup creates both vendor and customer records
2. Test creating customer with existing user returns existing record
3. Test creating customer without user works normally
4. Test customer can exist in multiple organizations
5. Test email uniqueness within organization

## Migration Notes

**No database migration needed** - only logic changes in serializers.

Existing customer records remain unchanged. New behavior only affects:
- New user signups (creates customer record)
- New customer creation with user_id (checks for existing)
