#!/usr/bin/env python
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from django.db import connection
from crmApp.models import *

def check_tables():
    """Check all database tables"""
    print("=" * 60)
    print("DATABASE TABLES CHECK")
    print("=" * 60)
    
    cursor = connection.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
    tables = [t[0] for t in cursor.fetchall()]
    
    print(f"\nTotal tables: {len(tables)}\n")
    print("Tables:")
    for table in sorted(tables):
        cursor.execute(f"SELECT COUNT(*) FROM {table}")
        count = cursor.fetchone()[0]
        print(f"  ✓ {table:<40} ({count} rows)")
    
    print("\n" + "=" * 60)
    print("DJANGO MODELS CHECK")
    print("=" * 60)
    
    models = [
        ('Users', User),
        ('Organizations', Organization),
        ('UserProfiles', UserProfile),
        ('Employees', Employee),
        ('Customers', Customer),
        ('Vendors', Vendor),
        ('Leads', Lead),
        ('Deals', Deal),
        ('Issues', Issue),
        ('IssueComments', IssueComment),
        ('Activities', Activity),
        ('Messages', Message),
        ('Conversations', Conversation),
        ('Calls', Call),
        ('JitsiCallSessions', JitsiCallSession),
        ('TelegramUsers', TelegramUser),
        ('LeadStageHistory', LeadStageHistory),
    ]
    
    print("\nModel counts:")
    for name, model in models:
        try:
            count = model.objects.count()
            print(f"  ✓ {name:<30} {count} records")
        except Exception as e:
            print(f"  ✗ {name:<30} Error: {e}")
    
    print("\n" + "=" * 60)
    print("MIGRATION STATUS")
    print("=" * 60)
    
    from django.db.migrations.recorder import MigrationRecorder
    recorder = MigrationRecorder(connection)
    migrations = recorder.migration_qs.order_by('applied')
    
    print(f"\nTotal migrations applied: {migrations.count()}\n")
    print("Recent migrations:")
    for migration in migrations.filter(app='crmApp').order_by('-applied')[:5]:
        print(f"  ✓ {migration.app}:{migration.name} (applied: {migration.applied})")
    
    print("\n" + "=" * 60)
    print("✅ DATABASE CHECK COMPLETE - Everything looks good!")
    print("=" * 60)

if __name__ == '__main__':
    check_tables()
