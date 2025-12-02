import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from django.conf import settings
from crmApp.models import AuditLog

print("=" * 80)
print("DATABASE CONFIGURATION CHECK")
print("=" * 80)

db_config = settings.DATABASES['default']
print(f"\nDatabase Engine: {db_config['ENGINE']}")
print(f"Database Name: {db_config['NAME']}")

if 'sqlite' in db_config['ENGINE'].lower():
    print("\n✅ Using SQLite - Audit logging is fully compatible!")
    print("   Django's JSONField automatically uses TEXT storage for SQLite.")
elif 'postgres' in db_config['ENGINE'].lower():
    print("\n✅ Using PostgreSQL - Audit logging is fully compatible!")
    print("   Django's JSONField uses native JSON type.")
else:
    print(f"\n✅ Using {db_config['ENGINE']} - Audit logging should be compatible!")

# Check if audit_logs table exists
from django.db import connection
with connection.cursor() as cursor:
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='audit_logs';")
    result = cursor.fetchone()
    
if result:
    print("\n✅ audit_logs table exists in database")
    
    # Check number of records
    count = AuditLog.objects.count()
    print(f"   Total audit logs: {count}")
    
    if count > 0:
        recent = AuditLog.objects.order_by('-created_at').first()
        print(f"\n   Most recent log:")
        print(f"   - Action: {recent.get_action_display()}")
        print(f"   - Resource: {recent.get_resource_type_display()}")
        print(f"   - User: {recent.user_email}")
        print(f"   - Time: {recent.created_at}")
else:
    print("\n❌ audit_logs table does not exist - run migrations!")

print("\n" + "=" * 80)
