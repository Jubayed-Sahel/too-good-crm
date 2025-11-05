"""
Seed Data Script for CRM Application

This script populates the database with realistic sample data for development and testing.
Run with: python manage.py shell < seed_data.py
or: python seed_data.py
"""

import os
import sys
import django
from datetime import datetime, timedelta
from decimal import Decimal
import random

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.utils import timezone
from crmApp.models import (
    User, Organization, UserOrganization, Employee, Customer, Lead, Deal,
    Pipeline, PipelineStage, Vendor, Role, Permission, RolePermission, UserRole
)

User = get_user_model()

def clear_existing_data():
    """Clear existing data (optional - comment out if you want to keep existing data)"""
    print("Clearing existing data...")
    Deal.objects.all().delete()
    Lead.objects.all().delete()
    Customer.objects.all().delete()
    Vendor.objects.all().delete()
    Employee.objects.filter(user__email__contains='demo').delete()
    PipelineStage.objects.all().delete()
    Pipeline.objects.all().delete()
    UserOrganization.objects.all().delete()
    UserRole.objects.all().delete()
    RolePermission.objects.all().delete()
    Permission.objects.all().delete()
    Role.objects.all().delete()
    # Don't delete superuser, but delete demo users
    User.objects.filter(email__contains='demo').delete()
    Organization.objects.filter(name__contains='Demo').delete()
    print("✓ Existing data cleared")


def create_organizations():
    """Create sample organizations"""
    print("\nCreating organizations...")
    
    orgs = [
        {
            'name': 'TechCorp Solutions',
            'slug': 'techcorp-solutions',
            'industry': 'technology',
            'description': 'Leading technology solutions provider',
            'website': 'https://techcorp.example.com',
            'phone': '+1-555-0100',
            'email': 'contact@techcorp.example.com',
            'address': '123 Tech Street',
            'city': 'San Francisco',
            'state': 'CA',
            'postal_code': '94105',
            'country': 'USA',
        },
        {
            'name': 'Global Marketing Inc',
            'slug': 'global-marketing-inc',
            'industry': 'marketing',
            'description': 'Full-service marketing agency',
            'website': 'https://globalmarketing.example.com',
            'phone': '+1-555-0200',
            'email': 'hello@globalmarketing.example.com',
            'address': '456 Marketing Ave',
            'city': 'New York',
            'state': 'NY',
            'postal_code': '10001',
            'country': 'USA',
        },
    ]
    
    created_orgs = []
    for org_data in orgs:
        # Use slug as the unique identifier for get_or_create
        slug = org_data.pop('slug')
        org, created = Organization.objects.get_or_create(
            slug=slug,
            defaults=org_data
        )
        created_orgs.append(org)
        print(f"  {'Created' if created else 'Found'}: {org.name}")
    
    return created_orgs


def create_users_and_employees(organizations):
    """Create users and their employee profiles"""
    print("\nCreating users and employees...")
    
    users_data = [
        {
            'email': 'john.doe@demo.com',
            'username': 'john.doe',
            'first_name': 'John',
            'last_name': 'Doe',
            'employee': {
                'job_title': 'Sales Manager',
                'department': 'sales',
                'phone': '+1-555-1001',
                'organization': 0,  # Index in organizations list
            }
        },
        {
            'email': 'sarah.johnson@demo.com',
            'username': 'sarah.johnson',
            'first_name': 'Sarah',
            'last_name': 'Johnson',
            'employee': {
                'job_title': 'Senior Sales Representative',
                'department': 'sales',
                'phone': '+1-555-1002',
                'organization': 0,
            }
        },
        {
            'email': 'mike.wilson@demo.com',
            'username': 'mike.wilson',
            'first_name': 'Mike',
            'last_name': 'Wilson',
            'employee': {
                'job_title': 'Sales Representative',
                'department': 'sales',
                'phone': '+1-555-1003',
                'organization': 0,
            }
        },
        {
            'email': 'emily.brown@demo.com',
            'username': 'emily.brown',
            'first_name': 'Emily',
            'last_name': 'Brown',
            'employee': {
                'job_title': 'Marketing Director',
                'department': 'marketing',
                'phone': '+1-555-2001',
                'organization': 1,
            }
        },
        {
            'email': 'david.garcia@demo.com',
            'username': 'david.garcia',
            'first_name': 'David',
            'last_name': 'Garcia',
            'employee': {
                'job_title': 'Account Manager',
                'department': 'sales',
                'phone': '+1-555-2002',
                'organization': 1,
            }
        },
    ]
    
    created_employees = []
    for user_data in users_data:
        employee_data = user_data.pop('employee')
        org_index = employee_data.pop('organization')
        
        user, created = User.objects.get_or_create(
            email=user_data['email'],
            defaults={**user_data, 'is_active': True}
        )
        
        if created:
            user.set_password('demo1234')  # Default password
            user.save()
            print(f"  Created user: {user.email}")
        
        # Create employee profile
        employee, emp_created = Employee.objects.get_or_create(
            user=user,
            organization=organizations[org_index],
            defaults=employee_data
        )
        
        # Create UserOrganization relationship
        UserOrganization.objects.get_or_create(
            user=user,
            organization=organizations[org_index],
            defaults={'is_owner': False, 'is_active': True}
        )
        
        created_employees.append(employee)
        print(f"  {'Created' if emp_created else 'Found'} employee: {employee.full_name}")
    
    return created_employees


def create_pipelines(organizations):
    """Create sales pipelines and stages"""
    print("\nCreating pipelines and stages...")
    
    pipelines_data = [
        {
            'name': 'Standard Sales Pipeline',
            'description': 'Default sales pipeline for all deals',
            'organization': 0,
            'stages': [
                {'name': 'Lead', 'order': 1, 'probability': 10},
                {'name': 'Qualified', 'order': 2, 'probability': 25},
                {'name': 'Proposal', 'order': 3, 'probability': 50},
                {'name': 'Negotiation', 'order': 4, 'probability': 75},
                {'name': 'Closed Won', 'order': 5, 'probability': 100},
                {'name': 'Closed Lost', 'order': 6, 'probability': 0},
            ]
        },
        {
            'name': 'Marketing Services Pipeline',
            'description': 'Pipeline for marketing service deals',
            'organization': 1,
            'stages': [
                {'name': 'Initial Contact', 'order': 1, 'probability': 10},
                {'name': 'Discovery', 'order': 2, 'probability': 30},
                {'name': 'Proposal Sent', 'order': 3, 'probability': 50},
                {'name': 'Negotiating', 'order': 4, 'probability': 70},
                {'name': 'Won', 'order': 5, 'probability': 100},
                {'name': 'Lost', 'order': 6, 'probability': 0},
            ]
        },
    ]
    
    created_pipelines = []
    for pipeline_data in pipelines_data:
        stages_data = pipeline_data.pop('stages')
        org_index = pipeline_data.pop('organization')
        
        pipeline, created = Pipeline.objects.get_or_create(
            name=pipeline_data['name'],
            organization=organizations[org_index],
            defaults=pipeline_data
        )
        created_pipelines.append(pipeline)
        print(f"  {'Created' if created else 'Found'} pipeline: {pipeline.name}")
        
        # Create stages
        for stage_data in stages_data:
            stage, stage_created = PipelineStage.objects.get_or_create(
                pipeline=pipeline,
                name=stage_data['name'],
                defaults=stage_data
            )
            if stage_created:
                print(f"    Created stage: {stage.name}")
    
    return created_pipelines


def create_customers(organizations, employees):
    """Create sample customers"""
    print("\nCreating customers...")
    
    customers_data = [
        {
            'name': 'Acme Corporation',
            'company_name': 'Acme Corp',
            'email': 'contact@acme.example.com',
            'phone': '+1-555-3001',
            'customer_type': 'business',
            'industry': 'Manufacturing',
            'website': 'https://acme.example.com',
            'source': 'referral',
            'credit_limit': Decimal('100000'),
            'payment_terms': 'Net 30',
            'address': '789 Industrial Blvd',
            'city': 'Chicago',
            'state': 'IL',
            'postal_code': '60601',
            'country': 'USA',
            'organization': 0,
            'assigned_to': 0,
        },
        {
            'name': 'Stellar Enterprises',
            'company_name': 'Stellar Enterprises LLC',
            'email': 'info@stellar.example.com',
            'phone': '+1-555-3002',
            'customer_type': 'business',
            'industry': 'Technology',
            'website': 'https://stellar.example.com',
            'source': 'website',
            'credit_limit': Decimal('50000'),
            'payment_terms': 'Net 30',
            'address': '321 Tech Park',
            'city': 'Austin',
            'state': 'TX',
            'postal_code': '73301',
            'country': 'USA',
            'organization': 0,
            'assigned_to': 1,
        },
        {
            'name': 'Pinnacle Solutions',
            'company_name': 'Pinnacle Solutions Inc',
            'email': 'contact@pinnacle.example.com',
            'phone': '+1-555-3003',
            'customer_type': 'business',
            'industry': 'Consulting',
            'website': 'https://pinnacle.example.com',
            'source': 'cold_call',
            'credit_limit': Decimal('75000'),
            'payment_terms': 'Net 15',
            'address': '555 Business Ave',
            'city': 'Boston',
            'state': 'MA',
            'postal_code': '02101',
            'country': 'USA',
            'organization': 0,
            'assigned_to': 2,
        },
        {
            'name': 'Quantum Marketing Group',
            'company_name': 'Quantum Marketing',
            'email': 'hello@quantum.example.com',
            'phone': '+1-555-4001',
            'customer_type': 'business',
            'industry': 'Marketing',
            'website': 'https://quantum.example.com',
            'source': 'social_media',
            'credit_limit': Decimal('25000'),
            'payment_terms': 'Net 30',
            'address': '888 Creative St',
            'city': 'Los Angeles',
            'state': 'CA',
            'postal_code': '90001',
            'country': 'USA',
            'organization': 1,
            'assigned_to': 3,
        },
        {
            'name': 'Innovate Tech',
            'company_name': 'Innovate Tech Solutions',
            'email': 'contact@innovatetech.example.com',
            'phone': '+1-555-4002',
            'customer_type': 'business',
            'industry': 'Software',
            'website': 'https://innovatetech.example.com',
            'source': 'website',
            'credit_limit': Decimal('150000'),
            'payment_terms': 'Net 45',
            'address': '999 Innovation Dr',
            'city': 'Seattle',
            'state': 'WA',
            'postal_code': '98101',
            'country': 'USA',
            'organization': 1,
            'assigned_to': 4,
        },
    ]
    
    created_customers = []
    for customer_data in customers_data:
        org_index = customer_data.pop('organization')
        emp_index = customer_data.pop('assigned_to')
        
        customer, created = Customer.objects.get_or_create(
            email=customer_data['email'],
            organization=organizations[org_index],
            defaults={
                **customer_data,
                'assigned_to': employees[emp_index],
                'status': 'active',
            }
        )
        created_customers.append(customer)
        print(f"  {'Created' if created else 'Found'}: {customer.name}")
    
    return created_customers


def create_leads(organizations, employees):
    """Create sample leads"""
    print("\nCreating leads...")
    
    leads_data = [
        {
            'name': 'Jennifer Martinez',
            'company': 'NextGen Innovations',
            'job_title': 'VP of Sales',
            'email': 'j.martinez@nextgen.example.com',
            'phone': '+1-555-5001',
            'source': 'website',
            'qualification_status': 'new',
            'lead_score': 45,
            'estimated_value': Decimal('75000'),
            'notes': 'Interested in our enterprise solution. Follow up next week.',
            'organization': 0,
            'assigned_to': 0,
        },
        {
            'name': 'Robert Chen',
            'company': 'DataFlow Systems',
            'job_title': 'CTO',
            'email': 'r.chen@dataflow.example.com',
            'phone': '+1-555-5002',
            'source': 'referral',
            'qualification_status': 'contacted',
            'lead_score': 65,
            'estimated_value': Decimal('120000'),
            'notes': 'Referred by Acme Corp. Very interested in our analytics platform.',
            'organization': 0,
            'assigned_to': 1,
        },
        {
            'name': 'Lisa Anderson',
            'company': 'GreenTech Solutions',
            'job_title': 'Director of Operations',
            'email': 'l.anderson@greentech.example.com',
            'phone': '+1-555-5003',
            'source': 'social_media',
            'qualification_status': 'qualified',
            'lead_score': 80,
            'estimated_value': Decimal('95000'),
            'notes': 'Ready to discuss proposal. Schedule demo for next Tuesday.',
            'organization': 0,
            'assigned_to': 2,
        },
        {
            'name': 'Michael Thompson',
            'company': 'Urban Retail Co',
            'job_title': 'Marketing Manager',
            'email': 'm.thompson@urbanretail.example.com',
            'phone': '+1-555-5004',
            'source': 'cold_call',
            'qualification_status': 'new',
            'lead_score': 30,
            'estimated_value': Decimal('45000'),
            'notes': 'Initial contact made. Need to send more information.',
            'organization': 0,
            'assigned_to': 0,
        },
        {
            'name': 'Amanda White',
            'company': 'FutureBrand Agency',
            'job_title': 'CEO',
            'email': 'a.white@futurebrand.example.com',
            'phone': '+1-555-6001',
            'source': 'event',
            'qualification_status': 'contacted',
            'lead_score': 70,
            'estimated_value': Decimal('150000'),
            'notes': 'Met at Marketing Summit. Very interested in our services.',
            'organization': 1,
            'assigned_to': 3,
        },
        {
            'name': 'Christopher Lee',
            'company': 'Velocity Startup',
            'job_title': 'Founder',
            'email': 'c.lee@velocity.example.com',
            'phone': '+1-555-6002',
            'source': 'website',
            'qualification_status': 'qualified',
            'lead_score': 85,
            'estimated_value': Decimal('200000'),
            'notes': 'Hot lead. Ready to sign. Send contract this week.',
            'organization': 1,
            'assigned_to': 4,
        },
        {
            'name': 'Patricia Davis',
            'company': 'Heritage Industries',
            'job_title': 'VP Marketing',
            'email': 'p.davis@heritage.example.com',
            'phone': '+1-555-6003',
            'source': 'email_campaign',
            'qualification_status': 'unqualified',
            'lead_score': 15,
            'estimated_value': Decimal('10000'),
            'notes': 'Budget constraints. Not a good fit at this time.',
            'organization': 1,
            'assigned_to': 3,
        },
    ]
    
    created_leads = []
    for lead_data in leads_data:
        org_index = lead_data.pop('organization')
        emp_index = lead_data.pop('assigned_to', None)
        
        lead, created = Lead.objects.get_or_create(
            email=lead_data['email'],
            organization=organizations[org_index],
            defaults={
                **lead_data,
                'assigned_to': employees[emp_index] if emp_index is not None else None,
                'status': 'active',
            }
        )
        created_leads.append(lead)
        print(f"  {'Created' if created else 'Found'}: {lead.name}")
    
    return created_leads


def create_deals(organizations, employees, customers, pipelines):
    """Create sample deals"""
    print("\nCreating deals...")
    
    # Get pipeline stages
    tech_pipeline = pipelines[0]
    marketing_pipeline = pipelines[1]
    
    tech_stages = list(tech_pipeline.stages.all().order_by('order'))
    marketing_stages = list(marketing_pipeline.stages.all().order_by('order'))
    
    deals_data = [
        {
            'title': 'Enterprise Software License',
            'description': 'Annual enterprise software license for 500 users',
            'value': Decimal('250000'),
            'probability': 75,
            'expected_close_date': timezone.now() + timedelta(days=15),
            'stage': tech_stages[3],  # Negotiation
            'pipeline': tech_pipeline,
            'customer': 0,
            'organization': 0,
            'assigned_to': 0,
        },
        {
            'title': 'Cloud Migration Project',
            'description': 'Complete cloud infrastructure migration',
            'value': Decimal('180000'),
            'probability': 50,
            'expected_close_date': timezone.now() + timedelta(days=30),
            'stage': tech_stages[2],  # Proposal
            'pipeline': tech_pipeline,
            'customer': 1,
            'organization': 0,
            'assigned_to': 1,
        },
        {
            'title': 'Consulting Services Package',
            'description': '6-month consulting engagement',
            'value': Decimal('95000'),
            'probability': 25,
            'expected_close_date': timezone.now() + timedelta(days=45),
            'stage': tech_stages[1],  # Qualified
            'pipeline': tech_pipeline,
            'customer': 2,
            'organization': 0,
            'assigned_to': 2,
        },
        {
            'title': 'Annual Marketing Campaign',
            'description': 'Full-year integrated marketing campaign',
            'value': Decimal('320000'),
            'probability': 70,
            'expected_close_date': timezone.now() + timedelta(days=20),
            'stage': marketing_stages[3],  # Negotiating
            'pipeline': marketing_pipeline,
            'customer': 3,
            'organization': 1,
            'assigned_to': 3,
        },
        {
            'title': 'Brand Refresh Project',
            'description': 'Complete brand identity redesign',
            'value': Decimal('125000'),
            'probability': 100,
            'expected_close_date': timezone.now() - timedelta(days=5),
            'stage': marketing_stages[4],  # Won
            'pipeline': marketing_pipeline,
            'customer': 4,
            'organization': 1,
            'assigned_to': 4,
            'actual_close_date': timezone.now() - timedelta(days=5),
        },
        {
            'title': 'SEO Optimization Services',
            'description': '3-month SEO and content marketing package',
            'value': Decimal('45000'),
            'probability': 30,
            'expected_close_date': timezone.now() + timedelta(days=60),
            'stage': marketing_stages[1],  # Discovery
            'pipeline': marketing_pipeline,
            'customer': 3,
            'organization': 1,
            'assigned_to': 3,
        },
        {
            'title': 'Training & Implementation',
            'description': 'Staff training and system implementation',
            'value': Decimal('65000'),
            'probability': 100,
            'expected_close_date': timezone.now() - timedelta(days=15),
            'stage': tech_stages[4],  # Closed Won
            'pipeline': tech_pipeline,
            'customer': 0,
            'organization': 0,
            'assigned_to': 0,
            'actual_close_date': timezone.now() - timedelta(days=15),
        },
        {
            'title': 'Mobile App Development',
            'description': 'Custom mobile application for iOS and Android',
            'value': Decimal('450000'),
            'probability': 10,
            'expected_close_date': timezone.now() + timedelta(days=90),
            'stage': tech_stages[0],  # Lead
            'pipeline': tech_pipeline,
            'customer': 1,
            'organization': 0,
            'assigned_to': 1,
        },
    ]
    
    created_deals = []
    for deal_data in deals_data:
        org_index = deal_data.pop('organization')
        emp_index = deal_data.pop('assigned_to')
        customer_index = deal_data.pop('customer')
        
        # Create unique deal title with timestamp to avoid duplicates
        unique_title = f"{deal_data['title']}"
        
        deal, created = Deal.objects.get_or_create(
            title=unique_title,
            organization=organizations[org_index],
            defaults={
                **deal_data,
                'customer': customers[customer_index],
                'assigned_to': employees[emp_index],
                'status': 'active',
            }
        )
        created_deals.append(deal)
        print(f"  {'Created' if created else 'Found'}: {deal.title} - ${deal.value}")
    
    return created_deals


def create_vendors(organizations):
    """Create sample vendors"""
    print("\nCreating vendors...")
    
    vendors_data = [
        {
            'name': 'CloudHost Pro',
            'company_name': 'CloudHost Professional Services',
            'email': 'sales@cloudhost.example.com',
            'phone': '+1-555-7001',
            'vendor_type': 'service_provider',
            'industry': 'Cloud Hosting',
            'website': 'https://cloudhost.example.com',
            'payment_terms': 'Net 30',
            'address': '100 Cloud Drive',
            'city': 'Seattle',
            'state': 'WA',
            'postal_code': '98101',
            'country': 'USA',
            'organization': 0,
        },
        {
            'name': 'Office Supplies Plus',
            'company_name': 'Office Supplies Plus Inc',
            'email': 'orders@officesupplies.example.com',
            'phone': '+1-555-7002',
            'vendor_type': 'supplier',
            'industry': 'Office Supplies',
            'website': 'https://officesupplies.example.com',
            'payment_terms': 'Net 15',
            'address': '200 Supply Road',
            'city': 'Dallas',
            'state': 'TX',
            'postal_code': '75201',
            'country': 'USA',
            'organization': 0,
        },
        {
            'name': 'TechGear Solutions',
            'company_name': 'TechGear IT Solutions',
            'email': 'info@techgear.example.com',
            'phone': '+1-555-7003',
            'vendor_type': 'supplier',
            'industry': 'IT Equipment',
            'website': 'https://techgear.example.com',
            'payment_terms': 'Net 30',
            'address': '300 Tech Plaza',
            'city': 'Austin',
            'state': 'TX',
            'postal_code': '73301',
            'country': 'USA',
            'organization': 0,
        },
        {
            'name': 'Creative Print Co',
            'company_name': 'Creative Printing Company',
            'email': 'orders@creativeprint.example.com',
            'phone': '+1-555-8001',
            'vendor_type': 'service_provider',
            'industry': 'Printing Services',
            'website': 'https://creativeprint.example.com',
            'payment_terms': 'Due on Receipt',
            'address': '400 Print Street',
            'city': 'New York',
            'state': 'NY',
            'postal_code': '10001',
            'country': 'USA',
            'organization': 1,
        },
        {
            'name': 'Marketing Analytics Pro',
            'company_name': 'Marketing Analytics Professional',
            'email': 'support@marketingpro.example.com',
            'phone': '+1-555-8002',
            'vendor_type': 'service_provider',
            'industry': 'Analytics Software',
            'website': 'https://marketingpro.example.com',
            'payment_terms': 'Monthly Subscription',
            'address': '500 Analytics Way',
            'city': 'San Jose',
            'state': 'CA',
            'postal_code': '95101',
            'country': 'USA',
            'organization': 1,
        },
    ]
    
    created_vendors = []
    for vendor_data in vendors_data:
        org_index = vendor_data.pop('organization')
        
        vendor, created = Vendor.objects.get_or_create(
            email=vendor_data['email'],
            organization=organizations[org_index],
            defaults={
                **vendor_data,
                'status': 'active',
            }
        )
        created_vendors.append(vendor)
        print(f"  {'Created' if created else 'Found'}: {vendor.name}")
    
    return created_vendors


def main():
    """Main execution function"""
    print("=" * 70)
    print("CRM SEED DATA GENERATOR")
    print("=" * 70)
    
    # Clear existing data (optional)
    # clear_existing_data()
    
    # Create data in order
    organizations = create_organizations()
    employees = create_users_and_employees(organizations)
    pipelines = create_pipelines(organizations)
    customers = create_customers(organizations, employees)
    leads = create_leads(organizations, employees)
    deals = create_deals(organizations, employees, customers, pipelines)
    vendors = create_vendors(organizations)
    
    print("\n" + "=" * 70)
    print("SEED DATA SUMMARY")
    print("=" * 70)
    print(f"Organizations: {len(organizations)}")
    print(f"Employees: {len(employees)}")
    print(f"Pipelines: {len(pipelines)}")
    print(f"Customers: {len(customers)}")
    print(f"Leads: {len(leads)}")
    print(f"Deals: {len(deals)}")
    print(f"Vendors: {len(vendors)}")
    print("=" * 70)
    print("✓ Seed data creation completed successfully!")
    print("\nDemo User Credentials:")
    print("Email: john.doe@demo.com")
    print("Password: demo1234")
    print("=" * 70)


if __name__ == '__main__':
    main()
