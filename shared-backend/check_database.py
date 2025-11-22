"""
Check database status after update
"""
import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from crmApp.models import *

def check_database():
    print("\n" + "=" * 80)
    print("DATABASE STATUS CHECK")
    print("=" * 80)
    
    # Core data
    print("\n=== CORE DATA ===")
    print(f"✓ Users: {User.objects.count()}")
    print(f"✓ Organizations: {Organization.objects.count()}")
    print(f"✓ Employees: {Employee.objects.count()}")
    print(f"✓ Customers: {Customer.objects.count()}")
    print(f"✓ Vendors: {Vendor.objects.count()}")
    print(f"✓ Leads: {Lead.objects.count()}")
    print(f"✓ Deals: {Deal.objects.count()}")
    print(f"✓ Orders: {Order.objects.count()}")
    print(f"✓ Payments: {Payment.objects.count()}")
    print(f"✓ Issues: {Issue.objects.count()}")
    print(f"✓ Activities: {Activity.objects.count()}")
    
    # New models
    print("\n=== NEW MODELS (FROM UPDATE) ===")
    print(f"✓ Conversations: {Conversation.objects.count()}")
    print(f"✓ Messages: {Message.objects.count()}")
    print(f"✓ Lead Stage History: {LeadStageHistory.objects.count()}")
    print(f"✓ Jitsi Call Sessions: {JitsiCallSession.objects.count()}")
    print(f"✓ User Presence: {UserPresence.objects.count()}")
    
    # Check data integrity
    print("\n=== DATA INTEGRITY CHECKS ===")
    
    # Check leads with stages
    leads_without_stage = Lead.objects.filter(stage__isnull=True).count()
    if leads_without_stage > 0:
        print(f"⚠ WARNING: {leads_without_stage} leads without stage assignment")
        print("  These leads need to be assigned to a lead stage (not a pipeline stage)")
    else:
        print(f"✓ All leads have stages assigned")
    
    # Check employees
    active_employees = Employee.objects.filter(status='active').count()
    print(f"✓ Active Employees: {active_employees}")
    
    # Check for duplicate active employees per user
    from django.db.models import Count
    duplicate_active = Employee.objects.filter(status='active').values('user').annotate(
        count=Count('id')
    ).filter(count__gt=1)
    
    if duplicate_active.exists():
        print(f"⚠ WARNING: Found users with multiple active employee records")
        for dup in duplicate_active:
            user = User.objects.get(id=dup['user'])
            print(f"  - {user.email}: {dup['count']} active employee records")
    else:
        print(f"✓ No duplicate active employees found")
    
    # Check organizations
    for org in Organization.objects.all():
        org_users = UserOrganization.objects.filter(organization=org, is_active=True).count()
        org_employees = Employee.objects.filter(organization=org, status='active').count()
        print(f"✓ {org.name}: {org_users} users, {org_employees} employees")
    
    print("\n" + "=" * 80)
    print("DATABASE CHECK COMPLETE")
    print("=" * 80 + "\n")

if __name__ == '__main__':
    check_database()
