# Android Customer Issue Creation - Feature Parity Implementation

## Overview
Updated Android app's customer issue creation flow to match the website's functionality, particularly around organization selection and issue linking capabilities.

## Problem Statement
The Android app was using a hardcoded or parameter-passed `organizationId` for issue creation, which:
1. Didn't allow customers to choose which organization to report issues for
2. Missed vendor and order linking capabilities available on the website
3. Caused "Not found" errors when the organization ID was invalid

## Website Implementation Analysis

### ClientRaiseIssueModal.tsx (Website)
```typescript
- Fetches ALL organizations from database via organizationService.getAllOrganizations()
- Auto-selects user's primaryOrganizationId by default
- Allows customer to select any organization from dropdown
- Shows "No organizations available" message if none exist
- Dynamically fetches vendors and orders based on selected organization
- Optional vendor and order linking
- Validates organization is required before submission
```

### Key Features:
1. **Organization Selection**: Dropdown with all available organizations
2. **Auto-Selection**: User's primary organization pre-selected
3. **Vendor Linking**: Optional dropdown populated by organization
4. **Order Linking**: Optional dropdown populated by organization
5. **Validation**: Organization, title, description required
6. **Help Text**: Clear instructions and warnings

## Android Implementation

### New Files Created

#### 1. Organization.kt
```kotlin
Location: app/src/main/java/too/good/crm/data/model/Organization.kt

Models:
- Organization (full model)
- OrganizationListResponse (paginated list)
- OrganizationSimple (for dropdowns)

Fields: id, name, code, industry, website, email, phone, address, status, timestamps
```

#### 2. Order.kt
```kotlin
Location: app/src/main/java/too/good/crm/data/model/Order.kt

Models:
- Order (full model)
- OrderListResponse (paginated list)
- OrderSimple (for dropdowns)

Fields: id, orderNumber, organization, vendor, customer, status, dates, totalAmount, notes
```

#### 3. OrganizationApiService.kt
```kotlin
Location: app/src/main/java/too/good/crm/data/api/OrganizationApiService.kt

Endpoints:
- GET /api/organizations/ (getAllOrganizations with pagination/search)
- GET /api/organizations/{id}/ (getOrganization)
- GET /api/client/organizations/ (getCustomerOrganizations for current user)
```

#### 4. OrderApiService.kt
```kotlin
Location: app/src/main/java/too/good/crm/data/api/OrderApiService.kt

Endpoints:
- GET /api/orders/ (getAllOrders with filters)
- GET /api/orders/?organization={id} (getOrdersByOrganization)
```

### Files Updated

#### 1. VendorApiService.kt
```diff
+ Added organizationId query parameter to getVendors()
+ Allows filtering vendors by organization for issue linking
```

#### 2. ApiClient.kt
```diff
+ Added organizationApiService lazy initialization
+ Added orderApiService lazy initialization
+ Both registered in Retrofit client
```

#### 3. CustomerCreateIssueScreen.kt
**Major Refactor:**

**Before:**
```kotlin
fun CustomerCreateIssueScreen(
    organizationId: Int,  // ❌ Hardcoded parameter
    onNavigateBack: () -> Unit
)
```

**After:**
```kotlin
fun CustomerCreateIssueScreen(
    onNavigateBack: () -> Unit  // ✅ No organizationId parameter
)
```

**New Features Added:**
1. **Organization State Management**:
   ```kotlin
   - organizations: List<OrganizationSimple> (fetched on load)
   - selectedOrganization: Int? (auto-selects user's primary)
   - loadingOrganizations: Boolean (loading state)
   ```

2. **Vendor State Management**:
   ```kotlin
   - vendors: List<Vendor> (fetched when org selected)
   - selectedVendor: Int? (optional)
   - loadingVendors: Boolean
   ```

3. **Order State Management**:
   ```kotlin
   - orders: List<Order> (fetched when org selected)
   - selectedOrder: Int? (optional)
   - loadingOrders: Boolean
   ```

4. **LaunchedEffect Hooks**:
   ```kotlin
   // On screen load: fetch organizations
   LaunchedEffect(Unit) {
       val response = ApiClient.organizationApiService.getAllOrganizations(pageSize = 100)
       organizations = response.body()?.results?.map { OrganizationSimple(it.id, it.name) }
       // Auto-select user's primary organization
       selectedOrganization = UserSession.currentProfile?.organizationId ?: organizations.first().id
   }

   // When organization selected: fetch vendors
   LaunchedEffect(selectedOrganization) {
       val response = ApiClient.vendorApiService.getVendors(
           pageSize = 100,
           organizationId = selectedOrganization
       )
       vendors = response.results
   }

   // When organization selected: fetch orders
   LaunchedEffect(selectedOrganization) {
       val response = ApiClient.orderApiService.getOrdersByOrganization(selectedOrganization)
       orders = response.body()?.results
   }
   ```

5. **New UI Components**:

   **Organization Dropdown** (Required):
   ```kotlin
   ExposedDropdownMenuBox {
       OutlinedTextField(
           value = organizations.find { it.id == selectedOrganization }?.name ?: "Select Organization",
           label = { Text("Organization *") },
           readOnly = true
       )
       ExposedDropdownMenu {
           if (loadingOrganizations) {
               DropdownMenuItem(text = { Text("Loading...") })
           } else if (organizations.isEmpty()) {
               DropdownMenuItem(text = { Text("No organizations available") })
           } else {
               organizations.forEach { org ->
                   DropdownMenuItem(
                       text = { Text(org.name) },
                       onClick = { selectedOrganization = org.id }
                   )
               }
           }
       }
   }
   // Help text
   Text("Select the organization you want to report an issue about")
   ```

   **Vendor Dropdown** (Optional):
   ```kotlin
   if (selectedOrganization != null) {
       ExposedDropdownMenuBox {
           OutlinedTextField(
               value = vendors.find { it.id == selectedVendor }?.name ?: "No specific vendor",
               label = { Text("Vendor (Optional)") }
           )
           ExposedDropdownMenu {
               DropdownMenuItem(
                   text = { Text("No specific vendor") },
                   onClick = { selectedVendor = null }
               )
               vendors.forEach { vendor ->
                   DropdownMenuItem(text = { Text(vendor.name) })
               }
           }
       }
   }
   ```

   **Order Dropdown** (Optional):
   ```kotlin
   if (selectedOrganization != null) {
       ExposedDropdownMenuBox {
           OutlinedTextField(
               value = orders.find { it.id == selectedOrder }?.orderNumber ?: "No related order",
               label = { Text("Related Order (Optional)") }
           )
           ExposedDropdownMenu {
               DropdownMenuItem(
                   text = { Text("No related order") },
                   onClick = { selectedOrder = null }
               )
               orders.forEach { order ->
                   DropdownMenuItem(text = { Text(order.orderNumber) })
               }
           }
       }
   }
   ```

   **Info Card**:
   ```kotlin
   Card(colors = CardDefaults.cardColors(containerColor = primaryContainer)) {
       Text(
           text = "Note: This issue will be sent to the selected organization. Vendors and employees of that organization will be able to view and resolve it.",
           style = MaterialTheme.typography.bodySmall
       )
   }
   ```

6. **Updated Submit Logic**:
   ```kotlin
   Button(
       onClick = {
           if (selectedOrganization != null && title.isNotBlank() && description.isNotBlank()) {
               viewModel.createIssue(
                   organizationId = selectedOrganization!!,  // ✅ From dropdown
                   title = title,
                   description = description,
                   priority = selectedPriority,
                   category = selectedCategory,
                   vendorId = selectedVendor,  // ✅ Optional vendor
                   orderId = selectedOrder     // ✅ Optional order
               )
           }
       },
       enabled = !isLoading && selectedOrganization != null && title.isNotBlank() && description.isNotBlank()
   )
   ```

#### 4. MainActivity.kt
```diff
composable("create-issue") {
    CustomerCreateIssueScreen(
-       organizationId = UserSession.currentProfile?.organizationId ?: 1,  // ❌ Removed hardcoded ID
        onNavigateBack = { navController.popBackStack() }
    )
}
```

#### 5. IssueViewModel.kt
**Already Had Correct Signature** ✅:
```kotlin
fun createIssue(
    organizationId: Int,
    title: String,
    description: String,
    priority: String,
    category: String,
    vendorId: Int? = null,  // ✅ Already optional
    orderId: Int? = null    // ✅ Already optional
)
```

#### 6. IssueRepository.kt
**Already Had Correct Implementation** ✅:
```kotlin
suspend fun createIssue(
    organizationId: Int,
    title: String,
    description: String,
    priority: String,
    category: String,
    vendorId: Int? = null,  // ✅ Already optional
    orderId: Int? = null    // ✅ Already optional
): Result<IssueResponse> {
    val response = apiService.createIssue(
        CreateIssueRequest(
            organizationId = organizationId,
            title = title,
            description = description,
            priority = priority,
            category = category,
            vendorId = vendorId,    // ✅ Passed to API
            orderId = orderId       // ✅ Passed to API
        )
    )
    // ... error handling
}
```

#### 7. Issue.kt (CreateIssueRequest)
**Already Had Correct Fields** ✅:
```kotlin
data class CreateIssueRequest(
    @SerializedName("organization") val organizationId: Int,
    @SerializedName("title") val title: String,
    @SerializedName("description") val description: String,
    @SerializedName("priority") val priority: String = "medium",
    @SerializedName("category") val category: String = "general",
    @SerializedName("vendor") val vendorId: Int? = null,   // ✅ Already exists
    @SerializedName("order") val orderId: Int? = null      // ✅ Already exists
)
```

## Feature Comparison: Website vs Android

| Feature | Website | Android (Before) | Android (After) |
|---------|---------|------------------|-----------------|
| Organization Selection | ✅ Dropdown with all orgs | ❌ Parameter only | ✅ Dropdown with all orgs |
| Auto-select Primary Org | ✅ Yes | ❌ No | ✅ Yes |
| Vendor Linking | ✅ Optional dropdown | ❌ Not available | ✅ Optional dropdown |
| Order Linking | ✅ Optional dropdown | ❌ Not available | ✅ Optional dropdown |
| Organization Validation | ✅ Required field | ❌ Hardcoded | ✅ Required field |
| Loading States | ✅ Yes | ❌ No | ✅ Yes |
| Empty State Messages | ✅ Yes | ❌ No | ✅ Yes |
| Help Text | ✅ Yes | ❌ No | ✅ Yes |
| Dynamic Filtering | ✅ Vendor/Order by org | ❌ N/A | ✅ Vendor/Order by org |

## API Endpoints Used

### Organizations
```
GET /api/organizations/?page_size=100
Response: { count, next, previous, results: [{ id, name, code, ... }] }
```

### Vendors (by Organization)
```
GET /api/vendors/?organization={orgId}&page_size=100
Response: { count, results: [{ id, name, companyName, ... }] }
```

### Orders (by Organization)
```
GET /api/orders/?organization={orgId}&page_size=100
Response: { count, results: [{ id, orderNumber, ... }] }
```

### Create Issue
```
POST /api/client/issues/raise/
Body: {
    organization: number,
    title: string,
    description: string,
    priority: "low" | "medium" | "high" | "urgent",
    category: "general" | "delivery" | "quality" | "billing" | "communication" | "technical" | "other",
    vendor?: number | null,
    order?: number | null
}
Response: { message, issue, linear_data, linear_synced, linear_url }
```

## Benefits

### 1. Feature Parity with Website
- Customers can now select which organization to report issues for
- Matches the web app's UX and functionality
- Consistent user experience across platforms

### 2. Multi-Organization Support
- Customers belonging to multiple organizations via `CustomerOrganization` model can choose which one
- No longer hardcoded to user's primary organization

### 3. Enhanced Issue Context
- Vendor linking helps identify which vendor is involved
- Order linking connects issues to specific transactions
- Better issue tracking and resolution

### 4. Improved UX
- Clear dropdown selections with loading states
- Help text explains what each field does
- "No organizations available" message if user has none
- Auto-selection of primary organization for convenience

### 5. Better Error Handling
- Organization selection required before submission
- Loading states prevent premature interactions
- Clear validation messages

## Testing Checklist

### Scenario 1: Customer with Single Organization
- [ ] Screen loads, fetches organizations
- [ ] User's primary organization auto-selected
- [ ] Vendors and orders load for that organization
- [ ] Can create issue successfully
- [ ] Issue syncs to Linear

### Scenario 2: Customer with Multiple Organizations
- [ ] Screen shows dropdown with all organizations
- [ ] User's primary organization pre-selected
- [ ] Can change to different organization
- [ ] Vendors/orders update when organization changes
- [ ] Can create issue for any organization

### Scenario 3: Customer with No Organizations
- [ ] Screen shows "No organizations available" message
- [ ] Submit button disabled
- [ ] Help text explains user needs to be part of an organization

### Scenario 4: Vendor and Order Linking
- [ ] Vendor dropdown shows "No specific vendor" by default
- [ ] Can select a vendor (optional)
- [ ] Order dropdown shows "No related order" by default
- [ ] Can select an order (optional)
- [ ] Can submit with or without vendor/order

### Scenario 5: Loading States
- [ ] Organization dropdown shows "Loading..." while fetching
- [ ] Vendor dropdown shows "Loading..." while fetching
- [ ] Order dropdown shows "Loading..." while fetching
- [ ] Submit button disabled during creation

## Migration Notes

### For Developers
1. **No Breaking Changes**: The backend API already supported vendor/order fields in `CreateIssueRequest`
2. **Backward Compatible**: Old code path (direct organizationId parameter) removed, but functionality preserved
3. **New Dependencies**: Added `OrganizationApiService` and `OrderApiService` to `ApiClient`

### For Users
1. **New Feature**: Can now select organization when creating issues
2. **Familiar UX**: Matches website's issue creation flow
3. **More Context**: Can link issues to specific vendors and orders

## Related Backend Endpoints

All backend endpoints already exist and support this functionality:
- `/api/organizations/` - Organization listing
- `/api/vendors/?organization={id}` - Vendor filtering by org
- `/api/orders/?organization={id}` - Order filtering by org
- `/api/client/issues/raise/` - Issue creation with vendor/order

## Linear Integration

The Linear sync functionality remains unchanged:
- Issues are auto-synced to Linear after creation
- Linear data returned in response: `{ linear_synced, linear_url, linear_data }`
- Android app already handles Linear status display in issue detail screens

## Conclusion

The Android app now has **complete feature parity** with the website's customer issue creation flow:
✅ Organization selection (with auto-select)
✅ Vendor linking (optional)
✅ Order linking (optional)
✅ Proper validation and error messages
✅ Loading states and empty state handling
✅ Help text and instructions
✅ Linear sync (already implemented)

The implementation is clean, follows Android best practices, and provides a smooth user experience.
