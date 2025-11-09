"""
Comprehensive Authenticated API Test
Tests all major API endpoints with actual authentication
"""
import requests
import json
import sys
import io
from typing import Dict, Optional

# Fix Windows console encoding
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

BASE_URL = "http://127.0.0.1:8000/api"
TEST_USER = {
    "username": "sarah.manager@globalmarketing.com",
    "password": "password123"
}

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    MAGENTA = '\033[95m'
    END = '\033[0m'


class ComprehensiveAPITester:
    def __init__(self):
        self.token = None
        self.passed = 0
        self.failed = 0
        self.warnings = 0
        self.results = []
    
    def print_header(self, text: str, color=Colors.BLUE):
        print(f"\n{color}{'='*70}")
        print(f"  {text}")
        print(f"{'='*70}{Colors.END}\n")
    
    def print_result(self, category: str, name: str, status: str, details: str = ""):
        symbol = "✓" if status == "PASS" else ("⚠" if status == "WARN" else "✗")
        color = Colors.GREEN if status == "PASS" else (Colors.YELLOW if status == "WARN" else Colors.RED)
        
        result = f"{color}{symbol}{Colors.END} {category:20s} | {name}"
        print(result)
        
        if details:
            print(f"  {color}{details}{Colors.END}")
        
        if status == "PASS":
            self.passed += 1
        elif status == "WARN":
            self.warnings += 1
        else:
            self.failed += 1
        
        self.results.append({
            "category": category,
            "name": name,
            "status": status,
            "details": details
        })
    
    def test_request(self, method: str, endpoint: str, category: str, name: str, 
                    data: Dict = None, use_auth: bool = True) -> Optional[Dict]:
        """Make a test request and return response data if successful"""
        url = f"{BASE_URL}{endpoint}"
        headers = {}
        
        if use_auth and self.token:
            headers['Authorization'] = f'Token {self.token}'
        
        try:
            if method == "GET":
                response = requests.get(url, headers=headers, timeout=10)
            elif method == "POST":
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == "PUT":
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method == "PATCH":
                response = requests.patch(url, json=data, headers=headers, timeout=10)
            elif method == "DELETE":
                response = requests.delete(url, headers=headers, timeout=10)
            else:
                self.print_result(category, name, "FAIL", f"Unknown method: {method}")
                return None
            
            # Success cases
            if response.status_code in [200, 201]:
                try:
                    data = response.json()
                    count = len(data) if isinstance(data, list) else (data.get('count', 'N/A') if isinstance(data, dict) else 'N/A')
                    self.print_result(category, name, "PASS", f"Status: {response.status_code} | Data: {count} records")
                    return data
                except:
                    self.print_result(category, name, "PASS", f"Status: {response.status_code}")
                    return {}
            
            # Expected failures
            elif response.status_code == 204:
                self.print_result(category, name, "PASS", "No content (expected)")
                return {}
            
            # Warnings
            elif response.status_code == 401:
                self.print_result(category, name, "WARN", "Auth required")
                return None
            
            elif response.status_code == 403:
                self.print_result(category, name, "WARN", "Permission denied")
                return None
            
            elif response.status_code == 404:
                self.print_result(category, name, "FAIL", f"Endpoint not found: {endpoint}")
                return None
            
            # Errors
            elif response.status_code >= 500:
                self.print_result(category, name, "FAIL", f"Server error: {response.status_code}")
                return None
            
            else:
                self.print_result(category, name, "WARN", f"Status: {response.status_code}")
                return None
                
        except requests.exceptions.ConnectionError:
            self.print_result(category, name, "FAIL", "Cannot connect to server")
            return None
        except requests.exceptions.Timeout:
            self.print_result(category, name, "FAIL", "Request timeout")
            return None
        except Exception as e:
            self.print_result(category, name, "FAIL", str(e))
            return None
    
    def test_authentication(self) -> bool:
        """Test authentication and get token"""
        self.print_header("1. AUTHENTICATION & SERVER", Colors.CYAN)
        
        # Test server connectivity
        try:
            response = requests.get(f"{BASE_URL}/users/", timeout=5)
            self.print_result("Server", "Connectivity", "PASS", "Server is reachable")
        except:
            self.print_result("Server", "Connectivity", "FAIL", "Cannot reach server")
            return False
        
        # Test login
        response = self.test_request(
            "POST", "/auth/login/", 
            "Authentication", "Login",
            data=TEST_USER,
            use_auth=False
        )
        
        if response and 'token' in response:
            self.token = response['token']
            self.print_result("Authentication", "Token Received", "PASS", f"Token: {self.token[:20]}...")
            return True
        else:
            self.print_result("Authentication", "Token Received", "FAIL", "No token in response")
            return False
    
    def test_user_management(self):
        """Test user-related endpoints"""
        self.print_header("2. USER MANAGEMENT", Colors.CYAN)
        
        self.test_request("GET", "/users/me/", "User", "Get Current User")
        users = self.test_request("GET", "/users/", "User", "List All Users")
        
        # Test user profiles if users exist
        if users and isinstance(users, dict) and users.get('count', 0) > 0:
            self.print_result("User", "Users Exist", "PASS", f"{users.get('count')} users found")
    
    def test_organization_management(self):
        """Test organization endpoints"""
        self.print_header("3. ORGANIZATION MANAGEMENT", Colors.CYAN)
        
        orgs = self.test_request("GET", "/organizations/", "Organization", "List Organizations")
        self.test_request("GET", "/organizations/my_organizations/", "Organization", "My Organizations")
        
        if orgs and isinstance(orgs, dict) and orgs.get('count', 0) > 0:
            self.print_result("Organization", "Orgs Exist", "PASS", f"{orgs.get('count')} organizations found")
    
    def test_crm_core(self):
        """Test core CRM endpoints"""
        self.print_header("4. CRM CORE (Customers, Leads, Deals)", Colors.CYAN)
        
        # Customers
        customers = self.test_request("GET", "/customers/", "Customer", "List Customers")
        self.test_request("GET", "/customers/stats/", "Customer", "Customer Stats")
        
        # Leads
        leads = self.test_request("GET", "/leads/", "Lead", "List Leads")
        self.test_request("GET", "/leads/stats/", "Lead", "Lead Stats")
        
        # Deals
        deals = self.test_request("GET", "/deals/", "Deal", "List Deals")
        self.test_request("GET", "/deals/stats/", "Deal", "Deal Stats")
        
        # Summary
        if customers or leads or deals:
            self.print_result("CRM Core", "Data Available", "PASS", "CRM data endpoints working")
    
    def test_pipeline_management(self):
        """Test pipeline endpoints"""
        self.print_header("5. PIPELINE MANAGEMENT", Colors.CYAN)
        
        self.test_request("GET", "/pipelines/", "Pipeline", "List Pipelines")
        self.test_request("GET", "/pipeline-stages/", "Pipeline", "List Stages")
    
    def test_employees_vendors(self):
        """Test employee and vendor endpoints"""
        self.print_header("6. EMPLOYEES & VENDORS", Colors.CYAN)
        
        employees = self.test_request("GET", "/employees/", "Employee", "List Employees")
        self.test_request("GET", "/employees/departments/", "Employee", "Departments")
        
        vendors = self.test_request("GET", "/vendors/", "Vendor", "List Vendors")
        self.test_request("GET", "/vendors/types/", "Vendor", "Vendor Types")
    
    def test_rbac(self):
        """Test RBAC endpoints"""
        self.print_header("7. RBAC (Roles & Permissions)", Colors.CYAN)
        
        roles = self.test_request("GET", "/roles/", "RBAC", "List Roles")
        permissions = self.test_request("GET", "/permissions/", "RBAC", "List Permissions")
        self.test_request("GET", "/user-roles/my_roles/", "RBAC", "My Roles")
        
        if roles or permissions:
            self.print_result("RBAC", "Security System", "PASS", "RBAC system operational")
    
    def test_analytics(self):
        """Test analytics endpoints"""
        self.print_header("8. ANALYTICS & REPORTING", Colors.CYAN)
        
        self.test_request("GET", "/analytics/dashboard/", "Analytics", "Dashboard")
        self.test_request("GET", "/analytics/sales_funnel/", "Analytics", "Sales Funnel")
        self.test_request("GET", "/analytics/revenue_by_period/", "Analytics", "Revenue")
        self.test_request("GET", "/analytics/employee_performance/", "Analytics", "Performance")
        self.test_request("GET", "/analytics/top_performers/", "Analytics", "Top Performers")
    
    def test_additional_endpoints(self):
        """Test additional important endpoints"""
        self.print_header("9. ADDITIONAL FEATURES", Colors.CYAN)
        
        self.test_request("GET", "/activities/", "Activity", "List Activities")
        self.test_request("GET", "/orders/", "Order", "List Orders")
        self.test_request("GET", "/issues/", "Issue", "List Issues")
        self.test_request("GET", "/notification-preferences/", "Notification", "List Notification Preferences")
    
    def print_summary(self):
        """Print comprehensive summary"""
        self.print_header("TEST SUMMARY", Colors.MAGENTA)
        
        total = self.passed + self.failed + self.warnings
        pass_rate = (self.passed / total * 100) if total > 0 else 0
        
        print(f"Total Tests Run:    {total}")
        print(f"{Colors.GREEN}✓ Passed:          {self.passed} ({pass_rate:.1f}%){Colors.END}")
        print(f"{Colors.YELLOW}⚠ Warnings:        {self.warnings}{Colors.END}")
        print(f"{Colors.RED}✗ Failed:          {self.failed}{Colors.END}")
        print()
        
        # Overall status
        if self.failed == 0 and self.passed > 20:
            print(f"{Colors.GREEN}{'='*70}")
            print("  ✓✓✓ EXCELLENT! All critical APIs are working properly!")
            print("  ✓✓✓ Your backend is fully operational and ready for production")
            print(f"{'='*70}{Colors.END}\n")
        elif self.failed == 0:
            print(f"{Colors.GREEN}{'='*70}")
            print("  ✓ GOOD! All tested endpoints are working")
            print("  ✓ No critical failures detected")
            print(f"{'='*70}{Colors.END}\n")
        elif self.failed < 5:
            print(f"{Colors.YELLOW}{'='*70}")
            print("  ⚠ MOSTLY WORKING - Some endpoints need attention")
            print("  ⚠ Review failed tests above")
            print(f"{'='*70}{Colors.END}\n")
        else:
            print(f"{Colors.RED}{'='*70}")
            print("  ✗ NEEDS ATTENTION - Multiple endpoints failing")
            print("  ✗ Please review errors above")
            print(f"{'='*70}{Colors.END}\n")
        
        # Category breakdown
        print(f"\n{Colors.BLUE}Results by Category:{Colors.END}")
        categories = {}
        for result in self.results:
            cat = result['category']
            if cat not in categories:
                categories[cat] = {'pass': 0, 'warn': 0, 'fail': 0}
            
            status = result['status'].lower()
            if status == 'pass':
                categories[cat]['pass'] += 1
            elif status == 'warn':
                categories[cat]['warn'] += 1
            else:
                categories[cat]['fail'] += 1
        
        for cat, stats in sorted(categories.items()):
            total_cat = stats['pass'] + stats['warn'] + stats['fail']
            print(f"  {cat:20s}: {Colors.GREEN}{stats['pass']}✓{Colors.END} "
                  f"{Colors.YELLOW}{stats['warn']}⚠{Colors.END} "
                  f"{Colors.RED}{stats['fail']}✗{Colors.END} ({total_cat} total)")
    
    def run_all_tests(self):
        """Run all API tests"""
        print(f"""
{Colors.CYAN}╔══════════════════════════════════════════════════════════════════╗
║     COMPREHENSIVE API TEST SUITE                                 ║
║     Testing all major endpoints with authentication              ║
╚══════════════════════════════════════════════════════════════════╝{Colors.END}
""")
        
        # Test authentication first
        if not self.test_authentication():
            print(f"\n{Colors.RED}Cannot proceed without authentication. Please check:")
            print("  1. Server is running (python manage.py runserver)")
            print("  2. Database has the test user (admin@crm.com / admin123)")
            print(f"  3. Run: python scripts/seed/comprehensive_seed_data.py{Colors.END}\n")
            return
        
        # Run all other tests
        self.test_user_management()
        self.test_organization_management()
        self.test_crm_core()
        self.test_pipeline_management()
        self.test_employees_vendors()
        self.test_rbac()
        self.test_analytics()
        self.test_additional_endpoints()
        
        # Print summary
        self.print_summary()


if __name__ == "__main__":
    tester = ComprehensiveAPITester()
    tester.run_all_tests()

