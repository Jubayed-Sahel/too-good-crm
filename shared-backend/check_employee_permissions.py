#!/usr/bin/env python
"""
Script to check employee permissions based on their role
"""
import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from crmApp.models import User, Employee, Role, Permission, RolePermission, UserRole
from crmApp.services.rbac_service import RBACService

def check_employee_permissions(email):
    """Check permissions for an employee by email"""
    try:
        # Get user
        user = User.objects.get(email=email)
        print(f"\n{'='*80}")
        print(f"User: {user.email} (ID: {user.id})")
        print(f"{'='*80}\n")
        
        # Get all active employees for this user
        employees = Employee.objects.filter(
            user=user,
            status='active'
        ).select_related('organization', 'role')
        
        if not employees.exists():
            print(f"[ERROR] No active employee records found for {email}")
            return
        
        for employee in employees:
            print(f"\n{'-'*80}")
            print(f"Employee Record:")
            print(f"  Name: {employee.first_name} {employee.last_name}")
            print(f"  Organization: {employee.organization.name} (ID: {employee.organization.id})")
            print(f"  Job Title: {employee.job_title or 'N/A'}")
            print(f"  Department: {employee.department or 'N/A'}")
            print(f"  Status: {employee.status}")
            
            if employee.role:
                print(f"\n  Role: {employee.role.name} (ID: {employee.role.id})")
                print(f"  Role Description: {employee.role.description or 'N/A'}")
                print(f"  Role Active: {employee.role.is_active}")
                
                # Get permissions for this role
                role_permissions = RolePermission.objects.filter(
                    role=employee.role
                ).select_related('permission')
                
                if role_permissions.exists():
                    print(f"\n  Permissions from Role '{employee.role.name}':")
                    print(f"  {'-'*76}")
                    
                    # Group by resource
                    permissions_by_resource = {}
                    for rp in role_permissions:
                        perm = rp.permission
                        resource = perm.resource
                        if resource not in permissions_by_resource:
                            permissions_by_resource[resource] = []
                        permissions_by_resource[resource].append(perm.action)
                    
                    for resource, actions in sorted(permissions_by_resource.items()):
                        actions_str = ', '.join(sorted(actions))
                        print(f"    • {resource}: {actions_str}")
                    
                    print(f"\n  Total Permissions: {role_permissions.count()}")
                else:
                    print(f"\n  [WARNING] No permissions assigned to role '{employee.role.name}'")
            else:
                print(f"\n  [WARNING] No role assigned to this employee")
            
            # Check for additional UserRole assignments
            user_roles = UserRole.objects.filter(
                user=user,
                organization=employee.organization,
                is_active=True
            ).select_related('role')
            
            if user_roles.exists():
                print(f"\n  Additional Roles (from UserRole):")
                for ur in user_roles:
                    print(f"    • {ur.role.name} (ID: {ur.role.id})")
                    
                    # Get permissions for this additional role
                    additional_perms = RolePermission.objects.filter(
                        role=ur.role
                    ).select_related('permission')
                    
                    if additional_perms.exists():
                        print(f"      Permissions:")
                        for rp in additional_perms:
                            perm = rp.permission
                            print(f"        - {perm.resource}:{perm.action}")
            
            # Get all permissions using RBACService
            print(f"\n  {'-'*76}")
            print(f"  All Permissions (via RBACService):")
            print(f"  {'-'*76}")
            
            all_permissions = RBACService.get_user_permissions(user, employee.organization)
            
            if all_permissions:
                # Group by resource
                perms_by_resource = {}
                for perm in all_permissions:
                    resource = perm['resource']
                    if resource not in perms_by_resource:
                        perms_by_resource[resource] = []
                    perms_by_resource[resource].append(perm['action'])
                
                for resource, actions in sorted(perms_by_resource.items()):
                    actions_str = ', '.join(sorted(actions))
                    print(f"    • {resource}: {actions_str}")
                
                print(f"\n  Total Permissions: {len(all_permissions)}")
            else:
                print(f"    [WARNING] No permissions found")
            
            print(f"\n{'-'*80}\n")
    
    except User.DoesNotExist:
        print(f"[ERROR] User with email '{email}' not found in database")
    except Exception as e:
        print(f"[ERROR] Error: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    email = 'dummy@gmail.com'
    if len(sys.argv) > 1:
        email = sys.argv[1]
    
    check_employee_permissions(email)

