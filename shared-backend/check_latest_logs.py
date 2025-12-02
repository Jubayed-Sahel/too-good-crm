import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from crmApp.models import AuditLog, Customer
from django.utils import timezone
from datetime import timedelta

print("=" * 80)
print("CHECKING LATEST AUDIT LOGS")
print("=" * 80)

# Get the most recent customer
recent_customer = Customer.objects.order_by('-created_at').first()
print(f"\n📦 Most Recent Customer:")
print(f"   ID: {recent_customer.id}")
print(f"   Name: {recent_customer.name}")
print(f"   Email: {recent_customer.email}")
print(f"   Organization: {recent_customer.organization.name if recent_customer.organization else 'None'}")
print(f"   Created at: {recent_customer.created_at}")

# Check if there's an audit log for this customer
audit_log = AuditLog.objects.filter(
    resource_type='customer',
    resource_id=recent_customer.id,
    action='create'
).first()

if audit_log:
    print(f"\n✅ AUDIT LOG FOUND:")
    print(f"   Log ID: {audit_log.id}")
    print(f"   User: {audit_log.user_email}")
    print(f"   Profile Type: {audit_log.user_profile_type}")
    print(f"   Action: {audit_log.get_action_display()}")
    print(f"   Resource: {audit_log.get_resource_type_display()}")
    print(f"   Description: {audit_log.description}")
    print(f"   Created at: {audit_log.created_at}")
    print(f"   Organization: {audit_log.organization.name if audit_log.organization else 'None'}")
else:
    print(f"\n❌ NO AUDIT LOG FOUND for this customer!")
    print(f"   Checking why...")
    
    # Debug: Check all logs for this customer
    all_customer_logs = AuditLog.objects.filter(
        resource_type='customer',
        resource_id=recent_customer.id
    )
    print(f"   Total logs for customer #{recent_customer.id}: {all_customer_logs.count()}")
    
    # Check total audit logs
    total_logs = AuditLog.objects.count()
    print(f"   Total audit logs in database: {total_logs}")
    
    # Check logs in last 5 minutes
    recent_time = timezone.now() - timedelta(minutes=5)
    recent_logs = AuditLog.objects.filter(created_at__gte=recent_time)
    print(f"   Audit logs in last 5 minutes: {recent_logs.count()}")
    
    for log in recent_logs:
        print(f"     - {log.user_email} {log.action} {log.resource_type} #{log.resource_id}")

# Show all audit logs
print(f"\n📊 ALL AUDIT LOGS (last 10):")
all_logs = AuditLog.objects.all().order_by('-created_at')[:10]
for log in all_logs:
    print(f"   - [{log.created_at}] {log.user_email} ({log.user_profile_type}) {log.get_action_display()} {log.get_resource_type_display()} #{log.resource_id}: {log.resource_name}")

# Check via API endpoint
print(f"\n🔗 API ENDPOINT TEST:")
print(f"   You can check audit logs at:")
print(f"   http://127.0.0.1:8000/api/audit-logs/")
print(f"   http://127.0.0.1:8000/api/audit-logs/recent/")
print(f"   http://127.0.0.1:8000/api/audit-logs/?resource_type=customer")

print("\n" + "=" * 80)

