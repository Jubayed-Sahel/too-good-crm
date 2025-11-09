# Linear Integration Setup Guide

This guide will help you configure Linear integration for your CRM system.

## Prerequisites

1. **Linear Account**: You need a Linear.app account
2. **Linear Workspace**: You need a workspace with at least one team
3. **API Key**: You need a Linear API key

## Step 1: Get Linear API Key

1. Go to [Linear.app](https://linear.app)
2. Log in to your account
3. Go to **Settings** → **API** (or visit https://linear.app/settings/api)
4. Click **Create API Key**
5. Give it a name (e.g., "CRM Integration")
6. Copy the API key (starts with `lin_api_...`)

## Step 2: Configure API Key in Django

### Option A: Environment Variable (Recommended)

Add to your `.env` file in `shared-backend/`:

```bash
LINEAR_API_KEY=lin_api_your_key_here
```

### Option B: Django Settings

Add to `shared-backend/crmAdmin/settings.py`:

```python
LINEAR_API_KEY = os.getenv('LINEAR_API_KEY', 'lin_api_your_key_here')
```

## Step 3: Get Linear Team ID

### Option A: Using Management Command (Recommended)

```bash
cd shared-backend
python manage.py configure_linear --list-teams
```

This will show all available teams and their IDs.

### Option B: Using Script

```bash
cd shared-backend
python scripts/utilities/get_linear_team_id.py
```

### Option C: From Linear UI

1. Go to your Linear workspace
2. Open the team you want to use
3. The team ID is in the URL or you can get it from the API

## Step 4: Configure Organization with Linear Team ID

### Option A: Using Management Command (Recommended)

```bash
cd shared-backend
python manage.py configure_linear --organization-name "Your Org Name" --team-id "your-team-id" --test
```

This will:
- Configure the organization with Linear team ID
- Test the integration by creating a test issue

### Option B: Using Django Shell

```bash
cd shared-backend
python manage.py shell
```

```python
from crmApp.models import Organization

# Get your organization
org = Organization.objects.get(name="Your Org Name")

# Set Linear team ID
org.linear_team_id = "your-team-id"
org.save()

print(f"✅ Configured Linear for {org.name}")
```

### Option C: Using Django Admin

1. Go to Django admin
2. Navigate to Organizations
3. Edit your organization
4. Set the `linear_team_id` field
5. Save

## Step 5: Verify Configuration

### Test Linear Integration

```bash
cd shared-backend
python manage.py configure_linear --organization-name "Your Org Name" --test
```

### Test Issue Creation

1. Create a test issue via the API or frontend
2. Check if it syncs to Linear
3. Verify the issue appears in Linear.app

## Step 6: Test Issue Sync

### Create a Test Issue

```bash
# Using the API
curl -X POST http://localhost:8000/api/client/issues/raise/ \
  -H "Authorization: Token your-token" \
  -H "Content-Type: application/json" \
  -d '{
    "organization": 1,
    "title": "Test Issue",
    "description": "Testing Linear sync",
    "priority": "medium",
    "category": "general"
  }'
```

### Check Linear

1. Go to Linear.app
2. Navigate to your team
3. Verify the issue was created
4. Check that the issue has the correct title and description

## Configuration for Multiple Organizations

If you have multiple organizations, configure each one separately:

```bash
# Configure Organization 1
python manage.py configure_linear --organization-name "Org 1" --team-id "team-id-1"

# Configure Organization 2
python manage.py configure_linear --organization-name "Org 2" --team-id "team-id-2"
```

## How It Works

### Automatic Sync

1. **Customer raises issue** → Issue created in CRM
2. **If Linear configured** → Issue automatically synced to Linear
3. **Status changes** → Automatically synced to Linear
4. **Resolution** → Automatically synced to Linear

### Manual Sync

Vendors and employees can also manually sync issues:

```bash
POST /api/issues/{id}/sync_to_linear/
```

### Status Mapping

CRM statuses are mapped to Linear states:
- `open` → Todo/Backlog/Triage/Open
- `in_progress` → In Progress/Started/Working
- `resolved` → Done/Completed/Resolved/Closed
- `closed` → Canceled/Closed/Cancelled

## Troubleshooting

### Issue: "LINEAR_API_KEY not configured"

**Solution:**
1. Check if `LINEAR_API_KEY` is set in `.env` file
2. Restart Django server after setting the key
3. Verify the key is correct (starts with `lin_api_`)

### Issue: "Team ID not found"

**Solution:**
1. Run `python manage.py configure_linear --list-teams` to see available teams
2. Verify the team ID is correct
3. Check that you have access to the team in Linear

### Issue: "Failed to sync to Linear"

**Solution:**
1. Check Linear API key is valid
2. Verify team ID is correct
3. Check Linear API status
4. Review Django logs for detailed error messages

### Issue: "Issues not syncing automatically"

**Solution:**
1. Verify organization has `linear_team_id` set
2. Check that `LINEAR_API_KEY` is configured
3. Verify Linear API is accessible
4. Check Django logs for errors

## Verification Checklist

- [ ] Linear API key is set in environment variables
- [ ] Organization has `linear_team_id` configured
- [ ] Test issue creation works
- [ ] Issues sync to Linear automatically
- [ ] Status changes sync to Linear
- [ ] Linear issues appear in Linear.app
- [ ] Issue URLs are stored correctly

## API Endpoints

### Sync Issue to Linear
```
POST /api/issues/{id}/sync_to_linear/
```

### Sync Issue from Linear
```
POST /api/issues/{id}/sync_from_linear/
```

### Get Issue Statistics
```
GET /api/issues/stats/
```

## Management Commands

### List Linear Teams
```bash
python manage.py configure_linear --list-teams
```

### Configure Organization
```bash
python manage.py configure_linear --organization-name "Org Name" --team-id "team-id"
```

### Test Integration
```bash
python manage.py configure_linear --organization-name "Org Name" --test
```

## Next Steps

After configuration:

1. ✅ Test issue creation
2. ✅ Verify issues sync to Linear
3. ✅ Test status changes
4. ✅ Test issue resolution
5. ✅ Monitor Linear sync in logs

## Support

If you encounter issues:

1. Check Django logs: `shared-backend/logs/django.log`
2. Check Linear API status
3. Verify API key and team ID
4. Review error messages in console

---

**Status**: ✅ Ready to configure
**Last Updated**: 2025-11-09

