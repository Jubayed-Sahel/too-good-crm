# Mobile App Linear Sync Status

## ✅ Current Status

### Backend Implementation
- **Endpoint**: `POST /api/client/issues/raise/` ✅
- **Linear Sync**: Automatically enabled ✅
- **Sync Service**: `IssueLinearService` ✅
- **API Key**: Configured ✅

### Mobile App Implementation
- **API Service**: `IssueApiService.createIssue()` ✅
- **Data Models**: Includes Linear fields ✅
  - `linearIssueId`
  - `linearIssueUrl`
  - `syncedToLinear`
- **UI Display**: Shows Linear sync status ✅

## How It Works

### Issue Creation Flow

1. **Mobile App** → Calls `POST /api/client/issues/raise/`
2. **Backend** → Creates issue in database
3. **Backend** → Automatically syncs to Linear:
   - Gets Linear team ID (from organization, settings, or auto-fetches)
   - Creates issue in Linear
   - Updates issue with Linear data (`linear_issue_id`, `linear_issue_url`)
   - Sets `synced_to_linear = True`
4. **Backend** → Returns response with:
   - Issue data (including Linear fields)
   - `linear_data` object (if sync successful)
   - Message: "Issue raised successfully and synced to Linear"

### Linear Team ID Resolution

The backend tries multiple sources in order:
1. Request data (`team_id` parameter)
2. Organization's `linear_team_id` field
3. Settings `LINEAR_TEAM_ID` (from .env)
4. **Auto-fetch**: Gets first available team from Linear API
5. **Auto-save**: Saves team ID to organization for future use

## Verification

### Check if Sync is Working

1. **Create an issue from mobile app**
2. **Check response**:
   - Look for `synced_to_linear: true` in issue data
   - Look for `linear_issue_url` in issue data
   - Check response message includes "synced to Linear"

3. **Check Linear workspace**:
   - Issue should appear in Linear
   - Issue should have correct title, description, priority

### Troubleshooting

#### Issue: Sync not happening

**Check 1: Linear API Key**
```bash
cd shared-backend
python -c "import os; from dotenv import load_dotenv; load_dotenv(); print('LINEAR_API_KEY:', 'SET' if os.getenv('LINEAR_API_KEY') else 'NOT SET')"
```

**Check 2: Organization has Linear Team ID**
- Backend will auto-fetch if not set
- Check Django logs for: "Using first available Linear team as default"

**Check 3: Backend Logs**
- Look for: "Attempting to sync issue {issue_number} to Linear"
- Look for: "Issue {issue_number} auto-synced to Linear"
- Or errors: "Linear sync failed for issue"

#### Issue: Sync fails silently

The backend doesn't fail the request if Linear sync fails. Check:
- Django server logs
- Linear API key validity
- Network connectivity to Linear API

## Mobile App Display

The mobile app shows Linear sync status in:
- **CustomerIssuesListScreen**: Shows "Synced to Linear" badge
- **CustomerIssueDetailScreen**: Shows Linear link button
- **VendorIssuesListScreen**: Shows "Linear" badge
- **VendorIssueDetailScreen**: Shows Linear link button

## Next Steps

If sync is not working:

1. **Verify Linear API Key** is valid
2. **Check Django logs** for sync errors
3. **Test Linear API** directly:
   ```bash
   cd shared-backend
   python test_linear_integration.py
   ```

4. **Assign Linear Team IDs** to organizations:
   ```bash
   python manage.py assign_linear_team_ids
   ```

## Summary

✅ **Linear sync IS implemented and should be working automatically**

The backend automatically syncs issues to Linear when created from the mobile app. If sync is not happening, check:
- Linear API key is configured
- Backend logs for errors
- Organization has Linear team ID (will auto-fetch if missing)

