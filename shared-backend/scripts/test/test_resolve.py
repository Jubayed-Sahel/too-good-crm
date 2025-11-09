#!/usr/bin/env python
"""
Test the issue resolve functionality with Linear sync
"""
import requests
import json
import time

# Configuration
BASE_URL = "http://localhost:8000"
TOKEN = "e3b23a9b107b617bada0d3baa0cfd5b6c91ac3e6"

def test_resolve_issue():
    """Test resolving an issue and syncing to Linear"""
    print("\n" + "="*70)
    print("Testing Issue Resolve with Linear Sync")
    print("="*70)
    
    # Wait for server
    time.sleep(1)
    
    headers = {
        "Authorization": f"Token {TOKEN}",
        "Content-Type": "application/json"
    }
    
    # First, get the latest issue
    print("\n1️⃣ Getting latest issue...")
    response = requests.get(f"{BASE_URL}/api/issues/", headers=headers)
    if response.status_code == 200:
        issues = response.json()
        if issues and len(issues) > 0:
            latest_issue = issues[0]  # Get first issue
            issue_id = latest_issue['id']
            issue_number = latest_issue['issue_number']
            linear_synced = latest_issue.get('synced_to_linear', False)
            linear_url = latest_issue.get('linear_issue_url', 'Not synced')
            
            print(f"✅ Found issue: {issue_number} (ID: {issue_id})")
            print(f"   Title: {latest_issue['title']}")
            print(f"   Status: {latest_issue['status']}")
            print(f"   Linear Synced: {linear_synced}")
            if linear_synced:
                print(f"   Linear URL: {linear_url}")
        else:
            print("❌ No issues found!")
            return
    else:
        print(f"❌ Failed to get issues: {response.status_code}")
        return
    
    # Resolve the issue
    print(f"\n2️⃣ Resolving issue {issue_number}...")
    resolve_data = {
        "resolution_notes": "Issue has been fixed and tested successfully. All functionality working as expected."
    }
    
    response = requests.post(
        f"{BASE_URL}/api/issues/resolve/{issue_id}/",
        json=resolve_data,
        headers=headers
    )
    
    print(f"   Status Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"\n✅ SUCCESS! Issue resolved!")
        print(f"   Message: {data.get('message', '')}")
        
        issue = data.get('issue', {})
        print(f"\n📋 Updated Issue Details:")
        print(f"   Issue Number: {issue.get('issue_number')}")
        print(f"   Status: {issue.get('status')} → {issue.get('status_display')}")
        print(f"   Resolved At: {issue.get('resolved_at')}")
        print(f"   Resolution Notes: {issue.get('resolution_notes')}")
        
        # Check Linear sync
        linear_data = data.get('linear_data')
        if linear_data:
            print(f"\n🔗 Linear Sync:")
            print(f"   ✅ Synced to Linear!")
            print(f"   Linear ID: {linear_data.get('identifier')}")
            print(f"   Linear State: {linear_data.get('state')}")
            print(f"   Linear URL: {linear_data.get('url')}")
        elif issue.get('synced_to_linear'):
            print(f"\n🔗 Linear Sync:")
            print(f"   ✅ Previously synced (updated in Linear)")
        else:
            print(f"\n⚠️  Not synced to Linear")
        
        print(f"\n📄 Full Response:")
        print(json.dumps(data, indent=2))
        
    else:
        print(f"❌ Failed to resolve issue!")
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.text}")
    
    print("\n" + "="*70)
    print("Test Complete!")
    print("="*70 + "\n")

if __name__ == "__main__":
    test_resolve_issue()
