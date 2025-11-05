"""
Customer Service

Handles customer-related business logic:
- Customer creation and updates
- Status management
- Customer statistics
- Lead conversion to customer
"""

from typing import Dict, List, Optional
from django.db import transaction
from django.db.models import Count, Q
from decimal import Decimal

from crmApp.models import Customer, Lead, Organization, User, UserProfile


class CustomerService:
    """Service class for customer operations"""
    
    @staticmethod
    def create_customer(
        organization: Organization,
        customer_data: Dict,
        user: Optional[User] = None
    ) -> Customer:
        """
        Create a new customer
        
        Args:
            organization: Organization instance
            customer_data: Customer data dictionary
            user: Optional User instance to link
            
        Returns:
            Created Customer instance
        """
        with transaction.atomic():
            customer = Customer.objects.create(
                organization=organization,
                user=user,
                **customer_data
            )
            
            # UserProfile is auto-created in Customer.save() if user is provided
            
            return customer
    
    @staticmethod
    def convert_lead_to_customer(lead: Lead, customer_data: Optional[Dict] = None) -> Customer:
        """
        Convert a lead to a customer
        
        Args:
            lead: Lead instance to convert
            customer_data: Optional additional customer data
            
        Returns:
            Created Customer instance
        """
        with transaction.atomic():
            # Prepare customer data from lead
            data = {
                'name': lead.name,
                'email': lead.email,
                'phone': lead.phone,
                'mobile': lead.mobile,
                'company_name': lead.company,
                'address_line1': lead.address_line1,
                'address_line2': lead.address_line2,
                'city': lead.city,
                'state': lead.state,
                'country': lead.country,
                'postal_code': lead.postal_code,
                'assigned_to': lead.assigned_to,
                'source': lead.source,
                'status': 'active',
                'customer_type': 'business' if lead.company else 'individual',
            }
            
            # Update with additional data if provided
            if customer_data:
                data.update(customer_data)
            
            # Create customer
            customer = Customer.objects.create(
                organization=lead.organization,
                converted_from_lead=lead,
                **data
            )
            
            # Update lead status
            lead.is_converted = True
            lead.qualification_status = 'converted'
            lead.save()
            
            return customer
    
    @staticmethod
    def get_customer_statistics(organization: Organization) -> Dict:
        """
        Get customer statistics for an organization
        
        Args:
            organization: Organization instance
            
        Returns:
            Dictionary with statistics
        """
        customers = Customer.objects.filter(organization=organization)
        
        total = customers.count()
        by_status = customers.values('status').annotate(count=Count('id'))
        by_type = customers.values('customer_type').annotate(count=Count('id'))
        
        # Calculate average deal value per customer
        from crmApp.models import Deal
        deals = Deal.objects.filter(
            organization=organization,
            customer__isnull=False
        )
        
        total_value = sum(deal.value or 0 for deal in deals)
        avg_value = total_value / total if total > 0 else 0
        
        return {
            'total': total,
            'by_status': {item['status']: item['count'] for item in by_status},
            'by_type': {item['customer_type']: item['count'] for item in by_type},
            'average_deal_value': float(avg_value),
            'total_deal_value': float(total_value),
        }
    
    @staticmethod
    def bulk_update_status(customer_ids: List[int], status: str) -> int:
        """
        Bulk update customer status
        
        Args:
            customer_ids: List of customer IDs
            status: New status value
            
        Returns:
            Number of customers updated
        """
        return Customer.objects.filter(id__in=customer_ids).update(status=status)
    
    @staticmethod
    def search_customers(
        organization: Organization,
        search_term: str,
        filters: Optional[Dict] = None
    ) -> List[Customer]:
        """
        Search customers with filters
        
        Args:
            organization: Organization instance
            search_term: Search string
            filters: Optional filter dictionary
            
        Returns:
            List of Customer instances
        """
        queryset = Customer.objects.filter(organization=organization)
        
        # Apply search
        if search_term:
            queryset = queryset.filter(
                Q(name__icontains=search_term) |
                Q(email__icontains=search_term) |
                Q(phone__icontains=search_term) |
                Q(company_name__icontains=search_term)
            )
        
        # Apply filters
        if filters:
            if 'status' in filters:
                queryset = queryset.filter(status=filters['status'])
            if 'customer_type' in filters:
                queryset = queryset.filter(customer_type=filters['customer_type'])
            if 'assigned_to' in filters:
                queryset = queryset.filter(assigned_to_id=filters['assigned_to'])
        
        return queryset.select_related('organization', 'assigned_to')
    
    @staticmethod
    def get_top_customers(
        organization: Organization,
        limit: int = 10,
        metric: str = 'deal_value'
    ) -> List[Dict]:
        """
        Get top customers by metric
        
        Args:
            organization: Organization instance
            limit: Number of customers to return
            metric: Metric to rank by ('deal_value', 'deal_count')
            
        Returns:
            List of customer dictionaries with metrics
        """
        from crmApp.models import Deal
        from django.db.models import Sum, Count
        
        customers = Customer.objects.filter(organization=organization)
        
        if metric == 'deal_value':
            customers = customers.annotate(
                total_value=Sum('deals__value')
            ).order_by('-total_value')[:limit]
        else:  # deal_count
            customers = customers.annotate(
                deal_count=Count('deals')
            ).order_by('-deal_count')[:limit]
        
        return list(customers)
