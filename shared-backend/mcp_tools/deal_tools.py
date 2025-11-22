"""
Deal Management Tools for MCP Server
"""

import logging
from typing import Optional, List, Dict, Any
from crmApp.models import Deal, Pipeline, PipelineStage, Customer, Employee
from crmApp.serializers import DealSerializer, DealListSerializer

logger = logging.getLogger(__name__)

def register_deal_tools(mcp):
    """Register all deal-related tools"""
    
    @mcp.tool()
    def list_deals(
        status: str = "active",
        stage_id: Optional[int] = None,
        pipeline_id: Optional[int] = None,
        priority: Optional[str] = None,
        is_won: Optional[bool] = None,
        is_lost: Optional[bool] = None,
        search: Optional[str] = None,
        assigned_to: Optional[int] = None,
        limit: int = 20
    ) -> List[Dict[str, Any]]:
        """
        List deals with filtering options.
        
        Args:
            status: Filter by status (active, closed, all)
            stage_id: Filter by pipeline stage ID
            pipeline_id: Filter by pipeline ID
            priority: Filter by priority (low, medium, high, urgent)
            is_won: Filter by won status
            is_lost: Filter by lost status
            search: Search by title or customer name
            assigned_to: Filter by assigned employee ID
            limit: Maximum results (default: 20, max: 100)
        
        Returns:
            List of deal objects
        """
        try:
            mcp.check_permission('deal', 'read')
            org_id = mcp.get_organization_id()
            
            queryset = Deal.objects.filter(organization_id=org_id)
            
            if status and status.lower() != 'all':
                queryset = queryset.filter(status=status)
            if stage_id:
                queryset = queryset.filter(stage_id=stage_id)
            if pipeline_id:
                queryset = queryset.filter(pipeline_id=pipeline_id)
            if priority:
                queryset = queryset.filter(priority=priority)
            if is_won is not None:
                queryset = queryset.filter(is_won=is_won)
            if is_lost is not None:
                queryset = queryset.filter(is_lost=is_lost)
            if assigned_to:
                queryset = queryset.filter(assigned_to_id=assigned_to)
            
            if search:
                from django.db.models import Q
                queryset = queryset.filter(
                    Q(title__icontains=search) |
                    Q(customer__name__icontains=search)
                )
            
            limit = min(limit, 100)
            queryset = queryset.select_related('customer', 'stage', 'assigned_to')[:limit]
            
            serializer = DealListSerializer(queryset, many=True)
            return serializer.data
            
        except PermissionError as e:
            return {"error": str(e)}
        except Exception as e:
            logger.error(f"Error listing deals: {str(e)}", exc_info=True)
            return {"error": f"Failed to list deals: {str(e)}"}
    
    @mcp.tool()
    def get_deal(deal_id: int) -> Dict[str, Any]:
        """Get detailed information about a specific deal."""
        try:
            mcp.check_permission('deal', 'read')
            org_id = mcp.get_organization_id()
            
            deal = Deal.objects.select_related('customer', 'stage', 'pipeline', 'assigned_to').get(
                id=deal_id,
                organization_id=org_id
            )
            
            serializer = DealSerializer(deal)
            return serializer.data
            
        except PermissionError as e:
            return {"error": str(e)}
        except Deal.DoesNotExist:
            return {"error": f"Deal with ID {deal_id} not found"}
        except Exception as e:
            logger.error(f"Error getting deal: {str(e)}", exc_info=True)
            return {"error": f"Failed to get deal: {str(e)}"}
    
    @mcp.tool()
    def create_deal(
        title: str,
        customer_id: int,
        value: float,
        pipeline_id: Optional[int] = None,
        stage_id: Optional[int] = None,
        description: Optional[str] = None,
        priority: str = "medium",
        assigned_to: Optional[int] = None
    ) -> Dict[str, Any]:
        """Create a new deal."""
        try:
            mcp.check_permission('deal', 'create')
            org_id = mcp.get_organization_id()
            
            # Verify customer exists
            try:
                customer = Customer.objects.get(id=customer_id, organization_id=org_id)
            except Customer.DoesNotExist:
                return {"error": f"Customer {customer_id} not found"}
            
            # Get or create default pipeline
            if pipeline_id:
                pipeline = Pipeline.objects.get(id=pipeline_id, organization_id=org_id)
            else:
                pipeline = Pipeline.objects.filter(
                    organization_id=org_id,
                    is_active=True
                ).order_by('-is_default', '-created_at').first()
                
                if not pipeline:
                    return {"error": "No active pipeline found. Please create a pipeline first."}
            
            # Get stage
            if stage_id:
                stage = PipelineStage.objects.get(id=stage_id, pipeline=pipeline)
            else:
                stage = PipelineStage.objects.filter(pipeline=pipeline).order_by('order').first()
                if not stage:
                    return {"error": "No stages found in pipeline"}
            
            deal_data = {
                'organization_id': org_id,
                'customer': customer,
                'pipeline': pipeline,
                'stage': stage,
                'title': title,
                'value': value,
                'description': description or '',
                'priority': priority,
                'probability': stage.probability,
                'status': 'active'
            }
            
            if assigned_to:
                try:
                    employee = Employee.objects.get(id=assigned_to, organization_id=org_id)
                    deal_data['assigned_to'] = employee
                except Employee.DoesNotExist:
                    return {"error": f"Employee {assigned_to} not found"}
            
            deal = Deal.objects.create(**deal_data)
            serializer = DealSerializer(deal)
            
            return {
                "success": True,
                "message": f"Deal '{title}' created successfully",
                "deal": serializer.data
            }
            
        except PermissionError as e:
            return {"error": str(e)}
        except Exception as e:
            logger.error(f"Error creating deal: {str(e)}", exc_info=True)
            return {"error": f"Failed to create deal: {str(e)}"}
    
    @mcp.tool()
    def move_deal_to_stage(deal_id: int, stage_id: int) -> Dict[str, Any]:
        """Move a deal to a different pipeline stage."""
        try:
            mcp.check_permission('deal', 'update')
            org_id = mcp.get_organization_id()
            
            deal = Deal.objects.get(id=deal_id, organization_id=org_id)
            stage = PipelineStage.objects.get(id=stage_id, pipeline=deal.pipeline)
            
            deal.stage = stage
            deal.probability = stage.probability
            
            # Handle closed-won
            if stage.is_closed_won:
                from django.utils import timezone
                deal.is_won = True
                deal.is_lost = False
                deal.actual_close_date = timezone.now().date()
                deal.status = 'closed'
            
            deal.save()
            serializer = DealSerializer(deal)
            
            return {
                "success": True,
                "message": f"Deal moved to {stage.name}",
                "deal": serializer.data
            }
            
        except PermissionError as e:
            return {"error": str(e)}
        except (Deal.DoesNotExist, PipelineStage.DoesNotExist) as e:
            return {"error": "Deal or stage not found"}
        except Exception as e:
            logger.error(f"Error moving deal: {str(e)}", exc_info=True)
            return {"error": f"Failed to move deal: {str(e)}"}
    
    @mcp.tool()
    def mark_deal_won(deal_id: int) -> Dict[str, Any]:
        """Mark a deal as won."""
        try:
            mcp.check_permission('deal', 'update')
            org_id = mcp.get_organization_id()
            
            from django.utils import timezone
            deal = Deal.objects.get(id=deal_id, organization_id=org_id)
            deal.is_won = True
            deal.is_lost = False
            deal.actual_close_date = timezone.now().date()
            deal.status = 'closed'
            deal.save()
            
            serializer = DealSerializer(deal)
            return {
                "success": True,
                "message": f"Deal marked as won",
                "deal": serializer.data
            }
            
        except PermissionError as e:
            return {"error": str(e)}
        except Deal.DoesNotExist:
            return {"error": "Deal not found"}
        except Exception as e:
            return {"error": f"Failed to mark deal as won: {str(e)}"}
    
    @mcp.tool()
    def mark_deal_lost(deal_id: int, reason: Optional[str] = None) -> Dict[str, Any]:
        """Mark a deal as lost."""
        try:
            mcp.check_permission('deal', 'update')
            org_id = mcp.get_organization_id()
            
            from django.utils import timezone
            deal = Deal.objects.get(id=deal_id, organization_id=org_id)
            deal.is_won = False
            deal.is_lost = True
            deal.lost_reason = reason or ''
            deal.actual_close_date = timezone.now().date()
            deal.status = 'closed'
            deal.save()
            
            serializer = DealSerializer(deal)
            return {
                "success": True,
                "message": "Deal marked as lost",
                "deal": serializer.data
            }
            
        except PermissionError as e:
            return {"error": str(e)}
        except Deal.DoesNotExist:
            return {"error": "Deal not found"}
        except Exception as e:
            return {"error": f"Failed to mark deal as lost: {str(e)}"}
    
    @mcp.tool()
    def get_deal_stats() -> Dict[str, Any]:
        """Get deal statistics for the current organization."""
        try:
            mcp.check_permission('deal', 'read')
            org_id = mcp.get_organization_id()
            
            from django.db.models import Sum
            queryset = Deal.objects.filter(organization_id=org_id)
            
            total_value = queryset.aggregate(total=Sum('value'))['total'] or 0
            
            stats = {
                'total_deals': queryset.count(),
                'total_value': float(total_value),
                'won': queryset.filter(is_won=True).count(),
                'lost': queryset.filter(is_lost=True).count(),
                'open': queryset.filter(is_won=False, is_lost=False).count(),
                'by_priority': {
                    'low': queryset.filter(priority='low').count(),
                    'medium': queryset.filter(priority='medium').count(),
                    'high': queryset.filter(priority='high').count(),
                    'urgent': queryset.filter(priority='urgent').count(),
                }
            }
            
            return stats
            
        except PermissionError as e:
            return {"error": str(e)}
        except Exception as e:
            return {"error": f"Failed to get deal stats: {str(e)}"}
    
    @mcp.tool()
    def list_pipelines() -> List[Dict[str, Any]]:
        """List all pipelines for the organization."""
        try:
            mcp.check_permission('deal', 'read')
            org_id = mcp.get_organization_id()
            
            from crmApp.serializers import PipelineSerializer
            pipelines = Pipeline.objects.filter(
                organization_id=org_id,
                is_active=True
            ).prefetch_related('stages')
            
            serializer = PipelineSerializer(pipelines, many=True)
            return serializer.data
            
        except PermissionError as e:
            return {"error": str(e)}
        except Exception as e:
            return {"error": f"Failed to list pipelines: {str(e)}"}
    
    logger.info("Deal tools registered")

