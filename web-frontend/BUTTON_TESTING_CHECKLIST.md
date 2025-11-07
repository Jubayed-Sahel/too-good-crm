# Create/Add Button Testing Checklist

## Testing Status: ✅ IN PROGRESS

**Date:** November 8, 2025  
**Testing Environment:** http://localhost:5173  
**Purpose:** Verify all primary action buttons open correct dialogs with proper validation and submission

---

## 1. CustomersPage - "Add Customer" Button

**Location:** `/customers`  
**Button:** Primary action button in header  
**Expected Behavior:**
- ✅ Button exists and is visible
- [ ] Clicking opens `CreateCustomerDialog`
- [ ] Dialog has all required fields
- [ ] Validation works (required fields highlighted)
- [ ] Submission creates customer via API
- [ ] Success toast appears
- [ ] Dialog closes after submission
- [ ] Customer list refreshes with new customer

**Fields to Test:**
- Customer name (required)
- Email (required)
- Phone number
- Company name
- Address
- Customer type (individual/business)

**API Endpoint:** `POST /api/customers/`

---

## 2. DealsPage - "Add Deal" Button

**Location:** `/deals`  
**Button:** Primary action button in header  
**Expected Behavior:**
- ✅ Button exists and is visible
- [ ] Clicking opens `CreateDealDialog`
- [ ] Dialog has all required fields
- [ ] Customer autocomplete works
- [ ] Validation works (required fields highlighted)
- [ ] Submission creates deal via API
- [ ] Success toast appears
- [ ] Dialog closes after submission
- [ ] Deal list refreshes with new deal

**Fields to Test:**
- Title (required)
- Customer (required - autocomplete)
- Value (required)
- Stage (required)
- Expected close date
- Description
- Probability

**API Endpoint:** `POST /api/deals/`

---

## 3. LeadsPage - "Add Lead" Button

**Location:** `/leads`  
**Button:** Primary action button in header  
**Expected Behavior:**
- ✅ Button exists and is visible
- [ ] Clicking opens `CreateLeadDialog`
- [ ] Dialog has all required fields
- [ ] Validation works (required fields highlighted)
- [ ] Submission creates lead via API
- [ ] Success toast appears
- [ ] Dialog closes after submission
- [ ] Lead list refreshes with new lead

**Fields to Test:**
- Full name (required)
- Email (required)
- Phone number
- Company name
- Lead status (new/contacted/qualified/lost)
- Lead source
- Notes

**API Endpoint:** `POST /api/leads/`

---

## 4. EmployeesPage - "Invite Employee" Button

**Location:** `/employees`  
**Button:** Primary action button in header  
**Expected Behavior:**
- ✅ Button exists and is visible
- [ ] Clicking opens `InviteEmployeeDialog`
- [ ] Dialog has all required fields
- [ ] Email validation works
- [ ] Submission sends invite via API
- [ ] Success toast appears
- [ ] Dialog closes after submission
- [ ] Employee list refreshes

**Fields to Test:**
- First name (required)
- Last name (required)
- Email (required)
- Department
- Job title
- Role/permissions

**API Endpoint:** `POST /api/employees/` or `/api/employees/invite/`

---

## 5. ActivitiesPage - "New Activity" Menu

**Location:** `/activities`  
**Button:** Primary action button in header (opens menu)  
**Expected Behavior:**
- ✅ Button exists and is visible
- [ ] Clicking opens `ActivityTypeMenu` with 3 options
- [ ] Menu has: "Create Call", "Send Email", "Send Telegram"

### 5a. Create Call Dialog
**Expected Behavior:**
- [ ] Clicking "Create Call" opens `CreateCallDialog`
- [ ] Dialog has all required fields
- [ ] **CustomerAutocomplete** works properly ✅ (NEW)
- [ ] Phone number validation
- [ ] Submission creates call activity via API
- [ ] Success toast appears
- [ ] Dialog closes after submission
- [ ] Activities list refreshes

**Fields to Test:**
- Customer (required - autocomplete) ✅ NEW
- Title (required)
- Phone number (required)
- Notes

**API Endpoint:** `POST /api/activities/`

### 5b. Send Email Dialog
**Expected Behavior:**
- [ ] Clicking "Send Email" opens `SendEmailDialog`
- [ ] Dialog has all required fields
- [ ] **CustomerAutocomplete** works properly ✅ (NEW)
- [ ] Email validation
- [ ] Submission creates email activity via API
- [ ] Success toast appears
- [ ] Dialog closes after submission
- [ ] Activities list refreshes

**Fields to Test:**
- Customer (required - autocomplete) ✅ NEW
- Subject (required)
- Email address (required)
- Message (required)

**API Endpoint:** `POST /api/activities/`

### 5c. Send Telegram Dialog
**Expected Behavior:**
- [ ] Clicking "Send Telegram" opens `SendTelegramDialog`
- [ ] Dialog has all required fields
- [ ] **CustomerAutocomplete** works properly ✅ (NEW)
- [ ] Telegram username validation
- [ ] Submission creates telegram activity via API
- [ ] Success toast appears
- [ ] Dialog closes after submission
- [ ] Activities list refreshes

**Fields to Test:**
- Customer (required - autocomplete) ✅ NEW
- Telegram username (required)
- Message (required)

**API Endpoint:** `POST /api/activities/`

---

## 6. ClientIssuesPage - "Report Issue" Button

**Location:** `/client/issues`  
**Button:** Primary action button in header  
**Expected Behavior:**
- ✅ Button exists and is visible
- [ ] Clicking opens `CreateIssueDialog`
- [ ] Dialog has all required fields
- [ ] Vendor autocomplete/selection works
- [ ] Order autocomplete/selection works
- [ ] Priority selection works
- [ ] Category selection works
- [ ] Validation works (required fields highlighted)
- [ ] Submission creates issue via API
- [ ] Success toast appears
- [ ] Dialog closes after submission
- [ ] Issues list refreshes with new issue

**Fields to Test:**
- Title (required)
- Description (required)
- Vendor (required - likely autocomplete)
- Order number (optional - autocomplete)
- Priority (required - urgent/high/medium/low)
- Category (required - delivery/billing/quality/communication)

**API Endpoint:** `POST /api/issues/`

---

## Testing Methodology

### Phase 1: Visual Verification ✅
1. Navigate to each page
2. Confirm button exists and is visible
3. Note button text and styling

### Phase 2: Dialog Opening
1. Click each button
2. Verify correct dialog opens
3. Check dialog title and layout
4. Verify all expected fields are present

### Phase 3: Validation Testing
1. Try submitting empty form
2. Verify required field validation
3. Test field-specific validation (email format, etc.)
4. Verify error messages display properly

### Phase 4: Autocomplete Testing (NEW) ✅
1. Test CustomerAutocomplete in all activity dialogs
2. Verify search functionality
3. Verify dropdown displays customer info
4. Verify selection updates form data
5. Verify customer ID is captured

### Phase 5: Submission Testing
1. Fill all required fields with valid data
2. Submit form
3. Verify API call is made (check Network tab)
4. Verify success toast appears
5. Verify dialog closes
6. Verify list refreshes/new item appears

### Phase 6: Error Handling
1. Simulate API errors (disconnect backend)
2. Verify error toast appears
3. Verify dialog stays open on error
4. Verify user can retry

---

## Common Issues to Watch For

- [ ] Dialog doesn't open (check state management)
- [ ] Missing fields (check dialog component)
- [ ] Validation not working (check form validation logic)
- [ ] API call fails (check service configuration)
- [ ] Toast doesn't appear (check toast implementation)
- [ ] List doesn't refresh (check query invalidation)
- [ ] TypeScript errors in console
- [ ] Network errors in console
- [ ] React warnings in console

---

## Recent Improvements ✅

1. **CustomerAutocomplete Implementation**
   - Created reusable `CustomerAutocomplete` component
   - Integrated with `useCustomers` hook for real-time search
   - Updated all 3 activity dialogs to use autocomplete instead of text input
   - Customer IDs now properly captured for activity creation

2. **Backend Integration**
   - ClientOrdersPage: Real API with useOrders hook
   - ClientPaymentsPage: Real API with usePayments hook
   - ClientVendorsPage: Real API with useVendors hook
   - All pages have loading/error states

---

## Notes

- Test in both desktop and mobile viewports
- Test with both mouse and keyboard navigation
- Test tab order and accessibility
- Check console for any errors during testing
- Verify backend is running on expected port
- Ensure user has proper permissions for all actions
