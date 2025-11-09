# Vendor and Employee Issue Management

## Overview

Vendors and employees can now view and manage customer-raised issues in their organization. This document describes the functionality and permissions.

## Features

### 1. View Issues
- **Vendors**: Can see all issues in their organization (customer-raised and internal)
- **Employees**: Can see all issues in their organization (customer-raised and internal)
- **Customers**: Can only see issues they raised

### 2. Manage Issues
Vendors and employees can:
- ✅ **View** all issues in their organization
- ✅ **Update** issue details (title, description, priority, category, status)
- ✅ **Assign** issues to employees
- ✅ **Resolve** issues with resolution notes
- ✅ **Reopen** resolved issues
- ✅ **Delete** issues (with organization check)
- ✅ **Sync** issues to/from Linear (if configured)

### 3. Issue Assignment
- Vendors and employees can assign issues to employees in their organization
- When an issue is assigned, status automatically changes to "in_progress" if it was "open"
- Only active employees in the same organization can be assigned

## API Endpoints

### List Issues
```
GET /api/issues/
```
Returns all issues for the user's organization (filtered by profile type)

### Get Issue Details
```
GET /api/issues/{id}/
```
Returns detailed information about a specific issue

### Update Issue
```
PATCH /api/issues/{id}/
PUT /api/issues/{id}/
```
Update issue details (title, description, priority, category, status, etc.)

### Assign Issue
```
POST /api/issues/{id}/assign/
Body: { "employee_id": 123 }
```
Assign issue to an employee

### Resolve Issue
```
POST /api/issues/{id}/resolve/
Body: { "resolution_notes": "Issue resolved by..." }
```
Mark issue as resolved with optional resolution notes

### Reopen Issue
```
POST /api/issues/{id}/reopen/
```
Reopen a resolved issue

### Delete Issue
```
DELETE /api/issues/{id}/
```
Delete an issue (only if it belongs to the user's organization)

### Get Statistics
```
GET /api/issues/stats/
```
Get issue statistics (by status, priority, category, etc.)

### Sync to Linear
```
POST /api/issues/{id}/sync_to_linear/
```
Sync issue to Linear (if Linear is configured)

### Sync from Linear
```
POST /api/issues/{id}/sync_from_linear/
```
Pull latest changes from Linear

## Permissions

### Vendor Permissions
- ✅ View all issues in their organization
- ✅ Update issues in their organization
- ✅ Assign issues to employees
- ✅ Resolve/reopen issues
- ✅ Delete issues in their organization
- ✅ Sync issues to/from Linear
- ❌ Cannot raise new issues (only customers can)

### Employee Permissions
- ✅ View all issues in their organization
- ✅ Update issues in their organization
- ✅ Assign issues to employees
- ✅ Resolve/reopen issues
- ✅ Delete issues in their organization
- ✅ Sync issues to/from Linear
- ❌ Cannot raise new issues (only customers can)

### Customer Permissions
- ✅ View only issues they raised
- ✅ Update only their own issues
- ✅ Delete only their own issues
- ❌ Cannot resolve/reopen issues
- ❌ Cannot assign issues
- ❌ Cannot sync to Linear

## Frontend Integration

### Issues Page
- **Route**: `/issues`
- **Access**: Vendors and employees
- **Features**:
  - View all issues in organization
  - Filter by status, priority, category
  - Search issues
  - Update issue status
  - Assign issues to employees
  - Resolve issues
  - Delete issues
  - View statistics

### Components
- `IssuesPage.tsx` - Main issues management page
- `IssuesDataTable.tsx` - Table displaying issues
- `IssueFiltersPanel.tsx` - Filtering interface
- `IssueStatsGrid.tsx` - Statistics display
- `ResolveIssueModal.tsx` - Modal for resolving issues

## Backend Implementation

### IssueViewSet
- **Location**: `crmApp/viewsets/issue.py`
- **Key Methods**:
  - `get_queryset()` - Filters issues based on user profile type
  - `update()` - Updates issue with permission checks
  - `assign()` - Assigns issue to employee
  - `resolve()` - Resolves issue with notes
  - `reopen()` - Reopens resolved issue
  - `destroy()` - Deletes issue with permission checks

### Queryset Filtering
- **Vendors**: `organization=active_profile.organization`
- **Employees**: `organization=active_profile.organization`
- **Customers**: `raised_by_customer=customer`

### Permission Checks
- Organization-based: Users can only manage issues in their organization
- Profile-based: Different permissions for vendors, employees, and customers
- No strict RBAC checks for vendors/employees (implicit permission for org issues)

## Testing

### Test Scenarios

1. **Vendor Views Issues**
   - Vendor should see all issues in their organization
   - Vendor should see customer-raised issues
   - Vendor should see internal issues

2. **Employee Views Issues**
   - Employee should see all issues in their organization
   - Employee should see customer-raised issues
   - Employee should see internal issues

3. **Assign Issue**
   - Vendor/employee can assign issue to employee
   - Issue status changes to "in_progress" if open
   - Only employees in same organization can be assigned

4. **Resolve Issue**
   - Vendor/employee can resolve issue
   - Resolution notes are saved
   - Issue status changes to "resolved"
   - Resolved_by is set to employee

5. **Update Issue**
   - Vendor/employee can update issue details
   - Changes are synced to Linear if configured
   - Status changes trigger Linear sync

6. **Delete Issue**
   - Vendor/employee can delete issues in their organization
   - Cannot delete issues from other organizations

## API Examples

### Assign Issue to Employee
```bash
POST /api/issues/123/assign/
Authorization: Token <token>
Content-Type: application/json

{
  "employee_id": 456
}
```

### Resolve Issue
```bash
POST /api/issues/123/resolve/
Authorization: Token <token>
Content-Type: application/json

{
  "resolution_notes": "Issue resolved by fixing the bug in the payment gateway integration."
}
```

### Update Issue Status
```bash
PATCH /api/issues/123/
Authorization: Token <token>
Content-Type: application/json

{
  "status": "in_progress",
  "priority": "high"
}
```

## Changes Made

### Backend Changes

1. **IssueViewSet.get_queryset()**
   - Updated to show all issues for vendors and employees (not just customer-raised)
   - Fixed organization filtering for employees

2. **IssueViewSet.update()**
   - Added permission check for vendors and employees
   - Allows updates for issues in their organization

3. **IssueViewSet.destroy()**
   - Added permission check for vendors and employees
   - Allows deletion for issues in their organization

4. **IssueViewSet.resolve()**
   - Updated permission check for vendors and employees
   - Customers cannot resolve issues

5. **IssueViewSet.reopen()**
   - Updated permission check for vendors and employees
   - Customers cannot reopen issues

6. **IssueViewSet.assign()** (NEW)
   - New action to assign issues to employees
   - Updates status to "in_progress" if open
   - Validates employee belongs to same organization

7. **IssueViewSet.sync_to_linear()**
   - Updated permission check for vendors and employees

8. **IssueViewSet.sync_from_linear()**
   - Updated permission check for vendors and employees

### Frontend Changes

- No changes needed - frontend already supports issue management for vendors and employees
- IssuesPage is already configured for vendor/employee profiles

## Usage

### For Vendors
1. Navigate to `/issues` page
2. View all customer-raised issues
3. Assign issues to employees
4. Update issue status and details
5. Resolve issues with notes
6. Monitor issue statistics

### For Employees
1. Navigate to `/issues` page
2. View all issues assigned to them or in their organization
3. Update issue status and details
4. Resolve issues with notes
5. Assign issues to other employees (if needed)

## Notes

- Issues are automatically filtered by organization
- Customer-raised issues are marked with `is_client_issue=True`
- Issues can be synced to Linear if organization has Linear configured
- Status changes automatically sync to Linear
- Resolution notes are appended to issue description

---

**Status**: ✅ Implemented
**Date**: 2025-11-09
**Tested**: Yes

