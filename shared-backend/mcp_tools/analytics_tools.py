"""
Analytics and Reporting Tools for MCP Server
"""

import logging
from typing import Dict, Any
from django.db.models import Sum, Count, Avg

logger = logging.getLogger(__name__)

def register_analytics_tools(mcp):
    """Register all analytics-related tools"""
    
    @mcp.tool()
    def get_dashboard_stats() -> Dict[str, Any]:
        """
        Get comprehensive dashboard statistics for the organization.
        
        Returns:
            Dashboard stats including customer, lead, deal, and revenue metrics
        """
        try:
            mcp.check_permission('analytics', 'read')
            org_id = mcp.get_organization_id()
            
            if not org_id:
                return {"error": "No organization context found"}
            
            from crmApp.services import AnalyticsService
            from crmApp.models import Organization
            
            org = Organization.objects.get(id=org_id)
            stats = AnalyticsService.get_dashboard_stats(org)
            
            logger.info(f"Retrieved dashboard stats for org {org_id}")
            return stats
            
        except PermissionError as e:
            return {"error": str(e)}
        except Exception as e:
            logger.error(f"Error getting dashboard stats: {str(e)}", exc_info=True)
            return {"error": f"Failed to get dashboard stats: {str(e)}"}
    
    @mcp.tool()
    def get_sales_funnel() -> Dict[str, Any]:
        """
        Get sales funnel conversion rates.
        
        Returns:
            Funnel stages with conversion rates (Leads -> Qualified -> Deals -> Won)
        """
        try:
            mcp.check_permission('analytics', 'read')
            org_id = mcp.get_organization_id()
            
            from crmApp.services import AnalyticsService
            from crmApp.models import Organization
            
            org = Organization.objects.get(id=org_id)
            funnel = AnalyticsService.get_sales_funnel(org)
            
            logger.info(f"Retrieved sales funnel for org {org_id}")
            return funnel
            
        except PermissionError as e:
            return {"error": str(e)}
        except Exception as e:
            logger.error(f"Error getting sales funnel: {str(e)}", exc_info=True)
            return {"error": f"Failed to get sales funnel: {str(e)}"}
    
    @mcp.tool()
    def get_revenue_by_period(period: str = "month", limit: int = 12) -> Dict[str, Any]:
        """
        Get revenue analytics by time period.
        
        Args:
            period: Time period (day, week, month, year)
            limit: Number of periods to return
        
        Returns:
            Revenue data by period
        """
        try:
            mcp.check_permission('analytics', 'read')
            org_id = mcp.get_organization_id()
            
            from crmApp.services import AnalyticsService
            from crmApp.models import Organization
            
            org = Organization.objects.get(id=org_id)
            revenue_data = AnalyticsService.get_revenue_by_period(
                org,
                period=period,
                count=limit
            )
            
            logger.info(f"Retrieved revenue by {period} for org {org_id}")
            return revenue_data
            
        except PermissionError as e:
            return {"error": str(e)}
        except Exception as e:
            logger.error(f"Error getting revenue data: {str(e)}", exc_info=True)
            return {"error": f"Failed to get revenue data: {str(e)}"}
    
    @mcp.tool()
    def get_employee_performance() -> Dict[str, Any]:
        """
        Get employee performance metrics.
        
        Returns:
            Per-employee statistics (customers, leads, deals, revenue, win rate)
        """
        try:
            mcp.check_permission('analytics', 'read')
            org_id = mcp.get_organization_id()
            
            from crmApp.services import AnalyticsService
            from crmApp.models import Organization
            
            org = Organization.objects.get(id=org_id)
            performance = AnalyticsService.get_employee_performance(org)
            
            logger.info(f"Retrieved employee performance for org {org_id}")
            return performance
            
        except PermissionError as e:
            return {"error": str(e)}
        except Exception as e:
            logger.error(f"Error getting employee performance: {str(e)}", exc_info=True)
            return {"error": f"Failed to get employee performance: {str(e)}"}
    
    @mcp.tool()
    def get_quick_stats() -> Dict[str, Any]:
        """
        Get quick overview stats for the current user.
        
        Returns:
            User's personal stats (my customers, leads, deals, revenue)
        """
        try:
            user_id = mcp.get_user_id()
            org_id = mcp.get_organization_id()
            
            from crmApp.models import Employee, Customer, Lead, Deal
            
            # Get employee profile
            try:
                employee = Employee.objects.get(user_id=user_id, organization_id=org_id)
            except Employee.DoesNotExist:
                return {
                    'my_customers': 0,
                    'my_leads': 0,
                    'my_deals': 0,
                    'my_revenue': 0
                }
            
            # Count assigned items
            my_customers = Customer.objects.filter(
                organization_id=org_id,
                assigned_to=employee
            ).count()
            
            my_leads = Lead.objects.filter(
                organization_id=org_id,
                assigned_to=employee
            ).count()
            
            my_deals = Deal.objects.filter(
                organization_id=org_id,
                assigned_to=employee
            ).count()
            
            # Calculate revenue from won deals
            my_revenue = Deal.objects.filter(
                organization_id=org_id,
                assigned_to=employee,
                is_won=True
            ).aggregate(total=Sum('value'))['total'] or 0
            
            stats = {
                'my_customers': my_customers,
                'my_leads': my_leads,
                'my_deals': my_deals,
                'my_revenue': float(my_revenue)
            }
            
            logger.info(f"Retrieved quick stats for user {user_id}")
            return stats
            
        except Exception as e:
            logger.error(f"Error getting quick stats: {str(e)}", exc_info=True)
            return {"error": f"Failed to get quick stats: {str(e)}"}
    
    logger.info("Analytics tools registered")

