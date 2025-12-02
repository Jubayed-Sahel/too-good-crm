import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from crmApp.models import Customer, Lead, Deal, AuditLog, User, UserProfile
from crmApp.middleware.organization_context import set_current_user
from django.db import transaction

print("=" * 80)
print("AUDIT LOGGING TEST")
print("=" * 80)

# Get a vendor user
vendor_profile = UserProfile.objects.filter(
    profile_type='vendor',
    status='active',
    organization__isnull=False
).select_related('user', 'organization').first()

if not vendor_profile:
    print("❌ No vendor profile found!")
    exit(1)

user = vendor_profile.user
organization = vendor_profile.organization

print(f"\nTesting with:")
print(f"  User: {user.email}")
print(f"  Profile: {vendor_profile.profile_type}")
print(f"  Organization: {organization.name}")

# Set current user for signals
set_current_user(user)
user.active_profile = vendor_profile

print("\n" + "-" * 80)
print("TEST 1: Create Customer")
print("-" * 80)

# Count audit logs before
before_count = AuditLog.objects.filter(organization=organization).count()
print(f"Audit logs before: {before_count}")

# Create a customer
customer = Customer.objects.create(
    organization=organization,
    name="Test Customer for Audit",
    email=f"audit_test_{User.objects.count()}@example.com",
    phone="123-456-7890",
    status="active"
)

print(f"✅ Created customer: {customer.name} (ID: {customer.id})")

# Count audit logs after
after_count = AuditLog.objects.filter(organization=organization).count()
print(f"Audit logs after: {after_count}")
print(f"New logs created: {after_count - before_count}")

# Get the most recent audit log
recent_log = AuditLog.objects.filter(organization=organization).order_by('-created_at').first()
if recent_log:
    print(f"\n📝 Recent Audit Log:")
    print(f"  Action: {recent_log.get_action_display()}")
    print(f"  Resource: {recent_log.get_resource_type_display()} #{recent_log.resource_id}")
    print(f"  Resource Name: {recent_log.resource_name}")
    print(f"  User: {recent_log.user_email} ({recent_log.user_profile_type})")
    print(f"  Description: {recent_log.description}")
    print(f"  Created At: {recent_log.created_at}")

print("\n" + "-" * 80)
print("TEST 2: Update Customer")
print("-" * 80)

before_count = after_count

# Update the customer
customer.name = "Updated Customer Name"
customer.phone = "999-888-7777"
customer.save()

print(f"✅ Updated customer: {customer.name}")

after_count = AuditLog.objects.filter(organization=organization).count()
print(f"Audit logs before: {before_count}")
print(f"Audit logs after: {after_count}")
print(f"New logs created: {after_count - before_count}")

# Get the most recent audit log
recent_log = AuditLog.objects.filter(organization=organization).order_by('-created_at').first()
if recent_log:
    print(f"\n📝 Recent Audit Log:")
    print(f"  Action: {recent_log.get_action_display()}")
    print(f"  Resource: {recent_log.get_resource_type_display()} #{recent_log.resource_id}")
    print(f"  Resource Name: {recent_log.resource_name}")
    print(f"  User: {recent_log.user_email} ({recent_log.user_profile_type})")
    print(f"  Description: {recent_log.description}")
    if recent_log.changes:
        print(f"  Changes: {recent_log.changes}")

print("\n" + "-" * 80)
print("TEST 3: Delete Customer")
print("-" * 80)

before_count = after_count

# Delete the customer
customer_id = customer.id
customer_name = customer.name
customer.delete()

print(f"✅ Deleted customer: {customer_name} (ID: {customer_id})")

after_count = AuditLog.objects.filter(organization=organization).count()
print(f"Audit logs before: {before_count}")
print(f"Audit logs after: {after_count}")
print(f"New logs created: {after_count - before_count}")

# Get the most recent audit log
recent_log = AuditLog.objects.filter(organization=organization).order_by('-created_at').first()
if recent_log:
    print(f"\n📝 Recent Audit Log:")
    print(f"  Action: {recent_log.get_action_display()}")
    print(f"  Resource: {recent_log.get_resource_type_display()} #{recent_log.resource_id}")
    print(f"  Resource Name: {recent_log.resource_name}")
    print(f"  User: {recent_log.user_email} ({recent_log.user_profile_type})")
    print(f"  Description: {recent_log.description}")

print("\n" + "-" * 80)
print("AUDIT LOG SUMMARY")
print("-" * 80)

# Show recent audit logs
recent_logs = AuditLog.objects.filter(organization=organization).order_by('-created_at')[:10]

print(f"\nLast 10 audit logs for {organization.name}:")
print()
for log in recent_logs:
    print(f"  [{log.created_at.strftime('%Y-%m-%d %H:%M:%S')}] {log.user_email} ({log.user_profile_type})")
    print(f"    → {log.get_action_display()} {log.get_resource_type_display()}: {log.resource_name}")
    print()

# Statistics
print("-" * 80)
print("STATISTICS")
print("-" * 80)

total_logs = AuditLog.objects.filter(organization=organization).count()
print(f"\nTotal audit logs: {total_logs}")

# By action
print("\nBy Action:")
for action, label in AuditLog.ACTION_CHOICES[:7]:  # First 7 actions
    count = AuditLog.objects.filter(organization=organization, action=action).count()
    if count > 0:
        print(f"  {label}: {count}")

# By resource
print("\nBy Resource:")
for resource, label in AuditLog.RESOURCE_TYPE_CHOICES[:5]:  # First 5 resources
    count = AuditLog.objects.filter(organization=organization, resource_type=resource).count()
    if count > 0:
        print(f"  {label}: {count}")

# By user
print("\nBy User Profile Type:")
for profile_type in ['vendor', 'employee', 'customer']:
    count = AuditLog.objects.filter(organization=organization, user_profile_type=profile_type).count()
    if count > 0:
        print(f"  {profile_type.title()}: {count}")

print("\n" + "=" * 80)
print("✅ AUDIT LOGGING TEST COMPLETE")
print("=" * 80)

