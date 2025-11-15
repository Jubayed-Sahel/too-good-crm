# 🚀 QUICK REFERENCE CARD

## Run the App (Android Studio)
```
1. Open Android Studio
2. Open: C:\Users\User\Desktop\p\too-good-crm\app-frontend
3. Click Run (▶)
```

## Start Backend First
```cmd
cd C:\Users\User\Desktop\p\too-good-crm\shared-backend
python manage.py runserver 0.0.0.0:8000
```

## Test Credentials
| Role | Username | Password |
|------|----------|----------|
| Customer | testcustomer | password123 |
| Vendor | testvendor | password123 |

## API Configuration
File: `app/src/main/java/too/good/crm/data/api/ApiClient.kt`

Current: `https://stephine-nonconfiding-pseudotribally.ngrok-free.dev/api/`

**For Emulator:** `http://10.0.2.2:8000/api/`  
**For Physical Device:** `http://YOUR_IP:8000/api/`

## Role Permissions

### Customer (CLIENT) ✅ Can ❌ Cannot
- ✅ Raise issues
- ✅ View own issues
- ✅ Add comments
- ❌ Update status
- ❌ Resolve issues

### Vendor (EMPLOYEE) ✅ Can ❌ Cannot
- ✅ View all client issues
- ✅ Update status
- ✅ Update priority
- ✅ Assign issues
- ✅ Resolve issues
- ❌ Create issues

## Features to Test

### As Customer:
```
Login → Issues → + → Create Issue → View Details → Add Comment
```

### As Vendor:
```
Login → Issues → Filter → Select Issue → Update Status → Resolve
```

## Files Created/Updated

**New:**
- `data/api/AuthApiService.kt`
- `data/model/Auth.kt`
- `data/repository/AuthRepository.kt`
- `features/login/LoginViewModel.kt`

**Updated:**
- `data/api/ApiClient.kt`
- `data/UserRole.kt`
- `data/repository/IssueRepository.kt`
- `features/login/LoginScreen.kt`
- `features/client/issues/IssuesScreen.kt`
- `MainActivity.kt`

## Documentation
- `BACKEND_INTEGRATION_COMPLETE.md` - Full technical docs
- `QUICK_START_GUIDE.md` - Setup & troubleshooting
- `ARCHITECTURE.md` - System architecture
- `RUN_APP.md` - Simple run instructions

## Troubleshooting

### "Cannot connect to server"
→ Check backend is running on port 8000  
→ Update BASE_URL in ApiClient.kt  
→ For emulator use: `10.0.2.2:8000`

### "Authentication failed"
→ Create test accounts (see QUICK_START_GUIDE.md)  
→ Verify credentials are correct

### "No issues shown"
→ Create issues as customer first  
→ Check API returns data (curl test)

## Status: ✅ READY TO RUN!

Everything is configured and ready. Just:
1. Start backend
2. Open in Android Studio
3. Click Run
4. Test with credentials above

**You're all set! 🎉**

