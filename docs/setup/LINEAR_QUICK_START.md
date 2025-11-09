# Linear Integration - Quick Start Guide

## 🚀 Quick Setup (5 minutes)

### Step 1: Get Your Linear API Key

1. Go to https://linear.app/settings/api
2. Click **"Create API Key"**
3. Give it a name (e.g., "CRM Integration")
4. Copy the API key (starts with `lin_api_...`)

### Step 2: Add API Key to Environment

Add to your `.env` file in `shared-backend/`:

```bash
LINEAR_API_KEY=lin_api_your_key_here
```

### Step 3: List Your Linear Teams

```bash
cd shared-backend
python manage.py configure_linear --list-teams
```

This will show:
- Your Linear account info
- All available teams
- Team IDs you can use

### Step 4: Configure Organization

**Option A: Interactive (Recommended)**
```bash
python manage.py configure_linear
```

**Option B: With Parameters**
```bash
python manage.py configure_linear --organization-name "Your Org Name" --team-id "your-team-id" --test
```

The `--test` flag will create a test issue in Linear to verify everything works.

### Step 5: Verify Configuration

After configuration, test by creating an issue:

1. Create an issue via the API or frontend
2. Check Linear.app - the issue should appear automatically
3. Update issue status - it should sync to Linear
4. Resolve the issue - it should sync to Linear

## ✅ What Happens Next?

Once configured:

- ✅ **Customer raises issue** → Automatically synced to Linear
- ✅ **Status changes** → Automatically synced to Linear  
- ✅ **Issue resolved** → Automatically synced to Linear
- ✅ **Vendors/Employees** → Can view and manage issues in both systems

## 🔧 Troubleshooting

### "LINEAR_API_KEY not configured"
- Check `.env` file has `LINEAR_API_KEY=...`
- Restart Django server after adding the key

### "No teams found"
- Create a team in Linear.app first
- Make sure you have access to the team

### "Failed to sync to Linear"
- Check API key is valid
- Verify team ID is correct
- Check Django logs for detailed errors

## 📝 Example Commands

```bash
# List all teams
python manage.py configure_linear --list-teams

# Configure organization interactively
python manage.py configure_linear

# Configure with team ID
python manage.py configure_linear --organization-name "My Org" --team-id "abc123" --test

# Configure by organization ID
python manage.py configure_linear --organization-id 1 --team-id "abc123"
```

## 🎯 Next Steps

1. ✅ Configure Linear for your organizations
2. ✅ Test issue creation
3. ✅ Verify issues sync to Linear
4. ✅ Test status updates
5. ✅ Monitor Linear sync in logs

---

**Need Help?** Check `LINEAR_SETUP_GUIDE.md` for detailed instructions.

