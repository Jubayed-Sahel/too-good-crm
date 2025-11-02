"""
API endpoint tests for CRM application
"""

from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from crmApp.models import Organization, Lead, Customer

User = get_user_model()


class AuthAPITest(TestCase):
    """Test authentication API endpoints"""
    
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User'
        )
    
    def test_user_registration(self):
        """Test user can register via API"""
        url = reverse('user-list')
        data = {
            'email': 'newuser@example.com',
            'password': 'newpass123',
            'password_confirm': 'newpass123',
            'first_name': 'New',
            'last_name': 'User'
        }
        
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.count(), 2)
    
    def test_user_login(self):
        """Test user can login via API"""
        url = reverse('login-list')
        data = {
            'email': 'test@example.com',
            'password': 'testpass123'
        }
        
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('tokens', response.data)
        self.assertIn('access', response.data['tokens'])


class LeadAPITest(TestCase):
    """Test Lead API endpoints"""
    
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )
        self.org = Organization.objects.create(
            name='Test Org',
            industry='Technology'
        )
        self.client.force_authenticate(user=self.user)
    
    def test_create_lead(self):
        """Test creating a lead via API"""
        url = reverse('lead-list')
        data = {
            'organization_id': self.org.id,
            'first_name': 'Test',
            'last_name': 'Lead',
            'email': 'lead@example.com',
            'company': 'Test Co',
            'source': 'website',
            'priority': 'high'
        }
        
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Lead.objects.count(), 1)
    
    def test_list_leads(self):
        """Test listing leads via API"""
        Lead.objects.create(
            organization=self.org,
            first_name='Lead',
            last_name='One',
            email='lead1@example.com',
            source='website'
        )
        
        url = reverse('lead-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class CustomerAPITest(TestCase):
    """Test Customer API endpoints"""
    
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )
        self.org = Organization.objects.create(
            name='Test Org',
            industry='Technology'
        )
        self.client.force_authenticate(user=self.user)
    
    def test_create_customer(self):
        """Test creating a customer via API"""
        url = reverse('customer-list')
        data = {
            'organization_id': self.org.id,
            'name': 'Test Customer',
            'email': 'customer@example.com',
            'customer_type': 'individual'
        }
        
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Customer.objects.count(), 1)
    
    def test_customer_stats(self):
        """Test customer statistics endpoint"""
        Customer.objects.create(
            organization=self.org,
            name='Customer One',
            email='c1@example.com',
            status='active'
        )
        
        url = reverse('customer-stats')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('total', response.data)
