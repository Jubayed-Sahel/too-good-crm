#!/usr/bin/env python
"""
Script to completely clean the database for a fresh start
Removes all user data, organizations, and business data
"""
import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from django.db import transaction, connection
from crmApp.models import (
    UserProfile, Employee, Organization, User,
    Customer, Deal, Lead, Issue, IssueComment,
    Activity, Order, Payment, OrderItem,
    UserRole, RolePermission, Role, Permission,
    Call, Pipeline, PipelineStage, Vendor,
    NotificationPreferences
)
# Try to import JitsiCallSession if it exists
try:
    from crmApp.models.jitsi_call import JitsiCallSession, UserPresence
except ImportError:
    JitsiCallSession = None
    UserPresence = None

def clean_database():
    """Clean all data from the database"""
    print(f"\n{'='*80}")
    print("DATABASE CLEANUP - REMOVING ALL DATA")
    print(f"{'='*80}\n")
    
    counts = {}
    
    # Helper function to safely delete
    def safe_delete(model, name):
        try:
            count = model.objects.all().delete()[0]
            counts[name] = count
            return count
        except Exception as e:
            print(f"   [WARNING] Could not delete {name}: {str(e)}")
            counts[name] = 0
            return 0
    
    try:
        # 1. Remove all business data
        print("1. Removing business data...")
        
        safe_delete(IssueComment, 'IssueComment')
        safe_delete(Issue, 'Issue')
        safe_delete(Activity, 'Activity')
        safe_delete(OrderItem, 'OrderItem')
        safe_delete(Order, 'Order')
        safe_delete(Payment, 'Payment')
        safe_delete(PipelineStage, 'PipelineStage')
        safe_delete(Deal, 'Deal')
        safe_delete(Pipeline, 'Pipeline')
        safe_delete(Lead, 'Lead')
        safe_delete(Customer, 'Customer')
        safe_delete(Vendor, 'Vendor')
        safe_delete(Call, 'Call')
        if JitsiCallSession:
            try:
                counts['JitsiCallSession'] = JitsiCallSession.objects.all().delete()[0]
            except Exception:
                counts['JitsiCallSession'] = 0
        else:
            counts['JitsiCallSession'] = 0
        if UserPresence:
            try:
                counts['UserPresence'] = UserPresence.objects.all().delete()[0]
            except Exception:
                counts['UserPresence'] = 0
        else:
            counts['UserPresence'] = 0
        try:
            counts['NotificationPreferences'] = NotificationPreferences.objects.all().delete()[0]
        except Exception:
            counts['NotificationPreferences'] = 0
        
        print(f"   - Removed {sum(counts.values())} business records")
        
        # 2. Remove all user-organization relationships
        print("\n2. Removing user-organization relationships...")
        
        safe_delete(UserRole, 'UserRole')
        safe_delete(RolePermission, 'RolePermission')
        safe_delete(UserProfile, 'UserProfile')
        safe_delete(Employee, 'Employee')
        
        print(f"   - Removed {counts['UserRole']} UserRole records")
        print(f"   - Removed {counts['RolePermission']} RolePermission records")
        print(f"   - Removed {counts['UserProfile']} UserProfile records")
        print(f"   - Removed {counts['Employee']} Employee records")
        
        # 3. Remove all organizations (disable foreign keys for SQLite)
        print("\n3. Removing organizations...")
        
        org_count = Organization.objects.count()
        try:
            with connection.cursor() as cursor:
                # Disable foreign key checks for SQLite
                cursor.execute("PRAGMA foreign_keys = OFF")
                cursor.execute("DELETE FROM organizations")
                cursor.execute("PRAGMA foreign_keys = ON")
            counts['Organization'] = org_count
            print(f"   - Removed {counts['Organization']} Organization records")
        except Exception as e:
            print(f"   [WARNING] Could not delete organizations: {str(e)}")
            counts['Organization'] = 0
        
        # 4. Remove all users (except superuser if exists)
        print("\n4. Removing users...")
        
        # Keep superuser if exists
        superuser = User.objects.filter(is_superuser=True).first()
        superuser_email = superuser.email if superuser else None
        
        user_count = User.objects.count()
        try:
            # Use raw SQL to delete non-superuser users (disable foreign keys for SQLite)
            with connection.cursor() as cursor:
                # Disable foreign key checks for SQLite
                cursor.execute("PRAGMA foreign_keys = OFF")
                cursor.execute("DELETE FROM users WHERE is_superuser = 0")
                cursor.execute("PRAGMA foreign_keys = ON")
            remaining_users = User.objects.count()
            counts['User'] = user_count - remaining_users
            print(f"   - Removed {counts['User']} User records")
            if remaining_users > 0:
                print(f"   - Kept {remaining_users} superuser(s): {superuser_email}")
        except Exception as e:
            print(f"   [WARNING] Could not delete users: {str(e)}")
            counts['User'] = 0
            remaining_users = user_count
        
        # 5. Remove all roles and permissions (optional - comment out if you want to keep system roles)
        print("\n5. Removing roles and permissions...")
        
        safe_delete(Role, 'Role')
        safe_delete(Permission, 'Permission')
        
        print(f"   - Removed {counts['Role']} Role records")
        print(f"   - Removed {counts['Permission']} Permission records")
        
        print(f"\n{'='*80}")
        print("CLEANUP SUMMARY")
        print(f"{'='*80}\n")
        
        total_deleted = sum(counts.values())
        print(f"Total records deleted: {total_deleted}")
        print("\nBreakdown:")
        for model, count in sorted(counts.items()):
            if count > 0:
                print(f"  - {model}: {count}")
        
        print(f"\n{'='*80}")
        print("VERIFICATION")
        print(f"{'='*80}\n")
        
        # Verify cleanup
        remaining = {
            'Users': User.objects.count(),
            'Organizations': Organization.objects.count(),
            'UserProfiles': UserProfile.objects.count(),
            'Employees': Employee.objects.count(),
            'Vendors': Vendor.objects.count(),
            'Customers': Customer.objects.count(),
            'Deals': Deal.objects.count(),
            'Pipelines': Pipeline.objects.count(),
            'Leads': Lead.objects.count(),
            'Issues': Issue.objects.count(),
            'Orders': Order.objects.count(),
            'Payments': Payment.objects.count(),
            'Activities': Activity.objects.count(),
            'Roles': Role.objects.count(),
            'Permissions': Permission.objects.count(),
        }
        
        all_zero = all(count == 0 for count in remaining.values())
        
        if all_zero:
            print("[SUCCESS] Database is completely clean!")
            print("[SUCCESS] All data has been removed")
        else:
            print("[WARNING] Some records still remain:")
            for model, count in remaining.items():
                if count > 0:
                    print(f"  - {model}: {count}")
        
        print(f"\n{'='*80}\n")
        print("[INFO] Database structure is intact")
        print("[INFO] You can now register a new user and start fresh")
        print(f"\n{'='*80}\n")
    except Exception as e:
        print(f"\n[ERROR] An error occurred during cleanup: {str(e)}")
        import traceback
        traceback.print_exc()
        print("\n[INFO] Some data may have been deleted. Please check the database.")

if __name__ == '__main__':
    # Safety confirmation
    print("\n" + "!"*80)
    print("WARNING: This will DELETE ALL DATA from the database!")
    print("This includes:")
    print("  - All users (except superusers)")
    print("  - All organizations")
    print("  - All customers, deals, leads, issues")
    print("  - All roles and permissions")
    print("  - All business data")
    print("")
    print("This action CANNOT be undone!")
    print("The database structure will remain intact.")
    print("!"*80)
    
    response = input("\nAre you absolutely sure you want to proceed? (type 'yes' to confirm): ")
    
    if response.lower() == 'yes':
        clean_database()
    else:
        print("\n[INFO] Operation cancelled. No data was deleted.")

