import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.dirname(__file__))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from crmApp.models import Lead

leads = Lead.objects.filter(organization_id=12)
print(f"Total leads: {leads.count()}")
print("\nLead statuses:")
for lead in leads:
    print(f"  {lead.id}. {lead.name}: status='{lead.status}'")

print("\nActive leads:")
active_leads = Lead.objects.filter(organization_id=12, status='active')
print(f"  Count: {active_leads.count()}")

print("\nAll leads (no status filter):")
all_leads = Lead.objects.filter(organization_id=12)
for lead in all_leads:
    print(f"  {lead.id}. {lead.name} - status='{lead.status}', qualification='{lead.qualification_status}'")

