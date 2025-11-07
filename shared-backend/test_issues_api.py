"""
Test script for Issue Management API endpoints
Run this to test all issue-related endpoints without frontend

Prerequisites:
1. Start Django server: python manage.py runserver
2. Have a valid user account (or use test_auth.py to create one)

Usage:
    python test_issues_api.py
"""

import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:8000/api"

# Test credentials (modify these or create user first)
TEST_EMAIL = "john.doe@demo.com"  # Demo user from seed_data.py
TEST_PASSWORD = "demo1234"

class IssueAPITester:
    def __init__(self):
        self.token = None
        self.headers = {}
        self.created_issue_id = None
        
    def login(self, email=TEST_EMAIL, password=TEST_PASSWORD):
        """Login and get authentication token"""
        print("\n" + "="*60)
        print("🔐 LOGGING IN")
        print("="*60)
        
        response = requests.post(
            f"{BASE_URL}/auth/login/",
            json={"username": email, "password": password}
        )
        
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            self.token = data.get('token')
            self.headers = {
                "Authorization": f"Token {self.token}",
                "Content-Type": "application/json"
            }
            print(f"✅ Login successful!")
            print(f"Token: {self.token[:20]}...")
            print(f"User: {data.get('user', {}).get('email')}")
            return True
        else:
            print(f"❌ Login failed!")
            print(f"Response: {response.text}")
            return False
    
    def list_issues(self, params=None):
        """GET /api/issues/ - List all issues"""
        print("\n" + "="*60)
        print("📋 LIST ISSUES")
        print("="*60)
        
        response = requests.get(
            f"{BASE_URL}/issues/",
            headers=self.headers,
            params=params or {}
        )
        
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Found {data.get('count', 0)} issues")
            
            # Display issues
            issues = data.get('results', [])
            if issues:
                print("\nIssues:")
                for issue in issues[:5]:  # Show first 5
                    print(f"  • [{issue['issue_number']}] {issue['title']}")
                    print(f"    Priority: {issue['priority']} | Status: {issue['status']}")
            else:
                print("No issues found")
            
            return data
        else:
            print(f"❌ Failed to list issues")
            print(f"Response: {response.text}")
            return None
    
    def create_issue(self):
        """POST /api/issues/ - Create new issue"""
        print("\n" + "="*60)
        print("➕ CREATE ISSUE")
        print("="*60)
        
        issue_data = {
            "title": "Test Quality Issue - API Test",
            "description": "This is a test issue created via API testing script",
            "priority": "high",
            "category": "quality",
            "status": "open"
            # vendor and order are optional
        }
        
        print("Creating issue with data:")
        print(json.dumps(issue_data, indent=2))
        
        response = requests.post(
            f"{BASE_URL}/issues/",
            headers=self.headers,
            json=issue_data
        )
        
        print(f"\nStatus: {response.status_code}")
        
        if response.status_code == 201:
            data = response.json()
            self.created_issue_id = data.get('id')
            print(f"✅ Issue created successfully!")
            print(f"Issue ID: {data.get('id')}")
            print(f"Issue Number: {data.get('issue_number')}")
            print(f"Created at: {data.get('created_at')}")
            print(f"\nFull response:")
            print(json.dumps(data, indent=2))
            return data
        else:
            print(f"❌ Failed to create issue")
            print(f"Response: {response.text}")
            return None
    
    def get_issue_detail(self, issue_id):
        """GET /api/issues/{id}/ - Get specific issue"""
        print("\n" + "="*60)
        print(f"🔍 GET ISSUE DETAIL (ID: {issue_id})")
        print("="*60)
        
        response = requests.get(
            f"{BASE_URL}/issues/{issue_id}/",
            headers=self.headers
        )
        
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Issue retrieved successfully!")
            print(f"\nIssue Details:")
            print(f"  Number: {data.get('issue_number')}")
            print(f"  Title: {data.get('title')}")
            print(f"  Description: {data.get('description')}")
            print(f"  Priority: {data.get('priority')}")
            print(f"  Category: {data.get('category')}")
            print(f"  Status: {data.get('status')}")
            print(f"  Created: {data.get('created_at')}")
            return data
        else:
            print(f"❌ Failed to get issue")
            print(f"Response: {response.text}")
            return None
    
    def update_issue(self, issue_id):
        """PUT /api/issues/{id}/ - Update issue"""
        print("\n" + "="*60)
        print(f"✏️  UPDATE ISSUE (ID: {issue_id})")
        print("="*60)
        
        update_data = {
            "title": "Updated Test Issue - Modified via API",
            "description": "This issue was updated through API testing",
            "priority": "critical",
            "status": "in_progress"
        }
        
        print("Updating with data:")
        print(json.dumps(update_data, indent=2))
        
        response = requests.put(
            f"{BASE_URL}/issues/{issue_id}/",
            headers=self.headers,
            json=update_data
        )
        
        print(f"\nStatus: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Issue updated successfully!")
            print(f"New title: {data.get('title')}")
            print(f"New priority: {data.get('priority')}")
            print(f"New status: {data.get('status')}")
            return data
        else:
            print(f"❌ Failed to update issue")
            print(f"Response: {response.text}")
            return None
    
    def resolve_issue(self, issue_id):
        """POST /api/issues/{id}/resolve/ - Resolve issue"""
        print("\n" + "="*60)
        print(f"✅ RESOLVE ISSUE (ID: {issue_id})")
        print("="*60)
        
        response = requests.post(
            f"{BASE_URL}/issues/{issue_id}/resolve/",
            headers=self.headers
        )
        
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Issue resolved!")
            print(f"Status: {data.get('status')}")
            print(f"Resolved by: {data.get('resolved_by_name')}")
            return data
        else:
            print(f"❌ Failed to resolve issue")
            print(f"Response: {response.text}")
            return None
    
    def reopen_issue(self, issue_id):
        """POST /api/issues/{id}/reopen/ - Reopen issue"""
        print("\n" + "="*60)
        print(f"🔄 REOPEN ISSUE (ID: {issue_id})")
        print("="*60)
        
        response = requests.post(
            f"{BASE_URL}/issues/{issue_id}/reopen/",
            headers=self.headers
        )
        
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Issue reopened!")
            print(f"Status: {data.get('status')}")
            return data
        else:
            print(f"❌ Failed to reopen issue")
            print(f"Response: {response.text}")
            return None
    
    def get_issue_stats(self):
        """GET /api/issues/stats/ - Get issue statistics"""
        print("\n" + "="*60)
        print("📊 GET ISSUE STATISTICS")
        print("="*60)
        
        response = requests.get(
            f"{BASE_URL}/issues/stats/",
            headers=self.headers
        )
        
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Statistics retrieved!")
            print(f"\nTotal Issues: {data.get('total', 0)}")
            
            print(f"\nBy Status:")
            for status, count in data.get('by_status', {}).items():
                print(f"  {status}: {count}")
            
            print(f"\nBy Priority:")
            for priority, count in data.get('by_priority', {}).items():
                print(f"  {priority}: {count}")
            
            print(f"\nBy Category:")
            for category, count in data.get('by_category', {}).items():
                print(f"  {category}: {count}")
            
            return data
        else:
            print(f"❌ Failed to get statistics")
            print(f"Response: {response.text}")
            return None
    
    def filter_issues(self):
        """Test filtering issues"""
        print("\n" + "="*60)
        print("🔎 FILTER ISSUES")
        print("="*60)
        
        # Test different filters
        filters = [
            {"priority": "high"},
            {"status": "open"},
            {"category": "quality"},
            {"search": "test"}
        ]
        
        for filter_params in filters:
            print(f"\nFiltering by: {filter_params}")
            response = requests.get(
                f"{BASE_URL}/issues/",
                headers=self.headers,
                params=filter_params
            )
            
            if response.status_code == 200:
                count = response.json().get('count', 0)
                print(f"✅ Found {count} issues")
            else:
                print(f"❌ Filter failed")
    
    def delete_issue(self, issue_id):
        """DELETE /api/issues/{id}/ - Delete issue"""
        print("\n" + "="*60)
        print(f"🗑️  DELETE ISSUE (ID: {issue_id})")
        print("="*60)
        
        response = requests.delete(
            f"{BASE_URL}/issues/{issue_id}/",
            headers=self.headers
        )
        
        print(f"Status: {response.status_code}")
        
        if response.status_code == 204:
            print(f"✅ Issue deleted successfully!")
            return True
        else:
            print(f"❌ Failed to delete issue")
            print(f"Response: {response.text}")
            return False


def main():
    """Run all tests"""
    print("\n" + "🚀"*30)
    print("ISSUE MANAGEMENT API TESTS")
    print("🚀"*30)
    
    tester = IssueAPITester()
    
    # Step 1: Login
    if not tester.login():
        print("\n❌ Cannot proceed without authentication")
        print("\nTroubleshooting:")
        print("1. Make sure Django server is running: python manage.py runserver")
        print("2. Check credentials in this file (TEST_EMAIL, TEST_PASSWORD)")
        print("3. Run seed_data.py to create demo user")
        return
    
    # Step 2: List existing issues
    tester.list_issues()
    
    # Step 3: Create new issue
    new_issue = tester.create_issue()
    
    if new_issue:
        issue_id = new_issue['id']
        
        # Step 4: Get issue detail
        tester.get_issue_detail(issue_id)
        
        # Step 5: Update issue
        tester.update_issue(issue_id)
        
        # Step 6: Resolve issue
        tester.resolve_issue(issue_id)
        
        # Step 7: Reopen issue
        tester.reopen_issue(issue_id)
        
        # Step 8: Get statistics
        tester.get_issue_stats()
        
        # Step 9: Test filtering
        tester.filter_issues()
        
        # Step 10: Delete test issue
        print("\n" + "="*60)
        input("Press ENTER to delete the test issue (or Ctrl+C to keep it)...")
        tester.delete_issue(issue_id)
    
    print("\n" + "="*60)
    print("✅ ALL TESTS COMPLETED!")
    print("="*60)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  Tests interrupted by user")
    except Exception as e:
        print(f"\n\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
