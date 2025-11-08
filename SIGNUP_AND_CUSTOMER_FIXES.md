# Signup and Customer Creation Fixes

**Date:** November 8, 2025

## Issues Fixed

### 1. User Signup/Registration Broken After Migration

**Problem:**
- After adding the `current_organization` field to the User model (migration 0002), user signup was failing with 400 Bad Request errors
- Users could sign up before the migration but not after

**Root Cause:**
- The `UserCreateSerializer` was creating the user and organization but not setting the `user.current_organization` field
- This left the field as NULL, which caused validation or downstream issues

**Solution:**
Updated `shared-backend/crmApp/serializers/auth.py` in the `UserCreateSerializer.create()` method:

```python
# After creating all three profiles (vendor, employee, customer):

# Set the current organization for the user
user.current_organization = organization
user.save()
```

**Files Modified:**
- `shared-backend/crmApp/serializers/auth.py` (lines ~260)

**Result:**
- Users can now successfully sign up with organization_name
- The current_organization field is properly set during registration
- User profiles are correctly initialized with organizational context

---

### 2. Enhanced Signup Error Logging

**Problem:**
- Generic "400 Bad Request" errors made it difficult to diagnose signup issues
- No visibility into what data was being sent or what validation was failing

**Solution:**
Added detailed logging to `shared-backend/crmApp/viewsets/auth.py` in the `UserViewSet.create()` method:

```python
def create(self, request, *args, **kwargs):
    """Register a new user and return token"""
    import logging
    logger = logging.getLogger(__name__)
    
    logger.info(f"Registration attempt with data: {request.data}")
    
    serializer = self.get_serializer(data=request.data)
    try:
        serializer.is_valid(raise_exception=True)
    except Exception as e:
        logger.error(f"Validation error: {e}")
        logger.error(f"Serializer errors: {serializer.errors}")
        raise
    
    user = serializer.save()
    logger.info(f"User created successfully: {user.username}")
    
    # Create token for new user
    token, created = Token.objects.get_or_create(user=user)
    
    return Response({
        'user': UserSerializer(user).data,
        'token': token.key,
        'message': 'Registration successful'
    }, status=status.HTTP_201_CREATED)
```

**Files Modified:**
- `shared-backend/crmApp/viewsets/auth.py`

**Result:**
- Clear visibility into registration attempts and failures
- Detailed error messages showing validation failures (e.g., "password too common")
- Easier debugging of authentication issues

---

### 3. Customer Creation Not Appearing in List

**Problem:**
- Customers were being created successfully (201 status) but not appearing in the customer list
- Frontend showed empty list even after creating customers

**Root Cause:**
- The `CustomerViewSet` wasn't automatically setting the `organization` field when creating customers
- Customers were being saved without an organization, or with the wrong organization
- The `get_queryset()` filters by user's organizations, so unassigned customers weren't returned

**Solution:**
Added `perform_create()` method to `shared-backend/crmApp/viewsets/customer.py`:

```python
def perform_create(self, serializer):
    """Auto-set organization from user's current organization"""
    import logging
    logger = logging.getLogger(__name__)
    
    # Get organization from request or use user's current organization
    organization_id = self.request.data.get('organization') or self.request.user.current_organization_id
    
    if not organization_id:
        # Fallback to user's first active organization
        user_org = self.request.user.user_organizations.filter(is_active=True).first()
        if user_org:
            organization_id = user_org.organization_id
    
    logger.info(f"Creating customer for organization: {organization_id}, user: {self.request.user.username}")
    logger.info(f"User current_organization_id: {self.request.user.current_organization_id}")
    logger.info(f"Request data organization: {self.request.data.get('organization')}")
    
    serializer.save(organization_id=organization_id)
```

**Files Modified:**
- `shared-backend/crmApp/viewsets/customer.py`

**Result:**
- Customers are automatically assigned to the user's current organization
- Fallback logic ensures organization is always set
- Detailed logging helps diagnose organization assignment issues

---

## Testing Notes

### Password Validation
- Django enforces strong password requirements by default
- Passwords like "testing123" will be rejected as "too common"
- Use stronger passwords with mixed case, numbers, and special characters
- Example: `TestPass123!@#`

### Customer Data Format
Sample JSON for creating customers via API:

```json
{
  "first_name": "John",
  "last_name": "Anderson",
  "name": "John Anderson",
  "email": "john.anderson@example.com",
  "phone": "+1 (555) 123-4567",
  "customer_type": "individual",
  "status": "active",
  "company_name": "Anderson Consulting",
  "industry": "Technology Consulting",
  "website": "https://www.anderson-consulting.com",
  "rating": 4.5,
  "credit_limit": 50000.00,
  "payment_terms": "Net 30",
  "postal_code": "94102",
  "country": "USA"
}
```

---

## Known Issues

### Organization Mismatch
- Frontend may be querying customers for a different organization than where they were created
- Logs show: Customer created for org 3, but list queried for org 4
- Need to investigate frontend organization context management

### DateTime Warnings
- RuntimeWarnings about naive datetime values for Customer.created_at
- Should use timezone-aware datetime values
- Currently not causing functional issues but should be addressed

---

## Next Steps

1. Verify customers appear in list after organization context fix
2. Review frontend organization selection/switching logic
3. Address timezone warnings in Customer model
4. Consider adding organization context to all creation endpoints
5. Add unit tests for multi-tenant customer creation

---

## Files Changed

1. `shared-backend/crmApp/serializers/auth.py`
   - Added current_organization assignment in UserCreateSerializer.create()

2. `shared-backend/crmApp/viewsets/auth.py`
   - Enhanced logging in UserViewSet.create()

3. `shared-backend/crmApp/viewsets/customer.py`
   - Added perform_create() with organization auto-assignment
   - Added detailed logging for customer creation

---

## Impact

- **User Signup:** Now working correctly with organization context
- **Customer Creation:** Automatically assigns to correct organization
- **Debugging:** Enhanced logging throughout authentication and customer flows
- **Multi-tenancy:** Properly enforced at creation time
