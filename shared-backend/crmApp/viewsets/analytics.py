"""
Analytics ViewSet
Provides analytics and reporting endpoints
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Count, Avg, Q
from django.utils import timezone
from datetime import timedelta

from crmApp.models import Customer, Lead, Deal, Employee
from crmApp.services import AnalyticsService


class AnalyticsViewSet(viewsets.ViewSet):
    """
    ViewSet for Analytics and Reporting.
    Provides comprehensive statistics and insights.
    """
    permission_classes = [IsAuthenticated]
    
    def _get_user_organization(self, request):
        """Helper to get user's organization"""
        user_org = request.user.user_organizations.filter(
            is_active=True
        ).first()
        
        if not user_org:
            return None
        
        return user_org.organization
    
    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        """
        Get comprehensive dashboard statistics
        
        Returns:
            - Customer stats (total, active, inactive, growth)
            - Lead stats (total, qualified, converted, hot leads)
            - Deal stats (total, won, lost, revenue, win rate)
            - Revenue stats (monthly comparison, growth)
        """
        org = self._get_user_organization(request)
        if not org:
            return Response(
                {'error': 'No organization found for user'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            stats = AnalyticsService.get_dashboard_stats(org)
            return Response(stats)
        except Exception as e:
            return Response(
                {'error': f'Failed to get dashboard stats: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def sales_funnel(self, request):
        """
        Get sales funnel conversion rates
        
        Returns funnel stages:
            - Total Leads
            - Qualified Leads
            - Deals Created
            - Deals Won
        With conversion rates at each stage
        """
        org = self._get_user_organization(request)
        if not org:
            return Response(
                {'error': 'No organization found for user'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            funnel = AnalyticsService.get_sales_funnel(org)
            return Response(funnel)
        except Exception as e:
            return Response(
                {'error': f'Failed to get sales funnel: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def revenue(self, request):
        """
        Get revenue analytics by period
        
        Query params:
            - period: day|week|month|year (default: month)
            - limit: number of periods to return (default: 12)
        """
        org = self._get_user_organization(request)
        if not org:
            return Response(
                {'error': 'No organization found for user'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        period = request.query_params.get('period', 'month')
        limit = int(request.query_params.get('limit', 12))
        
        try:
            revenue_data = AnalyticsService.get_revenue_by_period(
                org, 
                period=period, 
                limit=limit
            )
            return Response(revenue_data)
        except Exception as e:
            return Response(
                {'error': f'Failed to get revenue data: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def employee_performance(self, request):
        """
        Get employee performance metrics
        
        Returns per-employee stats:
            - Total customers
            - Total leads
            - Total deals
            - Total revenue
            - Win rate
        """
        org = self._get_user_organization(request)
        if not org:
            return Response(
                {'error': 'No organization found for user'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            performance = AnalyticsService.get_employee_performance(org)
            return Response(performance)
        except Exception as e:
            return Response(
                {'error': f'Failed to get employee performance: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def top_performers(self, request):
        """
        Get top performing employees
        
        Query params:
            - metric: revenue|deals|win_rate (default: revenue)
            - limit: number of employees to return (default: 10)
        """
        org = self._get_user_organization(request)
        if not org:
            return Response(
                {'error': 'No organization found for user'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        metric = request.query_params.get('metric', 'revenue')
        limit = int(request.query_params.get('limit', 10))
        
        try:
            top_performers = AnalyticsService.get_top_performers(
                org,
                metric=metric,
                limit=limit
            )
            return Response(top_performers)
        except Exception as e:
            return Response(
                {'error': f'Failed to get top performers: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def quick_stats(self, request):
        """
        Get quick overview stats for current user
        
        Returns:
            - My customers count
            - My leads count
            - My deals count
            - My revenue total
        """
        user = request.user
        org = self._get_user_organization(request)
        
        if not org:
            return Response(
                {'error': 'No organization found for user'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Get employee profile
            employee = Employee.objects.filter(
                user=user,
                organization=org
            ).first()
            
            if not employee:
                return Response({
                    'my_customers': 0,
                    'my_leads': 0,
                    'my_deals': 0,
                    'my_revenue': 0
                })
            
            # Count assigned items
            my_customers = Customer.objects.filter(
                organization=org,
                assigned_to=employee
            ).count()
            
            my_leads = Lead.objects.filter(
                organization=org,
                assigned_to=employee
            ).count()
            
            my_deals = Deal.objects.filter(
                organization=org,
                assigned_to=employee
            ).count()
            
            # Calculate revenue from won deals
            my_revenue = Deal.objects.filter(
                organization=org,
                assigned_to=employee,
                is_won=True
            ).aggregate(total=Sum('value'))['total'] or 0
            
            return Response({
                'my_customers': my_customers,
                'my_leads': my_leads,
                'my_deals': my_deals,
                'my_revenue': float(my_revenue)
            })
        except Exception as e:
            return Response(
                {'error': f'Failed to get quick stats: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

