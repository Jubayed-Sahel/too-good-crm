"""
Test script to diagnose issue tracking and Linear sync problems
"""
import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from crmApp.models import Issue, Organization, User, UserProfile, Customer
from django.db.models import Q

print("=" * 80)
print("ISSUE TRACKING DIAGNOSTIC")
print("=" * 80)

# 1. Check organizations and Linear configuration
print("\n1. ORGANIZATIONS AND LINEAR CONFIGURATION")
print("-" * 80)
orgs = Organization.objects.filter(is_active=True)
print(f"Total active organizations: {orgs.count()}\n")

for org in orgs:
    linear_status = "Configured" if org.linear_team_id else "Not configured"
    print(f"  {org.id:2d}. {org.name:40s} - Linear: {linear_status}")
    if org.linear_team_id:
        print(f"      Team ID: {org.linear_team_id}")

# 2. Check issues and their organizations
print("\n2. ISSUES BY ORGANIZATION")
print("-" * 80)
issues = Issue.objects.select_related('organization', 'raised_by_customer').all()
print(f"Total issues: {issues.count()}\n")

issues_by_org = {}
for issue in issues:
    org_id = issue.organization.id
    org_name = issue.organization.name
    if org_id not in issues_by_org:
        issues_by_org[org_id] = {
            'name': org_name,
            'total': 0,
            'synced': 0,
            'not_synced': 0,
            'issues': []
        }
    issues_by_org[org_id]['total'] += 1
    if issue.synced_to_linear:
        issues_by_org[org_id]['synced'] += 1
    else:
        issues_by_org[org_id]['not_synced'] += 1
    issues_by_org[org_id]['issues'].append(issue)

for org_id, data in sorted(issues_by_org.items()):
    print(f"  Org {org_id:2d} ({data['name']:40s}): {data['total']:2d} issues")
    print(f"    Synced to Linear: {data['synced']:2d}, Not synced: {data['not_synced']:2d}")

# 3. Check vendor user and their organization
print("\n3. VENDOR USERS AND THEIR ORGANIZATIONS")
print("-" * 80)
vendor_profiles = UserProfile.objects.filter(
    profile_type='vendor',
    status='active'
).select_related('user', 'organization')

print(f"Total vendor profiles: {vendor_profiles.count()}\n")

for profile in vendor_profiles:
    user = profile.user
    org = profile.organization
    linear_status = "YES" if org and org.linear_team_id else "NO"
    org_issues = Issue.objects.filter(organization=org).count() if org else 0
    
    print(f"  Vendor: {user.email:30s}")
    print(f"    Organization: {org.name if org else 'None':40s} (ID: {org.id if org else 'N/A'})")
    print(f"    Linear configured: {linear_status}")
    print(f"    Issues in org: {org_issues}")
    print()

# 4. Check employee users and their organizations
print("4. EMPLOYEE USERS AND THEIR ORGANIZATIONS")
print("-" * 80)
employee_profiles = UserProfile.objects.filter(
    profile_type='employee',
    status='active'
).select_related('user', 'organization')[:10]  # Limit to first 10

print(f"Total employee profiles (showing first 10): {employee_profiles.count()}\n")

for profile in employee_profiles:
    user = profile.user
    org = profile.organization
    linear_status = "YES" if org and org.linear_team_id else "NO"
    org_issues = Issue.objects.filter(organization=org).count() if org else 0
    
    print(f"  Employee: {user.email:30s}")
    print(f"    Organization: {org.name if org else 'None':40s} (ID: {org.id if org else 'N/A'})")
    print(f"    Linear configured: {linear_status}")
    print(f"    Issues in org: {org_issues}")
    print()

# 5. Check customer users and their organizations
print("5. CUSTOMER USERS AND THEIR ORGANIZATIONS")
print("-" * 80)
customer_profiles = UserProfile.objects.filter(
    profile_type='customer',
    status='active'
).select_related('user')[:10]  # Limit to first 10

print(f"Total customer profiles (showing first 10): {customer_profiles.count()}\n")

for profile in customer_profiles:
    user = profile.user
    customers = Customer.objects.filter(user=user)
    raised_issues = Issue.objects.filter(raised_by_customer__in=customers).count()
    
    print(f"  Customer: {user.email:30s}")
    print(f"    Customer records: {customers.count()}")
    print(f"    Organizations: {', '.join([str(c.org.id) for c in customers if c.organization])}")
    print(f"    Issues raised: {raised_issues}")
    print()

# 6. Check specific vendor (user@user.user)
print("6. SPECIFIC VENDOR ANALYSIS: user@user.user")
print("-" * 80)
vendor_user = User.objects.filter(email='user@user.user').first()
if vendor_user:
    vendor_profile = UserProfile.objects.filter(
        user=vendor_user,
        profile_type='vendor',
        status='active'
    ).select_related('organization').first()
    
    if vendor_profile:
        org = vendor_profile.organization
        print(f"  Vendor: {vendor_user.email}")
        print(f"  Organization: {org.name if org else 'None'} (ID: {org.id if org else 'N/A'})")
        print(f"  Linear Team ID: {org.linear_team_id if org else 'N/A'}")
        
        if org:
            org_issues = Issue.objects.filter(organization=org)
            print(f"  Total issues in org: {org_issues.count()}")
            print(f"  Synced to Linear: {org_issues.filter(synced_to_linear=True).count()}")
            print(f"  Not synced: {org_issues.filter(synced_to_linear=False).count()}")
            
            print(f"\n  Recent issues:")
            for issue in org_issues[:5]:
                synced = "SYNCED" if issue.synced_to_linear else "NOT SYNCED"
                print(f"    [{synced}] {issue.issue_number} - {issue.title[:50]} - Status: {issue.status}")
        else:
            print("  ERROR: Vendor has no organization!")
    else:
        print(f"  ERROR: No vendor profile found for {vendor_user.email}")
else:
    print("  ERROR: Vendor user 'user@user.user' not found")

# 7. Recommendations
print("\n7. RECOMMENDATIONS")
print("-" * 80)

# Find organizations without Linear team ID that have issues
orgs_without_linear = Organization.objects.filter(
    is_active=True,
    linear_team_id__isnull=True
)
orgs_with_issues_no_linear = []
for org in orgs_without_linear:
    issue_count = Issue.objects.filter(organization=org).count()
    if issue_count > 0:
        orgs_with_issues_no_linear.append((org, issue_count))

if orgs_with_issues_no_linear:
    print("  Organizations with issues but no Linear team ID:")
    for org, count in orgs_with_issues_no_linear:
        print(f"    - {org.name} (ID: {org.id}) has {count} issues")
    print("\n  ACTION: Configure Linear team ID for these organizations:")
    print("    python manage.py configure_linear --organization-id <ID> --team-id <TEAM_ID>")

# Find vendors with organizations that have no Linear team ID
vendors_no_linear = UserProfile.objects.filter(
    profile_type='vendor',
    status='active',
    organization__linear_team_id__isnull=True
).select_related('organization', 'user')

if vendors_no_linear.exists():
    print("\n  Vendors with organizations missing Linear team ID:")
    for profile in vendors_no_linear:
        print(f"    - {profile.user.email} -> {profile.organization.name} (ID: {profile.organization.id})")
    print("\n  ACTION: Configure Linear team ID for these organizations")

print("\n" + "=" * 80)
print("DIAGNOSTIC COMPLETE")
print("=" * 80)

