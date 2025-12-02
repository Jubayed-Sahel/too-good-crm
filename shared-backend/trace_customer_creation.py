"""
Comprehensive trace of customer creation flow to understand where logging breaks
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

print("=" * 80)
print("TRACING CUSTOMER CREATION FLOW")
print("=" * 80)

# Step 1: Check if signals are registered
print("\n1. CHECKING SIGNAL REGISTRATION")
print("-" * 80)

from django.db.models.signals import post_save, pre_save
from crmApp.models import Customer

# Get registered receivers
pre_save_receivers = pre_save._live_receivers(Customer)
post_save_receivers = post_save._live_receivers(Customer)

print(f"pre_save receivers for Customer: {len(pre_save_receivers)}")
for i, receiver in enumerate(pre_save_receivers, 1):
    print(f"  {i}. {receiver}")

print(f"\npost_save receivers for Customer: {len(post_save_receivers)}")
for i, receiver in enumerate(post_save_receivers, 1):
    print(f"  {i}. {receiver}")

if len(post_save_receivers) == 0:
    print("\n❌ NO POST_SAVE RECEIVERS REGISTERED!")
    print("   This means signals are not being imported.")
    print("   Check crmApp.apps.ready() method.")

# Step 2: Check apps.py
print("\n2. CHECKING APPS.PY")
print("-" * 80)

from crmApp.apps import CrmappConfig
import inspect

print(f"App config class: {CrmappConfig}")
print(f"App name: {CrmappConfig.name}")

if hasattr(CrmappConfig, 'ready'):
    print(f"✅ ready() method exists")
    source = inspect.getsource(CrmappConfig.ready)
    print(f"Source:\n{source}")
else:
    print(f"❌ ready() method NOT found")

# Step 3: Check if signals module exists and can be imported
print("\n3. CHECKING SIGNALS MODULE")
print("-" * 80)

try:
    import crmApp.signals.audit_signals
    print("✅ audit_signals module can be imported")
    
    # Check functions in the module
    functions = [name for name in dir(crmApp.signals.audit_signals) if not name.startswith('_')]
    print(f"Functions/classes: {functions[:10]}")
except Exception as e:
    print(f"❌ Error importing audit_signals: {e}")

# Step 4: Check middleware
print("\n4. CHECKING MIDDLEWARE")
print("-" * 80)

from crmApp.middleware import get_current_user, set_current_user

print(f"✅ get_current_user: {get_current_user}")
print(f"✅ set_current_user: {set_current_user}")

# Test thread-local storage
from crmApp.models import User

test_user = User.objects.first()
if test_user:
    set_current_user(test_user)
    retrieved_user = get_current_user()
    if retrieved_user == test_user:
        print(f"✅ Thread-local storage working: {retrieved_user.email}")
    else:
        print(f"❌ Thread-local storage NOT working")
    set_current_user(None)
else:
    print("⚠️  No users in database to test")

# Step 5: Test signal manually
print("\n5. MANUAL SIGNAL TEST")
print("-" * 80)

from crmApp.models import Organization, UserProfile

# Get a user with organization
profile = UserProfile.objects.filter(
    profile_type='vendor',
    organization__isnull=False,
    status='active'
).select_related('user', 'organization').first()

if profile:
    print(f"Test user: {profile.user.email}")
    print(f"Organization: {profile.organization.name}")
    
    # Set current user
    set_current_user(profile.user)
    profile.user.active_profile = profile
    
    # Create a test customer
    print("\nCreating test customer...")
    
    from crmApp.models import AuditLog
    before_count = AuditLog.objects.count()
    
    test_customer = Customer.objects.create(
        organization=profile.organization,
        name="Signal Test Customer",
        email=f"signaltest{Customer.objects.count()}@test.com",
        status="active"
    )
    
    after_count = AuditLog.objects.count()
    
    print(f"Customer created: {test_customer.name} (ID: {test_customer.id})")
    print(f"Audit logs before: {before_count}")
    print(f"Audit logs after: {after_count}")
    print(f"New logs: {after_count - before_count}")
    
    if after_count > before_count:
        print("✅ SIGNAL FIRED AND AUDIT LOG CREATED!")
        latest_log = AuditLog.objects.latest('created_at')
        print(f"   Log: {latest_log.user_email} {latest_log.action} {latest_log.resource_type} #{latest_log.resource_id}")
    else:
        print("❌ SIGNAL DID NOT CREATE AUDIT LOG!")
        print("   Checking for errors...")
    
    # Clean up
    test_customer.delete()
    set_current_user(None)
else:
    print("❌ No vendor profile found for testing")

# Step 6: Check AuditLog model
print("\n6. CHECKING AUDITLOG MODEL")
print("-" * 80)

from crmApp.models import AuditLog

print(f"AuditLog model: {AuditLog}")
print(f"Table name: {AuditLog._meta.db_table}")
print(f"Total audit logs: {AuditLog.objects.count()}")

if AuditLog.objects.exists():
    latest = AuditLog.objects.latest('created_at')
    print(f"\nLatest log:")
    print(f"  ID: {latest.id}")
    print(f"  User: {latest.user_email}")
    print(f"  Action: {latest.action}")
    print(f"  Resource: {latest.resource_type} #{latest.resource_id}")
    print(f"  Created: {latest.created_at}")

print("\n" + "=" * 80)
print("DIAGNOSIS COMPLETE")
print("=" * 80)

