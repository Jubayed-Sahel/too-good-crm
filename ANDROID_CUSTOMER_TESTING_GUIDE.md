# Android Customer Creation - Testing Guide

## Quick Test Steps

### 1. Basic Creation Test
**Objective:** Verify customers can be created successfully

**Steps:**
1. Launch the app and navigate to Customers screen
2. Wait for customers to load from API
3. Tap the floating action button (+) in the bottom right
4. Fill in required fields:
   - Full Name: "Test Customer"
   - Email: "test@example.com"
   - Phone: "+1234567890"
5. Tap "Create Customer"
6. **Expected:** Dialog closes, success snackbar appears, new customer shows in list

**Pass Criteria:**
- ✓ Dialog opens smoothly
- ✓ All fields are accessible
- ✓ Create button is enabled after filling required fields
- ✓ Success snackbar shows "Customer created successfully"
- ✓ New customer appears at the top/bottom of the list
- ✓ Customer details match what was entered

---

### 2. Validation Test
**Objective:** Verify form validation works correctly

**Test 2a: Empty Form Submission**
1. Open create customer dialog
2. Try to tap "Create Customer" without filling anything
3. **Expected:** Error messages appear under Name, Email, and Phone fields

**Test 2b: Invalid Email**
1. Enter Name: "Test"
2. Enter Email: "invalid-email"
3. Enter Phone: "123"
4. **Expected:** Error message under Email field says "Valid email is required"

**Test 2c: Valid Form**
1. Enter Name: "Valid Customer"
2. Enter Email: "valid@example.com"
3. Enter Phone: "+1234567890"
4. **Expected:** No error messages, Create button is enabled

**Pass Criteria:**
- ✓ Required field errors show immediately on blur or submit
- ✓ Email format validation works
- ✓ Error messages are clear and helpful
- ✓ Errors clear when fixed

---

### 3. Customer Type Test
**Objective:** Verify business vs individual customer type switching

**Steps:**
1. Open create customer dialog
2. **Default:** Individual is selected
3. Tap "Business"
4. **Expected:** Business Information section appears (Company Name, Website)
5. Tap "Individual" again
6. **Expected:** Business Information section disappears

**Pass Criteria:**
- ✓ Individual is selected by default
- ✓ Switching to Business shows additional fields
- ✓ Switching back to Individual hides those fields
- ✓ Fields retain values when switching (if implemented)

---

### 4. Full Form Test
**Objective:** Create customer with all optional fields

**Steps:**
1. Open create customer dialog
2. Select "Business"
3. Fill all fields:
   - Full Name: "John Smith"
   - First Name: "John"
   - Last Name: "Smith"
   - Email: "john.smith@acme.com"
   - Phone: "+1-555-123-4567"
   - Company Name: "Acme Corporation"
   - Website: "https://acme.com"
   - Address: "123 Business St"
   - City: "New York"
   - State: "NY"
   - Postal Code: "10001"
   - Country: "USA"
   - Notes: "Important VIP customer from referral"
4. Tap "Create Customer"
5. **Expected:** Customer created with all data

**Pass Criteria:**
- ✓ All fields accept input
- ✓ Customer created successfully
- ✓ All data is saved (verify on backend or by viewing customer later)

---

### 5. Loading State Test
**Objective:** Verify loading indicators work

**Test 5a: Initial Load**
1. Fresh app start or pull to refresh
2. **Expected:** Loading indicator in header, "Loading customers..." message

**Test 5b: Creating Customer**
1. Open dialog, fill form
2. Tap "Create Customer"
3. **Expected:** 
   - Button shows spinner
   - Button text changes or has loading indicator
   - Button is disabled during creation

**Pass Criteria:**
- ✓ Loading states are visible
- ✓ User cannot interact during loading
- ✓ Loading clears after success/error

---

### 6. Error Handling Test
**Objective:** Verify error handling works

**Test 6a: Network Error (Simulate)**
1. Turn off WiFi/mobile data
2. Try to create customer
3. **Expected:** Error message appears in dialog

**Test 6b: Server Error (Simulate)**
1. Create customer with duplicate email (if backend enforces uniqueness)
2. **Expected:** Error message shows API error

**Test 6c: Error Recovery**
1. Get an error
2. Fix the issue (turn on network, change email)
3. Retry
4. **Expected:** Customer created successfully

**Pass Criteria:**
- ✓ Errors are displayed clearly
- ✓ User can dismiss error
- ✓ User can retry after fixing issue
- ✓ Dialog doesn't close on error

---

### 7. Search & Filter Test
**Objective:** Verify new customer appears in search

**Steps:**
1. Create customer named "Zebra Company"
2. Verify it appears in the list
3. Type "Zebra" in search box
4. **Expected:** Newly created customer appears in filtered results

**Pass Criteria:**
- ✓ Search works immediately after creation
- ✓ New customer is searchable by name
- ✓ New customer is searchable by email
- ✓ New customer is searchable by company

---

### 8. Cancel & Dismiss Test
**Objective:** Verify dialog can be cancelled

**Test 8a: Cancel Button**
1. Open dialog
2. Fill some fields
3. Tap "Cancel"
4. **Expected:** Dialog closes, no customer created

**Test 8b: Close Icon**
1. Open dialog
2. Tap X icon in header
3. **Expected:** Dialog closes, no customer created

**Test 8c: Back Button (Android)**
1. Open dialog
2. Press device back button
3. **Expected:** Dialog closes, no customer created

**Pass Criteria:**
- ✓ Dialog can be dismissed without saving
- ✓ No API call is made when cancelling
- ✓ Form data is cleared on next open (optional)

---

### 9. UI/UX Test
**Objective:** Verify UI looks good and is usable

**Checklist:**
- ✓ Dialog is properly sized (not too small, not too large)
- ✓ All text is readable
- ✓ Form is scrollable on small screens
- ✓ Fields are properly aligned
- ✓ Spacing is consistent
- ✓ Colors match app theme
- ✓ FAB is easily accessible
- ✓ FAB doesn't overlap important content
- ✓ Keyboard doesn't hide input fields
- ✓ Can scroll to see all fields when keyboard is open

---

### 10. Data Integrity Test
**Objective:** Verify data is correctly saved

**Steps:**
1. Create customer with specific data
2. Note the customer ID or name
3. Close app completely
4. Reopen app
5. Navigate to Customers screen
6. Search for the created customer
7. **Expected:** Customer exists with all correct data

**Alternative:**
- Check backend database directly
- Use web frontend to verify customer exists

**Pass Criteria:**
- ✓ Customer persists after app restart
- ✓ All data is correctly saved
- ✓ No data corruption or truncation

---

## Performance Tests

### Load Time Test
**Steps:**
1. Note time when Customers screen opens
2. Wait for data to load
3. **Expected:** Load completes within 3 seconds on good network

### Creation Speed Test
**Steps:**
1. Fill form
2. Tap Create Customer
3. Note time until success snackbar appears
4. **Expected:** Creation completes within 2 seconds on good network

---

## Edge Cases

### Test: Very Long Input
**Steps:**
1. Enter very long name (200+ characters)
2. Enter very long notes (1000+ characters)
3. **Expected:** 
   - Fields handle long text gracefully
   - Backend validates and truncates if needed
   - No UI breaks or crashes

### Test: Special Characters
**Steps:**
1. Enter name with special chars: "O'Brien & Sons"
2. Enter email: "test+tag@example.com"
3. **Expected:** Characters are accepted and saved correctly

### Test: International Input
**Steps:**
1. Enter name: "José García"
2. Enter company: "北京公司"
3. Enter address with international characters
4. **Expected:** UTF-8 characters handled correctly

### Test: Whitespace
**Steps:**
1. Enter name with extra spaces: "  John   Doe  "
2. **Expected:** Whitespace is trimmed or preserved as intended

---

## Automated Testing (Optional)

### Unit Tests
```kotlin
@Test
fun `createCustomer with valid data returns success`() {
    // Test ViewModel.createCustomer()
}

@Test
fun `email validation rejects invalid emails`() {
    // Test email validation logic
}

@Test
fun `toUiCustomer correctly maps API customer`() {
    // Test data conversion
}
```

### Integration Tests
```kotlin
@Test
fun `repository createCustomer calls API correctly`() {
    // Test repository integration
}
```

### UI Tests
```kotlin
@Test
fun `clicking FAB opens create dialog`() {
    // Test UI interaction
}

@Test
fun `submitting valid form creates customer`() {
    // Test end-to-end flow
}
```

---

## Bug Reporting Template

If you find issues, report using this format:

```
**Bug Title:** [Short description]

**Severity:** Critical / High / Medium / Low

**Steps to Reproduce:**
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happens]

**Screenshots/Video:**
[Attach if possible]

**Device Info:**
- Device: [e.g., Pixel 6]
- Android Version: [e.g., Android 13]
- App Version: [e.g., 1.0.0]

**Additional Notes:**
[Any other relevant info]
```

---

## Success Criteria Summary

✅ All 10 main tests pass
✅ No crashes or freezes
✅ Data is correctly saved to backend
✅ UI is responsive and looks good
✅ Error handling works properly
✅ Validation prevents invalid data
✅ User can successfully create customers end-to-end

---

## Quick Smoke Test (5 minutes)

If you only have 5 minutes, test these critical paths:

1. ✅ **Open app → Customers screen loads**
2. ✅ **Tap FAB → Dialog opens**
3. ✅ **Fill required fields → Create button enables**
4. ✅ **Submit → Success snackbar shows**
5. ✅ **New customer appears in list**

If all 5 pass → Basic functionality is working ✅
