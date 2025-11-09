# Fix User Profiles Scripts

These scripts ensure all users have exactly 3 profiles: **vendor**, **employee**, and **customer**.

## Management Command (Recommended)

Use the Django management command for a more controlled approach:

```bash
cd shared-backend
python manage.py ensure_all_profiles
```

### Options

- `--dry-run`: Preview changes without applying them
- `--fix-orgs`: Create organizations for users who don't have any

### Examples

```bash
# Dry run to see what would be changed
python manage.py ensure_all_profiles --dry-run

# Fix all users and create organizations if needed
python manage.py ensure_all_profiles --fix-orgs

# Fix users (skip users without organizations)
python manage.py ensure_all_profiles
```

## Standalone Script

Alternatively, use the standalone script:

```bash
cd shared-backend
python scripts/fix/fix_user_profiles.py
```

## What These Scripts Do

1. **Check all users** for existing profiles
2. **Create missing profiles** (vendor, employee, customer)
3. **Ensure users have organizations** (create if needed with `--fix-orgs`)
4. **Create UserOrganization links** (link users to their organizations)
5. **Set vendor as primary** if no primary profile exists
6. **Create Vendor records** for vendor profiles
7. **Verify all users** have exactly 3 profiles

## Profile Structure

After running the script, each user will have:

- **1 Organization** (owned by the user)
- **3 UserProfiles**:
  - Vendor profile (primary, active)
  - Employee profile (active)
  - Customer profile (active)
- **1 Vendor record** (linked to vendor profile)
- **1 UserOrganization link** (user as owner)

## Notes

- The script uses database transactions to ensure consistency
- Existing profiles are preserved (only missing ones are created)
- Vendor profile is automatically set as primary if no primary exists
- Organizations are created with names like: `"{First Name} {Last Name}'s Organization"`

## Troubleshooting

If you encounter issues:

1. **Check for duplicate profiles**: Run `python scripts/fix/cleanup_duplicate_profiles.py`
2. **Verify user organizations**: Check that users have active organization links
3. **Check database constraints**: Ensure no unique constraint violations

## Integration with Signup

New users automatically get all 3 profiles when they sign up (see `UserCreateSerializer` in `crmApp/serializers/auth.py`).

