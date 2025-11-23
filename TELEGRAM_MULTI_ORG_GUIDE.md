# Telegram Bot Multi-Organization Support

## Problem Solved

**Issue**: When users have multiple profiles (e.g., vendor in Org A, employee in Org B), data created via Telegram bot wasn't showing in the web frontend because they were in different organizational contexts.

**Root Cause**: 
- Telegram bot always used the user's **primary profile**
- Web frontend uses whichever profile the user **currently has selected**
- If these profiles belonged to different organizations, the data wouldn't match

## Solution Implemented

### 1. Profile Selection in Telegram

Added the ability for users to see and switch between their different organizational profiles directly in Telegram.

### 2. New Commands

#### `/profiles` - List All Your Profiles
Shows all available profiles with:
- Profile type (Vendor 💼 / Employee 👔 / Customer 🛒)
- Organization name
- Current active profile marked with ✅
- Primary profile marked with ⭐
- Profile ID and Organization ID for reference

**Example Output:**
```
👤 Your Profiles

1. 💼 Vendor at Acme Corp [⭐ Primary, ✅ Active]
   ID: 43 | Org: 12

2. 👔 Employee at Tech Solutions
   ID: 44 | Org: 13

3. 🛒 Customer (No organization)
   ID: 45

💡 Use /switch <profile_id> to change your active profile
Example: /switch 44
```

#### `/switch <profile_id>` - Switch Active Profile
Changes the active organizational context for all Telegram bot operations.

**Usage:**
```
/switch 44
```

**Confirmation:**
```
✅ Profile switched successfully!

👔 Employee at Tech Solutions
Profile ID: 44
Organization ID: 13

All new data (leads, customers, deals) will now be linked to this organization.

💡 Your conversation history has been cleared for a fresh start.
```

### 3. Technical Changes

#### Database Schema
- Added `selected_profile` field to `TelegramUser` model
- Stores the user's currently selected profile for Telegram interactions
- Links to `UserProfile` model with SET_NULL on delete

#### Context Resolution Priority
When building user context for Telegram bot operations:

1. **PRIORITY 1**: Use `telegram_user.selected_profile` if set (via `/switch`)
2. **PRIORITY 2**: Use user's primary profile (`is_primary=True`)
3. **PRIORITY 3**: Use any active profile
4. **PRIORITY 4**: Use any profile at all

#### Service Updates
- `GeminiService.get_user_context()` now accepts `telegram_user` parameter
- `GeminiService.chat_stream()` passes `telegram_user` to context builder
- Telegram webhook handler passes `telegram_user` to Gemini service

### 4. Updated Help Command

The `/help` command now includes the new profile management section:

```
Profile Management:
/profiles - List all your profiles (vendor/employee/customer)
/switch <id> - Switch to a different profile/organization
```

## How It Works

### For Users with Multiple Organizations

**Scenario**: User is both:
- Vendor in Organization A (ID: 12)
- Employee in Organization B (ID: 13)

**Workflow:**

1. **Check Current Context**
   ```
   /profiles
   ```
   See all available profiles and which one is currently active.

2. **Switch to Different Organization**
   ```
   /switch 44
   ```
   Switch to Employee profile in Organization B.

3. **Create Data**
   ```
   Create lead named John Doe with email john@example.com
   ```
   Lead is now created in Organization B (ID: 13).

4. **Verify in Web Frontend**
   - Log into web frontend
   - Use ProfileSwitcher in top-right to select Employee @ Organization B
   - See the lead created via Telegram

### Conversation History Management

When switching profiles:
- Conversation history is **automatically cleared**
- Ensures clean context for the new organizational scope
- Prevents confusion from previous conversations

## Benefits

✅ **Seamless Multi-Org Support**: Work with multiple organizations from single Telegram account

✅ **Data Consistency**: Data created in Telegram appears in correct organization in web frontend

✅ **Clear Context**: Always know which organization you're working with

✅ **Easy Switching**: Change context with simple `/switch` command

✅ **Conversation Clarity**: Fresh history after switching prevents cross-org confusion

## Best Practices

### For Vendors with Multiple Organizations
If you manage multiple vendor organizations:
1. Use `/profiles` to see all your organizations
2. `/switch` to the specific organization before creating data
3. Verify the organization name in the confirmation message

### For Employees Working for Multiple Vendors
If you're an employee at multiple companies:
1. Always check `/profiles` when starting work
2. Switch to the relevant employer's organization
3. Create data specific to that employer's context

### For Users with Dual Roles
If you're both a vendor AND an employee:
1. Use `/profiles` to distinguish between roles
2. Switch to vendor profile for business operations
3. Switch to employee profile for assigned tasks

## Troubleshooting

### "Data not showing in web frontend"

**Check:**
1. Which profile is active in Telegram? (`/profiles`)
2. Which profile is selected in web frontend? (ProfileSwitcher in top-right)
3. Do both profiles point to the same organization?

**Solution:**
- Either switch Telegram profile to match web frontend
- Or switch web frontend profile to match Telegram

### "Lead created but can't find it"

**Check:**
- Organization ID shown in `/switch` confirmation
- Organization selected in web frontend

**Solution:**
- Use `/profiles` to verify active organization
- Filter by organization in web frontend

## Migration Notes

### Existing Users
- Existing `TelegramUser` records have `selected_profile` set to NULL
- System falls back to primary profile (current behavior)
- No action required unless they want to switch organizations

### Database Migration
```bash
python manage.py makemigrations crmApp
python manage.py migrate
```

### No Data Loss
- All existing data remains intact
- New field is nullable, no breaking changes
- Backward compatible with existing functionality

## Future Enhancements

Potential improvements:
- Remember last selected profile per organization
- Auto-switch based on time of day or context
- Profile-specific conversation histories
- Notification when switching organizations
- Quick switch shortcuts (e.g., `/vendor`, `/employee`)

---

**Status**: ✅ Implemented and Active

**Version**: 1.0.0

**Last Updated**: November 24, 2025
