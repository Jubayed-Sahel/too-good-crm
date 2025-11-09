"""
Test Linear Integration
Run this to test creating an issue and syncing to Linear
"""

import requests
import json

# Configuration
BASE_URL = "http://localhost:8000"
# You need to get your auth token first by logging in
AUTH_TOKEN = "YOUR_AUTH_TOKEN_HERE"  # Replace with actual token
LINEAR_TEAM_ID = "b95250db-8430-4dbc-88f8-9fc109369df0"  # Your Linear team ID

headers = {
    "Authorization": f"Token {AUTH_TOKEN}",
    "Content-Type": "application/json"
}

def test_raise_issue_with_linear_sync():
    """Test creating an issue with auto-sync to Linear"""
    print("\n" + "="*60)
    print("TEST 1: Raise Issue with Auto-Sync to Linear")
    print("="*60)
    
    url = f"{BASE_URL}/api/issues/raise/"
    
    data = {
        "title": "Test Linear Integration - Quality Issue",
        "description": "This is a test issue to verify Linear integration is working correctly",
        "priority": "high",
        "category": "quality",
        "auto_sync_linear": True,
        "linear_team_id": LINEAR_TEAM_ID
    }
    
    print(f"\nCreating issue with data:")
    print(json.dumps(data, indent=2))
    
    try:
        response = requests.post(url, json=data, headers=headers)
        print(f"\nStatus Code: {response.status_code}")
        
        if response.status_code == 201:
            result = response.json()
            print(f"\n✅ SUCCESS! Issue created:")
            print(f"   Issue Number: {result['issue']['issue_number']}")
            print(f"   Status: {result['issue']['status']}")
            print(f"   Synced to Linear: {result['issue']['synced_to_linear']}")
            
            if result['issue']['synced_to_linear']:
                print(f"\n🎉 LINEAR SYNC SUCCESSFUL!")
                print(f"   Linear URL: {result['issue']['linear_issue_url']}")
                print(f"\n   View in Linear: {result['issue']['linear_issue_url']}")
            
            return result['issue']['id']
        else:
            print(f"\n❌ ERROR: {response.status_code}")
            print(response.json())
            return None
            
    except Exception as e:
        print(f"\n❌ Exception: {str(e)}")
        return None


def test_manual_sync(issue_id):
    """Test manually syncing an existing issue"""
    print("\n" + "="*60)
    print("TEST 2: Manual Sync to Linear")
    print("="*60)
    
    url = f"{BASE_URL}/api/issues/{issue_id}/sync_to_linear/"
    
    data = {
        "team_id": LINEAR_TEAM_ID
    }
    
    print(f"\nSyncing issue {issue_id} to Linear...")
    
    try:
        response = requests.post(url, json=data, headers=headers)
        print(f"\nStatus Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"\n✅ SUCCESS! Issue synced:")
            print(f"   Message: {result['message']}")
            print(f"   Linear URL: {result['issue']['linear_issue_url']}")
            
            return True
        else:
            print(f"\n❌ ERROR: {response.status_code}")
            print(response.json())
            return False
            
    except Exception as e:
        print(f"\n❌ Exception: {str(e)}")
        return False


def test_resolve_issue(issue_id):
    """Test resolving an issue (should auto-sync if already in Linear)"""
    print("\n" + "="*60)
    print("TEST 3: Resolve Issue (Auto-Sync)")
    print("="*60)
    
    url = f"{BASE_URL}/api/issues/resolve/{issue_id}/"
    
    data = {
        "resolution_notes": "Issue resolved successfully during integration testing"
    }
    
    print(f"\nResolving issue {issue_id}...")
    
    try:
        response = requests.post(url, json=data, headers=headers)
        print(f"\nStatus Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"\n✅ SUCCESS! Issue resolved:")
            print(f"   Message: {result['message']}")
            print(f"   Previous Status: {result['previous_status']}")
            print(f"   Current Status: {result['issue']['status']}")
            
            if result.get('linear_synced'):
                print(f"   🎉 Resolution synced to Linear!")
            
            return True
        else:
            print(f"\n❌ ERROR: {response.status_code}")
            print(response.json())
            return False
            
    except Exception as e:
        print(f"\n❌ Exception: {str(e)}")
        return False


def test_get_stats():
    """Test getting statistics including Linear sync status"""
    print("\n" + "="*60)
    print("TEST 4: Get Statistics")
    print("="*60)
    
    url = f"{BASE_URL}/api/issues/stats/"
    
    try:
        response = requests.get(url, headers=headers)
        print(f"\nStatus Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"\n✅ Issue Statistics:")
            print(f"   Total Issues: {result['total']}")
            print(f"\n   By Status:")
            for status, count in result['by_status'].items():
                print(f"      {status}: {count}")
            print(f"\n   Linear Sync:")
            print(f"      Synced: {result['linear_sync']['synced']}")
            print(f"      Not Synced: {result['linear_sync']['not_synced']}")
            
            return True
        else:
            print(f"\n❌ ERROR: {response.status_code}")
            print(response.json())
            return False
            
    except Exception as e:
        print(f"\n❌ Exception: {str(e)}")
        return False


def login():
    """Login to get auth token"""
    print("\n" + "="*60)
    print("LOGIN")
    print("="*60)
    
    url = f"{BASE_URL}/api/auth/login/"
    
    data = {
        "username": "admin@crm.com",
        "password": "admin123"
    }
    
    print(f"\nLogging in as {data['username']}...")
    
    try:
        response = requests.post(url, json=data)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            token = result.get('token')
            print(f"\n✅ Login successful!")
            print(f"   Token: {token}")
            return token
        else:
            print(f"\n❌ Login failed: {response.status_code}")
            print(response.json())
            return None
            
    except Exception as e:
        print(f"\n❌ Exception: {str(e)}")
        return None


if __name__ == "__main__":
    print("\n" + "="*60)
    print("LINEAR INTEGRATION TEST SUITE")
    print("="*60)
    
    # Check configuration
    if AUTH_TOKEN == "YOUR_AUTH_TOKEN_HERE":
        print("\n⚠️  AUTH_TOKEN not set. Attempting to login...")
        token = login()
        if token:
            AUTH_TOKEN = token
            headers["Authorization"] = f"Token {token}"
        else:
            print("\n❌ Cannot proceed without authentication.")
            print("\nPlease update AUTH_TOKEN in this script or ensure server is running.")
            exit(1)
    
    if LINEAR_TEAM_ID == "YOUR_LINEAR_TEAM_ID":
        print("\n⚠️  WARNING: LINEAR_TEAM_ID not set!")
        print("Please update LINEAR_TEAM_ID in this script with your actual Linear team ID.")
        print("\nTo get your team ID, run:")
        print("  curl https://api.linear.app/graphql \\")
        print("    -H 'Authorization: YOUR_LINEAR_API_KEY' \\")
        print("    -d '{\"query\": \"{ viewer { teams { nodes { id name } } } }\"}'")
        exit(1)
    
    # Run tests
    print("\nStarting tests...\n")
    
    # Test 1: Create issue with auto-sync
    issue_id = test_raise_issue_with_linear_sync()
    
    if not issue_id:
        print("\n⚠️  First test failed. Check your configuration.")
        print("Make sure:")
        print("  1. Django server is running (python manage.py runserver)")
        print("  2. LINEAR_API_KEY is set in .env")
        print("  3. LINEAR_TEAM_ID is correct")
        exit(1)
    
    # Test 2: Get stats
    test_get_stats()
    
    # Test 3: Resolve issue
    test_resolve_issue(issue_id)
    
    print("\n" + "="*60)
    print("✅ ALL TESTS COMPLETED!")
    print("="*60)
    print("\nCheck Linear to verify the issue was created and updated!")
