# Quick Start Guide: Customer Creation Feature

## What Was Implemented

You now have a fully functional customer creation system in your Android app that:
- ✅ Displays a floating action button (+) on the Customers screen
- ✅ Opens a dialog to add new customers
- ✅ Validates form inputs (name, email, phone required)
- ✅ Saves customers to your backend API
- ✅ Shows success/error messages
- ✅ Updates the customer list automatically

## Testing the Feature

### 1. **Quick Test (Without Backend)**
If you don't have the backend running yet, the app will show an error when trying to create a customer. This is expected behavior.

### 2. **Full Test (With Backend)**

#### Start Your Backend Server
Make sure your backend API is running on port 3000.

#### Configure the API URL
If testing on a **physical device** (not emulator), update the URL in:
**File:** `app/src/main/java/too/good/crm/data/api/ApiClient.kt`

```kotlin
// For emulator (default)
private const val BASE_URL = "http://10.0.2.2:3000/api/"

// For physical device - Replace with your computer's IP
private const val BASE_URL = "http://192.168.1.100:3000/api/"  // Example

// For production
private const val BASE_URL = "https://your-backend.com/api/"
```

#### Test Steps
1. Run the app on emulator or device
2. Navigate to Customers screen
3. Click the purple floating action button (+) in the bottom-right
4. Fill in the form:
   - Name: Required
   - Email: Required (must be valid email)
   - Phone: Required
   - Company: Optional
   - Address: Optional
5. Click "Add Customer"
6. Watch for:
   - Loading spinner in the button
   - Success message appears
   - Dialog closes
   - New customer appears in the list

## Backend API Requirements

Your backend needs these endpoints:

### GET /api/customers
Returns list of customers
```json
{
  "success": true,
  "data": [...]
}
```

### POST /api/customers
Creates a new customer
**Request Body:**
```json
{
  "name": "string",
  "email": "string",
  "phone": "string",
  "company": "string (optional)",
  "address": "string (optional)",
  "status": "active"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "name": "string",
    "email": "string",
    "phone": "string",
    "company": "string",
    "address": "string",
    "status": "string",
    "createdAt": "string",
    "updatedAt": "string"
  },
  "message": "Customer created successfully"
}
```

## Troubleshooting

### Error: "Failed to load customers"
- Check if backend is running
- Verify API URL in ApiClient.kt
- Check network connectivity
- Check backend CORS settings (if applicable)

### Error: "Failed to create customer"
- Check backend API endpoint
- Verify request format matches backend expectations
- Check backend logs for errors

### App crashes on customer screen
- Sync Gradle dependencies
- Clean and rebuild project
- Check for compilation errors

### Customer not appearing in list
- Check backend response format
- Verify customer was saved in database
- Check ViewModel data conversion logic

## Commands to Run

```bash
# Clean project
gradlew clean

# Build project
gradlew build

# Install on connected device/emulator
gradlew installDebug

# View logs
adb logcat | findstr "TooGoodCRM"
```

## Next Steps

1. **Test the Feature**: Try creating a few customers
2. **Verify Backend**: Check that customers are saved in your database
3. **Customize**: Adjust styling, validation rules as needed
4. **Add More Features**:
   - Edit customer
   - Delete customer
   - View customer details
   - Search with API
   - Filter by status

## Files You Can Customize

### Change Form Fields
**File:** `AddCustomerDialog.kt`
Add or remove form fields as needed

### Change Validation Rules
**File:** `AddCustomerDialog.kt`
Modify the validation logic in the `onConfirm` click handler

### Change API URL
**File:** `ApiClient.kt`
Update the `BASE_URL` constant

### Change Success/Error Messages
**File:** `CustomersViewModel.kt`
Update `successMessage` and error messages

### Change Button Colors/Styling
**File:** `AddCustomerDialog.kt` and `CustomersScreen.kt`
Modify colors using `DesignTokens.Colors.*`

## Important Notes

⚠️ **INTERNET Permission**: Already added to AndroidManifest.xml
⚠️ **Dependencies**: Already added to build.gradle.kts
⚠️ **API Format**: Backend must return JSON in the expected format
⚠️ **Error Handling**: All API errors are caught and displayed to user

## Need Help?

Check the detailed documentation in `CUSTOMER_CREATION_IMPLEMENTATION.md`

