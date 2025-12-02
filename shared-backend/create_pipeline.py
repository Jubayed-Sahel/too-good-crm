#!/usr/bin/env python
"""
Script to create a default sales pipeline for organization ID 13
Run this with: python create_pipeline.py
"""
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from crmApp.models import Pipeline, PipelineStage, Organization

def create_pipeline_for_org(org_id=13):
    """Create a default sales pipeline with stages for the specified organization."""
    
    try:
        # Get the organization
        org = Organization.objects.get(id=org_id)
        print(f"✅ Found organization: {org.name} (ID: {org.id})")
        
        # Check if pipeline already exists
        existing_pipeline = Pipeline.objects.filter(organization=org, is_default=True).first()
        if existing_pipeline:
            print(f"⚠️  Default pipeline already exists: {existing_pipeline.name} (ID: {existing_pipeline.id})")
            print(f"   Stages: {existing_pipeline.stages.count()}")
            return existing_pipeline
        
        # Create a new pipeline
        pipeline = Pipeline.objects.create(
            organization=org,
            name="Sales Pipeline",
            code=f"SALES-{org.id}",
            description="Default sales pipeline for managing deals",
            is_active=True,
            is_default=True
        )
        print(f"✅ Created pipeline: {pipeline.name} (ID: {pipeline.id})")
        
        # Create pipeline stages
        stages_data = [
            {
                "name": "Lead",
                "description": "Initial contact or inquiry",
                "order": 1,
                "probability": 10,
                "is_active": True,
                "is_closed_won": False,
                "is_closed_lost": False
            },
            {
                "name": "Qualified",
                "description": "Lead has been qualified",
                "order": 2,
                "probability": 25,
                "is_active": True,
                "is_closed_won": False,
                "is_closed_lost": False
            },
            {
                "name": "Proposal",
                "description": "Proposal has been sent",
                "order": 3,
                "probability": 50,
                "is_active": True,
                "is_closed_won": False,
                "is_closed_lost": False
            },
            {
                "name": "Negotiation",
                "description": "In negotiation phase",
                "order": 4,
                "probability": 75,
                "is_active": True,
                "is_closed_won": False,
                "is_closed_lost": False
            },
            {
                "name": "Closed Won",
                "description": "Deal won",
                "order": 5,
                "probability": 100,
                "is_active": True,
                "is_closed_won": True,
                "is_closed_lost": False
            },
            {
                "name": "Closed Lost",
                "description": "Deal lost",
                "order": 6,
                "probability": 0,
                "is_active": True,
                "is_closed_won": False,
                "is_closed_lost": True
            }
        ]
        
        for stage_data in stages_data:
            stage = PipelineStage.objects.create(
                pipeline=pipeline,
                **stage_data
            )
            print(f"  ✅ Created stage: {stage.name} (ID: {stage.id}, Probability: {stage.probability}%)")
        
        print(f"\n🎉 Successfully created pipeline with {pipeline.stages.count()} stages!")
        print(f"   Pipeline ID: {pipeline.id}")
        print(f"   Organization: {org.name} (ID: {org.id})")
        print(f"\n✨ You can now create deals in the Android app!")
        
        return pipeline
        
    except Organization.DoesNotExist:
        print(f"❌ Organization with ID {org_id} not found!")
        print("   Please check the organization ID and try again.")
        return None
    except Exception as e:
        print(f"❌ Error creating pipeline: {str(e)}")
        import traceback
        traceback.print_exc()
        return None

if __name__ == "__main__":
    print("🚀 Creating default sales pipeline for organization ID 13...\n")
    create_pipeline_for_org(org_id=13)

