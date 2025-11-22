import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.dirname(__file__))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from crmApp.models import User
from crmApp.services.gemini_service import GeminiService

# Get user
user = User.objects.get(email='sahel@gmail.com')
print(f"User: {user.email}")
print(f"User ID: {user.id}")

# Get user context
gemini = GeminiService()

# Build user context
import asyncio
from asgiref.sync import sync_to_async

async def test():
    user_context = await gemini.get_user_context(user)
    print(f"\nUser Context:")
    print(f"  user_id: {user_context.get('user_id')}")
    print(f"  organization_id: {user_context.get('organization_id')}")
    print(f"  role: {user_context.get('role')}")
    print(f"  permissions: {user_context.get('permissions')}")
    
    # Create MCP tools
    crm_tools = gemini._create_crm_tools(user_context)
    print(f"\nCreated {len(crm_tools)} MCP tools")
    
    # Find list_leads tool
    list_leads_tool = None
    for tool in crm_tools:
        if hasattr(tool, 'name') and tool.name == 'list_leads':
            list_leads_tool = tool
            break
    
    if list_leads_tool:
        print(f"\nFound list_leads tool")
        print(f"  Name: {list_leads_tool.name}")
        
        # Try to call it
        print(f"\nCalling list_leads()...")
        try:
            result = list_leads_tool.function()
            print(f"  Result type: {type(result)}")
            print(f"  Result length: {len(result) if isinstance(result, (list, dict)) else 'N/A'}")
            print(f"  Result: {result}")
        except Exception as e:
            print(f"  ERROR: {e}")
            import traceback
            traceback.print_exc()
    else:
        print("\nERROR: list_leads tool not found!")

asyncio.run(test())

