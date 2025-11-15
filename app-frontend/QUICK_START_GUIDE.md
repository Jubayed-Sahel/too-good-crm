# Quick Start Guide - Running the Mobile App

## Prerequisites
1. ✅ Android Studio installed
2. ✅ Android SDK configured
3. ✅ Backend server running (shared-backend)
4. ✅ Network connectivity

## Step 1: Start the Backend Server

```bash
cd C:\Users\User\Desktop\p\too-good-crm\shared-backend
python manage.py runserver 0.0.0.0:8000
```

Or if using ngrok:
```bash
ngrok http 8000
```

## Step 2: Configure API URL

Open: `app-frontend/app/src/main/java/too/good/crm/data/api/ApiClient.kt`

Update the BASE_URL:

**For Android Emulator:**
```kotlin
private const val BASE_URL = "http://10.0.2.2:8000/api/"
```

**For Physical Device (same network):**
```kotlin
private const val BASE_URL = "http://YOUR_COMPUTER_IP:8000/api/"
// Example: http://192.168.1.100:8000/api/
```

**For ngrok:**
```kotlin
private const val BASE_URL = "https://your-ngrok-url.ngrok-free.dev/api/"
```

## Step 3: Build the App

### Option A: Using Android Studio
1. Open Android Studio
2. Open project: `C:\Users\User\Desktop\p\too-good-crm\app-frontend`
3. Wait for Gradle sync to complete
4. Click the "Run" button (Green play icon)
5. Select your device/emulator

### Option B: Using Command Line
```bash
cd C:\Users\User\Desktop\p\too-good-crm\app-frontend
gradlew.bat assembleDebug
gradlew.bat installDebug
```

## Step 4: Test the App

### Test Customer Flow (CLIENT Mode)

1. **Create Customer Account on Backend**
   ```bash
   cd C:\Users\User\Desktop\p\too-good-crm\shared-backend
   python manage.py shell
   ```
   ```python
   from crmApp.models import User, Organization, Customer
   from django.contrib.auth.hashers import make_password
   
   # Create organization
   org = Organization.objects.create(
       name="Test Customer Org",
       org_type="customer",
       email="customer@test.com"
   )
   
   # Create user
   user = User.objects.create(
       username="testcustomer",
       email="customer@test.com",
       password=make_password("password123"),
       first_name="Test",
       last_name="Customer"
   )
   
   # Create customer profile
   Customer.objects.create(
       user=user,
       organization=org
   )
   
   print(f"Created customer: {user.username}")
   ```

2. **Login to App**
   - Username: `testcustomer`
   - Password: `password123`
   - Should navigate to Client Dashboard

3. **Create Issue**
   - Navigate to "Issues" from menu
   - Click FAB (+) button
   - Fill in:
     - Title: "Test Issue"
     - Description: "Testing issue creation"
     - Priority: "medium"
     - Category: "general"
   - Click "Create Issue"
   - Verify issue appears in list

4. **View Issue Details**
   - Click on the created issue
   - Verify all details are displayed
   - Try adding a comment

### Test Vendor Flow (VENDOR Mode)

1. **Create Vendor/Employee Account on Backend**
   ```python
   from crmApp.models import User, Organization, Employee
   from django.contrib.auth.hashers import make_password
   
   # Create organization
   vendor_org = Organization.objects.create(
       name="Test Vendor Org",
       org_type="vendor",
       email="vendor@test.com"
   )
   
   # Create user
   vendor_user = User.objects.create(
       username="testvendor",
       email="vendor@test.com",
       password=make_password("password123"),
       first_name="Test",
       last_name="Vendor"
   )
   
   # Create employee profile
   Employee.objects.create(
       user=vendor_user,
       organization=vendor_org
   )
   
   print(f"Created vendor: {vendor_user.username}")
   ```

2. **Login to App**
   - Username: `testvendor`
   - Password: `password123`
   - Should navigate to Vendor Dashboard

3. **View Issues**
   - Navigate to "Issues" from menu
   - See all client-raised issues
   - Try filtering by status/priority

4. **Manage Issue**
   - Click on any issue
   - Update status to "in_progress"
   - Update priority
   - Add resolution notes
   - Click "Resolve Issue"

### Test Dual Role (BOTH Modes)

1. **Create Dual Role Account**
   ```python
   from crmApp.models import User, Organization, Customer, Employee
   from django.contrib.auth.hashers import make_password
   
   # Create both organizations
   customer_org = Organization.objects.create(
       name="Dual Role Customer Org",
       org_type="customer"
   )
   vendor_org = Organization.objects.create(
       name="Dual Role Vendor Org",
       org_type="vendor"
   )
   
   # Create user
   dual_user = User.objects.create(
       username="testboth",
       email="both@test.com",
       password=make_password("password123"),
       first_name="Test",
       last_name="Both"
   )
   
   # Create both profiles
   Customer.objects.create(user=dual_user, organization=customer_org)
   Employee.objects.create(user=dual_user, organization=vendor_org)
   
   print(f"Created dual role user: {dual_user.username}")
   ```

2. **Login and Switch Modes**
   - Username: `testboth`
   - Password: `password123`
   - Open drawer menu
   - See mode switcher
   - Switch between VENDOR and CLIENT modes
   - Verify UI changes appropriately

## Step 5: Troubleshooting

### Issue: "Unable to connect to server"
**Solution:**
1. Verify backend is running
2. Check BASE_URL in `ApiClient.kt`
3. For emulator, use `10.0.2.2` not `localhost`
4. Check firewall settings
5. For physical device, ensure same WiFi network

### Issue: "Authentication failed"
**Solution:**
1. Verify user exists in database
2. Check username/password are correct
3. Check backend logs for errors
4. Verify token authentication is enabled in backend

### Issue: "No issues displayed"
**Solution:**
1. Create test issues in backend admin panel
2. Verify API endpoint returns data
3. Check network logs in Android Studio
4. Verify user has correct permissions

### Issue: App crashes on launch
**Solution:**
1. Check Android Studio Logcat for errors
2. Verify all dependencies are synced
3. Clean and rebuild project
4. Check for null pointer exceptions

## Step 6: Verify Backend Endpoints

Test these endpoints manually using curl or Postman:

### Login
```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "testcustomer", "password": "password123"}'
```

### Get User Profile
```bash
curl -X GET http://localhost:8000/api/users/me/ \
  -H "Authorization: Token YOUR_TOKEN_HERE"
```

### Create Issue (Customer)
```bash
curl -X POST http://localhost:8000/api/client/issues/raise/ \
  -H "Authorization: Token YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "organization": 1,
    "title": "Test Issue",
    "description": "Testing issue creation",
    "priority": "medium",
    "category": "general"
  }'
```

### Get All Issues (Vendor)
```bash
curl -X GET http://localhost:8000/api/issues/ \
  -H "Authorization: Token YOUR_TOKEN_HERE"
```

### Update Issue Status (Vendor)
```bash
curl -X PATCH http://localhost:8000/api/issues/1/ \
  -H "Authorization: Token YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"status": "in_progress"}'
```

## Expected Results

✅ **Customer can:**
- Login successfully
- See their dashboard
- Create new issues
- View their issues list
- View issue details
- Add comments
- See status updates from vendors

✅ **Vendor can:**
- Login successfully
- See vendor dashboard
- View all client issues
- Filter issues by status/priority
- Update issue status
- Update issue priority
- Assign issues (if team members exist)
- Resolve issues with notes
- Cannot create new issues

✅ **Dual Role can:**
- Switch between modes
- Access both customer and vendor features
- Maintain separate permissions per mode

## Development Tips

1. **Enable Debug Logging**
   - Check `ApiClient.kt` - logging is already enabled
   - View logs in Android Studio Logcat
   - Filter by "okhttp" to see API calls

2. **Database Inspection**
   - Use Django admin: http://localhost:8000/admin
   - Or use: `python manage.py shell`

3. **Hot Reload**
   - Android Studio supports hot reload for UI changes
   - For logic changes, rebuild is needed

4. **Testing on Emulator vs Physical Device**
   - Emulator: Easier debugging, slower
   - Physical Device: Real performance, better UX testing

## Next Steps

After successful testing:
1. Update BASE_URL to production server
2. Implement push notifications
3. Add offline support
4. Enhance UI/UX based on feedback
5. Add analytics tracking
6. Implement automated tests

---

**Ready to Start!** 🚀

Follow the steps above and you'll have a fully functional CRM mobile app with backend integration and role-based issue tracking!

