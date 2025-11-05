"""
Lead Service

Handles lead-related business logic:
- Lead creation and management
- Lead scoring
- Lead qualification
- Lead conversion
"""

from typing import Dict, List, Optional
from django.db import transaction
from django.db.models import Q, Avg
from datetime import datetime

from crmApp.models import Lead, Organization, Employee


class LeadService:
    """Service class for lead operations"""
    
    @staticmethod
    def create_lead(organization: Organization, lead_data: Dict) -> Lead:
        """
        Create a new lead
        
        Args:
            organization: Organization instance
            lead_data: Lead data dictionary
            
        Returns:
            Created Lead instance
        """
        return Lead.objects.create(
            organization=organization,
            **lead_data
        )
    
    @staticmethod
    def calculate_lead_score(lead: Lead) -> int:
        """
        Calculate lead score based on various factors
        
        Args:
            lead: Lead instance
            
        Returns:
            Lead score (0-100)
        """
        score = 0
        
        # Base score
        if lead.email:
            score += 10
        if lead.phone:
            score += 10
        if lead.company:
            score += 15
        if lead.job_title:
            score += 10
        
        # Source score
        source_scores = {
            'referral': 25,
            'partner': 20,
            'website': 15,
            'social_media': 10,
            'event': 10,
            'email_campaign': 5,
            'cold_call': 5,
        }
        score += source_scores.get(lead.source, 0)
        
        # Estimated value
        if lead.estimated_value:
            if lead.estimated_value >= 100000:
                score += 20
            elif lead.estimated_value >= 50000:
                score += 15
            elif lead.estimated_value >= 10000:
                score += 10
            else:
                score += 5
        
        # Cap at 100
        return min(score, 100)
    
    @staticmethod
    def update_lead_score(lead: Lead) -> Lead:
        """
        Update lead score
        
        Args:
            lead: Lead instance
            
        Returns:
            Updated Lead instance
        """
        lead.lead_score = LeadService.calculate_lead_score(lead)
        lead.save()
        return lead
    
    @staticmethod
    def qualify_lead(lead: Lead, status: str, notes: Optional[str] = None) -> Lead:
        """
        Qualify or disqualify a lead
        
        Args:
            lead: Lead instance
            status: Qualification status ('qualified', 'unqualified')
            notes: Optional notes
            
        Returns:
            Updated Lead instance
        """
        lead.qualification_status = status
        if notes:
            lead.notes = f"{lead.notes}\n{notes}" if lead.notes else notes
        lead.save()
        return lead
    
    @staticmethod
    def assign_lead(lead: Lead, employee: Employee) -> Lead:
        """
        Assign lead to an employee
        
        Args:
            lead: Lead instance
            employee: Employee instance
            
        Returns:
            Updated Lead instance
        """
        lead.assigned_to = employee
        if lead.qualification_status == 'new':
            lead.qualification_status = 'contacted'
        lead.save()
        return lead
    
    @staticmethod
    def get_lead_statistics(organization: Organization) -> Dict:
        """
        Get lead statistics for an organization
        
        Args:
            organization: Organization instance
            
        Returns:
            Dictionary with statistics
        """
        from django.db.models import Count, Avg, Sum
        
        leads = Lead.objects.filter(organization=organization)
        
        total = leads.count()
        converted = leads.filter(is_converted=True).count()
        conversion_rate = (converted / total * 100) if total > 0 else 0
        
        by_status = leads.values('qualification_status').annotate(count=Count('id'))
        by_source = leads.values('source').annotate(count=Count('id'))
        
        avg_score = leads.aggregate(avg_score=Avg('lead_score'))['avg_score'] or 0
        total_value = leads.aggregate(total=Sum('estimated_value'))['total'] or 0
        
        return {
            'total': total,
            'converted': converted,
            'conversion_rate': round(conversion_rate, 2),
            'average_score': round(avg_score, 2),
            'total_estimated_value': float(total_value),
            'by_status': {item['qualification_status']: item['count'] for item in by_status},
            'by_source': {item['source']: item['count'] for item in by_source},
        }
    
    @staticmethod
    def get_hot_leads(
        organization: Organization,
        min_score: int = 70,
        limit: int = 10
    ) -> List[Lead]:
        """
        Get hot leads (high score, not yet converted)
        
        Args:
            organization: Organization instance
            min_score: Minimum lead score threshold
            limit: Number of leads to return
            
        Returns:
            List of Lead instances
        """
        return Lead.objects.filter(
            organization=organization,
            is_converted=False,
            lead_score__gte=min_score
        ).order_by('-lead_score', '-estimated_value')[:limit]
    
    @staticmethod
    def bulk_assign_leads(
        lead_ids: List[int],
        employee: Employee
    ) -> int:
        """
        Bulk assign leads to an employee
        
        Args:
            lead_ids: List of lead IDs
            employee: Employee instance
            
        Returns:
            Number of leads assigned
        """
        return Lead.objects.filter(id__in=lead_ids).update(
            assigned_to=employee,
            qualification_status='contacted'
        )
    
    @staticmethod
    def search_leads(
        organization: Organization,
        search_term: str,
        filters: Optional[Dict] = None
    ) -> List[Lead]:
        """
        Search leads with filters
        
        Args:
            organization: Organization instance
            search_term: Search string
            filters: Optional filter dictionary
            
        Returns:
            List of Lead instances
        """
        queryset = Lead.objects.filter(organization=organization)
        
        # Apply search
        if search_term:
            queryset = queryset.filter(
                Q(name__icontains=search_term) |
                Q(email__icontains=search_term) |
                Q(company__icontains=search_term) |
                Q(phone__icontains=search_term)
            )
        
        # Apply filters
        if filters:
            if 'status' in filters:
                queryset = queryset.filter(qualification_status=filters['status'])
            if 'source' in filters:
                queryset = queryset.filter(source=filters['source'])
            if 'assigned_to' in filters:
                queryset = queryset.filter(assigned_to_id=filters['assigned_to'])
            if 'min_score' in filters:
                queryset = queryset.filter(lead_score__gte=filters['min_score'])
        
        return queryset.select_related('organization', 'assigned_to')
