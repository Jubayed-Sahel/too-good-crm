"""
Script to link existing customers to users based on matching email addresses.
This will enable Jitsi call functionality for customers who are also system users.

Run with: python manage.py shell < link_customers_to_users.py
"""

from crmApp.models import Customer, User

# Find all customers with email but no linked user
customers_without_user = Customer.objects.filter(
    email__isnull=False,
    user__isnull=True
).exclude(email='')

linked_count = 0
skipped_count = 0

print(f"\nFound {customers_without_user.count()} customers without linked users")
print("-" * 80)

for customer in customers_without_user:
    # Try to find matching user by email
    matching_user = User.objects.filter(email__iexact=customer.email).first()
    
    if matching_user:
        customer.user = matching_user
        customer.save()
        linked_count += 1
        print(f"✓ Linked: {customer.name} ({customer.email}) → User ID: {matching_user.id}")
    else:
        skipped_count += 1
        print(f"✗ No match: {customer.name} ({customer.email})")

print("-" * 80)
print(f"\nSummary:")
print(f"  - Customers linked: {linked_count}")
print(f"  - Customers skipped (no matching user): {skipped_count}")
print(f"\nCustomers with linked users can now receive Jitsi calls!")
