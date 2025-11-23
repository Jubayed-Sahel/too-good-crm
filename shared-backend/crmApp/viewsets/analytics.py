"""
Analytics ViewSet
Provides analytics and reporting endpoints for dashboard statistics
"""

import logging
from datetime import datetime, timedelta
from django.db.models import Sum, Count, Q, Avg
from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from crmApp.models import Customer, Lead, Deal, Activity, Employee
from crmApp.viewsets.mixins import OrganizationFilterMixin
from crmApp.services import RBACService

logger = logging.getLogger(__name__)


class AnalyticsViewSet(viewsets.ViewSet, OrganizationFilterMixin):
    """
    ViewSet for analytics and dashboard statistics.
    Provides various analytics endpoints for reporting and insights.
    """
    permission_classes = [IsAuthenticated]

    def _get_date_range(self, request):
        """Parse date range from request parameters"""
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        if start_date:
            start_date = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
        else:
            # Default to 30 days ago
            start_date = timezone.now() - timedelta(days=30)
        
        if end_date:
            end_date = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
        else:
            end_date = timezone.now()
        
        return start_date, end_date

    def _get_accessible_organizations(self, request):
        """Get organizations accessible to the user"""
        rbac_service = RBACService(request.user)
        return rbac_service.get_accessible_organizations()

    @action(detail=False, methods=['get'], url_path='dashboard-stats')
    def dashboard_stats(self, request):
        """
        Get comprehensive dashboard statistics
        GET /api/analytics/dashboard-stats/
        """
        try:
            organizations = self._get_accessible_organizations(request)
            start_date, end_date = self._get_date_range(request)

            # Get filtered querysets
            customers = Customer.objects.filter(organization__in=organizations)
            leads = Lead.objects.filter(organization__in=organizations)
            deals = Deal.objects.filter(organization__in=organizations)
            activities = Activity.objects.filter(organization__in=organizations)

            # Calculate statistics
            total_customers = customers.count()
            total_leads = leads.count()
            total_deals = deals.count()

            won_deals = deals.filter(is_won=True)
            won_deals_count = won_deals.count()
            lost_deals = deals.filter(is_closed=True, is_won=False)
            lost_deals_count = lost_deals.count()

            total_revenue = won_deals.aggregate(
                total=Sum('value')
            )['total'] or 0

            active_deals_value = deals.filter(is_closed=False).aggregate(
                total=Sum('value')
            )['total'] or 0

            conversion_rate = (won_deals_count / total_deals * 100) if total_deals > 0 else 0

            # Get recent activities
            recent_activities = activities.filter(
                created_at__gte=start_date,
                created_at__lte=end_date
            ).order_by('-created_at')[:10]

            # Serialize activities
            from crmApp.serializers import ActivitySerializer
            activities_data = ActivitySerializer(recent_activities, many=True).data

            return Response({
                'total_leads': total_leads,
                'total_deals': total_deals,
                'total_customers': total_customers,
                'total_revenue': float(total_revenue),
                'active_deals_value': float(active_deals_value),
                'won_deals_count': won_deals_count,
                'lost_deals_count': lost_deals_count,
                'conversion_rate': round(conversion_rate, 2),
                'recent_activities': activities_data
            })

        except Exception as e:
            logger.error(f"Error fetching dashboard stats: {str(e)}", exc_info=True)
            return Response(
                {'error': 'Failed to fetch dashboard statistics'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'], url_path='sales_funnel')
    def sales_funnel(self, request):
        """
        Get sales funnel data
        GET /api/analytics/sales_funnel/
        """
        try:
            organizations = self._get_accessible_organizations(request)
            start_date, end_date = self._get_date_range(request)

            deals = Deal.objects.filter(
                organization__in=organizations,
                created_at__gte=start_date,
                created_at__lte=end_date
            )

            # Group by pipeline stage
            from crmApp.models import PipelineStage
            stages = PipelineStage.objects.filter(
                pipeline__organization__in=organizations,
                pipeline__is_active=True
            ).order_by('order')

            funnel_data = []
            for stage in stages:
                stage_deals = deals.filter(stage=stage)
                count = stage_deals.count()
                value = stage_deals.aggregate(total=Sum('value'))['total'] or 0
                
                funnel_data.append({
                    'stage': stage.name,
                    'count': count,
                    'value': float(value),
                    'conversion_rate': None  # Could calculate if needed
                })

            return Response({'funnel_data': funnel_data})

        except Exception as e:
            logger.error(f"Error fetching sales funnel: {str(e)}", exc_info=True)
            return Response(
                {'error': 'Failed to fetch sales funnel data'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'], url_path='revenue_by_period')
    def revenue_by_period(self, request):
        """
        Get revenue data by time period
        GET /api/analytics/revenue_by_period/
        """
        try:
            organizations = self._get_accessible_organizations(request)
            start_date, end_date = self._get_date_range(request)
            period = request.query_params.get('period', 'month')

            deals = Deal.objects.filter(
                organization__in=organizations,
                is_won=True,
                closed_at__gte=start_date,
                closed_at__lte=end_date
            )

            # Group by period
            revenue_data = []
            
            if period == 'day':
                # Group by day
                from django.db.models.functions import TruncDay
                grouped = deals.annotate(
                    period=TruncDay('closed_at')
                ).values('period').annotate(
                    revenue=Sum('value'),
                    deals_count=Count('id'),
                    average_deal_value=Avg('value')
                ).order_by('period')
                
            elif period == 'week':
                # Group by week
                from django.db.models.functions import TruncWeek
                grouped = deals.annotate(
                    period=TruncWeek('closed_at')
                ).values('period').annotate(
                    revenue=Sum('value'),
                    deals_count=Count('id'),
                    average_deal_value=Avg('value')
                ).order_by('period')
                
            elif period == 'month':
                # Group by month
                from django.db.models.functions import TruncMonth
                grouped = deals.annotate(
                    period=TruncMonth('closed_at')
                ).values('period').annotate(
                    revenue=Sum('value'),
                    deals_count=Count('id'),
                    average_deal_value=Avg('value')
                ).order_by('period')
                
            elif period == 'quarter':
                # Group by quarter
                from django.db.models.functions import TruncQuarter
                grouped = deals.annotate(
                    period=TruncQuarter('closed_at')
                ).values('period').annotate(
                    revenue=Sum('value'),
                    deals_count=Count('id'),
                    average_deal_value=Avg('value')
                ).order_by('period')
                
            elif period == 'year':
                # Group by year
                from django.db.models.functions import TruncYear
                grouped = deals.annotate(
                    period=TruncYear('closed_at')
                ).values('period').annotate(
                    revenue=Sum('value'),
                    deals_count=Count('id'),
                    average_deal_value=Avg('value')
                ).order_by('period')
            else:
                return Response(
                    {'error': 'Invalid period. Use: day, week, month, quarter, year'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            for item in grouped:
                revenue_data.append({
                    'period': item['period'].isoformat() if item['period'] else None,
                    'revenue': float(item['revenue'] or 0),
                    'deals_count': item['deals_count'],
                    'average_deal_value': float(item['average_deal_value'] or 0)
                })

            return Response({'revenue_data': revenue_data})

        except Exception as e:
            logger.error(f"Error fetching revenue by period: {str(e)}", exc_info=True)
            return Response(
                {'error': 'Failed to fetch revenue data'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'], url_path='employee_performance')
    def employee_performance(self, request):
        """
        Get employee performance metrics
        GET /api/analytics/employee_performance/
        """
        try:
            organizations = self._get_accessible_organizations(request)
            start_date, end_date = self._get_date_range(request)
            employee_id = request.query_params.get('employee_id')

            employees_query = Employee.objects.filter(organization__in=organizations)
            if employee_id:
                employees_query = employees_query.filter(id=employee_id)

            performance_data = []
            for employee in employees_query:
                # Get deals for this employee
                deals = Deal.objects.filter(
                    assigned_to=employee,
                    created_at__gte=start_date,
                    created_at__lte=end_date
                )

                # Get leads for this employee
                leads = Lead.objects.filter(
                    assigned_to=employee,
                    created_at__gte=start_date,
                    created_at__lte=end_date
                )

                won_deals = deals.filter(is_won=True)
                total_revenue = won_deals.aggregate(total=Sum('value'))['total'] or 0
                converted_leads = leads.filter(status='qualified').count()

                performance_data.append({
                    'employee_id': employee.id,
                    'employee_name': f"{employee.user.first_name} {employee.user.last_name}".strip() or employee.user.email,
                    'total_leads': leads.count(),
                    'converted_leads': converted_leads,
                    'total_deals': deals.count(),
                    'won_deals': won_deals.count(),
                    'total_revenue': float(total_revenue),
                    'conversion_rate': (won_deals.count() / deals.count() * 100) if deals.count() > 0 else 0
                })

            return Response({'employee_performance': performance_data})

        except Exception as e:
            logger.error(f"Error fetching employee performance: {str(e)}", exc_info=True)
            return Response(
                {'error': 'Failed to fetch employee performance data'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'], url_path='top_performers')
    def top_performers(self, request):
        """
        Get top performing employees
        GET /api/analytics/top_performers/
        """
        try:
            organizations = self._get_accessible_organizations(request)
            start_date, end_date = self._get_date_range(request)
            metric = request.query_params.get('metric', 'revenue')
            limit = int(request.query_params.get('limit', 10))

            employees = Employee.objects.filter(organization__in=organizations)
            performers = []

            for employee in employees:
                deals = Deal.objects.filter(
                    assigned_to=employee,
                    created_at__gte=start_date,
                    created_at__lte=end_date
                )

                leads = Lead.objects.filter(
                    assigned_to=employee,
                    created_at__gte=start_date,
                    created_at__lte=end_date
                )

                won_deals = deals.filter(is_won=True)
                total_revenue = won_deals.aggregate(total=Sum('value'))['total'] or 0
                converted_leads = leads.filter(status='qualified').count()

                metric_value = 0
                if metric == 'revenue':
                    metric_value = total_revenue
                elif metric == 'deals':
                    metric_value = won_deals.count()
                elif metric == 'leads':
                    metric_value = converted_leads
                elif metric == 'conversion':
                    metric_value = (won_deals.count() / deals.count() * 100) if deals.count() > 0 else 0

                performers.append({
                    'employee_id': employee.id,
                    'employee_name': f"{employee.user.first_name} {employee.user.last_name}".strip() or employee.user.email,
                    'metric_value': float(metric_value),
                    'total_revenue': float(total_revenue),
                    'won_deals': won_deals.count(),
                    'converted_leads': converted_leads
                })

            # Sort by metric value and limit
            performers.sort(key=lambda x: x['metric_value'], reverse=True)
            performers = performers[:limit]

            return Response({'top_performers': performers})

        except Exception as e:
            logger.error(f"Error fetching top performers: {str(e)}", exc_info=True)
            return Response(
                {'error': 'Failed to fetch top performers data'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'], url_path='quick_stats')
    def quick_stats(self, request):
        """
        Get quick statistics for current user
        GET /api/analytics/quick_stats/
        """
        try:
            organizations = self._get_accessible_organizations(request)
            
            # Get counts
            total_customers = Customer.objects.filter(organization__in=organizations).count()
            total_leads = Lead.objects.filter(organization__in=organizations).count()
            total_deals = Deal.objects.filter(organization__in=organizations).count()
            
            active_deals = Deal.objects.filter(
                organization__in=organizations,
                is_closed=False
            ).count()
            
            won_deals = Deal.objects.filter(
                organization__in=organizations,
                is_won=True
            )
            
            total_revenue = won_deals.aggregate(total=Sum('value'))['total'] or 0

            return Response({
                'total_customers': total_customers,
                'total_leads': total_leads,
                'total_deals': total_deals,
                'active_deals': active_deals,
                'won_deals': won_deals.count(),
                'total_revenue': float(total_revenue)
            })

        except Exception as e:
            logger.error(f"Error fetching quick stats: {str(e)}", exc_info=True)
            return Response(
                {'error': 'Failed to fetch quick statistics'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'], url_path='dashboard')
    def dashboard(self, request):
        """
        Alternative endpoint for dashboard stats (matches web frontend config)
        GET /api/analytics/dashboard/
        """
        return self.dashboard_stats(request)
