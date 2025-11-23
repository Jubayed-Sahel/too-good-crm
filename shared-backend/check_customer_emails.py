import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from crmApp.models import Customer, User

print("Customers with registered emails:\n")
customers = Customer.objects.all().select_related('user')[:10]

for customer in customers:
    if customer.email:
        try:
            user = User.objects.get(email=customer.email)
            print(f"✓ {customer.name} ({customer.email}) -> User: {user.username} (ID: {user.id})")
        except User.DoesNotExist:
            print(f"✗ {customer.name} ({customer.email}) -> No matching user")
    else:
        print(f"- {customer.name} -> No email")

print(f"\n📊 Summary:")
print(f"Total customers: {Customer.objects.count()}")
print(f"Customers with email: {Customer.objects.exclude(email='').count()}")
print(f"Customers with matching user account: {Customer.objects.filter(email__in=User.objects.values_list('email', flat=True)).count()}")
