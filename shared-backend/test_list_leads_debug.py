import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.dirname(__file__))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from crmApp.models import User, Lead
from crmApp.services.gemini_service import GeminiService

# Get user
user = User.objects.get(email='sahel@gmail.com')
print(f"User: {user.email}")

# Build user context
gemini = GeminiService()

# Test user context
import asyncio
from asgiref.sync import sync_to_async

async def test():
    user_context = await gemini.get_user_context(user)
    print(f"\nUser Context:")
    print(f"  user_id: {user_context.get('user_id')}")
    print(f"  organization_id: {user_context.get('organization_id')}")
    print(f"  role: {user_context.get('role')}")
    
    org_id = user_context.get('organization_id')
    print(f"\nChecking leads for org_id={org_id}:")
    
    # Test the query directly
    from crmApp.models import Lead
    leads = Lead.objects.filter(organization_id=org_id, status='active')
    print(f"  Total leads: {leads.count()}")
    
    for lead in leads:
        print(f"    - {lead.name} (ID: {lead.id}, Stage: {lead.stage.name if lead.stage else 'None'})")

asyncio.run(test())

