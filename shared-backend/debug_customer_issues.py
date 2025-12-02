"""
Debug script to check customer issues
"""
import os
import sys
import django

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from crmApp.models import User, Customer, Issue

# Find a test user
user = User.objects.filter(username='testuser').first()
if not user:
    user = User.objects.filter(email__icontains='test').first()
if not user:
    # Get any user with customer profile
    from crmApp.models import UserProfile
    profile = UserProfile.objects.filter(profile_type='customer').first()
    if profile:
        user = profile.user

if not user:
    print("❌ No test user found")
    sys.exit(1)

print(f"✅ User: {user.username} (ID: {user.id}, Email: {user.email})")
print()

# Check customer records
customers = Customer.objects.filter(user=user)
print(f"📋 Customer records for this user: {customers.count()}")
for c in customers:
    print(f"  - Customer ID: {c.id}, Name: {c.name}, Organization: {c.organization.name if c.organization else 'None'}")
print()

# Check all issues in the system
all_issues = Issue.objects.all()
print(f"📊 Total issues in system: {all_issues.count()}")
print()

# Check issues raised by this customer
if customers.exists():
    issues_by_customer = Issue.objects.filter(raised_by_customer__in=customers)
    print(f"🎫 Issues raised by customer records: {issues_by_customer.count()}")
    for issue in issues_by_customer[:10]:
        print(f"  - {issue.issue_number}: {issue.title}")
        print(f"    Status: {issue.status}, Priority: {issue.priority}")
        print(f"    Raised by customer: {issue.raised_by_customer.name if issue.raised_by_customer else 'None'}")
        print(f"    Organization: {issue.organization.name if issue.organization else 'None'}")
        print()
else:
    print("❌ No customer records found for this user")
    print()

# Check issues with is_client_issue flag
client_issues = Issue.objects.filter(is_client_issue=True)
print(f"🚩 Issues marked as client issues: {client_issues.count()}")
for issue in client_issues[:5]:
    print(f"  - {issue.issue_number}: {issue.title}")
    print(f"    Raised by: {issue.raised_by_customer.name if issue.raised_by_customer else 'None (customer ID: {issue.raised_by_customer_id})'}")
print()

# Check if there are orphaned issues (client issues without raised_by_customer)
orphaned = Issue.objects.filter(is_client_issue=True, raised_by_customer__isnull=True)
print(f"⚠️ Orphaned client issues (no raised_by_customer): {orphaned.count()}")
