"""
Verify API endpoints match between backend and frontend configuration
"""
import os
import sys
import json
import re

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

# Backend endpoints from urls.py
BACKEND_ENDPOINTS = {
    # Auth
    'POST /api/users/': 'User Registration',
    'GET /api/users/': 'List Users',
    'GET /api/users/me/': 'Get Current User',
    'POST /api/auth/login/': 'User Login',
    'POST /api/auth/logout/': 'User Logout',
    'POST /api/auth/change-password/': 'Change Password',
    'POST /api/auth/role-selection/select_role/': 'Select Role',
    'GET /api/auth/role-selection/available_roles/': 'Available Roles',
    'GET /api/auth/role-selection/current_role/': 'Current Role',
    
    # User Profiles
    'GET /api/user-profiles/': 'List User Profiles',
    'GET /api/user-profiles/my_profiles/': 'My Profiles',
    
    # Organizations
    'GET /api/organizations/': 'List Organizations',
    'GET /api/organizations/my_organizations/': 'My Organizations',
    
    # Customers
    'GET /api/customers/': 'List Customers',
    'GET /api/customers/stats/': 'Customer Stats',
    
    # Leads
    'GET /api/leads/': 'List Leads',
    'GET /api/leads/stats/': 'Lead Stats',
    
    # Deals
    'GET /api/deals/': 'List Deals',
    'GET /api/deals/stats/': 'Deal Stats',
    
    # Employees
    'GET /api/employees/': 'List Employees',
    
    # Vendors
    'GET /api/vendors/': 'List Vendors',
    
    # Issues
    'GET /api/issues/': 'List Issues',
    'GET /api/issues/stats/': 'Issue Stats',
    'POST /api/issues/raise/': 'Raise Issue',
    
    # Orders
    'GET /api/orders/': 'List Orders',
    'GET /api/orders/stats/': 'Order Stats',
    
    # Payments
    'GET /api/payments/': 'List Payments',
    'GET /api/payments/stats/': 'Payment Stats',
    
    # Activities
    'GET /api/activities/': 'List Activities',
    'GET /api/activities/stats/': 'Activity Stats',
    
    # RBAC
    'GET /api/permissions/': 'List Permissions',
    'GET /api/roles/': 'List Roles',
    'GET /api/user-roles/': 'List User Roles',
    'GET /api/user-roles/my_roles/': 'My Roles',
    
    # Analytics
    'GET /api/analytics/dashboard/': 'Analytics Dashboard',
    'GET /api/analytics/sales_funnel/': 'Sales Funnel',
    
    # Notifications
    'GET /api/notification-preferences/': 'List Notification Preferences',
    'GET /api/notification-preferences/my_preferences/': 'My Preferences',
}

# Frontend API config path
FRONTEND_API_CONFIG = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
    'web-frontend', 'src', 'config', 'api.config.ts'
)

def extract_frontend_endpoints():
    """Extract endpoints from frontend API config"""
    endpoints = {}
    
    if not os.path.exists(FRONTEND_API_CONFIG):
        print(f"[ERROR] Frontend API config not found: {FRONTEND_API_CONFIG}")
        return endpoints
    
    with open(FRONTEND_API_CONFIG, 'r') as f:
        content = f.read()
    
    # Extract endpoint patterns
    patterns = [
        (r"LOGIN:\s*['\"]([^'\"]+)['\"]", 'POST'),
        (r"LOGOUT:\s*['\"]([^'\"]+)['\"]", 'POST'),
        (r"REGISTER:\s*['\"]([^'\"]+)['\"]", 'POST'),
        (r"ME:\s*['\"]([^'\"]+)['\"]", 'GET'),
        (r"LIST:\s*['\"]([^'\"]+)['\"]", 'GET'),
        (r"STATS:\s*['\"]([^'\"]+)['\"]", 'GET'),
    ]
    
    for pattern, method in patterns:
        matches = re.finditer(pattern, content)
        for match in matches:
            endpoint = match.group(1)
            key = f"{method} /api{endpoint}"
            endpoints[key] = endpoint
    
    # Extract function-based endpoints
    func_pattern = r"DETAIL:\s*\([^)]+\)\s*=>\s*['\"`]([^'\"`]+)['\"`]"
    matches = re.finditer(func_pattern, content)
    for match in matches:
        endpoint_template = match.group(1)
        # Convert template to example
        endpoint = endpoint_template.replace('${id}', '1')
        key = f"GET /api{endpoint}"
        endpoints[key] = endpoint_template
    
    return endpoints

def verify_endpoints():
    """Verify backend and frontend endpoints match"""
    print("=" * 80)
    print("API Endpoint Verification")
    print("=" * 80)
    
    frontend_endpoints = extract_frontend_endpoints()
    
    print(f"\n✅ Backend endpoints found: {len(BACKEND_ENDPOINTS)}")
    print(f"✅ Frontend endpoints found: {len(frontend_endpoints)}")
    
    # Check for missing endpoints
    print("\n" + "=" * 80)
    print("Endpoint Verification Results")
    print("=" * 80)
    
    missing_in_frontend = []
    for endpoint, description in BACKEND_ENDPOINTS.items():
        # Normalize endpoint for comparison
        normalized = endpoint.replace('/api', '')
        found = False
        for fe_endpoint in frontend_endpoints.values():
            if normalized.startswith(fe_endpoint) or fe_endpoint.startswith(normalized):
                found = True
                break
        if not found:
            missing_in_frontend.append((endpoint, description))
    
    if missing_in_frontend:
        print(f"\n⚠️  Missing in Frontend ({len(missing_in_frontend)}):")
        for endpoint, desc in missing_in_frontend:
            print(f"   - {endpoint} ({desc})")
    else:
        print("\n✅ All backend endpoints have frontend counterparts")
    
    print("\n" + "=" * 80)
    print("Verification Complete")
    print("=" * 80)

if __name__ == '__main__':
    verify_endpoints()

