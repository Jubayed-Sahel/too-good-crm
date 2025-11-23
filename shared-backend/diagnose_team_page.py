#!/usr/bin/env python
"""
Diagnose Team Page Employee Fetching

This script checks if employees are being fetched correctly based on organization.
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from crmApp.models import Employee, User, Organization, UserOrganization
from django.db.models import Q

print("=" * 80)
print("TEAM PAGE EMPLOYEE FETCHING DIAGNOSIS")
print("=" * 80)

# Get all users
users = User.objects.all()
print(f"\n📊 Total Users: {users.count()}")

for user in users:
    print(f"\n{'='*60}")
    print(f"👤 User: {user.email}")
    print(f"{'='*60}")
    
    # Get user's organizations
    user_orgs = user.user_organizations.filter(is_active=True)
    print(f"\n🏢 Active Organizations ({user_orgs.count()}):")
    for uo in user_orgs:
        print(f"  - ID: {uo.organization.id}, Name: {uo.organization.name}, Owner: {uo.is_owner}")
    
    # Get all employees across user's organizations
    user_org_ids = user_orgs.values_list('organization_id', flat=True)
    all_employees = Employee.objects.filter(
        Q(organization_id__in=user_org_ids) | 
        Q(user=user, organization_id__in=user_org_ids)
    ).select_related('organization')
    
    print(f"\n👥 Total Employees Across All Orgs: {all_employees.count()}")
    for emp in all_employees:
        print(f"  - ID: {emp.id}, Email: {emp.email}, Org ID: {emp.organization_id}, Org: {emp.organization.name}")
    
    # For each organization, show employees
    for org_id in user_org_ids:
        org_employees = all_employees.filter(organization_id=org_id)
        org = Organization.objects.get(id=org_id)
        print(f"\n  📋 Employees in '{org.name}' (ID: {org_id}): {org_employees.count()}")
        for emp in org_employees:
            print(f"    - {emp.email} (ID: {emp.id})")

print("\n" + "=" * 80)
print("ANALYSIS")
print("=" * 80)

print("\n❗ POTENTIAL ISSUE:")
print("   If a user is a member of MULTIPLE organizations (e.g., vendor of org1,")
print("   employee of org2), the backend query will return employees from BOTH")
print("   organizations unless the frontend explicitly filters by organization ID.")

print("\n✅ SOLUTION:")
print("   Frontend MUST pass 'organization' parameter when fetching employees:")
print("   useEmployees({ organization: activeOrganizationId })")

print("\n🔍 BACKEND FILTER LOGIC:")
print("   Line 80-82 in shared-backend/crmApp/viewsets/employee.py:")
print("   ```")
print("   org_id = self.request.query_params.get('organization')")
print("   if org_id:")
print("       queryset = queryset.filter(organization_id=org_id)")
print("   ```")

print("\n" + "=" * 80)

