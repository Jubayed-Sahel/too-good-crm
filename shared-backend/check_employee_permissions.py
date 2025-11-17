"""
Script to check employee permissions from database
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from crmApp.models import User, Employee, UserProfile, Role, Permission, RolePermission, UserRole, Organization
from crmApp.services import RBACService

def check_employee_permissions(email):
    """Check permissions for an employee by email"""
    try:
        # Get user
        user = User.objects.get(email=email)
        print(f"\n{'='*80}")
        print(f"USER INFORMATION")
        print(f"{'='*80}")
        print(f"ID: {user.id}")
        print(f"Email: {user.email}")
        print(f"Username: {user.username}")
        print(f"Full Name: {user.full_name}")
        print(f"Is Active: {user.is_active}")
        print(f"Is Staff: {user.is_staff}")
        print(f"Is Superuser: {user.is_superuser}")
        
        # Get user profiles
        profiles = UserProfile.objects.filter(user=user, status='active')
        print(f"\n{'='*80}")
        print(f"USER PROFILES")
        print(f"{'='*80}")
        if profiles.exists():
            for profile in profiles:
                print(f"\nProfile ID: {profile.id}")
                print(f"  Type: {profile.profile_type}")
                print(f"  Organization: {profile.organization.name if profile.organization else 'None'} (ID: {profile.organization.id if profile.organization else 'N/A'})")
                print(f"  Status: {profile.status}")
                print(f"  Is Primary: {profile.is_primary}")
        else:
            print("No active profiles found")
        
        # Get employees
        employees = Employee.objects.filter(user=user, status='active')
        print(f"\n{'='*80}")
        print(f"EMPLOYEE RECORDS")
        print(f"{'='*80}")
        if employees.exists():
            for employee in employees:
                print(f"\nEmployee ID: {employee.id}")
                print(f"  Organization: {employee.organization.name} (ID: {employee.organization.id})")
                print(f"  Name: {employee.first_name} {employee.last_name}")
                print(f"  Status: {employee.status}")
                print(f"  Role: {employee.role.name if employee.role else 'No Role Assigned'}")
                print(f"  Role ID: {employee.role.id if employee.role else 'N/A'}")
                
                # Get permissions for this employee
                print(f"\n{'='*80}")
                print(f"PERMISSIONS FOR EMPLOYEE IN ORGANIZATION: {employee.organization.name}")
                print(f"{'='*80}")
                
                # Get permissions using RBACService
                permissions = RBACService.get_user_permissions(user, employee.organization)
                
                if permissions:
                    print(f"\nTotal Permissions: {len(permissions)}")
                    print(f"\nPermission Details:")
                    print(f"{'-'*80}")
                    
                    # Group by resource
                    by_resource = {}
                    for perm in permissions:
                        resource = perm.get('resource', 'unknown')
                        if resource not in by_resource:
                            by_resource[resource] = []
                        by_resource[resource].append(perm.get('action', 'unknown'))
                    
                    for resource, actions in sorted(by_resource.items()):
                        print(f"\n{resource.upper()}:")
                        for action in sorted(set(actions)):
                            # Find full permission details
                            perm_details = [p for p in permissions if p.get('resource') == resource and p.get('action') == action]
                            if perm_details:
                                desc = perm_details[0].get('description', 'No description')
                                print(f"  - {action}: {desc}")
                else:
                    print("No permissions found")
                
                # Get roles
                print(f"\n{'='*80}")
                print(f"ROLES FOR EMPLOYEE")
                print(f"{'='*80}")
                
                # Get roles from Employee.role
                if employee.role:
                    print(f"\nPrimary Role (from Employee.role):")
                    print(f"  - {employee.role.name} (ID: {employee.role.id})")
                    print(f"  - Description: {employee.role.description or 'No description'}")
                    print(f"  - Is Active: {employee.role.is_active}")
                    
                    # Get permissions for this role
                    role_perms = RolePermission.objects.filter(
                        role=employee.role,
                        role__is_active=True
                    ).select_related('permission')
                    
                    if role_perms.exists():
                        print(f"\n  Permissions in this role ({role_perms.count()}):")
                        for rp in role_perms:
                            print(f"    - {rp.permission.resource}:{rp.permission.action} - {rp.permission.description or 'No description'}")
                    else:
                        print(f"  No permissions assigned to this role")
                
                # Get additional roles from UserRole
                user_roles = UserRole.objects.filter(
                    user=user,
                    organization=employee.organization,
                    is_active=True
                ).select_related('role')
                
                if user_roles.exists():
                    print(f"\nAdditional Roles (from UserRole):")
                    for ur in user_roles:
                        print(f"  - {ur.role.name} (ID: {ur.role.id})")
                        print(f"    - Description: {ur.role.description or 'No description'}")
                        print(f"    - Is Active: {ur.role.is_active}")
                        
                        # Get permissions for this role
                        role_perms = RolePermission.objects.filter(
                            role=ur.role,
                            role__is_active=True
                        ).select_related('permission')
                        
                        if role_perms.exists():
                            print(f"    - Permissions ({role_perms.count()}):")
                            for rp in role_perms:
                                print(f"      - {rp.permission.resource}:{rp.permission.action} - {rp.permission.description or 'No description'}")
                        else:
                            print(f"    - No permissions assigned")
                else:
                    print(f"\nNo additional roles from UserRole")
                
                # Summary
                print(f"\n{'='*80}")
                print(f"PERMISSION SUMMARY")
                print(f"{'='*80}")
                if permissions:
                    print(f"\nEmployee '{user.email}' has the following permissions in '{employee.organization.name}':")
                    for resource, actions in sorted(by_resource.items()):
                        actions_str = ', '.join(sorted(set(actions)))
                        print(f"  - {resource}: {actions_str}")
                else:
                    print(f"\nEmployee '{user.email}' has NO permissions in '{employee.organization.name}'")
                    print(f"This means they cannot perform any actions on resources.")
        else:
            print("No active employee records found")
            print("\nThis user is not registered as an employee in any organization.")
        
    except User.DoesNotExist:
        print(f"\nError: User with email '{email}' not found in database")
    except Exception as e:
        print(f"\nError: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    check_employee_permissions('dummy@gmail.com')
