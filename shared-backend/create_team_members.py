"""
Script to create multiple test employees for Team Members page
Run: python create_team_members.py
"""

import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from django.contrib.auth import get_user_model
from crmApp.models import Organization, UserProfile, UserOrganization, Employee, Role
from django.utils import timezone
from django.db import transaction

User = get_user_model()


def create_team_members():
    """Create multiple test employees for the team"""
    
    print("=" * 70)
    print("CREATING TEAM MEMBERS")
    print("=" * 70)
    
    # Get existing organization (first one)
    org = Organization.objects.first()
    
    if not org:
        print("❌ No organization found. Please create a vendor account first.")
        return
    
    print(f"\n✓ Found organization: {org.name} (ID: {org.id})")
    
    # Get roles if they exist
    roles = Role.objects.filter(organization=org, is_active=True)
    role_list = list(roles)
    print(f"✓ Found {len(role_list)} roles in organization")
    
    # Team member data
    team_members = [
        {
            'email': 'john.smith@test.com',
            'username': 'john_smith',
            'first_name': 'John',
            'last_name': 'Smith',
            'job_title': 'Sales Manager',
            'department': 'Sales',
        },
        {
            'email': 'sarah.johnson@test.com',
            'username': 'sarah_johnson',
            'first_name': 'Sarah',
            'last_name': 'Johnson',
            'job_title': 'Senior Sales Representative',
            'department': 'Sales',
        },
        {
            'email': 'michael.chen@test.com',
            'username': 'michael_chen',
            'first_name': 'Michael',
            'last_name': 'Chen',
            'job_title': 'Sales Representative',
            'department': 'Sales',
        },
        {
            'email': 'emily.davis@test.com',
            'username': 'emily_davis',
            'first_name': 'Emily',
            'last_name': 'Davis',
            'job_title': 'Account Executive',
            'department': 'Sales',
        },
        {
            'email': 'david.wilson@test.com',
            'username': 'david_wilson',
            'first_name': 'David',
            'last_name': 'Wilson',
            'job_title': 'Business Development Manager',
            'department': 'Business Development',
        },
    ]
    
    created_count = 0
    updated_count = 0
    
    print(f"\n📝 Creating {len(team_members)} team members...\n")
    
    for member_data in team_members:
        try:
            with transaction.atomic():
                # Create or get user
                user, user_created = User.objects.get_or_create(
                    email=member_data['email'],
                    defaults={
                        'username': member_data['username'],
                        'first_name': member_data['first_name'],
                        'last_name': member_data['last_name'],
                        'is_active': True,
                        'is_verified': True
                    }
                )
                
                if user_created:
                    user.set_password('password123')  # Default password for all
                    user.save()
                
                # Create or update employee profile
                employee_profile, profile_created = UserProfile.objects.get_or_create(
                    user=user,
                    organization=org,
                    defaults={
                        'profile_type': 'employee',
                        'is_primary': True,
                        'status': 'active',
                        'activated_at': timezone.now()
                    }
                )
                
                if not profile_created and employee_profile.status != 'active':
                    employee_profile.status = 'active'
                    employee_profile.activated_at = timezone.now()
                    employee_profile.save()
                
                # Link to organization
                UserOrganization.objects.get_or_create(
                    user=user,
                    organization=org,
                    defaults={
                        'is_active': True,
                        'invitation_accepted_at': timezone.now()
                    }
                )
                
                # Assign a role if available (rotate through roles)
                assigned_role = None
                if role_list:
                    role_index = created_count % len(role_list)
                    assigned_role = role_list[role_index]
                
                # Create or update Employee record
                employee, emp_created = Employee.objects.get_or_create(
                    user=user,
                    organization=org,
                    defaults={
                        'email': user.email,
                        'first_name': member_data['first_name'],
                        'last_name': member_data['last_name'],
                        'job_title': member_data['job_title'],
                        'department': member_data['department'],
                        'status': 'active',
                        'employment_type': 'full-time',
                        'role': assigned_role,
                    }
                )
                
                if not emp_created:
                    # Update existing employee
                    employee.job_title = member_data['job_title']
                    employee.department = member_data['department']
                    employee.status = 'active'
                    if assigned_role:
                        employee.role = assigned_role
                    employee.save()
                    updated_count += 1
                else:
                    created_count += 1
                
                status = "✓ Created" if emp_created else "✓ Updated"
                role_info = f" (Role: {assigned_role.name})" if assigned_role else " (No role assigned)"
                print(f"{status}: {member_data['first_name']} {member_data['last_name']} - {member_data['job_title']}{role_info}")
                
        except Exception as e:
            print(f"❌ Error creating {member_data['email']}: {str(e)}")
    
    print("\n" + "=" * 70)
    print("✅ TEAM MEMBERS SETUP COMPLETE!")
    print("=" * 70)
    print(f"\n📊 Summary:")
    print(f"   - Created: {created_count} new employees")
    print(f"   - Updated: {updated_count} existing employees")
    print(f"   - Total: {created_count + updated_count} team members")
    print(f"   - Organization: {org.name}")
    
    if role_list:
        print(f"\n🎭 Roles assigned:")
        for role in role_list:
            count = Employee.objects.filter(organization=org, role=role, status='active').count()
            print(f"   - {role.name}: {count} employees")
    else:
        print(f"\n⚠️  No roles found. Create roles in Settings → Roles & Permissions first.")
    
    print("\n🔐 Default Password for all employees: password123")
    print("\n📝 Next steps:")
    print("   1. Go to http://localhost:5173/settings")
    print("   2. Click on 'Team Members' tab")
    print("   3. You should see all employees listed with their names and job titles")
    print("   4. You can assign or change roles for each employee")
    print("\n" + "=" * 70)


if __name__ == '__main__':
    create_team_members()
