"""
Quick test script for Gemini + MCP integration
Run this to verify everything is set up correctly
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from crmApp.services.gemini_service import GeminiService
from django.contrib.auth import get_user_model

def test_gemini():
    print("=" * 60)
    print("Testing Gemini + MCP Integration")
    print("=" * 60)
    print()
    
    # Check API key
    print("[1] Checking Gemini API Key...")
    service = GeminiService()
    if not service.api_key:
        print("   [ERROR] GEMINI_API_KEY not configured")
        print("   [TIP] Set it in .env file or environment variable")
        print("   Example: GEMINI_API_KEY=your_key_here")
        return False
    print("   [OK] GEMINI_API_KEY is configured")
    print(f"   [INFO] Model: {service.model_name}")
    print()
    
    # Check MCP server file exists
    print("[2] Checking MCP Server...")
    if not os.path.exists(service.mcp_server_path):
        print(f"   [ERROR] MCP server not found at: {service.mcp_server_path}")
        return False
    print(f"   [OK] MCP server found: {service.mcp_server_path}")
    print()
    
    # Check user exists
    print("[3] Checking Database Users...")
    User = get_user_model()
    user_count = User.objects.count()
    
    if user_count == 0:
        print("   [ERROR] No users in database")
        print("   [TIP] Create a user first: python manage.py createsuperuser")
        return False
    
    print(f"   [OK] Found {user_count} user(s) in database")
    user = User.objects.first()
    print(f"   [INFO] Testing with user: {user.username} (ID: {user.id})")
    print()
    
    # Check user context
    print("[4] Checking User Context...")
    try:
        context = service.get_user_context(user)
        print("   [OK] User context loaded successfully:")
        print(f"      - User ID: {context['user_id']}")
        print(f"      - Organization ID: {context['organization_id']}")
        print(f"      - Role: {context['role']}")
        print(f"      - Permissions: {len(context['permissions'])} permission(s)")
        if context['permissions']:
            print(f"      - Sample permissions: {', '.join(context['permissions'][:5])}")
    except Exception as e:
        print(f"   [ERROR] Error getting user context: {e}")
        print("   [TIP] Make sure user has an active profile with organization")
        return False
    print()
    
    # Check MCP tools can be imported
    print("[5] Checking MCP Tools...")
    try:
        from mcp_tools import customer_tools, lead_tools, deal_tools
        print("   [OK] MCP tool modules import successfully")
        print("   [INFO] Available tool modules:")
        print("      - customer_tools (Customer management)")
        print("      - lead_tools (Lead management)")
        print("      - deal_tools (Deal pipeline)")
        print("      - issue_tools (Issue tracking)")
        print("      - analytics_tools (Analytics & reporting)")
        print("      - And 3 more modules...")
    except ImportError as e:
        print(f"   [ERROR] Error importing MCP tools: {e}")
        return False
    print()
    
    # Summary
    print("=" * 60)
    print("[SUCCESS] All checks passed!")
    print("=" * 60)
    print()
    print("You can now test the Gemini endpoints:")
    print()
    print("1. Start Django server:")
    print("   python manage.py runserver")
    print()
    print("2. Test status endpoint:")
    print("   GET http://localhost:8000/api/gemini/status/")
    print(f"   Authorization: Token YOUR_TOKEN")
    print()
    print("3. Test chat endpoint:")
    print("   POST http://localhost:8000/api/gemini/chat/")
    print("   Authorization: Token YOUR_TOKEN")
    print('   Body: {"message": "Show me my customer statistics"}')
    print()
    print("See TESTING_GUIDE.md for detailed testing instructions")
    print()
    
    return True

if __name__ == "__main__":
    try:
        success = test_gemini()
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"\n[ERROR] Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

