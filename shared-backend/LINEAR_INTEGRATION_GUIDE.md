# Linear Integration Implementation Guide

## Overview

The Linear integration is now fully implemented and automatically syncs CRM issues to Linear. This guide explains how it works and how to use it.

## Features

✅ **Auto-sync on Issue Creation**: New issues are automatically synced to Linear when created  
✅ **Auto-sync on Issue Update**: Issue updates (status, title, description, priority) sync to Linear  
✅ **Status Mapping**: CRM issue statuses are automatically mapped to Linear workflow states  
✅ **Priority Mapping**: CRM priorities are mapped to Linear priorities  
✅ **Bulk Sync**: Management command to sync existing unsynced issues  
✅ **Comment Sync**: Comments can be synced between CRM and Linear  

## Configuration

### 1. Environment Variables

The `.env` file in `shared-backend` should contain:

```env
LINEAR_API_KEY=your_linear_api_key_here
LINEAR_WEBHOOK_SECRET=your_webhook_secret_here (optional)
LINEAR_TEAM_ID=default_team_id (optional, for new organizations)
```

### 2. Get Linear API Key

1. Go to https://linear.app
2. Navigate to Settings → API
3. Click "Create API Key"
4. Copy the key and add it to `.env` as `LINEAR_API_KEY`

### 3. Configure Organizations

Each organization needs a Linear Team ID configured:

```bash
# Interactive configuration
python manage.py configure_linear

# Or specify organization and team
python manage.py configure_linear --organization-name "My Org" --team-id "TEAM_ID"

# List available teams
python manage.py configure_linear --list-teams
```

## How It Works

### Issue Creation Flow

1. Customer creates an issue in the CRM
2. `IssueViewSet.perform_create()` is called
3. If organization has `linear_team_id` configured:
   - Issue is automatically synced to Linear
   - Linear issue ID and URL are stored in the CRM issue
   - Status is mapped to appropriate Linear state
   - Priority is mapped to Linear priority

### Issue Update Flow

1. Issue is updated (status, title, description, priority)
2. `IssueViewSet.update()` is called
3. If issue is already synced:
   - Status changes are synced using `sync_issue_status_to_linear()`
   - Field changes (title, description, priority) are synced
4. If issue is not synced but organization has `linear_team_id`:
   - Issue is automatically synced to Linear (initial sync)

### Status Mapping

CRM statuses are mapped to Linear states:

| CRM Status | Linear State Types | Linear State Names |
|------------|-------------------|-------------------|
| `open` | unstarted, started | Todo, Backlog, Triage, Open, New |
| `in_progress` | started | In Progress, Started, Working, Active |
| `resolved` | completed | Done, Completed, Resolved, Fixed |
| `closed` | canceled, completed | Canceled, Cancelled, Closed |

### Priority Mapping

| CRM Priority | Linear Priority |
|--------------|-----------------|
| `urgent` | 1 (Urgent) |
| `high` | 2 (High) |
| `medium` | 3 (Normal) |
| `low` | 4 (Low) |

## Management Commands

### Sync Existing Issues

Sync all unsynced issues to Linear:

```bash
python manage.py sync_issues_to_linear
```

Sync issues for a specific organization:

```bash
python manage.py sync_issues_to_linear --organization-id 1
```

Force re-sync already synced issues:

```bash
python manage.py sync_issues_to_linear --force
```

### Configure Linear for Organizations

```bash
# Interactive mode
python manage.py configure_linear

# With parameters
python manage.py configure_linear --organization-name "My Org" --team-id "TEAM_ID"

# List available teams
python manage.py configure_linear --list-teams

# Test integration
python manage.py configure_linear --organization-name "My Org" --test
```

## Testing

Run the test script to verify Linear integration:

```bash
python test_linear_integration.py
```

This will:
- ✅ Test Linear API connection
- ✅ List available Linear teams
- ✅ Check organization Linear configuration
- ✅ Show issue sync status
- ✅ Optionally create and sync a test issue

## API Endpoints

### Manual Sync Actions

The `IssueViewSet` provides several actions for manual syncing:

- `POST /api/issues/{id}/sync_to_linear/` - Sync issue to Linear
- `POST /api/issues/{id}/sync_from_linear/` - Pull changes from Linear
- `POST /api/issues/bulk_sync_to_linear/` - Bulk sync multiple issues
- `GET /api/issues/import_from_linear/` - Import issues from Linear

## Code Structure

### Services

- **`LinearService`** (`crmApp/services/linear_service.py`): Core Linear API client
  - Handles GraphQL queries and mutations
  - Manages teams, issues, states, priorities
  - Provides utility methods for mapping

- **`IssueLinearService`** (`crmApp/services/issue_linear_service.py`): CRM-Linear sync service
  - Handles issue synchronization logic
  - Maps CRM statuses to Linear states
  - Manages sync state and errors

### ViewSets

- **`IssueViewSet`** (`crmApp/viewsets/issue.py`): Main issue viewset
  - Auto-syncs on create and update
  - Provides manual sync actions
  - Handles permissions and organization filtering

### Models

The `Issue` model includes Linear sync fields:

- `synced_to_linear` (BooleanField): Whether issue is synced
- `linear_issue_id` (CharField): Linear issue ID
- `linear_issue_url` (URLField): Link to Linear issue
- `linear_team_id` (CharField): Linear team ID used
- `last_synced_at` (DateTimeField): Last sync timestamp

## Troubleshooting

### Issues Not Syncing

1. **Check API Key**: Verify `LINEAR_API_KEY` is set in `.env`
2. **Check Organization**: Ensure organization has `linear_team_id` configured
3. **Check Logs**: Look for errors in Django logs (`logs/django.log`)
4. **Test Connection**: Run `python test_linear_integration.py`

### Status Not Mapping Correctly

1. **Check Linear States**: Verify your Linear team has appropriate states
2. **Check State Names**: Ensure state names match the mapping (case-insensitive)
3. **View Logs**: Check logs for mapping warnings

### API Errors

1. **Invalid API Key**: Regenerate API key in Linear settings
2. **Rate Limiting**: Linear has rate limits - check if you're hitting them
3. **Network Issues**: Check internet connection and Linear API status

## Best Practices

1. **Configure Early**: Set up Linear Team IDs for organizations before creating issues
2. **Monitor Syncs**: Check `last_synced_at` to ensure issues are syncing
3. **Handle Errors Gracefully**: Sync failures don't block issue creation/updates
4. **Test First**: Use test script before production deployment
5. **Backup Data**: Linear sync is one-way (CRM → Linear), keep CRM as source of truth

## Security

- ✅ API keys are stored in `.env` (not committed to git)
- ✅ Linear webhook secret for verifying webhook requests
- ✅ Organization-level team IDs (each org can have different Linear team)
- ✅ Permission checks before syncing

## Next Steps

1. Configure Linear Team IDs for all organizations
2. Test with a few issues
3. Run bulk sync for existing issues if needed
4. Monitor sync status in logs
5. Set up Linear webhooks for bidirectional sync (optional)

## Support

For issues or questions:
- Check Django logs: `logs/django.log`
- Run test script: `python test_linear_integration.py`
- Review Linear API documentation: https://developers.linear.app/docs

