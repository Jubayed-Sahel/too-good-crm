import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from crmApp.models import User, Vendor, Organization

# Get users
vendor_user = User.objects.get(username='vendor_demo')
client_user = User.objects.get(username='client_demo')
vendor_org = Organization.objects.get(name='Demo Vendor Company')

print(f'\n✅ Checking Vendor records in {vendor_org.name}:')
print('='*60)

vendors = Vendor.objects.filter(organization=vendor_org)
print(f'Total vendors: {vendors.count()}')

for v in vendors:
    print(f'\n  ID: {v.id}')
    print(f'  Name: {v.name}')
    print(f'  Email: {v.email}')
    print(f'  User: {v.user.username if v.user else "No user linked"}')
    print(f'  User ID: {v.user.id if v.user else "N/A"}')
    print('-'*60)

print(f'\n✅ The client_demo user should see this vendor in their vendors list!')
print(f'   Vendor user ID: {vendor_user.id}')
