"""
Unit tests for CRM models
"""

from django.test import TestCase
from django.contrib.auth import get_user_model
from crmApp.models import (
    Organization, UserOrganization,
    Role, Permission, UserRole,
    Employee, Customer, Lead, Deal, Pipeline, PipelineStage
)

User = get_user_model()


class UserModelTest(TestCase):
    """Test cases for User model"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123',
            first_name='John',
            last_name='Doe'
        )
    
    def test_user_creation(self):
        """Test user can be created"""
        self.assertEqual(self.user.email, 'test@example.com')
        self.assertEqual(self.user.full_name, 'John Doe')
        self.assertTrue(self.user.is_active)
        self.assertFalse(self.user.is_staff)
    
    def test_user_str(self):
        """Test user string representation"""
        self.assertEqual(str(self.user), 'test@example.com')


class OrganizationModelTest(TestCase):
    """Test cases for Organization model"""
    
    def setUp(self):
        self.org = Organization.objects.create(
            name='Test Organization',
            industry='Technology',
            size='small'
        )
    
    def test_organization_creation(self):
        """Test organization can be created"""
        self.assertEqual(self.org.name, 'Test Organization')
        self.assertEqual(self.org.industry, 'Technology')
        self.assertTrue(self.org.is_active)
    
    def test_organization_str(self):
        """Test organization string representation"""
        self.assertEqual(str(self.org), 'Test Organization')


class LeadModelTest(TestCase):
    """Test cases for Lead model"""
    
    def setUp(self):
        self.org = Organization.objects.create(
            name='Test Org',
            industry='Technology'
        )
        self.lead = Lead.objects.create(
            organization=self.org,
            first_name='Jane',
            last_name='Doe',
            email='jane@example.com',
            company='Doe Corp',
            source='website',
            score=75
        )
    
    def test_lead_creation(self):
        """Test lead can be created"""
        self.assertEqual(self.lead.first_name, 'Jane')
        self.assertEqual(self.lead.email, 'jane@example.com')
        self.assertFalse(self.lead.is_converted)
        self.assertEqual(self.lead.qualification_status, 'new')
    
    def test_lead_full_name(self):
        """Test lead full name property"""
        self.assertEqual(self.lead.full_name, 'Jane Doe')
    
    def test_lead_str(self):
        """Test lead string representation"""
        self.assertIn('Jane Doe', str(self.lead))


class CustomerModelTest(TestCase):
    """Test cases for Customer model"""
    
    def setUp(self):
        self.org = Organization.objects.create(
            name='Test Org',
            industry='Technology'
        )
        self.customer = Customer.objects.create(
            organization=self.org,
            name='John Customer',
            email='john@customer.com',
            customer_type='individual'
        )
    
    def test_customer_creation(self):
        """Test customer can be created"""
        self.assertEqual(self.customer.name, 'John Customer')
        self.assertEqual(self.customer.customer_type, 'individual')
        self.assertEqual(self.customer.status, 'active')


class DealModelTest(TestCase):
    """Test cases for Deal model"""
    
    def setUp(self):
        self.org = Organization.objects.create(
            name='Test Org',
            industry='Technology'
        )
        self.customer = Customer.objects.create(
            organization=self.org,
            name='Test Customer',
            email='customer@test.com'
        )
        self.pipeline = Pipeline.objects.create(
            organization=self.org,
            name='Sales Pipeline',
            is_default=True
        )
        self.stage = PipelineStage.objects.create(
            pipeline=self.pipeline,
            name='Qualified',
            order=1,
            probability=50
        )
        self.deal = Deal.objects.create(
            organization=self.org,
            customer=self.customer,
            pipeline=self.pipeline,
            stage=self.stage,
            title='Test Deal',
            value=10000,
            priority='high'
        )
    
    def test_deal_creation(self):
        """Test deal can be created"""
        self.assertEqual(self.deal.title, 'Test Deal')
        self.assertEqual(self.deal.value, 10000)
        self.assertFalse(self.deal.is_won)
        self.assertFalse(self.deal.is_lost)
    
    def test_deal_expected_revenue(self):
        """Test deal expected revenue calculation"""
        self.assertEqual(self.deal.expected_revenue, 5000)  # 10000 * 0.5
