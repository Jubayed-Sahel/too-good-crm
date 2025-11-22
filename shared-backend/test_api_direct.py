"""
Test the API endpoint directly to see what it returns
"""

import os
import django
import json
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from django.contrib.auth import get_user_model
from crmApp.models import Organization
from crmApp.utils.permissions import PermissionChecker

User = get_user_model()

print("=" * 80)
print("TESTING API ENDPOINT RESPONSE")
print("=" * 80)

# Get employee
employee = User.objects.filter(email='dummy@gmail.com').first()
if not employee:
    print("Employee not found!")
    exit(1)

# Get organization
org = Organization.objects.get(id=12)

print(f"\nEmployee: {employee.email}")
print(f"Organization: {org.name} (ID: {org.id})")

# Use PermissionChecker to get permissions (same as API does)
checker = PermissionChecker(employee, org)
permissions = checker.get_all_permissions()

print(f"\nPermissions returned by PermissionChecker:")
print(f"  Type: {type(permissions)}")
print(f"  Count: {len(permissions)}")

# Show first 20 permissions
print(f"\n  First 20 permissions:")
for perm in sorted(list(permissions))[:20]:
    print(f"    {perm}")

# Check what format they are in
if permissions:
    sample = list(permissions)[0]
    print(f"\n  Sample permission: '{sample}'")
    print(f"  Type: {type(sample)}")
    if '.' in sample:
        print(f"  Format: DOT notation (e.g., 'customers.read')")
    elif ':' in sample:
        print(f"  Format: COLON notation (e.g., 'customers:read')")

# Simulate what the API endpoint returns
print("\n" + "=" * 80)
print("SIMULATING API RESPONSE")
print("=" * 80)

api_response = {
    'organization_id': org.id,
    'organization_name': org.name,
    'is_owner': checker.is_owner(),
    'is_employee': True,
    'role': 'Test Sales Role',
    'permissions': list(permissions),  # Convert set to list
}

print(f"\nAPI Response would be:")
print(f"  organization_id: {api_response['organization_id']}")
print(f"  is_owner: {api_response['is_owner']}")
print(f"  is_employee: {api_response['is_employee']}")
print(f"  permissions (first 10):")
for perm in sorted(api_response['permissions'])[:10]:
    print(f"    {perm}")

# Check specific sidebar permissions
print("\n" + "=" * 80)
print("SIDEBAR PERMISSION CHECKS")
print("=" * 80)

sidebar_checks = [
    'customers.read',
    'deals.read',
    'issues.read',
    'analytics.read',
    'activities.read',
    'employees.read',
]

print(f"\nChecking if these permissions exist in the list:")
for check in sidebar_checks:
    exists = check in permissions
    status = "[OK]" if exists else "[NO]"
    print(f"  {status} {check}")

print("\n" + "=" * 80)
print("WHAT FRONTEND SHOULD DO")
print("=" * 80)

print(f"\nFrontend receives: {api_response['permissions'][:3]}...")
print(f"Frontend should convert:")
print(f"  'customers.read' → 'customers:read'")
print(f"  'deals.read' → 'deals:read'")
print(f"  'issues.read' → 'issues:read'")

print(f"\nSidebar checks for: 'customers' with action 'read'")
print(f"Frontend converts to: 'customers:read'")
print(f"Should match: YES ✓")

print("\n" + "=" * 80)

