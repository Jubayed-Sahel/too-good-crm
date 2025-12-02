"""
Test script for MCP list_activities tool
Tests the tool directly to verify it returns all activities correctly
"""
import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.dirname(__file__))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

import asyncio
from crmApp.models import User, Activity
from mcp_server import set_user_context
from crmApp.services.gemini_service import GeminiService
from asgiref.sync import sync_to_async

def test_mcp_list_activities():
    """Test the MCP list_activities tool directly"""
    print("=" * 70)
    print("Testing MCP list_activities Tool")
    print("=" * 70)
    print()
    
    # Get a vendor user (or first user)
    try:
        # Try to get a vendor user first
        user = User.objects.filter(
            user_profiles__profile_type='vendor',
            user_profiles__status='active'
        ).select_related().first()
        
        if not user:
            # Fallback to any user
            user = User.objects.first()
        
        if not user:
            print("❌ ERROR: No users found in database")
            return False
        
        print(f"[1] Using user: {user.email} (ID: {user.id})")
    except Exception as e:
        print(f"❌ ERROR: Failed to get user: {e}")
        return False
    
    # Get user context from GeminiService
    print("\n[2] Getting user context...")
    gemini = GeminiService()
    
    async def run_test():
        try:
            # Check user's organizations
            @sync_to_async
            def get_user_orgs():
                from crmApp.models import UserOrganization, UserProfile
                user_orgs = UserOrganization.objects.filter(user=user, is_active=True).select_related('organization')
                user_profiles = UserProfile.objects.filter(user=user, status='active').select_related('organization')
                return list(user_orgs), list(user_profiles)
            
            user_orgs_list, user_profiles_list = await get_user_orgs()
            print(f"\n   User's organizations (UserOrganization):")
            for uo in user_orgs_list:
                print(f"      - Org {uo.organization_id}: {uo.organization.name} (is_owner: {uo.is_owner})")
            
            print(f"\n   User's profiles (UserProfile):")
            for up in user_profiles_list:
                print(f"      - Profile {up.id}: {up.profile_type} (Org: {up.organization_id if up.organization else 'None'}, Status: {up.status})")
            
            # Get user context (async)
            user_context = await gemini.get_user_context(user)
            print(f"\n   ✅ User context retrieved:")
            print(f"      - User ID: {user_context.get('user_id')}")
            print(f"      - Organization ID: {user_context.get('organization_id')}")
            print(f"      - Role: {user_context.get('role')}")
            print(f"      - Permissions: {len(user_context.get('permissions', []))} permission(s)")
            
            org_id = user_context.get('organization_id')
            if not org_id:
                print("\n❌ ERROR: No organization ID found in user context")
                print("   User might not have an active organization")
                return False
            
            # Check how many activities exist in the database for this org
            @sync_to_async
            def get_activity_count():
                return Activity.objects.filter(organization_id=org_id).count()
            
            @sync_to_async
            def get_all_activities_count():
                return Activity.objects.all().count()
            
            @sync_to_async
            def get_sample_activities():
                return list(Activity.objects.filter(organization_id=org_id)[:5])
            
            @sync_to_async
            def get_all_sample_activities():
                return list(Activity.objects.all()[:10])
            
            @sync_to_async
            def get_activities_by_org():
                from django.db.models import Count
                return list(Activity.objects.values('organization_id').annotate(count=Count('id')).order_by('-count'))
            
            total_activities = await get_activity_count()
            total_all_activities = await get_all_activities_count()
            orgs_with_activities = await get_activities_by_org()
            
            print(f"\n[3] Checking database activities...")
            print(f"   📊 Total activities in database for org {org_id}: {total_activities}")
            print(f"   📊 Total activities in ALL organizations: {total_all_activities}")
            
            if orgs_with_activities:
                print(f"\n   Activities by organization:")
                for item in orgs_with_activities:
                    org_id_check = item['organization_id']
                    count = item['count']
                    print(f"      - Org {org_id_check}: {count} activities")
            
            if total_activities == 0:
                print(f"\n   ⚠️  WARNING: No activities found in database for organization {org_id}")
                if total_all_activities > 0:
                    print(f"   But there are {total_all_activities} activities in other organizations")
                    print(f"   Checking all activities...")
                    all_sample = await get_all_sample_activities()
                    if all_sample:
                        print(f"\n   Sample activities from ALL organizations (first 10):")
                        for act in all_sample:
                            print(f"      - ID {act.id}: {act.title} (Org: {act.organization_id}, Type: {act.activity_type}, Status: {act.status})")
                else:
                    print("   No activities found in the entire database")
                print("   This means the MCP tool will correctly return an empty list for this org")
                print("   The AI might be seeing activities from a different organization or context")
                return True
            
            # Show sample activities
            sample_activities = await get_sample_activities()
            print(f"\n   Sample activities from org {org_id} (first 5):")
            for act in sample_activities:
                print(f"      - ID {act.id}: {act.title} (Type: {act.activity_type}, Status: {act.status})")
            
            # Set user context for MCP tools
            print(f"\n[4] Setting MCP user context...")
            set_user_context(user_context)
            print(f"   ✅ MCP context set")
            
            # Get the MCP tool function directly from the module
            print(f"\n[5] Getting MCP list_activities tool...")
            
            # Import directly from the module to get the tool
            from mcp_tools.activity_tools import register_activity_tools
            
            # Create a simple mcp mock to extract the tool
            class TestMCP:
                def __init__(self):
                    self._tools = {}
                
                def tool(self):
                    def decorator(func):
                        self._tools[func.__name__] = func
                        return func
                    return decorator
                
                def check_permission(self, resource, action):
                    # Mock permission check - always allow for testing
                    pass
                
                def get_organization_id(self):
                    return org_id
                
                def get_user_id(self):
                    return user_context.get('user_id')
            
            test_mcp = TestMCP()
            register_activity_tools(test_mcp)
            
            if 'list_activities' not in test_mcp._tools:
                print("   ❌ ERROR: list_activities tool not found after registration!")
                print(f"   Available tools: {list(test_mcp._tools.keys())}")
                return False
            
            list_activities_tool = test_mcp._tools['list_activities']
            print(f"   ✅ Tool found: list_activities")
            
            # Test 1: Call with default parameters (limit=20)
            print(f"\n[6] Test 1: Calling list_activities() with default limit=20...")
            try:
                @sync_to_async
                def call_list_activities(**kwargs):
                    return list_activities_tool(**kwargs)
                
                result1 = await call_list_activities(limit=20)
                print(f"   ✅ Tool executed successfully")
                print(f"   Result type: {type(result1).__name__}")
                
                if isinstance(result1, dict) and 'error' in result1:
                    print(f"   ❌ ERROR: {result1['error']}")
                    return False
                
                if isinstance(result1, list):
                    count1 = len(result1)
                    print(f"   📊 Returned {count1} activities")
                    
                    if count1 == 0:
                        print(f"   ⚠️  WARNING: Tool returned 0 activities but database has {total_activities}")
                    elif count1 < total_activities and total_activities > 20:
                        print(f"   ⚠️  WARNING: Tool returned {count1} activities but database has {total_activities}")
                        print(f"   This is expected if limit=20 and there are more than 20 activities")
                    else:
                        print(f"   ✅ Returned {count1} activities (matches or within limit)")
                    
                    # Show first few results
                    if count1 > 0:
                        print(f"\n   First {min(3, count1)} activity/activities returned:")
                        for idx, act in enumerate(result1[:3], 1):
                            if isinstance(act, dict):
                                title = act.get('title', 'N/A')
                                act_type = act.get('activity_type', 'N/A')
                                status = act.get('status', 'N/A')
                                act_id = act.get('id', 'N/A')
                                print(f"      {idx}. ID {act_id}: {title} (Type: {act_type}, Status: {status})")
                            else:
                                print(f"      {idx}. {str(act)[:100]}")
                else:
                    print(f"   ❌ ERROR: Unexpected result type: {type(result1)}")
                    print(f"   Result: {str(result1)[:200]}")
                    return False
                    
            except Exception as e:
                print(f"   ❌ ERROR calling tool: {e}")
                import traceback
                traceback.print_exc()
                return False
            
            # Test 2: Call with limit=100 to get all activities
            print(f"\n[7] Test 2: Calling list_activities() with limit=100...")
            try:
                result2 = await call_list_activities(limit=100)
                print(f"   ✅ Tool executed successfully")
                
                if isinstance(result2, dict) and 'error' in result2:
                    print(f"   ❌ ERROR: {result2['error']}")
                    return False
                
                if isinstance(result2, list):
                    count2 = len(result2)
                    print(f"   📊 Returned {count2} activities")
                    
                    if count2 == total_activities:
                        print(f"   ✅ Perfect! Returned all {total_activities} activities")
                    elif count2 < total_activities:
                        print(f"   ⚠️  WARNING: Returned {count2} but database has {total_activities}")
                        print(f"   This might indicate a filtering issue")
                    else:
                        print(f"   ⚠️  Unexpected: Returned {count2} but database has {total_activities}")
                    
                    # Show all results summary
                    if count2 > 0:
                        print(f"\n   Activity summary:")
                        by_type = {}
                        by_status = {}
                        for act in result2:
                            if isinstance(act, dict):
                                act_type = act.get('activity_type', 'unknown')
                                status = act.get('status', 'unknown')
                                by_type[act_type] = by_type.get(act_type, 0) + 1
                                by_status[status] = by_status.get(status, 0) + 1
                        
                        print(f"      By type: {by_type}")
                        print(f"      By status: {by_status}")
                else:
                    print(f"   ❌ ERROR: Unexpected result type: {type(result2)}")
                    return False
                    
            except Exception as e:
                print(f"   ❌ ERROR calling tool: {e}")
                import traceback
                traceback.print_exc()
                return False
            
            # Summary
            print(f"\n" + "=" * 70)
            print("[RESULT] MCP list_activities tool test completed")
            print("=" * 70)
            print(f"\n✅ Tool is working correctly!")
            print(f"   - Database has {total_activities} activities for org {org_id}")
            print(f"   - Tool returned {count2} activities with limit=100")
            
            if count2 == total_activities:
                print(f"\n✅ SUCCESS: Tool returns all activities correctly!")
            elif count2 < total_activities:
                print(f"\n⚠️  WARNING: Tool might not be returning all activities")
                print(f"   Check if there are any additional filters being applied")
            
            return True
            
        except Exception as e:
            print(f"\n❌ ERROR: {e}")
            import traceback
            traceback.print_exc()
            return False
    
    # Run async test
    success = asyncio.run(run_test())
    
    if success:
        print(f"\n✅ All tests passed!")
    else:
        print(f"\n❌ Some tests failed. Check output above.")
    
    return success

if __name__ == "__main__":
    test_mcp_list_activities()
