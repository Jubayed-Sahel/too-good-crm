# Issue Tracking System - Quick Start Guide

## ✅ System Status
The issue tracking system is **FULLY INTEGRATED** and ready to use!

## 🚀 Quick Start

### Backend (Already Configured)
The backend is fully set up with:
- ✅ Issue model with all fields
- ✅ API endpoints for CRUD operations
- ✅ ViewSets with permission checks
- ✅ Linear integration support
- ✅ Client issue portal
- ✅ Database migrations
- ✅ Serializers and services

### Frontend (Ready to Use)
The frontend is complete with:
- ✅ Issues list page with filters
- ✅ Issue detail page
- ✅ Issue edit page
- ✅ Create/Raise issue modals
- ✅ Resolve issue functionality
- ✅ Client issue pages
- ✅ Navigation integrated
- ✅ TypeScript types
- ✅ React Query hooks

## 📋 What You Can Do Now

### 1. View Issues
Navigate to: **`/issues`**
- See all issues in your organization
- Filter by status, priority, category
- Search issues
- View statistics

### 2. Create an Issue
1. Go to `/issues`
2. Click "Create Issue" button
3. Fill in:
   - Title (required)
   - Description (required)
   - Priority (low/medium/high/urgent/critical)
   - Category (quality/delivery/billing/etc.)
   - Vendor (optional)
   - Order (optional)
4. Submit

### 3. View Issue Details
- Click on any issue in the list
- See full details
- View resolution notes
- Check Linear sync status

### 4. Manage Issues
From the issue detail page:
- **Resolve**: Mark as resolved with notes
- **Close**: Close the issue
- **Reopen**: Reopen resolved issues
- **Edit**: Update issue details
- **Delete**: Remove issue

### 5. Client Issue Portal
Customers can:
- Navigate to `/client/issues`
- Raise issues about vendors
- View their raised issues
- Add comments
- Track resolution status

## 🔧 Testing the System

### Test in Browser
1. **Start backend** (if not running):
   ```bash
   cd shared-backend
   python manage.py runserver
   ```

2. **Start frontend** (if not running):
   ```bash
   cd web-frontend
   npm run dev
   ```

3. **Login** to the application

4. **Navigate** to `/issues`

5. **Create** a test issue

### Test as Different Roles

#### As Employee/Vendor:
- Full CRUD access (with permissions)
- Can raise, resolve, edit issues
- Can assign to team members
- Can link to vendors and orders

#### As Customer:
- Can raise issues about vendors
- Can view own issues
- Can add comments
- Cannot see internal issues

## 🔌 API Endpoints Available

### Main Endpoints
```
GET    /api/issues/              - List issues
POST   /api/issues/              - Create issue
GET    /api/issues/{id}/         - Get issue detail
PUT    /api/issues/{id}/         - Update issue
PATCH  /api/issues/{id}/         - Partial update
DELETE /api/issues/{id}/         - Delete issue
GET    /api/issues/stats/        - Get statistics
```

### Action Endpoints
```
POST   /api/issues/raise/        - Raise issue (with Linear sync)
POST   /api/issues/resolve/{id}/ - Resolve issue
POST   /api/issues/{id}/resolve/ - Resolve (viewset action)
POST   /api/issues/{id}/reopen/  - Reopen issue
```

### Client Endpoints
```
POST   /api/client/issues/raise/     - Client raises issue
GET    /api/client/issues/{id}/      - Client views issue
POST   /api/client/issues/{id}/comment/ - Client adds comment
```

## 📊 Features Available

### ✅ Core Features
- [x] Create, read, update, delete issues
- [x] Priority levels (low to critical)
- [x] Issue categories (quality, delivery, etc.)
- [x] Status workflow (open → in progress → resolved → closed)
- [x] Link issues to vendors
- [x] Link issues to orders
- [x] Assign to team members
- [x] Resolution notes
- [x] Issue numbering (ISS-YYYY-NNNN)

### ✅ Advanced Features
- [x] Client issue portal
- [x] Linear integration
- [x] Status sync to Linear
- [x] Webhook support
- [x] Permission-based access
- [x] Organization isolation
- [x] Search and filtering
- [x] Statistics dashboard

### ✅ User Interface
- [x] Issues list page
- [x] Issue detail page
- [x] Issue edit page
- [x] Create issue modal
- [x] Resolve issue modal
- [x] Client issues page
- [x] Responsive design
- [x] Loading states
- [x] Error handling

## 🔐 Permissions Required

### For Employees/Vendors:
- `issue:create` - Create new issues
- `issue:view` - View issues
- `issue:update` - Update/resolve issues
- `issue:delete` - Delete issues

### For Customers:
No explicit permissions needed - customers can:
- Raise issues (always allowed)
- View their own issues
- Add comments to their issues

## 🎯 Common Use Cases

### Use Case 1: Report a Quality Issue
```
1. Employee receives customer complaint
2. Navigate to /issues
3. Click "Create Issue"
4. Title: "Defective product - Order #1234"
5. Description: "Customer reports product malfunction..."
6. Priority: High
7. Category: Quality
8. Link to Order #1234
9. Submit
10. Issue syncs to Linear automatically
11. Assign to quality team
12. Resolve when fixed
```

### Use Case 2: Customer Raises Issue
```
1. Customer logs in (customer profile)
2. Navigate to /client/issues
3. Click "Raise Issue"
4. Select vendor/organization
5. Fill in details
6. Submit
7. Vendor receives notification
8. Customer can track status
9. Customer adds comments if needed
10. Vendor resolves and closes
```

### Use Case 3: Track Delivery Problem
```
1. Create issue with Category: Delivery
2. Link to specific order
3. Link to vendor
4. Set priority based on urgency
5. Update status as work progresses
6. Add resolution notes when solved
7. Close issue
```

## 🐛 Troubleshooting

### Issue: Cannot see issues
**Solution**: 
- Check you have an active organization
- Verify your role has `issue:view` permission
- Make sure you're on the correct profile

### Issue: Cannot create issues
**Solution**:
- Check you have `issue:create` permission
- Verify backend is running
- Check browser console for errors

### Issue: Linear sync not working
**Solution**:
- Verify LINEAR_API_KEY is set in backend
- Check Linear team ID is configured
- Review backend logs for sync errors

## 📚 Documentation

For detailed information, see:
- **Full Documentation**: `ISSUE_TRACKING_SYSTEM.md`
- **API Documentation**: Check backend `/api/` endpoints
- **Type Definitions**: `web-frontend/src/types/issue.types.ts`

## ✨ Next Steps

1. **Test the system**: Create and manage test issues
2. **Configure Linear** (optional): Set up Linear integration
3. **Set permissions**: Assign issue permissions to roles
4. **Train users**: Show team how to use the system
5. **Monitor usage**: Check statistics dashboard

## 🎉 You're All Set!

The issue tracking system is fully integrated and ready to use. Start by:
1. Login to the application
2. Navigate to `/issues`
3. Create your first issue!

---

**Need Help?**
- Review `ISSUE_TRACKING_SYSTEM.md` for detailed docs
- Check code comments in the source files
- Test with different user roles

**Happy Issue Tracking! 🚀**

