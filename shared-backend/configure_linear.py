import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from crmApp.models import Organization

# Set Linear team ID for Test Organization
org = Organization.objects.get(name='Test Organization')
org.linear_team_id = 'b95250db-8430-4dbc-88f8-9fc109369df0'  # Your Too-good-crm team
org.save()

print(f"✅ Linear team ID configured for {org.name}")
print(f"   Team ID: {org.linear_team_id}")
print()

# Also set for Demo Company (most users are there)
demo_org = Organization.objects.get(name='Demo Company')
demo_org.linear_team_id = 'b95250db-8430-4dbc-88f8-9fc109369df0'
demo_org.save()

print(f"✅ Linear team ID configured for {demo_org.name}")
print(f"   Team ID: {demo_org.linear_team_id}")
