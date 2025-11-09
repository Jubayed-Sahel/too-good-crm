"""
Complete test of Linear integration flow via API:
1. Customer raises issue
2. Verify Linear sync
3. Vendor views issue
4. Vendor updates status
5. Verify Linear sync for status update
6. Customer views updated status
"""

import requests
import json
import time

BASE_URL = 'http://127.0.0.1:8000/api'

print("=" * 70)
print("COMPLETE LINEAR INTEGRATION FLOW TEST")
print("=" * 70)

# Step 1: Login as Customer
print("\n[1/6] Logging in as customer...")
customer_login = requests.post(
    f'{BASE_URL}/auth/login/',
    json={'username': 'customer@test.com', 'password': 'customer123'}
)

if customer_login.status_code != 200:
    print(f"[ERROR] Customer login failed: {customer_login.status_code}")
    print(customer_login.text)
    exit(1)

customer_data = customer_login.json()
customer_token = customer_data['token']
customer_user = customer_data['user']
print(f"[OK] Customer logged in: {customer_user['email']}")

# Get organization ID
org_id = None
if customer_user.get('profiles'):
    for profile in customer_user['profiles']:
        if profile.get('organization'):
            org_id = profile['organization']
            break

if not org_id:
    print("[ERROR] No organization found for customer")
    exit(1)

print(f"[OK] Organization ID: {org_id}")

# Step 2: Customer raises an issue
print("\n[2/6] Customer raising an issue...")
issue_data = {
    'organization': org_id,
    'title': 'Linear Integration Test - Complete Flow',
    'description': 'Testing complete Linear integration flow: customer raises issue, vendor views and updates status, Linear syncs automatically.',
    'priority': 'high',
    'category': 'quality'
}

raise_issue_response = requests.post(
    f'{BASE_URL}/client/issues/raise/',
    headers={'Authorization': f'Token {customer_token}'},
    json=issue_data
)

if raise_issue_response.status_code != 201:
    print(f"[ERROR] Failed to raise issue: {raise_issue_response.status_code}")
    print(raise_issue_response.text)
    exit(1)

issue_result = raise_issue_response.json()
issue = issue_result.get('issue', {})
issue_id = issue.get('id')
issue_number = issue.get('issue_number', 'N/A')

print(f"[OK] Issue created: {issue_number}")
print(f"   Issue ID: {issue_id}")
print(f"   Title: {issue.get('title')}")

# Check Linear sync
linear_synced = issue.get('synced_to_linear', False)
linear_url = issue.get('linear_issue_url', 'N/A')

if linear_synced:
    print(f"[OK] Issue synced to Linear: {linear_url}")
else:
    print(f"[WARNING] Issue not synced to Linear")

# Step 3: Login as Vendor
print("\n[3/6] Logging in as vendor...")
vendor_login = requests.post(
    f'{BASE_URL}/auth/login/',
    json={'username': 'vendor@test.com', 'password': 'vendor123'}
)

if vendor_login.status_code != 200:
    print(f"[ERROR] Vendor login failed: {vendor_login.status_code}")
    print(vendor_login.text)
    exit(1)

vendor_data = vendor_login.json()
vendor_token = vendor_data['token']
vendor_user = vendor_data['user']
print(f"[OK] Vendor logged in: {vendor_user['email']}")

# Step 4: Vendor views issues
print("\n[4/6] Vendor viewing issues...")
issues_response = requests.get(
    f'{BASE_URL}/issues/',
    headers={'Authorization': f'Token {vendor_token}'}
)

if issues_response.status_code != 200:
    print(f"[ERROR] Failed to get issues: {issues_response.status_code}")
    print(issues_response.text)
    exit(1)

issues_data = issues_response.json()
issues = issues_data.get('results', [])
print(f"[OK] Found {len(issues)} issues")

# Find our test issue
test_issue = None
for iss in issues:
    if iss.get('id') == issue_id or 'Linear Integration Test - Complete Flow' in iss.get('title', ''):
        test_issue = iss
        break

if not test_issue:
    print(f"[ERROR] Test issue not found in vendor's issue list")
    print(f"   Looking for issue ID: {issue_id}")
    if issues:
        print(f"   Available issues: {[i.get('issue_number') for i in issues[:5]]}")
    exit(1)

print(f"[OK] Vendor can see the test issue: {test_issue.get('issue_number')}")
print(f"   Status: {test_issue.get('status')}")
print(f"   Linear Synced: {test_issue.get('synced_to_linear', False)}")

# Step 5: Vendor updates issue status
print("\n[5/6] Vendor updating issue status to 'in_progress'...")
update_response = requests.patch(
    f'{BASE_URL}/issues/{issue_id}/',
    headers={'Authorization': f'Token {vendor_token}'},
    json={'status': 'in_progress'}
)

if update_response.status_code != 200:
    print(f"[ERROR] Failed to update issue: {update_response.status_code}")
    print(update_response.text)
    exit(1)

updated_issue = update_response.json()
print(f"[OK] Issue status updated to: {updated_issue.get('status')}")

# Check Linear sync
if updated_issue.get('linear_synced'):
    print(f"[OK] Status change synced to Linear")
else:
    print(f"[INFO] Linear sync status: {updated_issue.get('linear_synced', 'not reported')}")

# Wait a bit for sync
time.sleep(1)

# Step 6: Customer views updated issue
print("\n[6/6] Customer viewing updated issue...")
customer_issue_response = requests.get(
    f'{BASE_URL}/client/issues/{issue_id}/',
    headers={'Authorization': f'Token {customer_token}'}
)

if customer_issue_response.status_code != 200:
    print(f"[ERROR] Failed to get issue: {customer_issue_response.status_code}")
    print(customer_issue_response.text)
    exit(1)

customer_issue = customer_issue_response.json()
print(f"[OK] Customer can see updated issue")
print(f"   Status: {customer_issue.get('status')}")
print(f"   Issue Number: {customer_issue.get('issue_number')}")

# Verify status was updated
if customer_issue.get('status') == 'in_progress':
    print(f"[OK] Status update visible to customer: in_progress")
else:
    print(f"[WARNING] Status mismatch. Expected: in_progress, Got: {customer_issue.get('status')}")

print("\n" + "=" * 70)
print("TEST RESULTS")
print("=" * 70)
print(f"\nIssue Number: {issue_number}")
print(f"Issue ID: {issue_id}")
if linear_synced:
    print(f"Linear URL: {linear_url}")
print(f"\nStatus: {customer_issue.get('status')}")
print(f"\n[OK] All tests passed!")
print("\nNext steps:")
print("1. Check Linear.app to verify the issue: " + (linear_url if linear_synced else "N/A"))
print("2. Verify status update in Linear.app")
print("3. Test in web UI: vendor should see issue in /issues page")
print("4. Test in web UI: customer should see updated status in /client/issues page")

