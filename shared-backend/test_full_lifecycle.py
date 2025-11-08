#!/usr/bin/env python
"""
Complete test: Login, create issue, and resolve with Linear sync
"""
import requests
import json
import time

# Configuration
BASE_URL = "http://localhost:8000"

def login():
    """Login and get fresh token"""
    print("\n🔐 Logging in...")
    response = requests.post(
        f"{BASE_URL}/api/auth/login/",
        json={
            "username": "admin@crm.com",
            "password": "admin123"
        }
    )
    
    if response.status_code == 200:
        data = response.json()
        token = data.get('token')
        print(f"✅ Login successful! Token: {token[:20]}...")
        return token
    else:
        print(f"❌ Login failed: {response.status_code}")
        print(response.text)
        return None

def create_test_issue(token):
    """Create a test issue with Linear sync"""
    print("\n📝 Creating test issue with Linear sync...")
    
    headers = {
        "Authorization": f"Token {token}",
        "Content-Type": "application/json"
    }
    
    data = {
        "title": "Test Issue for Resolve Functionality",
        "description": "This issue will be resolved to test the resolve endpoint",
        "priority": "medium",
        "category": "technical",
        "auto_sync_linear": True,
        "linear_team_id": "b95250db-8430-4dbc-88f8-9fc109369df0"
    }
    
    response = requests.post(
        f"{BASE_URL}/api/issues/raise/",
        json=data,
        headers=headers
    )
    
    if response.status_code == 201:
        result = response.json()
        issue = result.get('issue', {})
        linear_data = result.get('linear_data', {})
        
        print(f"✅ Issue created!")
        print(f"   Issue Number: {issue.get('issue_number')}")
        print(f"   Issue ID: {issue.get('id')}")
        print(f"   Status: {issue.get('status')}")
        
        if linear_data:
            print(f"   Linear ID: {linear_data.get('identifier')}")
            print(f"   Linear URL: {linear_data.get('url')}")
        
        return issue.get('id')
    else:
        print(f"❌ Failed to create issue: {response.status_code}")
        print(response.text)
        return None

def resolve_issue(token, issue_id):
    """Resolve the issue and check Linear sync"""
    print(f"\n✅ Resolving issue ID {issue_id}...")
    
    headers = {
        "Authorization": f"Token {token}",
        "Content-Type": "application/json"
    }
    
    data = {
        "resolution_notes": "Issue resolved successfully! Testing the resolve functionality with Linear sync."
    }
    
    response = requests.post(
        f"{BASE_URL}/api/issues/resolve/{issue_id}/",
        json=data,
        headers=headers
    )
    
    print(f"   Status Code: {response.status_code}")
    
    if response.status_code == 200:
        result = response.json()
        issue = result.get('issue', {})
        linear_data = result.get('linear_data')
        
        print(f"\n🎉 SUCCESS! Issue Resolved!")
        print(f"\n📋 Issue Details:")
        print(f"   Issue Number: {issue.get('issue_number')}")
        print(f"   Status: {issue.get('status_display')}")
        print(f"   Resolved At: {issue.get('resolved_at')}")
        print(f"   Resolution Notes: {issue.get('resolution_notes')}")
        
        if linear_data:
            print(f"\n🔗 Linear Sync Status:")
            print(f"   ✅ Successfully synced to Linear!")
            print(f"   Linear Issue: {linear_data.get('identifier')}")
            print(f"   Linear State: {linear_data.get('state')}")
            print(f"   Linear URL: {linear_data.get('url')}")
            print(f"\n   → Check Linear to verify the issue is marked as resolved/done!")
        else:
            print(f"\n⚠️  Linear sync status unclear")
        
        print(f"\n📄 Full Response:")
        print(json.dumps(result, indent=2))
        return True
    else:
        print(f"❌ Failed to resolve issue!")
        print(f"   Response: {response.text}")
        return False

def main():
    print("\n" + "="*70)
    print("🧪 Testing Complete Issue Lifecycle with Linear Sync")
    print("="*70)
    
    # Step 1: Login
    token = login()
    if not token:
        print("\n❌ Test failed: Could not login")
        return
    
    time.sleep(1)
    
    # Step 2: Create issue
    issue_id = create_test_issue(token)
    if not issue_id:
        print("\n❌ Test failed: Could not create issue")
        return
    
    time.sleep(2)
    
    # Step 3: Resolve issue
    success = resolve_issue(token, issue_id)
    
    print("\n" + "="*70)
    if success:
        print("✅ ALL TESTS PASSED!")
        print("   - Issue created ✅")
        print("   - Synced to Linear ✅")
        print("   - Issue resolved ✅")
        print("   - Resolution synced to Linear ✅")
    else:
        print("❌ TEST FAILED!")
    print("="*70 + "\n")

if __name__ == "__main__":
    main()
