import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from crmApp.models import AuditLog, Customer, User
from django.utils import timezone
from datetime import timedelta

print("=" * 80)
print("RECENT ACTIVITY DEBUG")
print("=" * 80)

# Check recent customers
recent_time = timezone.now() - timedelta(minutes=10)
recent_customers = Customer.objects.filter(created_at__gte=recent_time).order_by('-created_at')

print(f"\n📦 Customers created in last 10 minutes: {recent_customers.count()}")
for customer in recent_customers:
    print(f"  - {customer.name} (ID: {customer.id}) at {customer.created_at}")

# Check recent audit logs
recent_logs = AuditLog.objects.filter(created_at__gte=recent_time).order_by('-created_at')

print(f"\n📝 Audit logs in last 10 minutes: {recent_logs.count()}")
for log in recent_logs:
    print(f"  - {log.created_at}: {log.user_email} {log.get_action_display()} {log.get_resource_type_display()} #{log.resource_id}")

# Check ALL audit logs
all_logs = AuditLog.objects.all().order_by('-created_at')[:10]

print(f"\n📊 Last 10 audit logs (all time):")
for log in all_logs:
    print(f"  - {log.created_at}: {log.user_email} ({log.user_profile_type}) {log.get_action_display()} {log.get_resource_type_display()} #{log.resource_id}: {log.resource_name}")

# Check if signals are connected
print("\n🔧 Checking signal connections...")
from django.db.models.signals import post_save
from crmApp.models import Customer

receivers = post_save._live_receivers(Customer)
print(f"  post_save receivers for Customer: {len(receivers)}")
for receiver in receivers:
    print(f"    - {receiver}")

print("\n" + "=" * 80)

