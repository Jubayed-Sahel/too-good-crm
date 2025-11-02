"""
Unit tests for CRM serializers
"""

from django.test import TestCase
from django.contrib.auth import get_user_model
from crmApp.models import Organization, Lead, Customer
from crmApp.serializers import (
    UserCreateSerializer, UserSerializer,
    LeadSerializer, LeadCreateSerializer,
    CustomerSerializer, CustomerCreateSerializer
)

User = get_user_model()


class UserSerializerTest(TestCase):
    """Test cases for User serializers"""
    
    def test_user_create_serializer(self):
        """Test user creation with serializer"""
        data = {
            'email': 'newuser@example.com',
            'password': 'testpass123',
            'password_confirm': 'testpass123',
            'first_name': 'New',
            'last_name': 'User'
        }
        
        serializer = UserCreateSerializer(data=data)
        self.assertTrue(serializer.is_valid())
        user = serializer.save()
        self.assertEqual(user.email, 'newuser@example.com')
        self.assertTrue(user.check_password('testpass123'))
    
    def test_password_mismatch(self):
        """Test password mismatch validation"""
        data = {
            'email': 'user@example.com',
            'password': 'testpass123',
            'password_confirm': 'different',
            'first_name': 'Test',
            'last_name': 'User'
        }
        
        serializer = UserCreateSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('password_confirm', serializer.errors)


class LeadSerializerTest(TestCase):
    """Test cases for Lead serializers"""
    
    def setUp(self):
        self.org = Organization.objects.create(
            name='Test Org',
            industry='Technology'
        )
    
    def test_lead_create_serializer(self):
        """Test lead creation with serializer"""
        data = {
            'organization_id': self.org.id,
            'first_name': 'Test',
            'last_name': 'Lead',
            'email': 'lead@example.com',
            'company': 'Test Company',
            'source': 'website',
            'priority': 'high',
            'score': 80
        }
        
        serializer = LeadCreateSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)
        lead = serializer.save()
        self.assertEqual(lead.first_name, 'Test')
        self.assertEqual(lead.score, 80)


class CustomerSerializerTest(TestCase):
    """Test cases for Customer serializers"""
    
    def setUp(self):
        self.org = Organization.objects.create(
            name='Test Org',
            industry='Technology'
        )
    
    def test_customer_create_serializer(self):
        """Test customer creation with serializer"""
        data = {
            'organization_id': self.org.id,
            'name': 'Test Customer',
            'email': 'customer@example.com',
            'customer_type': 'individual',
            'status': 'active'
        }
        
        serializer = CustomerCreateSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)
        customer = serializer.save()
        self.assertEqual(customer.name, 'Test Customer')
        self.assertEqual(customer.customer_type, 'individual')
