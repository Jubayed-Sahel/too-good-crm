# CRUD Testing Plan

## Current Status

### Login Issue
- **Problem**: Unable to login with `admin@crm.com` / `admin123`
- **Error**: "Unable to log in with provided credentials"
- **Root Cause**: User may not exist or password is incorrect
- **Solution Needed**: 
  1. Verify user exists in database
  2. Update/create user with correct password
  3. Ensure user has active profile and organization

### Entities Requiring CRUD Testing

#### 1. Customers ✅ (Partially Fixed)
- **Create**: ✅ Fixed - Form transformer and serializer updated
- **Read**: ✅ Working - List and detail views
- **Update**: ⚠️ Needs testing
- **Delete**: ✅ Working - ConfirmDialog integrated
- **Status**: Backend 500 error fixed, needs end-to-end testing

#### 2. Deals
- **Create**: ⚠️ Needs testing
- **Read**: ✅ Working - List and detail views
- **Update**: ⚠️ Needs testing
- **Delete**: ✅ Working - ConfirmDialog integrated
- **Status**: Form transformer exists, needs testing

#### 3. Leads
- **Create**: ⚠️ Needs testing
- **Read**: ✅ Working - List and detail views
- **Update**: ⚠️ Needs testing
- **Delete**: ✅ Working - ConfirmDialog integrated
- **Status**: Form transformer exists, needs testing

#### 4. Issues
- **Create**: ⚠️ Needs testing (Raise Issue)
- **Read**: ✅ Working - List and detail views
- **Update**: ⚠️ Needs testing (Resolve, Reopen)
- **Delete**: ✅ Working - ConfirmDialog integrated
- **Status**: Linear integration exists, needs testing

#### 5. Activities
- **Create**: ⚠️ Needs testing (Email, Call, Telegram)
- **Read**: ✅ Working - List and detail views
- **Update**: ⚠️ Needs testing
- **Delete**: ✅ Working - ConfirmDialog integrated
- **Status**: Email sending implemented, needs testing

#### 6. Employees
- **Create**: ⚠️ Needs testing (Invite Employee)
- **Read**: ✅ Working - List and detail views
- **Update**: ⚠️ Needs testing
- **Delete**: ✅ Working - ConfirmDialog integrated
- **Status**: Service methods exist, needs testing

#### 7. Orders
- **Create**: ⚠️ Needs testing
- **Read**: ✅ Working - List and detail views
- **Update**: ⚠️ Needs testing
- **Delete**: ⚠️ Needs testing
- **Status**: Service methods exist, needs testing

#### 8. Payments
- **Create**: ⚠️ Needs testing
- **Read**: ✅ Working - List and detail views
- **Update**: ⚠️ Needs testing
- **Delete**: ⚠️ Needs testing
- **Status**: Service methods exist, needs testing

## Testing Steps (Once Login is Fixed)

### Step 1: Login
1. Navigate to login page
2. Enter credentials
3. Verify successful login and redirect to dashboard

### Step 2: Test Customer CRUD
1. **Create**: 
   - Navigate to Customers page
   - Click "Create Customer"
   - Fill form with test data
   - Submit and verify success
   - Verify customer appears in list

2. **Read**:
   - Verify customer list loads
   - Click on customer to view details
   - Verify all fields display correctly

3. **Update**:
   - Click "Edit" on customer
   - Modify fields
   - Save and verify changes

4. **Delete**:
   - Click "Delete" on customer
   - Confirm deletion
   - Verify customer removed from list

### Step 3: Test Deal CRUD
1. **Create**: Create deal with customer, stage, value
2. **Read**: View deal list and details
3. **Update**: Update deal stage, value, probability
4. **Delete**: Delete deal and verify removal

### Step 4: Test Lead CRUD
1. **Create**: Create lead with contact info
2. **Read**: View lead list and details
3. **Update**: Update lead status, score
4. **Delete**: Delete lead and verify removal
5. **Convert**: Convert lead to customer

### Step 5: Test Issue CRUD
1. **Create**: Raise issue from customer/vendor
2. **Read**: View issue list and details
3. **Update**: Update issue status (resolve, reopen)
4. **Delete**: Delete issue and verify removal
5. **Linear**: Verify Linear sync works

### Step 6: Test Activity CRUD
1. **Create**: Create email, call, telegram activities
2. **Read**: View activity list and details
3. **Update**: Update activity details
4. **Delete**: Delete activity and verify removal

### Step 7: Test Employee CRUD
1. **Create**: Invite employee
2. **Read**: View employee list and details
3. **Update**: Update employee role, status
4. **Delete**: Terminate/delete employee

### Step 8: Test Order CRUD
1. **Create**: Create order with items
2. **Read**: View order list and details
3. **Update**: Update order status, items
4. **Delete**: Cancel/delete order

### Step 9: Test Payment CRUD
1. **Create**: Create payment record
2. **Read**: View payment list and details
3. **Update**: Update payment status
4. **Delete**: Delete payment record

## Fixes Applied

### Backend Fixes
1. ✅ Customer serializer validation improved
2. ✅ Organization handling fixed (set server-side)
3. ✅ Name generation with fallbacks
4. ✅ Email validation with context fallback
5. ✅ Phone validation for international formats
6. ✅ Error handling in perform_create

### Frontend Fixes
1. ✅ Removed organization from payload
2. ✅ Form transformers updated
3. ✅ StandardButton used consistently
4. ✅ ConfirmDialog for delete actions
5. ✅ Customer status types fixed (prospect, vip)
6. ✅ Duplicate buttons removed

## Next Steps

1. **Fix Login**: 
   - Run seed script or create admin user
   - Verify credentials work
   - Test login flow

2. **Test Each Entity**:
   - Follow testing steps above
   - Document any errors
   - Fix issues as they arise

3. **Verify API Compatibility**:
   - Check request/response types
   - Verify field mappings
   - Test edge cases

4. **Database Verification**:
   - Verify schema matches models
   - Check constraints
   - Verify relationships

## Commands to Fix Login

```bash
# Option 1: Use existing user
cd shared-backend
python manage.py shell
>>> from crmApp.models import User
>>> user = User.objects.get(email='admin@test.com')
>>> user.set_password('admin123')
>>> user.save()

# Option 2: Run seed script
python manage.py seed_data

# Option 3: Create new user
python manage.py createsuperuser
```

## Notes

- All CRUD operations should be tested with Chrome DevTools MCP
- Errors should be logged and fixed iteratively
- Each entity should be tested independently
- Verify data persistence after each operation
- Check for proper error handling and user feedback

