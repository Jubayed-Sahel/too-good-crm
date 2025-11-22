import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.dirname(__file__))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from crmApp.models import Lead, Customer, User, Deal, PipelineStage

# Get user
u = User.objects.get(email='sahel@gmail.com')
print(f"User: {u.email}")

# Get organization
profile = u.user_profiles.first()
if not profile:
    print("ERROR: No user profile found!")
    sys.exit(1)

org = profile.organization
print(f"Organization: {org.name} (ID: {org.id})")
print(f"Role: {profile.profile_type}")

# Check data
print(f"\n=== DATA COUNTS ===")
print(f"Leads: {Lead.objects.filter(organization=org).count()}")
print(f"Customers: {Customer.objects.filter(organization=org).count()}")
print(f"Deals: {Deal.objects.filter(organization=org).count()}")
print(f"Pipeline Stages: {PipelineStage.objects.filter(pipeline__organization=org).count()}")

# Show leads
print(f"\n=== LEADS ===")
leads = Lead.objects.filter(organization=org)[:10]
if leads.exists():
    for lead in leads:
        stage_name = lead.stage.name if lead.stage else "No stage"
        print(f"  {lead.id}. {lead.name}")
        print(f"     Stage: {stage_name}")
        print(f"     Status: {lead.qualification_status}")
        print(f"     Source: {lead.source}")
        print(f"     Converted: {lead.is_converted}")
        print()
else:
    print("  No leads found!")

# Show customers
print(f"\n=== CUSTOMERS ===")
customers = Customer.objects.filter(organization=org)[:10]
if customers.exists():
    for customer in customers:
        print(f"  {customer.id}. {customer.name}")
        print(f"     Email: {customer.email}")
        print(f"     Status: {customer.status}")
        print()
else:
    print("  No customers found!")

# Show pipeline stages
print(f"\n=== PIPELINE STAGES ===")
stages = PipelineStage.objects.filter(pipeline__organization=org).order_by('order')
if stages.exists():
    for stage in stages:
        lead_count = Lead.objects.filter(organization=org, stage=stage).count()
        print(f"  {stage.name} (Order: {stage.order}) - {lead_count} leads")
else:
    print("  No pipeline stages found!")

# Check "Closed Won" stage
print(f"\n=== CLOSED WON CHECK ===")
closed_won_stages = PipelineStage.objects.filter(
    pipeline__organization=org,
    name__icontains="closed"
)
if closed_won_stages.exists():
    for stage in closed_won_stages:
        print(f"  Found stage: {stage.name}")
        leads_in_stage = Lead.objects.filter(organization=org, stage=stage)
        print(f"  Leads in this stage: {leads_in_stage.count()}")
        for lead in leads_in_stage[:5]:
            print(f"    - {lead.name} (Converted: {lead.is_converted})")
else:
    print("  No 'Closed Won' stage found!")

