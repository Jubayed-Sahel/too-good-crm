# Linear Team Setup Guide

## Problem: Shared Linear Teams

When multiple organizations share the same Linear team ID, all organizations will see and sync ALL issues from that team. This causes:
- ❌ Organization A sees Organization B's issues
- ❌ Issues get synced to the wrong organization
- ❌ No data isolation between organizations

## Solution: Unique Linear Teams

Each organization should have its own dedicated Linear team for proper isolation.

## Setup Steps

### 1. Check Current Configuration

List all organizations and their Linear team assignments:

```bash
cd too-good-crm/shared-backend
python manage.py setup_linear_teams --list-orgs
```

This will show:
- Which organizations have Linear teams assigned
- Which teams are shared by multiple organizations (⚠ Warning)

### 2. View Available Linear Teams

List all teams in your Linear workspace:

```bash
python manage.py setup_linear_teams --list-teams
```

This will display:
- Team names
- Team keys
- Team IDs

### 3. Create New Teams in Linear (if needed)

If you don't have enough teams:

1. Go to [Linear](https://linear.app)
2. Click on your workspace name (top left)
3. Select **"Settings"** → **"Teams"**
4. Click **"Create team"**
5. Name it after your organization (e.g., "Ahmed Ltd", "Dummy Ltd")
6. Copy the team ID from the URL or settings

### 4. Assign Teams to Organizations

#### Option A: Interactive Setup

```bash
python manage.py setup_linear_teams
```

Follow the prompts to assign teams.

#### Option B: Command Line

```bash
python manage.py setup_linear_teams --assign <ORG_ID> <TEAM_ID>
```

Example:
```bash
python manage.py setup_linear_teams --assign 1 "abc123-def456-ghi789"
```

### 5. Verify Configuration

Check that each organization has a unique team:

```bash
python manage.py setup_linear_teams --list-orgs
```

You should see:
- ✓ All organizations have teams assigned
- ✓ No warnings about shared teams

## Best Practices

### 1. One Team Per Organization
```
✓ Ahmed Ltd    → Linear Team: "Ahmed Ltd" (team-abc123)
✓ Dummy Ltd    → Linear Team: "Dummy Ltd" (team-def456)
✓ Demo Company → Linear Team: "Demo Co"   (team-ghi789)
```

### 2. Team Naming Convention
- Use organization name as team name
- Makes it easy to identify which team belongs to which org

### 3. Regular Audits
Run `--list-orgs` periodically to ensure:
- New organizations have teams assigned
- No teams are accidentally shared

## Troubleshooting

### Issue: "Linear team ID not configured"

**Solution:** Assign a Linear team to the organization:
```bash
python manage.py setup_linear_teams --assign <ORG_ID> <TEAM_ID>
```

### Issue: "Seeing other organization's issues"

**Cause:** Multiple organizations share the same Linear team

**Solution:** 
1. Create separate teams in Linear
2. Assign unique teams to each organization
3. Re-sync issues

### Issue: "Can't create more teams in Linear"

**Options:**
1. Upgrade your Linear plan for more teams
2. Use Linear labels to tag issues by organization (not recommended)
3. Use separate Linear workspaces for different organizations

## Migration Guide

If you currently have shared teams and want to migrate:

### Step 1: Backup Current Issues
```bash
python manage.py dumpdata crmApp.Issue > issues_backup.json
```

### Step 2: Create New Teams in Linear
Create one team per organization in Linear workspace.

### Step 3: Assign New Teams
```bash
python manage.py setup_linear_teams --assign 1 "new-team-id-1"
python manage.py setup_linear_teams --assign 2 "new-team-id-2"
```

### Step 4: Migrate Existing Issues
For each organization, sync their issues to the new team:
1. Go to Issues page
2. Click "Sync from Linear"
3. Issues will be synced to the new team

### Step 5: Clean Up Old Team (Optional)
Archive or delete issues from the old shared team in Linear.

## API Configuration

The Linear integration uses these environment variables:

```bash
# .env file
LINEAR_API_KEY=lin_api_xxxxxxxxxxxxx
LINEAR_WEBHOOK_SECRET=lin_wh_xxxxxxxxxxxxx
LINEAR_TEAM_ID=default-team-id  # Fallback for new orgs
```

## Quick Reference

```bash
# List organizations
python manage.py setup_linear_teams --list-orgs

# List Linear teams
python manage.py setup_linear_teams --list-teams

# Assign team to org
python manage.py setup_linear_teams --assign <ORG_ID> <TEAM_ID>

# Clear assignment
python manage.py setup_linear_teams --clear <ORG_ID>

# Interactive mode
python manage.py setup_linear_teams
```

## Support

For issues or questions:
1. Check Django logs: `tail -f logs/django.log`
2. Verify Linear API key is valid
3. Ensure teams exist in Linear workspace
4. Check organization has active profile

