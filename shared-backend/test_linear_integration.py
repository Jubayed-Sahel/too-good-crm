"""
Test script to verify Linear integration is working correctly.
Run this script to test Linear API connectivity and issue syncing.
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from crmApp.models import Organization, Issue
from crmApp.services.linear_service import LinearService
from crmApp.services.issue_linear_service import IssueLinearService
from django.conf import settings

def test_linear_api_connection():
    """Test if Linear API key is configured and working."""
    print("=" * 60)
    print("TESTING LINEAR API CONNECTION")
    print("=" * 60)
    
    linear_api_key = getattr(settings, 'LINEAR_API_KEY', None) or os.getenv('LINEAR_API_KEY', '')
    
    if not linear_api_key:
        print("[ERROR] LINEAR_API_KEY not configured in .env file")
        print("   Please add LINEAR_API_KEY to your .env file")
        return False
    
    print(f"[OK] LINEAR_API_KEY found: {linear_api_key[:20]}...")
    
    try:
        linear_service = LinearService(api_key=linear_api_key)
        viewer = linear_service.get_viewer()
        
        print(f"[OK] Connected to Linear API")
        print(f"   User: {viewer.get('name', 'N/A')}")
        print(f"   Email: {viewer.get('email', 'N/A')}")
        if viewer.get('organization'):
            print(f"   Organization: {viewer['organization'].get('name', 'N/A')}")
        
        return True
    except Exception as e:
        print(f"[ERROR] Failed to connect to Linear API: {str(e)}")
        return False


def test_linear_teams():
    """Test fetching Linear teams."""
    print("\n" + "=" * 60)
    print("TESTING LINEAR TEAMS")
    print("=" * 60)
    
    try:
        linear_service = LinearService()
        teams = linear_service.get_teams()
        
        if not teams:
            print("[WARNING] No teams found in Linear")
            print("   Please create a team in Linear first")
            return []
        
        print(f"[OK] Found {len(teams)} team(s):")
        for i, team in enumerate(teams, 1):
            print(f"   {i}. {team['name']} (ID: {team['id']}, Key: {team['key']})")
        
        return teams
    except Exception as e:
        print(f"[ERROR] Failed to fetch teams: {str(e)}")
        return []


def test_organization_linear_config():
    """Test if organizations have Linear team IDs configured."""
    print("\n" + "=" * 60)
    print("TESTING ORGANIZATION LINEAR CONFIGURATION")
    print("=" * 60)
    
    organizations = Organization.objects.filter(is_active=True)
    
    if not organizations.exists():
        print("[WARNING] No active organizations found")
        return []
    
    configured_orgs = []
    unconfigured_orgs = []
    
    for org in organizations:
        if org.linear_team_id:
            configured_orgs.append(org)
            print(f"[OK] {org.name} (ID: {org.id})")
            print(f"   Linear Team ID: {org.linear_team_id}")
        else:
            unconfigured_orgs.append(org)
            print(f"[WARNING] {org.name} (ID: {org.id}) - No Linear Team ID configured")
    
    if unconfigured_orgs:
        print(f"\n[WARNING] {len(unconfigured_orgs)} organization(s) need Linear Team ID configuration")
        print("   Run: python manage.py configure_linear")
    
    return configured_orgs


def test_issue_sync_status():
    """Check sync status of existing issues."""
    print("\n" + "=" * 60)
    print("TESTING ISSUE SYNC STATUS")
    print("=" * 60)
    
    issues = Issue.objects.all()
    
    if not issues.exists():
        print("[WARNING] No issues found in database")
        return
    
    synced_count = issues.filter(synced_to_linear=True).count()
    unsynced_count = issues.filter(synced_to_linear=False).count()
    total_count = issues.count()
    
    print(f"Total Issues: {total_count}")
    print(f"[OK] Synced to Linear: {synced_count}")
    print(f"[WARNING] Not Synced: {unsynced_count}")
    
    if unsynced_count > 0:
        print(f"\n[TIP] To sync unsynced issues, run:")
        print(f"   python manage.py sync_issues_to_linear")
    
    # Show some synced issues
    synced_issues = issues.filter(synced_to_linear=True)[:5]
    if synced_issues:
        print(f"\nSample Synced Issues:")
        for issue in synced_issues:
            print(f"   - {issue.issue_number}: {issue.title}")
            if issue.linear_issue_url:
                print(f"     Linear URL: {issue.linear_issue_url}")


def test_create_test_issue():
    """Test creating a test issue and syncing it to Linear."""
    print("\n" + "=" * 60)
    print("TESTING ISSUE CREATION AND SYNC")
    print("=" * 60)
    
    # Find an organization with Linear configured
    org = Organization.objects.filter(is_active=True, linear_team_id__isnull=False).first()
    
    if not org:
        print("[WARNING] No organization with Linear Team ID configured")
        print("   Please configure Linear for at least one organization first")
        return False
    
    print(f"Using organization: {org.name} (Team ID: {org.linear_team_id})")
    
    try:
        # Create a test issue
        from crmApp.models import Customer
        customer = Customer.objects.filter(organization=org).first()
        
        if not customer:
            print("[WARNING] No customer found for this organization")
            print("   Skipping test issue creation")
            return False
        
        issue = Issue.objects.create(
            organization=org,
            customer=customer,
            title="Test Issue - Linear Integration",
            description="This is a test issue to verify Linear integration is working correctly.",
            priority="medium",
            status="open",
            category="technical"
        )
        
        print(f"[OK] Created test issue: {issue.issue_number}")
        
        # Try to sync it
        linear_service = IssueLinearService()
        success, linear_data, error = linear_service.sync_issue_to_linear(
            issue=issue,
            team_id=org.linear_team_id,
            update_existing=False
        )
        
        if success and linear_data:
            print(f"[OK] Issue synced to Linear successfully!")
            print(f"   Linear Issue ID: {linear_data.get('id', 'N/A')}")
            print(f"   Linear URL: {linear_data.get('url', 'N/A')}")
            print(f"   Linear State: {linear_data.get('state', 'N/A')}")
            
            # Clean up test issue
            delete = input("\nDelete test issue? (y/n): ").lower().strip()
            if delete == 'y':
                issue.delete()
                print("[OK] Test issue deleted")
            
            return True
        else:
            print(f"[ERROR] Failed to sync issue to Linear: {error or 'Unknown error'}")
            return False
            
    except Exception as e:
        print(f"[ERROR] Error during test: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


def main():
    """Run all tests."""
    print("\n" + "=" * 60)
    print("LINEAR INTEGRATION TEST SUITE")
    print("=" * 60)
    print()
    
    # Test 1: API Connection
    if not test_linear_api_connection():
        print("\n[ERROR] Linear API connection failed. Please check your LINEAR_API_KEY in .env")
        return
    
    # Test 2: Teams
    teams = test_linear_teams()
    
    # Test 3: Organization Configuration
    configured_orgs = test_organization_linear_config()
    
    # Test 4: Issue Sync Status
    test_issue_sync_status()
    
    # Test 5: Create and sync test issue (optional)
    if configured_orgs:
        print("\n" + "=" * 60)
        run_test = input("Run test issue creation and sync? (y/n): ").lower().strip()
        if run_test == 'y':
            test_create_test_issue()
    
    print("\n" + "=" * 60)
    print("TEST SUITE COMPLETE")
    print("=" * 60)
    print("\n[TIP] Next Steps:")
    print("   1. Ensure all organizations have Linear Team IDs configured")
    print("   2. New issues will automatically sync to Linear on creation")
    print("   3. Issue updates will automatically sync to Linear")
    print("   4. To sync existing issues: python manage.py sync_issues_to_linear")
    print()


if __name__ == '__main__':
    main()

