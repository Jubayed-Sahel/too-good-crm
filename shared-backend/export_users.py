"""
Export all users to a JSON file with their credentials and organizational details.
"""
import os
import sys
import django
import json

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from crmApp.models import User, UserOrganization, Employee

def export_users():
    """Export all users to JSON format"""
    users_data = []
    
    for user in User.objects.all():
        orgs = UserOrganization.objects.filter(user=user)
        emp = Employee.objects.filter(user=user).first()
        
        user_info = {
            'id': user.id,
            'email': user.email,
            'username': user.username,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'full_name': f"{user.first_name} {user.last_name}",
            'is_staff': user.is_staff,
            'is_superuser': user.is_superuser,
            'organizations': [
                {
                    'name': o.organization.name,
                    'is_owner': o.is_owner,
                    'is_active': o.is_active
                }
                for o in orgs
            ],
            'employee': {
                'code': emp.code,
                'job_title': emp.job_title,
                'department': emp.department,
                'organization': emp.organization.name,
                'status': emp.status
            } if emp else None,
            'default_password': 'password123'
        }
        
        users_data.append(user_info)
    
    # Save to JSON file
    output_file = 'users_list.json'
    with open(output_file, 'w') as f:
        json.dump(users_data, f, indent=2)
    
    print(f"[OK] Exported {len(users_data)} users to {output_file}")
    
    # Also create a simple text version
    text_file = 'users_list.txt'
    with open(text_file, 'w') as f:
        f.write("=" * 80 + "\n")
        f.write("TOO GOOD CRM - USER CREDENTIALS LIST\n")
        f.write("=" * 80 + "\n\n")
        f.write("Default Password for all users: password123\n\n")
        f.write("-" * 80 + "\n\n")
        
        for user in users_data:
            f.write(f"Name: {user['full_name']}\n")
            f.write(f"Email: {user['email']}\n")
            f.write(f"Username: {user['username']}\n")
            
            if user['employee']:
                f.write(f"Employee Code: {user['employee']['code']}\n")
                f.write(f"Job Title: {user['employee']['job_title']}\n")
                f.write(f"Department: {user['employee']['department']}\n")
                f.write(f"Organization: {user['employee']['organization']}\n")
            
            if user['organizations']:
                orgs_str = ", ".join([
                    f"{o['name']} ({'Owner' if o['is_owner'] else 'Member'})"
                    for o in user['organizations']
                ])
                f.write(f"Organizations: {orgs_str}\n")
            
            if user['is_staff']:
                f.write("Role: Staff User\n")
            if user['is_superuser']:
                f.write("Role: Superuser/Admin\n")
            
            f.write("\n" + "-" * 80 + "\n\n")
    
    print(f"[OK] Created text version: {text_file}")
    
    # Print summary
    print("\nSummary:")
    print(f"  Total Users: {len(users_data)}")
    print(f"  Employees: {sum(1 for u in users_data if u['employee'])}")
    print(f"  Staff Users: {sum(1 for u in users_data if u['is_staff'])}")
    print(f"  Superusers: {sum(1 for u in users_data if u['is_superuser'])}")
    
    return users_data

if __name__ == '__main__':
    export_users()
