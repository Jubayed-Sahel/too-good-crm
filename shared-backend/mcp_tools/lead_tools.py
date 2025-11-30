"""
Lead Management Tools for MCP Server
Provides tools for lead operations with RBAC
"""

import logging
from typing import Optional, List, Dict, Any
from crmApp.models import Lead, Employee, PipelineStage, LeadStageHistory
from crmApp.serializers import LeadSerializer, LeadListSerializer

logger = logging.getLogger(__name__)

def register_lead_tools(mcp):
    """Register all lead-related tools"""
    
    @mcp.tool()
    def list_leads(
        status: str = "active",
        qualification_status: Optional[str] = None,
        source: Optional[str] = None,
        search: Optional[str] = None,
        assigned_to: Optional[int] = None,
        is_converted: Optional[bool] = None,
        limit: int = 20
    ) -> List[Dict[str, Any]]:
        """
        List leads with filtering options.
        
        Args:
            status: Filter by status (active, inactive, all)
            qualification_status: Filter by qualification (new, contacted, qualified, unqualified, lost)
            source: Filter by lead source (website, referral, social, email, etc.)
            search: Search by name, email, or organization
            assigned_to: Filter by assigned employee ID
            is_converted: Filter by conversion status (true/false)
            limit: Maximum number of results (default: 20, max: 100)
        
        Returns:
            List of lead objects
        """
        try:
            mcp.check_permission('lead', 'read')
            org_id = mcp.get_organization_id()
            
            if not org_id:
                return {"error": "No organization context found"}
            
            queryset = Lead.objects.filter(organization_id=org_id)
            
            if status and status.lower() != 'all':
                queryset = queryset.filter(status=status)
            
            if qualification_status:
                queryset = queryset.filter(qualification_status=qualification_status)
            
            if source:
                queryset = queryset.filter(source=source)
            
            if assigned_to:
                queryset = queryset.filter(assigned_to_id=assigned_to)
            
            if is_converted is not None:
                queryset = queryset.filter(is_converted=is_converted)
            
            if search:
                from django.db.models import Q
                queryset = queryset.filter(
                    Q(name__icontains=search) |
                    Q(email__icontains=search) |
                    Q(organization_name__icontains=search)
                )
            
            limit = min(limit, 100)
            queryset = queryset.select_related('assigned_to')[:limit]
            
            serializer = LeadListSerializer(queryset, many=True)
            logger.info(f"Retrieved {len(serializer.data)} leads for org {org_id}")
            return serializer.data
            
        except PermissionError as e:
            return {"error": str(e)}
        except Exception as e:
            logger.error(f"Error listing leads: {str(e)}", exc_info=True)
            return {"error": f"Failed to list leads: {str(e)}"}
    
    @mcp.tool()
    def get_lead(lead_id: int) -> Dict[str, Any]:
        """
        Get detailed information about a specific lead.
        
        Args:
            lead_id: The ID of the lead to retrieve
        
        Returns:
            Lead object with full details
        """
        try:
            mcp.check_permission('lead', 'read')
            org_id = mcp.get_organization_id()
            
            lead = Lead.objects.select_related('assigned_to', 'organization').get(
                id=lead_id,
                organization_id=org_id
            )
            
            serializer = LeadSerializer(lead)
            logger.info(f"Retrieved lead {lead_id} for org {org_id}")
            return serializer.data
            
        except PermissionError as e:
            return {"error": str(e)}
        except Lead.DoesNotExist:
            return {"error": f"Lead with ID {lead_id} not found"}
        except Exception as e:
            logger.error(f"Error getting lead {lead_id}: {str(e)}", exc_info=True)
            return {"error": f"Failed to get lead: {str(e)}"}
    
    @mcp.tool()
    def create_lead(
        name: str,
        email: Optional[str] = None,
        phone: Optional[str] = None,
        organization_name: Optional[str] = None,
        source: str = "website",
        estimated_value: Optional[float] = None,
        notes: Optional[str] = None,
        assigned_to: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Create a new lead.
        
        Args:
            name: Full name of the lead (required)
            email: Email address
            phone: Phone number
            organization_name: Company/organization name
            source: Lead source (website, referral, social, email, etc.)
            estimated_value: Estimated deal value
            notes: Additional notes
            assigned_to: Employee ID to assign lead to
        
        Returns:
            Created lead object
        """
        try:
            mcp.check_permission('lead', 'create')
            org_id = mcp.get_organization_id()
            
            if not org_id:
                return {"error": "No organization context found"}
            
            lead_data = {
                'organization_id': org_id,
                'name': name,
                'email': email,
                'phone': phone,
                'organization_name': organization_name,
                'source': source,
                'estimated_value': estimated_value,
                'notes': notes,
                'status': 'active',
                'qualification_status': 'new',
                'lead_score': 0
            }
            
            if assigned_to:
                try:
                    employee = Employee.objects.get(id=assigned_to, organization_id=org_id)
                    lead_data['assigned_to_id'] = assigned_to
                except Employee.DoesNotExist:
                    return {"error": f"Employee {assigned_to} not found in your organization"}
            
            lead = Lead.objects.create(**lead_data)
            serializer = LeadSerializer(lead)
            
            logger.info(f"Created lead {lead.id} in org {org_id}")
            return {
                "success": True,
                "message": f"Lead '{name}' created successfully",
                "lead": serializer.data
            }
            
        except PermissionError as e:
            return {"error": str(e)}
        except Exception as e:
            logger.error(f"Error creating lead: {str(e)}", exc_info=True)
            return {"error": f"Failed to create lead: {str(e)}"}
    
    @mcp.tool()
    def update_lead(
        lead_id: int,
        name: Optional[str] = None,
        email: Optional[str] = None,
        phone: Optional[str] = None,
        organization_name: Optional[str] = None,
        source: Optional[str] = None,
        estimated_value: Optional[float] = None,
        notes: Optional[str] = None,
        assigned_to: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Update an existing lead.
        
        Args:
            lead_id: ID of the lead to update (required)
            name: Updated name
            email: Updated email
            phone: Updated phone
            organization_name: Updated organization name
            source: Updated source
            estimated_value: Updated estimated value
            notes: Updated notes
            assigned_to: Updated assigned employee ID
        
        Returns:
            Updated lead object
        """
        try:
            mcp.check_permission('lead', 'update')
            org_id = mcp.get_organization_id()
            
            lead = Lead.objects.get(id=lead_id, organization_id=org_id)
            
            if name is not None:
                lead.name = name
            if email is not None:
                lead.email = email
            if phone is not None:
                lead.phone = phone
            if organization_name is not None:
                lead.organization_name = organization_name
            if source is not None:
                lead.source = source
            if estimated_value is not None:
                lead.estimated_value = estimated_value
            if notes is not None:
                lead.notes = notes
            
            if assigned_to is not None:
                try:
                    employee = Employee.objects.get(id=assigned_to, organization_id=org_id)
                    lead.assigned_to = employee
                except Employee.DoesNotExist:
                    return {"error": f"Employee {assigned_to} not found in your organization"}
            
            lead.save()
            serializer = LeadSerializer(lead)
            
            logger.info(f"Updated lead {lead_id} in org {org_id}")
            return {
                "success": True,
                "message": "Lead updated successfully",
                "lead": serializer.data
            }
            
        except PermissionError as e:
            return {"error": str(e)}
        except Lead.DoesNotExist:
            return {"error": f"Lead with ID {lead_id} not found"}
        except Exception as e:
            logger.error(f"Error updating lead {lead_id}: {str(e)}", exc_info=True)
            return {"error": f"Failed to update lead: {str(e)}"}
    
    @mcp.tool()
    def qualify_lead(lead_id: int) -> Dict[str, Any]:
        """
        Mark a lead as qualified.
        
        Args:
            lead_id: ID of the lead to qualify
        
        Returns:
            Success message with updated lead
        """
        try:
            mcp.check_permission('lead', 'update')
            org_id = mcp.get_organization_id()
            
            lead = Lead.objects.get(id=lead_id, organization_id=org_id)
            lead.qualification_status = 'qualified'
            lead.save()
            
            serializer = LeadSerializer(lead)
            logger.info(f"Qualified lead {lead_id} in org {org_id}")
            return {
                "success": True,
                "message": f"Lead '{lead.name}' marked as qualified",
                "lead": serializer.data
            }
            
        except PermissionError as e:
            return {"error": str(e)}
        except Lead.DoesNotExist:
            return {"error": f"Lead with ID {lead_id} not found"}
        except Exception as e:
            logger.error(f"Error qualifying lead {lead_id}: {str(e)}", exc_info=True)
            return {"error": f"Failed to qualify lead: {str(e)}"}
    
    @mcp.tool()
    def disqualify_lead(lead_id: int, reason: Optional[str] = None) -> Dict[str, Any]:
        """
        Mark a lead as unqualified.
        
        Args:
            lead_id: ID of the lead to disqualify
            reason: Optional reason for disqualification
        
        Returns:
            Success message with updated lead
        """
        try:
            mcp.check_permission('lead', 'update')
            org_id = mcp.get_organization_id()
            
            lead = Lead.objects.get(id=lead_id, organization_id=org_id)
            lead.qualification_status = 'unqualified'
            
            if reason:
                lead.notes = f"Disqualified: {reason}\n\n{lead.notes or ''}"
            
            lead.save()
            
            serializer = LeadSerializer(lead)
            logger.info(f"Disqualified lead {lead_id} in org {org_id}")
            return {
                "success": True,
                "message": f"Lead '{lead.name}' marked as unqualified",
                "lead": serializer.data
            }
            
        except PermissionError as e:
            return {"error": str(e)}
        except Lead.DoesNotExist:
            return {"error": f"Lead with ID {lead_id} not found"}
        except Exception as e:
            logger.error(f"Error disqualifying lead {lead_id}: {str(e)}", exc_info=True)
            return {"error": f"Failed to disqualify lead: {str(e)}"}
    
    @mcp.tool()
    def update_lead_score(lead_id: int, score: int, reason: Optional[str] = None) -> Dict[str, Any]:
        """
        Update the score of a lead.
        
        Args:
            lead_id: ID of the lead
            score: New score (0-100)
            reason: Optional reason for score change
        
        Returns:
            Success message with updated lead
        """
        try:
            mcp.check_permission('lead', 'update')
            org_id = mcp.get_organization_id()
            
            if not 0 <= score <= 100:
                return {"error": "Score must be between 0 and 100"}
            
            lead = Lead.objects.get(id=lead_id, organization_id=org_id)
            old_score = lead.lead_score
            lead.lead_score = score
            
            if reason:
                from django.utils import timezone
                timestamp = timezone.now().strftime('%Y-%m-%d %H:%M:%S')
                score_note = f"[{timestamp}] Score updated: {old_score} → {score}. Reason: {reason}\n"
                lead.notes = score_note + (lead.notes or '')
            
            lead.save()
            
            serializer = LeadSerializer(lead)
            logger.info(f"Updated lead {lead_id} score to {score} in org {org_id}")
            return {
                "success": True,
                "message": f"Lead score updated from {old_score} to {score}",
                "lead": serializer.data
            }
            
        except PermissionError as e:
            return {"error": str(e)}
        except Lead.DoesNotExist:
            return {"error": f"Lead with ID {lead_id} not found"}
        except Exception as e:
            logger.error(f"Error updating lead score {lead_id}: {str(e)}", exc_info=True)
            return {"error": f"Failed to update lead score: {str(e)}"}
    
    @mcp.tool()
    def assign_lead(lead_id: int, employee_id: int) -> Dict[str, Any]:
        """
        Assign a lead to an employee.
        
        Args:
            lead_id: ID of the lead
            employee_id: ID of the employee to assign to
        
        Returns:
            Success message with updated lead
        """
        try:
            mcp.check_permission('lead', 'update')
            org_id = mcp.get_organization_id()
            
            lead = Lead.objects.get(id=lead_id, organization_id=org_id)
            
            try:
                employee = Employee.objects.get(
                    id=employee_id,
                    organization_id=org_id,
                    status='active'
                )
            except Employee.DoesNotExist:
                return {"error": f"Employee {employee_id} not found or not active in your organization"}
            
            lead.assigned_to = employee
            lead.save()
            
            serializer = LeadSerializer(lead)
            logger.info(f"Assigned lead {lead_id} to employee {employee_id} in org {org_id}")
            return {
                "success": True,
                "message": f"Lead assigned to {employee.full_name}",
                "lead": serializer.data
            }
            
        except PermissionError as e:
            return {"error": str(e)}
        except Lead.DoesNotExist:
            return {"error": f"Lead with ID {lead_id} not found"}
        except Exception as e:
            logger.error(f"Error assigning lead {lead_id}: {str(e)}", exc_info=True)
            return {"error": f"Failed to assign lead: {str(e)}"}
    
    @mcp.tool()
    def move_lead_stage(
        lead_id: int,
        stage: str,
        notes: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Move a lead to a different pipeline stage.
        
        Args:
            lead_id: ID of the lead to move
            stage: Stage name or stage ID to move the lead to
            notes: Optional notes about the stage change
        
        Returns:
            Success message with updated lead
        """
        try:
            mcp.check_permission('lead', 'update')
            org_id = mcp.get_organization_id()
            user_id = mcp.get_user_id()
            
            # Get the lead
            lead = Lead.objects.select_related('stage').get(
                id=lead_id,
                organization_id=org_id
            )
            
            # Parse stage parameter - can be ID or name
            new_stage = None
            try:
                # Try to parse as integer ID first
                stage_id = int(stage)
                new_stage = PipelineStage.objects.get(
                    id=stage_id,
                    pipeline__organization_id=org_id
                )
            except (ValueError, TypeError):
                # If not an integer, treat as stage name
                new_stage = PipelineStage.objects.filter(
                    name__iexact=stage,
                    pipeline__organization_id=org_id
                ).first()
            
            if not new_stage:
                return {"error": f"Pipeline stage '{stage}' not found in your organization"}
            
            # Store previous stage for history
            previous_stage = lead.stage
            
            # Update lead stage
            lead.stage = new_stage
            lead.save()
            
            # Create stage history entry
            try:
                employee = Employee.objects.get(user_id=user_id, organization_id=org_id)
                LeadStageHistory.objects.create(
                    lead=lead,
                    organization_id=org_id,
                    stage=new_stage,
                    previous_stage=previous_stage,
                    changed_by=employee,
                    notes=notes
                )
            except Employee.DoesNotExist:
                # If employee not found, still create history without changed_by
                LeadStageHistory.objects.create(
                    lead=lead,
                    organization_id=org_id,
                    stage=new_stage,
                    previous_stage=previous_stage,
                    notes=notes
                )
            
            serializer = LeadSerializer(lead)
            prev_stage_name = previous_stage.name if previous_stage else 'None'
            
            logger.info(f"Moved lead {lead_id} from '{prev_stage_name}' to '{new_stage.name}' in org {org_id}")
            return {
                "success": True,
                "message": f"Lead '{lead.name}' moved from '{prev_stage_name}' to '{new_stage.name}'",
                "lead": serializer.data,
                "stage_change": {
                    "from": prev_stage_name,
                    "to": new_stage.name,
                    "pipeline": new_stage.pipeline.name
                }
            }
            
        except PermissionError as e:
            return {"error": str(e)}
        except Lead.DoesNotExist:
            return {"error": f"Lead with ID {lead_id} not found"}
        except Exception as e:
            logger.error(f"Error moving lead {lead_id} to stage: {str(e)}", exc_info=True)
            return {"error": f"Failed to move lead stage: {str(e)}"}
    
    @mcp.tool()
    def get_pipeline_stages() -> Dict[str, Any]:
        """
        Get all available pipeline stages for leads in the organization.
        
        Returns:
            List of pipeline stages grouped by pipeline
        """
        try:
            mcp.check_permission('lead', 'read')
            org_id = mcp.get_organization_id()
            
            if not org_id:
                return {"error": "No organization context found"}
            
            from crmApp.models import Pipeline
            pipelines = Pipeline.objects.filter(
                organization_id=org_id,
                is_active=True
            ).prefetch_related('stages')
            
            result = []
            stage_names_list = []  # For easy reference
            
            for pipeline in pipelines:
                stages = pipeline.stages.filter(is_active=True).order_by('order')
                stage_list = []
                
                for stage in stages:
                    stage_info = {
                        'id': stage.id,
                        'name': stage.name,
                        'full_name': f"{pipeline.name} - {stage.name}",
                        'order': stage.order,
                        'probability': float(stage.probability),
                        'is_closed_won': stage.is_closed_won,
                        'is_closed_lost': stage.is_closed_lost,
                        'description': stage.description or ''
                    }
                    
                    # Add human-readable status
                    if stage.is_closed_won:
                        stage_info['status'] = 'Closed Won (Deal successful)'
                    elif stage.is_closed_lost:
                        stage_info['status'] = 'Closed Lost (Deal failed)'
                    else:
                        stage_info['status'] = f'Active stage (Win probability: {stage.probability}%)'
                    
                    stage_list.append(stage_info)
                    stage_names_list.append(stage.name)
                
                result.append({
                    'pipeline_id': pipeline.id,
                    'pipeline_name': pipeline.name,
                    'description': pipeline.description or '',
                    'stages': stage_list,
                    'total_stages': len(stage_list)
                })
            
            logger.info(f"Retrieved pipeline stages for org {org_id}")
            return {
                "success": True,
                "pipelines": result,
                "total_pipelines": len(result),
                "all_stage_names": stage_names_list,
                "note": "Use stage 'name' or 'id' when moving leads. For example: 'Qualified', 'Contacted', 'Closed Won', etc."
            }
            
        except PermissionError as e:
            return {"error": str(e)}
        except Exception as e:
            logger.error(f"Error getting pipeline stages: {str(e)}", exc_info=True)
            return {"error": f"Failed to get pipeline stages: {str(e)}"}
    
    @mcp.tool()
    def get_lead_stage_history(lead_id: int) -> Dict[str, Any]:
        """
        Get the stage change history for a specific lead.
        
        Args:
            lead_id: ID of the lead
        
        Returns:
            List of stage changes with timestamps
        """
        try:
            mcp.check_permission('lead', 'read')
            org_id = mcp.get_organization_id()
            
            lead = Lead.objects.get(id=lead_id, organization_id=org_id)
            
            history = LeadStageHistory.objects.filter(
                lead=lead
            ).select_related(
                'stage', 'previous_stage', 'changed_by'
            ).order_by('-created_at')
            
            result = []
            for entry in history:
                result.append({
                    'timestamp': entry.created_at.isoformat(),
                    'from_stage': entry.previous_stage.name if entry.previous_stage else None,
                    'to_stage': entry.stage.name if entry.stage else None,
                    'changed_by': entry.changed_by.full_name if entry.changed_by else 'System',
                    'notes': entry.notes
                })
            
            logger.info(f"Retrieved stage history for lead {lead_id}")
            return {
                "success": True,
                "lead_name": lead.name,
                "current_stage": lead.stage.name if lead.stage else None,
                "history": result
            }
            
        except PermissionError as e:
            return {"error": str(e)}
        except Lead.DoesNotExist:
            return {"error": f"Lead with ID {lead_id} not found"}
        except Exception as e:
            logger.error(f"Error getting lead stage history: {str(e)}", exc_info=True)
            return {"error": f"Failed to get stage history: {str(e)}"}
    
    @mcp.tool()
    def get_lead_stats() -> Dict[str, Any]:
        """
        Get lead statistics for the current organization.
        
        Returns:
            Dictionary with lead statistics (total, by status, conversion rate, etc.)
        """
        try:
            mcp.check_permission('lead', 'read')
            org_id = mcp.get_organization_id()
            
            if not org_id:
                return {"error": "No organization context found"}
            
            from django.db.models import Avg, Sum
            queryset = Lead.objects.filter(organization_id=org_id)
            
            total = queryset.count()
            converted = queryset.filter(is_converted=True).count()
            conversion_rate = (converted / total * 100) if total > 0 else 0
            
            avg_score = queryset.aggregate(avg=Avg('lead_score'))['avg'] or 0
            total_value = queryset.aggregate(total=Sum('estimated_value'))['total'] or 0
            
            stats = {
                'total_leads': total,
                'status_counts': {
                    'new': queryset.filter(qualification_status='new').count(),
                    'contacted': queryset.filter(qualification_status='contacted').count(),
                    'qualified': queryset.filter(qualification_status='qualified').count(),
                    'unqualified': queryset.filter(qualification_status='unqualified').count(),
                    'converted': converted,
                    'lost': queryset.filter(qualification_status='lost').count(),
                },
                'average_score': round(avg_score, 2),
                'total_estimated_value': float(total_value),
                'conversion_rate': round(conversion_rate, 2)
            }
            
            logger.info(f"Retrieved lead stats for org {org_id}")
            return stats
            
        except PermissionError as e:
            return {"error": str(e)}
        except Exception as e:
            logger.error(f"Error getting lead stats: {str(e)}", exc_info=True)
            return {"error": f"Failed to get lead stats: {str(e)}"}
    
    logger.info("Lead tools registered")

