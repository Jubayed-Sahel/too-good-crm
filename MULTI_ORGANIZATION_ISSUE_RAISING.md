# Customer Issue Raising - Multi-Organization Support

## 🎯 Objective

Enable customers to raise issues about:
1. **Their own organization** (the one they created when they registered)
2. **Any other organization** they are part of (as customer, employee, or vendor)

---

## ✅ Changes Made

### 1. **Backend Fix** - `crmApp/views/client_issues.py`

**Problem:** Customer record creation was inside transaction causing conflicts.

**Solution:**
- Moved customer record creation OUTSIDE transaction
- Added comprehensive error handling and logging
- Added field validation (title required)
- Auto-creates customer record if doesn't exist
- Links to customer profile automatically

**Key Changes:**
```python
# Get or create customer record OUTSIDE transaction
customer, created = Customer.objects.get_or_create(
    user=request.user,
    organization=organization,
    defaults={...}
)

# Then create issue inside transaction
with transaction.atomic():
    issue = Issue.objects.create(...)
```

---

### 2. **Frontend Fix** - `ClientRaiseIssueModal.tsx`

**Problem:** Modal was trying to fetch organizations from vendors API, which returned empty results.

**Solution:** 
- Extract ALL organizations from user's profiles
- Show dropdown with all organizations user is part of
- Auto-select user's primary organization
- Allow user to select any organization they're part of

**Key Changes:**
```typescript
// Extract unique organizations from all user profiles
user.profiles?.forEach((profile: any) => {
  if (profile.organization) {
    orgSet.add(profile.organization);
    orgMap.set(profile.organization, profile.organization_name);
  }
});

// Show dropdown with all organizations
<CustomSelect
  options={[
    { value: '0', label: 'Select Organization' },
    ...organizations.map(org => ({ 
      value: org.id.toString(), 
      label: org.name 
    }))
  ]}
/>
```

---

### 3. **Type Update** - `issue.types.ts`

**Problem:** IssueCategory type was missing backend categories.

**Solution:** Added all backend-supported categories:
```typescript
// BEFORE
export type IssueCategory = 'quality' | 'delivery' | 'payment' | 'communication' | 'other';

// AFTER
export type IssueCategory = 'general' | 'quality' | 'delivery' | 'billing' | 'payment' | 'communication' | 'technical' | 'other';
```

---

### 4. **Auto-Configuration** - Registration Flow

**Already Fixed Earlier:** New organizations automatically get Linear team ID configured during registration.

```python
# In UserCreateSerializer.create()
organization = Organization.objects.create(
    name=organization_name,
    slug=slug,
    email=user.email,
    is_active=True,
    linear_team_id=linear_team_id  # Auto-configured!
)
```

---

## 🔄 Complete Flow

### **Registration:**
1. User registers → Creates User account
2. System creates Organization (with Linear team ID auto-configured)
3. System creates 3 profiles: **Vendor (Primary)**, Employee, Customer
4. User can immediately switch modes

### **Raising Issues:**
1. User switches to **Customer mode**
2. Clicks "Raise Issue"
3. Modal opens showing **dropdown of ALL organizations** user is part of:
   - Their own organization (from registration)
   - Any other organizations they're associated with
4. User selects organization to raise issue about
5. Fills in: title, description, priority, category
6. Optionally selects: vendor, order
7. Clicks "Raise Issue"

### **Backend Processing:**
1. Validates user has active customer profile ✅
2. Validates required fields (organization, title) ✅
3. Gets or creates Customer record for that organization ✅
4. Creates Issue with all details ✅
5. Auto-syncs to Linear (if team ID configured) ✅
6. Returns success response with issue data ✅

### **Vendor Resolving:**
1. User switches to **Vendor mode**
2. Sees ALL issues in their organization (including ones they raised as customer)
3. Can update status, assign to employees, resolve
4. Changes auto-sync to Linear

---

## 📊 Multi-Organization Scenarios

### **Scenario 1: User's Own Organization**
```
User registers → Creates "John's Organization"
User has profiles: Vendor, Employee, Customer (all for "John's Organization")
User as Customer → Can raise issue about "John's Organization"
User as Vendor → Can resolve that same issue
```

### **Scenario 2: Multiple Organizations**
```
User A creates "Company A"
User A has profiles in "Company A": Vendor, Employee, Customer

User A joins "Company B" as Customer
User A now has profiles in both organizations

User A as Customer → Dropdown shows:
  - Company A
  - Company B
User A can raise issues about EITHER organization
```

### **Scenario 3: Customer Profile in Multiple Orgs**
```
User has customer profile in:
  - Organization 1
  - Organization 2  
  - Organization 3

Modal shows ALL 3 organizations in dropdown
User selects which one to raise issue about
System auto-creates Customer record if needed for that org
```

---

## 🧪 Testing

### Test Script: `test_customer_issue_creation.py`

Run to validate the complete flow:
```bash
cd shared-backend
python test_customer_issue_creation.py
```

### Manual Testing Steps:

1. **Register new user**
   ```
   POST /api/users/
   {
     "email": "testcustomer@example.com",
     "username": "testcustomer",
     "password": "password123",
     "first_name": "Test",
     "last_name": "Customer"
   }
   ```

2. **Login**
   ```
   POST /api/auth/login/create/
   {
     "username": "testcustomer",
     "password": "password123"
   }
   ```

3. **Check profiles** (should have 3)
   ```
   GET /api/user-profiles/my_profiles/
   ```

4. **Raise issue as customer**
   ```
   POST /api/client/issues/raise/
   {
     "organization": 1,
     "title": "Test Issue",
     "description": "This is a test",
     "priority": "medium",
     "category": "general"
   }
   ```

5. **Verify issue created**
   ```
   GET /api/issues/
   ```

6. **Check Linear** (if configured)
   - Go to https://linear.app/too-good-crm
   - Verify issue appears there

---

## 🐛 Common Issues & Solutions

### Issue: "No organizations available"
**Cause:** User has no profiles
**Solution:** Ensure user registered properly and has profiles created

### Issue: "Organization is required"
**Cause:** User selected "Select Organization" option (value: 0)
**Solution:** User must select a valid organization from dropdown

### Issue: "Only customers can raise issues"
**Cause:** User doesn't have active customer profile
**Solution:** Ensure registration created customer profile, or manually create one

### Issue: "Customer record not found"
**Cause:** Customer record creation failed
**Solution:** Backend auto-creates it now. Check logs for errors.

### Issue: Linear sync fails
**Cause:** Organization doesn't have Linear team ID configured
**Solution:** Already fixed - auto-configured during registration

---

## ✅ Summary

**What Works Now:**

1. ✅ **Registration** creates all 3 profiles (Vendor, Employee, Customer)
2. ✅ **Linear team ID** auto-configured for new organizations
3. ✅ **Customer modal** shows ALL organizations user is part of
4. ✅ **Customer record** auto-created when raising issue
5. ✅ **Issue creation** works for any organization user is part of
6. ✅ **Linear sync** automatic on issue creation
7. ✅ **Vendor resolution** works for all issues in their org
8. ✅ **Same user** can raise as customer AND resolve as vendor

**Complete Workflow:**
```
Register → All profiles created → Linear auto-configured
Switch to Customer → Open modal → See all orgs dropdown
Select org → Fill form → Submit → Issue created + synced to Linear
Switch to Vendor → See all issues → Resolve → Syncs back to Linear
```

**Everything is working! 🎉**
