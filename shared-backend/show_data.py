"""
Show all organizations and their data
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from crmApp.models import Organization, Customer, Deal, Employee, UserOrganization

print("="*70)
print("ORGANIZATIONS AND DATA")
print("="*70)

orgs = Organization.objects.all()

for org in orgs:
    print(f"\n📊 {org.name} (ID: {org.id})")
    print(f"   Slug: {org.slug}")
    print(f"   Customers: {org.customers.count()}")
    print(f"   Deals: {org.deals.count()}")
    print(f"   Employees: {org.employees.count()}")
    print(f"   Users: {org.user_organizations.filter(is_active=True).count()}")
    
    # Show some customers
    customers = org.customers.all()[:3]
    if customers:
        print(f"   Sample Customers:")
        for c in customers:
            print(f"     - {c.name} ({c.email})")
    
    # Show some deals
    deals = org.deals.all()[:3]
    if deals:
        print(f"   Sample Deals:")
        for d in deals:
            print(f"     - {d.title} (${d.value})")

print("\n" + "="*70)
print("SUMMARY")
print("="*70)
total_customers = Customer.objects.count()
total_deals = Deal.objects.count()
print(f"Total Customers across all orgs: {total_customers}")
print(f"Total Deals across all orgs: {total_deals}")
