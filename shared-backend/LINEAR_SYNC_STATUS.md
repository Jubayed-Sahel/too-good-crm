# Linear Sync Status

## ✅ Configuration Complete

- **Organization**: ahmed ltd
- **Linear Team ID**: `b95250db-8430-4dbc-88f8-9fc109369df0`
- **Linear Team**: Too-good-crm (TOO)

## ✅ Existing Issues Synced

- **ISS-2025-0001**: Successfully synced to Linear
  - Linear Issue: TOO-22
  - Linear URL: https://linear.app/too-good-crm/issue/TOO-22/hellllllloooooooooooooooo
  - Status: resolved → Linear State: Done

## ✅ Auto-Sync Enabled

New issues created by customers will automatically sync to Linear when:
1. The organization has a `linear_team_id` configured ✅
2. The issue is created through the API
3. The Linear API key is valid ✅

## How It Works

1. **Issue Creation**: When a customer creates an issue, it automatically syncs to Linear
2. **Issue Updates**: When an issue is updated (status, title, description, priority), changes sync to Linear
3. **Status Mapping**: 
   - `open` → Todo/Backlog
   - `in_progress` → In Progress
   - `resolved` → Done
   - `closed` → Canceled/Closed

## Testing

To test the integration:
1. Create a new issue as a customer
2. Check Linear app - the issue should appear automatically
3. Update the issue status - it should update in Linear

## Manual Sync

If you need to manually sync issues:
```bash
python manage.py sync_issues_to_linear
```

## Troubleshooting

If issues aren't syncing:
1. Check organization has `linear_team_id`: `python manage.py shell -c "from crmApp.models import Organization; print(Organization.objects.first().linear_team_id)"`
2. Check Linear API key in `.env` file
3. Check Django logs: `logs/django.log`
4. Run test script: `python test_linear_integration.py`

