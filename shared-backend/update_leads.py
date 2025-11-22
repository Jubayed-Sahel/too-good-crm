"""
Update existing leads with pipeline stages
"""
import os
import sys
import django
import random

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from crmApp.models import Lead, PipelineStage, LeadStageHistory

def update_leads_with_stages():
    """Assign pipeline stages to existing leads"""
    print("\nUpdating leads with pipeline stages...")
    
    # Get all leads without stages
    leads_without_stage = Lead.objects.filter(stage__isnull=True)
    count = leads_without_stage.count()
    
    if count == 0:
        print("[OK] All leads already have stages assigned")
        return
    
    print(f"Found {count} leads without stages")
    
    # Process each organization
    updated = 0
    for lead in leads_without_stage:
        org = lead.organization
        
        # Get pipeline stages for this organization
        stages = PipelineStage.objects.filter(
            pipeline__organization=org,
            pipeline__is_active=True
        ).order_by('order')
        
        if not stages.exists():
            print(f"  WARNING: No pipeline stages found for {org.name}")
            continue
        
        # Assign stage based on qualification status
        if lead.qualification_status == 'new':
            stage = stages.first()  # First stage
        elif lead.qualification_status == 'contacted':
            stage = stages[min(1, len(stages)-1)]  # Second stage
        elif lead.qualification_status == 'qualified':
            stage = stages[min(2, len(stages)-1)]  # Third stage
        elif lead.qualification_status in ['converted', 'unqualified', 'lost']:
            stage = stages.last()  # Last stage
        else:
            stage = random.choice(stages)  # Random stage for others
        
        # Get the previous stage for history
        previous_stage = lead.stage
        
        # Update the lead
        lead.stage = stage
        lead.save()
        
        # Create stage history record
        LeadStageHistory.objects.create(
            lead=lead,
            organization=org,
            previous_stage=previous_stage,
            stage=stage,
            changed_by=lead.assigned_to
        )
        
        updated += 1
    
    print(f"[OK] Updated {updated} leads with pipeline stages")
    print(f"[OK] Created {updated} lead stage history records")

if __name__ == '__main__':
    update_leads_with_stages()
