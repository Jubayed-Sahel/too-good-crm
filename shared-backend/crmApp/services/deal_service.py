"""
Deal Service

Handles deal-related business logic:
- Deal creation and management
- Pipeline management
- Deal progression
- Revenue calculations
- Win/loss tracking
"""

from typing import Dict, List, Optional
from django.db import transaction
from django.db.models import Sum, Count, Q, Avg
from decimal import Decimal
from datetime import datetime, timedelta

from crmApp.models import Deal, Pipeline, PipelineStage, Organization, Customer, Employee


class DealService:
    """Service class for deal operations"""
    
    @staticmethod
    def create_deal(
        organization: Organization,
        deal_data: Dict,
        customer: Optional[Customer] = None,
        pipeline: Optional[Pipeline] = None
    ) -> Deal:
        """
        Create a new deal
        
        Args:
            organization: Organization instance
            deal_data: Deal data dictionary
            customer: Optional Customer instance
            pipeline: Optional Pipeline instance (uses default if not provided)
            
        Returns:
            Created Deal instance
        """
        with transaction.atomic():
            # Get default pipeline if not provided
            if not pipeline:
                pipeline = Pipeline.objects.filter(
                    organization=organization,
                    is_default=True
                ).first()
            
            # Get first stage of pipeline
            first_stage = pipeline.stages.filter(is_active=True).order_by('order').first()
            
            deal = Deal.objects.create(
                organization=organization,
                customer=customer,
                pipeline=pipeline,
                stage=first_stage,
                probability=first_stage.probability if first_stage else 0,
                **deal_data
            )
            
            return deal
    
    @staticmethod
    def move_to_stage(deal: Deal, stage: PipelineStage) -> Deal:
        """
        Move deal to a different pipeline stage
        
        Args:
            deal: Deal instance
            stage: Target PipelineStage instance
            
        Returns:
            Updated Deal instance
        """
        deal.stage = stage
        deal.probability = stage.probability
        
        # Update win/loss status based on stage
        if stage.is_closed_won:
            deal.is_won = True
            deal.actual_close_date = datetime.now().date()
        elif stage.is_closed_lost:
            deal.is_lost = True
            deal.actual_close_date = datetime.now().date()
        
        deal.save()
        return deal
    
    @staticmethod
    def win_deal(deal: Deal) -> Deal:
        """
        Mark deal as won
        
        Args:
            deal: Deal instance
            
        Returns:
            Updated Deal instance
        """
        # Find closed won stage
        won_stage = deal.pipeline.stages.filter(is_closed_won=True).first()
        
        if won_stage:
            deal.stage = won_stage
            deal.probability = Decimal('100.00')
        
        deal.is_won = True
        deal.actual_close_date = datetime.now().date()
        deal.save()
        
        return deal
    
    @staticmethod
    def lose_deal(deal: Deal, reason: Optional[str] = None) -> Deal:
        """
        Mark deal as lost
        
        Args:
            deal: Deal instance
            reason: Optional reason for loss
            
        Returns:
            Updated Deal instance
        """
        # Find closed lost stage
        lost_stage = deal.pipeline.stages.filter(is_closed_lost=True).first()
        
        if lost_stage:
            deal.stage = lost_stage
            deal.probability = Decimal('0.00')
        
        deal.is_lost = True
        deal.lost_reason = reason
        deal.actual_close_date = datetime.now().date()
        deal.save()
        
        return deal
    
    @staticmethod
    def calculate_deal_metrics(organization: Organization) -> Dict:
        """
        Calculate comprehensive deal metrics
        
        Args:
            organization: Organization instance
            
        Returns:
            Dictionary with deal metrics
        """
        deals = Deal.objects.filter(organization=organization)
        
        total = deals.count()
        won = deals.filter(is_won=True).count()
        lost = deals.filter(is_lost=True).count()
        active = total - won - lost
        
        win_rate = (won / total * 100) if total > 0 else 0
        
        total_value = deals.aggregate(total=Sum('value'))['total'] or 0
        won_value = deals.filter(is_won=True).aggregate(total=Sum('value'))['total'] or 0
        active_value = deals.filter(is_won=False, is_lost=False).aggregate(total=Sum('value'))['total'] or 0
        expected_revenue = deals.filter(is_won=False, is_lost=False).aggregate(
            total=Sum('expected_revenue')
        )['total'] or 0
        
        avg_deal_size = total_value / total if total > 0 else 0
        
        # By stage
        by_stage = deals.values(
            'stage__name', 'stage__probability'
        ).annotate(
            count=Count('id'),
            total_value=Sum('value')
        ).order_by('stage__order')
        
        # By priority
        by_priority = deals.filter(
            is_won=False, is_lost=False
        ).values('priority').annotate(count=Count('id'))
        
        return {
            'total': total,
            'active': active,
            'won': won,
            'lost': lost,
            'win_rate': round(win_rate, 2),
            'total_value': float(total_value),
            'won_value': float(won_value),
            'active_value': float(active_value),
            'expected_revenue': float(expected_revenue),
            'average_deal_size': float(avg_deal_size),
            'by_stage': list(by_stage),
            'by_priority': {item['priority']: item['count'] for item in by_priority},
        }
    
    @staticmethod
    def get_deals_by_pipeline_stage(
        pipeline: Pipeline,
        include_closed: bool = False
    ) -> Dict[str, List[Deal]]:
        """
        Get deals organized by pipeline stage
        
        Args:
            pipeline: Pipeline instance
            include_closed: Whether to include won/lost deals
            
        Returns:
            Dictionary mapping stage names to deal lists
        """
        stages = pipeline.stages.filter(is_active=True).order_by('order')
        
        result = {}
        for stage in stages:
            if not include_closed and (stage.is_closed_won or stage.is_closed_lost):
                continue
            
            deals = Deal.objects.filter(
                pipeline=pipeline,
                stage=stage
            ).select_related('customer', 'assigned_to')
            
            result[stage.name] = list(deals)
        
        return result
    
    @staticmethod
    def get_stale_deals(
        organization: Organization,
        days: int = 30
    ) -> List[Deal]:
        """
        Get deals that haven't been updated recently
        
        Args:
            organization: Organization instance
            days: Number of days threshold
            
        Returns:
            List of stale Deal instances
        """
        cutoff_date = datetime.now() - timedelta(days=days)
        
        return Deal.objects.filter(
            organization=organization,
            is_won=False,
            is_lost=False,
            updated_at__lt=cutoff_date
        ).select_related('customer', 'assigned_to', 'stage')
    
    @staticmethod
    def get_deals_by_expected_close(
        organization: Organization,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> List[Deal]:
        """
        Get deals expected to close in a date range
        
        Args:
            organization: Organization instance
            start_date: Start date (defaults to today)
            end_date: End date (defaults to 30 days from now)
            
        Returns:
            List of Deal instances
        """
        if not start_date:
            start_date = datetime.now().date()
        if not end_date:
            end_date = start_date + timedelta(days=30)
        
        return Deal.objects.filter(
            organization=organization,
            is_won=False,
            is_lost=False,
            expected_close_date__range=[start_date, end_date]
        ).order_by('expected_close_date')
    
    @staticmethod
    def forecast_revenue(
        organization: Organization,
        months: int = 3
    ) -> Dict:
        """
        Forecast revenue for upcoming months
        
        Args:
            organization: Organization instance
            months: Number of months to forecast
            
        Returns:
            Dictionary with revenue forecast
        """
        from dateutil.relativedelta import relativedelta
        
        today = datetime.now().date()
        forecasts = []
        
        for month_offset in range(months):
            month_start = today + relativedelta(months=month_offset, day=1)
            month_end = month_start + relativedelta(months=1, days=-1)
            
            deals = Deal.objects.filter(
                organization=organization,
                is_won=False,
                is_lost=False,
                expected_close_date__range=[month_start, month_end]
            )
            
            total_value = sum(deal.value or 0 for deal in deals)
            expected_revenue = sum(deal.expected_revenue or 0 for deal in deals)
            deal_count = deals.count()
            
            forecasts.append({
                'month': month_start.strftime('%Y-%m'),
                'month_name': month_start.strftime('%B %Y'),
                'total_value': float(total_value),
                'expected_revenue': float(expected_revenue),
                'deal_count': deal_count,
            })
        
        return {
            'forecasts': forecasts,
            'total_expected': sum(f['expected_revenue'] for f in forecasts),
        }
    
    @staticmethod
    def bulk_assign_deals(deal_ids: List[int], employee: Employee) -> int:
        """
        Bulk assign deals to an employee
        
        Args:
            deal_ids: List of deal IDs
            employee: Employee instance
            
        Returns:
            Number of deals assigned
        """
        return Deal.objects.filter(id__in=deal_ids).update(assigned_to=employee)
