"""
Management command to create demo users for testing Jitsi calls:
- Vendor user (service provider)
- Client user (customer of the vendor)
"""
from django.core.management.base import BaseCommand
from django.db import transaction
from crmApp.models import User, Organization, UserProfile, Vendor, Customer

class Command(BaseCommand):
    help = 'Create demo vendor and client users for Jitsi call testing'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('\n🎬 Creating Call Demo Users...\n'))
        
        try:
            with transaction.atomic():
                # Create organization for the vendor
                vendor_org, _ = Organization.objects.get_or_create(
                    name='Demo Vendor Company',
                    defaults={
                        'email': 'vendor@democompany.com',
                        'phone': '+1234567890',
                        'address': '123 Vendor Street',
                        'city': 'New York',
                        'state': 'NY',
                        'country': 'USA',
                        'is_active': True
                    }
                )
                
                # Create organization for the client (though client will be customer of vendor org)
                client_org, _ = Organization.objects.get_or_create(
                    name='Demo Client Company',
                    defaults={
                        'email': 'client@democlient.com',
                        'phone': '+0987654321',
                        'address': '456 Client Avenue',
                        'city': 'Los Angeles',
                        'state': 'CA',
                        'country': 'USA',
                        'is_active': True
                    }
                )
                
                # Create vendor user
                vendor_user, created = User.objects.get_or_create(
                    username='vendor_demo',
                    defaults={
                        'email': 'vendor@democompany.com',
                        'first_name': 'John',
                        'last_name': 'Vendor',
                        'is_active': True,
                        'is_verified': True
                    }
                )
                if created:
                    vendor_user.set_password('demo123')
                    vendor_user.save()
                    self.stdout.write(self.style.SUCCESS(f'✅ Created vendor user: {vendor_user.username}'))
                else:
                    self.stdout.write(self.style.WARNING(f'⚠️  Vendor user already exists: {vendor_user.username}'))
                
                # Create client user
                client_user, created = User.objects.get_or_create(
                    username='client_demo',
                    defaults={
                        'email': 'client@democlient.com',
                        'first_name': 'Sarah',
                        'last_name': 'Client',
                        'is_active': True,
                        'is_verified': True
                    }
                )
                if created:
                    client_user.set_password('demo123')
                    client_user.save()
                    self.stdout.write(self.style.SUCCESS(f'✅ Created client user: {client_user.username}'))
                else:
                    self.stdout.write(self.style.WARNING(f'⚠️  Client user already exists: {client_user.username}'))
                
                # Create user profile for vendor user
                vendor_user_profile = UserProfile.objects.filter(
                    user=vendor_user,
                    organization=vendor_org
                ).first()
                
                if not vendor_user_profile:
                    vendor_user_profile = UserProfile.objects.create(
                        user=vendor_user,
                        organization=vendor_org,
                        profile_type='employee',
                        is_primary=True,
                        status='active'
                    )
                    self.stdout.write(self.style.SUCCESS(f'✅ Created user profile for {vendor_user.username}'))
                else:
                    self.stdout.write(self.style.WARNING(f'⚠️  User profile already exists for {vendor_user.username}'))
                
                # Create vendor record
                vendor, created = Vendor.objects.get_or_create(
                    organization=vendor_org,
                    user=vendor_user,
                    defaults={
                        'name': 'John Vendor',
                        'company_name': 'Demo Vendor Company',
                        'vendor_type': 'service_provider',
                        'contact_person': 'John Vendor',
                        'email': 'vendor@democompany.com',
                        'phone': '+1234567890',
                        'status': 'active',
                        'user_profile': vendor_user_profile
                    }
                )
                if created:
                    self.stdout.write(self.style.SUCCESS(f'✅ Created vendor record for {vendor_user.username}'))
                else:
                    # Update user_profile if needed
                    if not vendor.user_profile:
                        vendor.user_profile = vendor_user_profile
                        vendor.save()
                    self.stdout.write(self.style.WARNING(f'⚠️  Vendor record already exists'))
                
                # Create user profile for client user (linked to vendor's organization as customer)
                client_user_profile = UserProfile.objects.filter(
                    user=client_user,
                    organization=vendor_org
                ).first()
                
                if not client_user_profile:
                    client_user_profile = UserProfile.objects.create(
                        user=client_user,
                        organization=vendor_org,
                        profile_type='customer',
                        is_primary=True,
                        status='active'
                    )
                    self.stdout.write(self.style.SUCCESS(f'✅ Created user profile for {client_user.username}'))
                else:
                    self.stdout.write(self.style.WARNING(f'⚠️  User profile already exists for {client_user.username}'))
                
                # Create customer record (customer of the vendor)
                customer, created = Customer.objects.get_or_create(
                    organization=vendor_org,  # Client is a customer of the vendor's organization
                    user=client_user,
                    defaults={
                        'customer_type': 'business',
                        'name': 'Sarah Client',
                        'first_name': 'Sarah',
                        'last_name': 'Client',
                        'company_name': 'Demo Client Company',
                        'contact_person': 'Sarah Client',
                        'phone': '+0987654321',
                        'email': 'client@democlient.com',
                        'address': '456 Client Avenue',
                        'city': 'Los Angeles',
                        'state': 'CA',
                        'country': 'USA',
                        'status': 'active',
                        'user_profile': client_user_profile
                    }
                )
                if created:
                    self.stdout.write(self.style.SUCCESS(f'✅ Created customer record for {client_user.username}'))
                else:
                    # Update user_profile if it wasn't set
                    if not customer.user_profile:
                        customer.user_profile = client_user_profile
                        customer.save()
                    self.stdout.write(self.style.WARNING(f'⚠️  Customer record already exists'))
                
                # Display summary
                self.stdout.write(self.style.SUCCESS('\n' + '='*60))
                self.stdout.write(self.style.SUCCESS('🎉 DEMO USERS CREATED SUCCESSFULLY!\n'))
                self.stdout.write(self.style.SUCCESS('='*60))
                self.stdout.write(self.style.SUCCESS('\n📋 Login Credentials:\n'))
                self.stdout.write(self.style.SUCCESS('  VENDOR:'))
                self.stdout.write(f'    Username: vendor_demo')
                self.stdout.write(f'    Password: demo123')
                self.stdout.write(f'    Email: vendor@democompany.com')
                self.stdout.write(f'    Name: John Vendor')
                self.stdout.write(f'    Organization: {vendor_org.name}')
                self.stdout.write(f'    User Profile Type: Employee (Vendor)\n')
                
                self.stdout.write(self.style.SUCCESS('  CLIENT (Customer):'))
                self.stdout.write(f'    Username: client_demo')
                self.stdout.write(f'    Password: demo123')
                self.stdout.write(f'    Email: client@democlient.com')
                self.stdout.write(f'    Name: Sarah Client')
                self.stdout.write(f'    Organization: {vendor_org.name} (as customer)')
                self.stdout.write(f'    User Profile Type: Customer\n')
                
                self.stdout.write(self.style.SUCCESS('='*60))
                self.stdout.write(self.style.SUCCESS('🚀 Next Steps:\n'))
                self.stdout.write('  1. Open two browser windows/tabs')
                self.stdout.write('  2. Login as vendor_demo in one browser')
                self.stdout.write('  3. Login as client_demo in another browser')
                self.stdout.write('  4. Initiate a call from either user to test!\n')
                self.stdout.write(self.style.SUCCESS('='*60 + '\n'))
                
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'\n❌ Error creating demo users: {str(e)}\n'))
            raise
