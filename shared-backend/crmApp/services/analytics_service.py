"""
Analytics Service

Handles analytics and reporting:
- Dashboard statistics
- Revenue analytics
- Conversion metrics
- Performance reports
"""

from typing import Dict, List, Optional
from django.db.models import Sum, Count, Avg, Q
from datetime import datetime, timedelta
from decimal import Decimal

from crmApp.models import Organization, Customer, Lead, Deal, Employee


class AnalyticsService:
    """Service class for analytics and reporting"""
    
    @staticmethod
    def get_dashboard_stats(organization: Organization) -> Dict:
        """
        Get comprehensive dashboard statistics
        
        Args:
            organization: Organization instance
            
        Returns:
            Dictionary with dashboard metrics
        """
        # Customer stats
        total_customers = Customer.objects.filter(organization=organization).count()
        active_customers = Customer.objects.filter(
            organization=organization,
            status='active'
        ).count()
        
        # Lead stats
        total_leads = Lead.objects.filter(organization=organization).count()
        qualified_leads = Lead.objects.filter(
            organization=organization,
            qualification_status='qualified'
        ).count()
        
        # Deal stats
        deals = Deal.objects.filter(organization=organization)
        total_deals = deals.count()
        won_deals = deals.filter(is_won=True).count()
        active_deals = deals.filter(is_won=False, is_lost=False).count()
        
        total_revenue = deals.filter(is_won=True).aggregate(
            total=Sum('value')
        )['total'] or 0
        
        pipeline_value = deals.filter(
            is_won=False,
            is_lost=False
        ).aggregate(total=Sum('value'))['total'] or 0
        
        expected_revenue = deals.filter(
            is_won=False,
            is_lost=False
        ).aggregate(total=Sum('expected_revenue'))['total'] or 0
        
        # Win rate
        closed_deals = won_deals + deals.filter(is_lost=True).count()
        win_rate = (won_deals / closed_deals * 100) if closed_deals > 0 else 0
        
        return {
            'customers': {
                'total': total_customers,
                'active': active_customers,
                'growth': AnalyticsService._calculate_growth(
                    Customer, organization, 'month'
                ),
            },
            'leads': {
                'total': total_leads,
                'qualified': qualified_leads,
                'conversion_rate': (
                    qualified_leads / total_leads * 100
                ) if total_leads > 0 else 0,
            },
            'deals': {
                'total': total_deals,
                'active': active_deals,
                'won': won_deals,
                'win_rate': round(win_rate, 2),
            },
            'revenue': {
                'total': float(total_revenue),
                'pipeline_value': float(pipeline_value),
                'expected': float(expected_revenue),
            },
        }
    
    @staticmethod
    def get_sales_funnel(organization: Organization) -> Dict:
        """
        Get sales funnel metrics
        
        Args:
            organization: Organization instance
            
        Returns:
            Dictionary with funnel stages and conversion rates
        """
        total_leads = Lead.objects.filter(organization=organization).count()
        qualified_leads = Lead.objects.filter(
            organization=organization,
            qualification_status='qualified'
        ).count()
        converted_leads = Lead.objects.filter(
            organization=organization,
            is_converted=True
        ).count()
        
        total_deals = Deal.objects.filter(organization=organization).count()
        won_deals = Deal.objects.filter(
            organization=organization,
            is_won=True
        ).count()
        
        return {
            'stages': [
                {
                    'name': 'Total Leads',
                    'count': total_leads,
                    'percentage': 100,
                },
                {
                    'name': 'Qualified Leads',
                    'count': qualified_leads,
                    'percentage': (
                        qualified_leads / total_leads * 100
                    ) if total_leads > 0 else 0,
                },
                {
                    'name': 'Opportunities',
                    'count': total_deals,
                    'percentage': (
                        total_deals / total_leads * 100
                    ) if total_leads > 0 else 0,
                },
                {
                    'name': 'Closed Won',
                    'count': won_deals,
                    'percentage': (
                        won_deals / total_leads * 100
                    ) if total_leads > 0 else 0,
                },
            ],
            'conversion_rates': {
                'lead_to_qualified': (
                    qualified_leads / total_leads * 100
                ) if total_leads > 0 else 0,
                'qualified_to_opportunity': (
                    total_deals / qualified_leads * 100
                ) if qualified_leads > 0 else 0,
                'opportunity_to_won': (
                    won_deals / total_deals * 100
                ) if total_deals > 0 else 0,
                'lead_to_won': (
                    won_deals / total_leads * 100
                ) if total_leads > 0 else 0,
            },
        }
    
    @staticmethod
    def get_revenue_by_period(
        organization: Organization,
        period: str = 'month',
        count: int = 12
    ) -> List[Dict]:
        """
        Get revenue breakdown by time period
        
        Args:
            organization: Organization instance
            period: Time period ('day', 'week', 'month', 'quarter', 'year')
            count: Number of periods to include
            
        Returns:
            List of revenue data by period
        """
        deals = Deal.objects.filter(
            organization=organization,
            is_won=True,
            actual_close_date__isnull=False
        )
        
        results = []
        today = datetime.now().date()
        
        for i in range(count):
            if period == 'month':
                # Calculate month offset without dateutil
                year = today.year
                month = today.month
                # Subtract i months
                month -= i
                while month < 1:
                    month += 12
                    year -= 1
                
                # First day of the month
                start = today.replace(year=year, month=month, day=1)
                
                # Last day of the month
                if month == 12:
                    end = start.replace(day=31)
                else:
                    next_month = start.replace(month=month + 1, day=1)
                    end = next_month - timedelta(days=1)
                
                label = start.strftime('%b %Y')
            elif period == 'week':
                start = today - timedelta(weeks=i)
                start = start - timedelta(days=start.weekday())
                end = start + timedelta(days=6)
                label = f"Week of {start.strftime('%b %d')}"
            elif period == 'day':
                start = end = today - timedelta(days=i)
                label = start.strftime('%b %d')
            else:  # year
                year = today.year - i
                start = today.replace(year=year, month=1, day=1)
                end = today.replace(year=year, month=12, day=31)
                label = str(start.year)
            
            period_deals = deals.filter(
                actual_close_date__range=[start, end]
            )
            
            revenue = period_deals.aggregate(total=Sum('value'))['total'] or 0
            deal_count = period_deals.count()
            
            results.insert(0, {
                'period': label,
                'revenue': float(revenue),
                'deal_count': deal_count,
                'start_date': str(start),
                'end_date': str(end),
            })
        
        return results
    
    @staticmethod
    def get_employee_performance(organization: Organization) -> List[Dict]:
        """
        Get performance metrics for employees
        
        Args:
            organization: Organization instance
            
        Returns:
            List of employee performance data
        """
        employees = Employee.objects.filter(organization=organization).select_related('user')
        
        performance = []
        for employee in employees:
            # Customer metrics
            customer_count = Customer.objects.filter(
                assigned_to=employee
            ).count()
            
            # Lead metrics
            leads = Lead.objects.filter(assigned_to=employee)
            total_leads = leads.count()
            converted_leads = leads.filter(is_converted=True).count()
            lead_conversion_rate = (
                converted_leads / total_leads * 100
            ) if total_leads > 0 else 0
            
            # Deal metrics
            deals = Deal.objects.filter(assigned_to=employee)
            total_deals = deals.count()
            won_deals = deals.filter(is_won=True).count()
            win_rate = (won_deals / total_deals * 100) if total_deals > 0 else 0
            
            won_revenue = deals.filter(is_won=True).aggregate(
                total=Sum('value')
            )['total'] or 0
            
            pipeline_value = deals.filter(
                is_won=False,
                is_lost=False
            ).aggregate(total=Sum('value'))['total'] or 0
            
            # Employee info with user data
            employee_data = {
                'id': employee.id,
                'code': employee.code,
                'department': employee.department,
                'designation': employee.job_title or employee.department,
            }
            
            # Add user information if available
            if employee.user:
                employee_data['user'] = {
                    'first_name': employee.user.first_name,
                    'last_name': employee.user.last_name,
                }
            
            performance.append({
                'employee': employee_data,
                'customers': customer_count,
                'leads': {
                    'total': total_leads,
                    'converted': converted_leads,
                    'conversion_rate': round(lead_conversion_rate, 2),
                },
                'deals': {
                    'total': total_deals,
                    'won': won_deals,
                    'win_rate': round(win_rate, 2),
                },
                'revenue': {
                    'won': float(won_revenue),
                    'pipeline': float(pipeline_value),
                },
            })
        
        # Sort by revenue
        performance.sort(key=lambda x: x['revenue']['won'], reverse=True)
        
        return performance
    
    @staticmethod
    def get_top_performers(
        organization: Organization,
        metric: str = 'revenue',
        limit: int = 5
    ) -> List[Dict]:
        """
        Get top performing employees
        
        Args:
            organization: Organization instance
            metric: Metric to rank by ('revenue', 'deals', 'win_rate')
            limit: Number of employees to return
            
        Returns:
            List of top performer data
        """
        performance = AnalyticsService.get_employee_performance(organization)
        
        if metric == 'revenue':
            performance.sort(key=lambda x: x['revenue']['won'], reverse=True)
        elif metric == 'deals':
            performance.sort(key=lambda x: x['deals']['won'], reverse=True)
        elif metric == 'win_rate':
            performance.sort(key=lambda x: x['deals']['win_rate'], reverse=True)
        
        return performance[:limit]
    
    @staticmethod
    def _calculate_growth(model, organization: Organization, period: str) -> float:
        """
        Calculate growth percentage for a model
        
        Args:
            model: Django model class
            organization: Organization instance
            period: Time period ('week', 'month', 'quarter', 'year')
            
        Returns:
            Growth percentage
        """
        today = datetime.now().date()
        
        if period == 'week':
            start = today - timedelta(days=7)
            prev_start = start - timedelta(days=7)
        elif period == 'month':
            start = today - timedelta(days=30)
            prev_start = start - timedelta(days=30)
        elif period == 'quarter':
            start = today - timedelta(days=90)
            prev_start = start - timedelta(days=90)
        else:  # year
            start = today - timedelta(days=365)
            prev_start = start - timedelta(days=365)
        
        current_count = model.objects.filter(
            organization=organization,
            created_at__gte=start
        ).count()
        
        previous_count = model.objects.filter(
            organization=organization,
            created_at__range=[prev_start, start]
        ).count()
        
        if previous_count == 0:
            return 100 if current_count > 0 else 0
        
        growth = ((current_count - previous_count) / previous_count) * 100
        return round(growth, 2)
