"""
Test script to reproduce lead creation issue
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from crmApp.models import Lead, Organization
from crmApp.serializers import LeadCreateSerializer
from decimal import Decimal

# Get organization
org = Organization.objects.filter(id=9).first()
if not org:
    print("Organization 9 not found!")
    exit(1)

print(f"Organization: {org.name} (ID: {org.id})")

# Test data matching the frontend payload
test_data = {
    "organization": 9,
    "name": "jhakanaka lead",
    "email": "jhakanaka@gmail.com",
    "phone": "+8801794386",
    "organization_name": "jhakanaka",
    "job_title": "jhakanaka",
    "source": "cold_call",
    "qualification_status": "new",
    "estimated_value": 5000000,
    "notes": "jhakanaka"
}

print("\nTesting serializer validation...")
serializer = LeadCreateSerializer(data=test_data)

if serializer.is_valid():
    print("OK - Serializer is valid")
    print(f"Validated data: {serializer.validated_data}")
    
    print("\nTesting lead creation...")
    try:
        lead = serializer.save()
        print("OK - Lead created successfully!")
        print(f"  ID: {lead.id}")
        print(f"  Code: {lead.code}")
        print(f"  Name: {lead.name}")
        print(f"  Email: {lead.email}")
        print(f"  Estimated Value: {lead.estimated_value}")
        
        # Clean up
        lead.delete()
        print("\nOK - Test lead deleted")
    except Exception as e:
        print(f"ERROR - Error creating lead: {str(e)}")
        import traceback
        traceback.print_exc()
else:
    print("ERROR - Serializer validation failed:")
    print(serializer.errors)

