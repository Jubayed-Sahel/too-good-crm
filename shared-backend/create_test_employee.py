"""
Quick script to create a test employee user
Run this from the shared-backend directory
"""
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from django.contrib.auth import get_user_model
from crmApp.models import Organization, UserProfile, UserOrganization, Role, UserRole, Permission, RolePermission
from django.utils import timezone

User = get_user_model()

def create_test_employee():
    """Create a test employee with limited access"""
    
    print("\n" + "="*60)
    print("Creating Test Employee User")
    print("="*60 + "\n")
    
    # Get or create a test organization (or use the first one)
    try:
        organization = Organization.objects.first()
        if not organization:
            print("❌ No organization found. Please create a vendor account first.")
            return
        
        print(f"✓ Using organization: {organization.name}")
        
        # Create employee user
        employee_username = "employee_test"
        employee_email = "employee@test.com"
        
        # Check if user already exists
        if User.objects.filter(email=employee_email).exists():
            print(f"✓ User {employee_email} already exists")
            user = User.objects.get(email=employee_email)
        else:
            user = User.objects.create_user(
                username=employee_username,
                email=employee_email,
                password="employee123",
                first_name="Test",
                last_name="Employee",
                is_active=True,
                is_verified=True
            )
            print(f"✓ Created user: {employee_email}")
        
        # Link user to organization
        user_org, created = UserOrganization.objects.get_or_create(
            user=user,
            organization=organization,
            defaults={
                'is_active': True,
                'is_owner': False
            }
        )
        if created:
            print(f"✓ Linked user to organization")
        else:
            print(f"✓ User already linked to organization")
        
        # Create employee profile
        employee_profile, created = UserProfile.objects.get_or_create(
            user=user,
            organization=organization,
            profile_type='employee',
            defaults={
                'is_primary': True,
                'status': 'active',
                'activated_at': timezone.now()
            }
        )
        if created:
            print(f"✓ Created employee profile")
        else:
            print(f"✓ Employee profile already exists")
        
        # Create customer profile (for client UI access)
        customer_profile, created = UserProfile.objects.get_or_create(
            user=user,
            organization=organization,
            profile_type='customer',
            defaults={
                'is_primary': False,
                'status': 'active',
                'activated_at': timezone.now()
            }
        )
        if created:
            print(f"✓ Created customer profile")
        else:
            print(f"✓ Customer profile already exists")
        
        # Create or get a "Sales" role with limited permissions
        sales_role, created = Role.objects.get_or_create(
            organization=organization,
            slug='sales',
            defaults={
                'name': 'Sales Representative',
                'description': 'Can manage customers, leads, and deals',
                'is_system_role': False,
                'is_active': True
            }
        )
        if created:
            print(f"✓ Created 'Sales Representative' role")
        else:
            print(f"✓ Using existing 'Sales Representative' role")
        
        # Assign role to user
        user_role, created = UserRole.objects.get_or_create(
            user=user,
            role=sales_role,
            organization=organization,
            defaults={
                'is_active': True,
                'assigned_by': organization.user_organizations.filter(is_owner=True).first().user if organization.user_organizations.filter(is_owner=True).exists() else None
            }
        )
        if created:
            print(f"✓ Assigned Sales role to employee")
        else:
            print(f"✓ Employee already has Sales role")
        
        # Create some basic permissions for the sales role
        resources_actions = [
            ('customer', 'read'),
            ('customer', 'create'),
            ('customer', 'update'),
            ('lead', 'read'),
            ('lead', 'create'),
            ('lead', 'update'),
            ('deal', 'read'),
            ('deal', 'create'),
            ('deal', 'update'),
            ('activity', 'read'),
            ('activity', 'create'),
        ]
        
        print(f"\n✓ Setting up permissions for Sales role:")
        for resource, action in resources_actions:
            permission, perm_created = Permission.objects.get_or_create(
                organization=organization,
                resource=resource,
                action=action,
                defaults={
                    'description': f'{action.title()} {resource}',
                    'is_system_permission': False
                }
            )
            
            role_perm, rp_created = RolePermission.objects.get_or_create(
                role=sales_role,
                permission=permission
            )
            
            if rp_created:
                print(f"  - {resource}:{action}")
        
        # Print summary
        print("\n" + "="*60)
        print("✅ Test Employee Created Successfully!")
        print("="*60)
        print(f"\n📧 Login Credentials:")
        print(f"   Email/Username: {employee_email}")
        print(f"   Password: employee123")
        print(f"\n👤 User Details:")
        print(f"   Name: {user.full_name}")
        print(f"   Organization: {organization.name}")
        print(f"   Profiles: Employee (Primary), Customer")
        print(f"   Role: Sales Representative")
        print(f"\n🔐 Permissions:")
        print(f"   - Read/Create/Update: Customers, Leads, Deals")
        print(f"   - Read/Create: Activities")
        print(f"   - NO access to: Employees, Vendors, Settings")
        print(f"\n🚀 Next Steps:")
        print(f"   1. Login at: http://localhost:5173/login")
        print(f"   2. Use credentials above")
        print(f"   3. Select 'Employee' role when prompted")
        print(f"   4. You'll see limited CRM interface")
        print("\n" + "="*60 + "\n")
        
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    create_test_employee()
