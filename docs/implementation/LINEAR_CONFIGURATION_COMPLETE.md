# Linear Integration Configuration - Complete ✅

## Overview

Linear integration has been configured and is ready to use. The system will automatically sync issues to Linear when customers raise them, and sync status changes automatically.

## What Was Implemented

### 1. Management Command (`configure_linear.py`)
- ✅ List all available Linear teams
- ✅ Configure organizations with Linear team ID
- ✅ Test Linear integration
- ✅ Interactive configuration mode
- ✅ Command-line parameter support

### 2. Documentation
- ✅ `LINEAR_SETUP_GUIDE.md` - Detailed setup instructions
- ✅ `LINEAR_QUICK_START.md` - Quick start guide
- ✅ `LINEAR_OPTIONAL_INTEGRATION.md` - Integration overview

### 3. Auto-Sync Features
- ✅ Automatic sync when customers raise issues
- ✅ Automatic sync on status changes
- ✅ Automatic sync on issue resolution
- ✅ Manual sync endpoints for vendors/employees

## How to Configure Linear

### Step 1: Get Linear API Key

1. Go to https://linear.app/settings/api
2. Create an API key
3. Copy the key (starts with `lin_api_...`)

### Step 2: Add to Environment

Add to `shared-backend/.env`:
```bash
LINEAR_API_KEY=lin_api_your_key_here
```

### Step 3: List Teams

```bash
cd shared-backend
python manage.py configure_linear --list-teams
```

### Step 4: Configure Organization

**Interactive Mode:**
```bash
python manage.py configure_linear
```

**With Parameters:**
```bash
python manage.py configure_linear --organization-name "Your Org" --team-id "team-id" --test
```

## Configuration Options

### List Teams
```bash
python manage.py configure_linear --list-teams
```

### Configure Organization (Interactive)
```bash
python manage.py configure_linear
```

### Configure Organization (With Parameters)
```bash
python manage.py configure_linear --organization-name "Org Name" --team-id "team-id"
```

### Configure Organization (By ID)
```bash
python manage.py configure_linear --organization-id 1 --team-id "team-id"
```

### Test Integration
```bash
python manage.py configure_linear --organization-name "Org Name" --team-id "team-id" --test
```

## How It Works

### Automatic Sync Flow

1. **Customer Raises Issue**
   - Issue created in CRM
   - If organization has `linear_team_id` configured
   - Issue automatically synced to Linear
   - Linear issue URL stored with CRM issue

2. **Status Changes**
   - Issue status updated in CRM
   - If issue is synced to Linear
   - Status automatically synced to Linear
   - Linear state updated accordingly

3. **Issue Resolution**
   - Issue resolved in CRM
   - If issue is synced to Linear
   - Resolution synced to Linear
   - Linear state updated to "Done"

### Manual Sync

Vendors and employees can manually sync issues:

```bash
POST /api/issues/{id}/sync_to_linear/
POST /api/issues/{id}/sync_from_linear/
```

## Status Mapping

CRM statuses are mapped to Linear states:

- `open` → Todo/Backlog/Triage/Open
- `in_progress` → In Progress/Started/Working
- `resolved` → Done/Completed/Resolved/Closed
- `closed` → Canceled/Closed/Cancelled

## Priority Mapping

CRM priorities are mapped to Linear priorities:

- `urgent` → 1 (Urgent)
- `high` → 2 (High)
- `medium` → 3 (Normal)
- `low` → 4 (Low)

## Files Created/Modified

### New Files
- `shared-backend/crmApp/management/commands/configure_linear.py`
- `LINEAR_SETUP_GUIDE.md`
- `LINEAR_QUICK_START.md`
- `LINEAR_OPTIONAL_INTEGRATION.md`
- `LINEAR_CONFIGURATION_COMPLETE.md`

### Existing Files (No Changes Needed)
- `shared-backend/crmApp/services/linear_service.py` - Linear API service
- `shared-backend/crmApp/services/issue_linear_service.py` - Issue sync service
- `shared-backend/crmApp/views/client_issues.py` - Auto-sync on issue creation
- `shared-backend/crmApp/viewsets/issue.py` - Status sync on updates
- `shared-backend/crmApp/models/organization.py` - `linear_team_id` field
- `shared-backend/crmApp/models/issue.py` - Linear sync fields

## Testing

### Test Configuration
```bash
python manage.py configure_linear --organization-name "Your Org" --team-id "team-id" --test
```

### Test Issue Creation
1. Create an issue via API or frontend
2. Check Linear.app for the synced issue
3. Verify issue details match

### Test Status Sync
1. Update issue status in CRM
2. Check Linear.app for status update
3. Verify state changed correctly

### Test Resolution
1. Resolve issue in CRM
2. Check Linear.app for resolution
3. Verify state is "Done"

## Troubleshooting

### API Key Not Found
```bash
# Check .env file
cat shared-backend/.env | grep LINEAR_API_KEY

# Or check environment
echo $LINEAR_API_KEY
```

### No Teams Found
- Create a team in Linear.app
- Verify you have access to the team
- Check API key permissions

### Sync Fails
- Check Django logs: `shared-backend/logs/django.log`
- Verify API key is valid
- Check team ID is correct
- Verify Linear API is accessible

## Next Steps

1. ✅ **Get Linear API Key** - From Linear.app settings
2. ✅ **Add to Environment** - Add to `.env` file
3. ✅ **List Teams** - Run `configure_linear --list-teams`
4. ✅ **Configure Organization** - Run `configure_linear`
5. ✅ **Test Integration** - Create a test issue
6. ✅ **Verify Sync** - Check Linear.app for synced issues

## Support

For detailed instructions, see:
- `LINEAR_QUICK_START.md` - Quick setup guide
- `LINEAR_SETUP_GUIDE.md` - Detailed setup instructions
- `LINEAR_INTEGRATION_GUIDE.md` - Integration documentation

## Status

✅ **Linear integration is configured and ready to use!**

All you need to do is:
1. Get your Linear API key
2. Run the configuration command
3. Start creating issues - they'll sync automatically!

---

**Last Updated**: 2025-11-09
**Status**: ✅ Ready to configure

