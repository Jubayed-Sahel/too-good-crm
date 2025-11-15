import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from crmApp.models import Organization

# Your Linear team ID
LINEAR_TEAM_ID = 'b95250db-8430-4dbc-88f8-9fc109369df0'

print("📋 Configuring Linear Team ID for ALL Organizations")
print("=" * 70)

# Get all organizations
all_orgs = Organization.objects.all()

print(f"\nFound {all_orgs.count()} organizations\n")

# Configure each organization
for org in all_orgs:
    old_team_id = org.linear_team_id
    org.linear_team_id = LINEAR_TEAM_ID
    org.save()
    
    status = "✅ UPDATED" if old_team_id != LINEAR_TEAM_ID else "✓ Already configured"
    print(f"{status} | {org.name:30} | Team ID: {LINEAR_TEAM_ID}")

print("\n" + "=" * 70)
print("✅ All organizations now have Linear integration configured!")
print("\n📌 What this means:")
print("   - ALL vendors can now sync issues to Linear")
print("   - New organizations (from new registrations) will need manual config")
print("   - Consider adding auto-config for new orgs in the registration flow")
