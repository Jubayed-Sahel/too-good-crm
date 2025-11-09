"""
Management command to ensure all users have all 3 profiles (vendor, employee, customer).
This command will:
1. Check all users
2. Create missing profiles
3. Ensure users have an organization
4. Create UserOrganization links
5. Create Vendor records for vendor profiles
6. Ensure vendor profile is primary
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.db import transaction
from django.utils.text import slugify

from crmApp.models import User, UserProfile, Organization, UserOrganization, Vendor


class Command(BaseCommand):
    help = 'Ensure all users have all 3 profiles (vendor, employee, customer)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Run without making changes (dry run)',
        )
        parser.add_argument(
            '--fix-orgs',
            action='store_true',
            help='Create organizations for users who don\'t have any',
        )

    def handle(self, *args, **options):
        import sys
        import io
        
        # Fix Windows console encoding
        if sys.platform == 'win32':
            sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
            sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')
        
        dry_run = options['dry_run']
        fix_orgs = options['fix_orgs']
        
        if dry_run:
            self.stdout.write(self.style.WARNING('DRY RUN MODE - No changes will be made'))
        
        self.stdout.write(self.style.SUCCESS('=' * 80))
        self.stdout.write(self.style.SUCCESS('Ensuring all users have 3 profiles'))
        self.stdout.write(self.style.SUCCESS('=' * 80))
        
        users = User.objects.all()
        total_users = users.count()
        self.stdout.write(f'\nTotal users: {total_users}\n')
        
        fixed_count = 0
        skipped_count = 0
        error_count = 0
        
        for user in users:
            try:
                result = self.fix_user_profiles(user, dry_run, fix_orgs)
                if result['fixed']:
                    fixed_count += 1
                elif result['skipped']:
                    skipped_count += 1
            except Exception as e:
                error_count += 1
                self.stdout.write(
                    self.style.ERROR(f'[ERROR] Error fixing user {user.username}: {str(e)}')
                )
        
        # Summary
        self.stdout.write('\n' + '=' * 80)
        self.stdout.write(self.style.SUCCESS('Summary'))
        self.stdout.write('=' * 80)
        self.stdout.write(f'Fixed: {fixed_count} users')
        self.stdout.write(f'Skipped (already correct): {skipped_count} users')
        if error_count > 0:
            self.stdout.write(self.style.ERROR(f'Errors: {error_count} users'))
        self.stdout.write('=' * 80)
        
        if dry_run:
            self.stdout.write(self.style.WARNING('\nThis was a dry run. Run without --dry-run to apply changes.'))

    def fix_user_profiles(self, user, dry_run=False, fix_orgs=False):
        """Fix profiles for a single user"""
        self.stdout.write(f'\nProcessing: {user.username} ({user.email})')
        
        # Get existing profiles
        existing_profiles = user.user_profiles.all()
        existing_types = set(existing_profiles.values_list('profile_type', flat=True))
        
        required_types = {'vendor', 'employee', 'customer'}
        missing_types = required_types - existing_types
        
        # Check if user has any organization
        user_orgs = user.user_organizations.filter(is_active=True)
        has_org = user_orgs.exists()
        
        # Get or create organization
        organization = None
        if has_org:
            organization = user_orgs.first().organization
            self.stdout.write(f'   Organization: {organization.name}')
        elif not has_org:
            # User has no organization
            if fix_orgs:
                # Create organization for user
                org_name = self.get_organization_name(user)
                org_slug = slugify(org_name)
                
                # Ensure unique slug
                counter = 1
                base_slug = org_slug
                while Organization.objects.filter(slug=org_slug).exists():
                    org_slug = f"{base_slug}-{counter}"
                    counter += 1
                
                if not dry_run:
                    organization = Organization.objects.create(
                        name=org_name,
                        slug=org_slug,
                        email=user.email,
                        is_active=True
                    )
                    self.stdout.write(self.style.SUCCESS(f'   [OK] Created organization: {organization.name}'))
                else:
                    self.stdout.write(self.style.WARNING(f'   [DRY RUN] Would create organization: {org_name}'))
                    # For dry run, create a temporary organization object for processing
                    # This won't be saved but allows us to show what would happen
                    organization = Organization(name=org_name, slug=org_slug, email=user.email)
            else:
                self.stdout.write(self.style.WARNING(f'   [WARN] User has no organization. Use --fix-orgs to create one.'))
                return {'fixed': False, 'skipped': True}
        
        # If no organization available, skip
        if not organization:
            return {'fixed': False, 'skipped': True}
        
        # Check if organization is saved (has pk) - needed for creating related objects
        org_is_saved = organization and hasattr(organization, 'pk') and organization.pk is not None
        
        # Create UserOrganization link if needed
        if organization and org_is_saved and not dry_run:
            user_org, created = UserOrganization.objects.get_or_create(
                user=user,
                organization=organization,
                defaults={
                    'is_owner': True,
                    'is_active': True
                }
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'   [OK] Created UserOrganization link'))
        elif organization and not org_is_saved and dry_run:
            self.stdout.write(self.style.WARNING(f'   [DRY RUN] Would create UserOrganization link'))
        
        # Check if user has a primary profile
        has_primary = existing_profiles.filter(is_primary=True).exists()
        
        # Create missing profiles
        profiles_created = 0
        vendor_profile = None
        
        for profile_type in ['vendor', 'employee', 'customer']:
            if profile_type in missing_types:
                is_primary = (profile_type == 'vendor' and not has_primary)
                
                if not dry_run and org_is_saved:
                    profile = UserProfile.objects.create(
                        user=user,
                        organization=organization,
                        profile_type=profile_type,
                        is_primary=is_primary,
                        status='active',
                        activated_at=timezone.now()
                    )
                    self.stdout.write(
                        self.style.SUCCESS(f'   [OK] Created {profile_type} profile (Primary: {is_primary})')
                    )
                    profiles_created += 1
                    
                    if profile_type == 'vendor':
                        vendor_profile = profile
                        has_primary = True
                else:
                    self.stdout.write(
                        self.style.WARNING(f'   [DRY RUN] Would create {profile_type} profile (Primary: {is_primary})')
                    )
                    profiles_created += 1
            else:
                # Profile exists, check if it needs to be set as primary
                existing_profile = existing_profiles.filter(profile_type=profile_type).first()
                if existing_profile and profile_type == 'vendor' and not has_primary:
                    if not dry_run:
                        UserProfile.objects.filter(user=user).update(is_primary=False)
                        existing_profile.is_primary = True
                        existing_profile.save(update_fields=['is_primary'])
                        self.stdout.write(self.style.SUCCESS(f'   [OK] Set {profile_type} profile as primary'))
                        has_primary = True
                    else:
                        self.stdout.write(self.style.WARNING(f'   [DRY RUN] Would set {profile_type} profile as primary'))
                
                if profile_type == 'vendor':
                    vendor_profile = existing_profile
        
        # Ensure vendor profile is primary if no primary exists
        if not has_primary and vendor_profile and not dry_run:
            # Set vendor as primary
            UserProfile.objects.filter(user=user).update(is_primary=False)
            vendor_profile.is_primary = True
            vendor_profile.save(update_fields=['is_primary'])
            self.stdout.write(self.style.SUCCESS(f'   [OK] Set vendor profile as primary'))
        
        # Create Vendor record if vendor profile exists but no vendor record
        if vendor_profile and org_is_saved:
            vendor_exists = Vendor.objects.filter(
                user=user,
                organization=organization
            ).exists()
            
            if not vendor_exists:
                if not dry_run:
                    try:
                        vendor = Vendor.objects.create(
                            user=user,
                            organization=organization,
                            user_profile=vendor_profile,
                            name=organization.name,
                            email=user.email,
                            status='active'
                        )
                        self.stdout.write(self.style.SUCCESS(f'   [OK] Created Vendor record'))
                    except Exception as e:
                        self.stdout.write(
                            self.style.WARNING(f'   [WARN] Could not create Vendor record: {str(e)}')
                        )
                else:
                    self.stdout.write(self.style.WARNING(f'   [DRY RUN] Would create Vendor record'))
        
        # Return result
        if profiles_created > 0 or not has_primary:
            return {'fixed': True, 'skipped': False}
        else:
            return {'fixed': False, 'skipped': True}

    def get_organization_name(self, user):
        """Get organization name for user"""
        # Try to use existing organization name
        user_org = user.user_organizations.filter(is_active=True).first()
        if user_org:
            return user_org.organization.name
        
        # Generate from user's name
        if user.first_name and user.last_name:
            return f"{user.first_name} {user.last_name}'s Organization"
        elif user.first_name:
            return f"{user.first_name}'s Organization"
        elif user.username:
            return f"{user.username}'s Organization"
        else:
            return f"User {user.id}'s Organization"

