# Backend Scripts

This directory contains utility scripts for the Django backend.

## Directory Structure

```
scripts/
├── test/           # Test scripts for API endpoints
├── fix/            # Scripts to fix database issues
├── seed/           # Database seeding scripts
├── utilities/      # Utility scripts (check users, get data)
└── verify/         # Verification scripts (API, profiles)
```

## Test Scripts (`test/`)

Scripts for testing API endpoints and functionality:

- `test_issue_flow.py` - Diagnostic script for issue tracking
- `test_linear_integration.py` - Test Linear integration
- `test_customer_api.py` - Test customer API endpoints
- `test_vendor_api.py` - Test vendor API endpoints
- `test_call_flow.py` - Test call/communication flow
- `test_jitsi_api.py` - Test Jitsi integration
- `test_login.py` - Test authentication
- `test_full_lifecycle.py` - End-to-end test
- `test_complete_linear_flow.py` - Complete Linear flow test

## Fix Scripts (`fix/`)

Scripts to fix database issues and data problems:

- `fix_login.py` - Fix login issues
- `fix_user_profiles.py` - Fix user profile issues
- `fix_employee.py` - Fix employee data
- `fix_admin_org.py` - Fix admin organization
- `cleanup_duplicate_profiles.py` - Remove duplicate profiles
- `update_admin_password.py` - Update admin password

## Seed Scripts (`seed/`)

Scripts to seed the database with test data:

- `comprehensive_seed_data.py` - Comprehensive seed data
- `seed_admin_data.py` - Seed admin user
- `seed_data.py` - Basic seed data

## Utility Scripts (`utilities/`)

Utility scripts for checking and managing data:

- `check_user.py` - Check user data
- `check_users.py` - Check multiple users
- `check_customers.py` - Check customer data
- `check_vendors.py` - Check vendor data
- `check_vendor.py` - Check single vendor
- `check_presence.py` - Check user presence
- `create_test_user.py` - Create test user
- `get_linear_team_id.py` - Get Linear team ID
- `show_data.py` - Show database data
- `associate_users.py` - Associate users with organizations

## Verification Scripts (`verify/`)

Scripts to verify system setup and data:

- `verify_api.py` - Verify API endpoints
- `verify_api_endpoints.py` - Verify all API endpoints
- `verify_user_profiles.py` - Verify user profiles
- `verify_employees.py` - Verify employee data
- `comprehensive_api_test.py` - Comprehensive API test

## Usage

### Running Test Scripts

```bash
# Test issue flow
python scripts/test/test_issue_flow.py

# Test Linear integration
python scripts/test/test_linear_integration.py

# Test customer API
python scripts/test/test_customer_api.py
```

### Running Fix Scripts

```bash
# Fix login issues
python scripts/fix/fix_login.py

# Fix user profiles
python scripts/fix/fix_user_profiles.py
```

### Running Seed Scripts

```bash
# Seed comprehensive data
python scripts/seed/comprehensive_seed_data.py

# Seed admin user
python scripts/seed/seed_admin_data.py
```

### Running Utility Scripts

```bash
# Check user
python scripts/utilities/check_user.py

# Get Linear team ID
python scripts/utilities/get_linear_team_id.py

# Show data
python scripts/utilities/show_data.py
```

### Running Verification Scripts

```bash
# Verify API
python scripts/verify/verify_api.py

# Verify user profiles
python scripts/verify/verify_user_profiles.py
```

## Notes

- All scripts should be run from the `shared-backend` directory
- Some scripts require Django environment setup (handled automatically)
- Check script documentation for specific requirements
- Test scripts may require API server to be running
- Fix scripts should be used with caution (backup database first)
