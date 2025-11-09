import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from crmApp.models import Customer, Organization, User

vendor_org = Organization.objects.get(name='Demo Vendor Company')
customers = Customer.objects.filter(organization=vendor_org)

print(f'\n✅ Customers in {vendor_org.name}: {customers.count()}')
print('='*60)

for c in customers:
    print(f'  ID: {c.id}')
    print(f'  Name: {c.name}')
    print(f'  Email: {c.email}')
    print(f'  User: {c.user.username if c.user else "No user linked"}')
    print(f'  User ID: {c.user.id if c.user else "N/A"}')
    print('-'*60)

print('\nNow checking if client_demo can be found:')
client = User.objects.get(username='client_demo')
print(f'Client user ID: {client.id}')
print(f'Client email: {client.email}')

customer_for_client = Customer.objects.filter(user=client, organization=vendor_org).first()
if customer_for_client:
    print(f'✅ Customer record exists for client_demo (ID: {customer_for_client.id})')
else:
    print('❌ No customer record found for client_demo')
