"""
Activity Management Tools for MCP Server
Provides tools for activity logging and tracking with RBAC
"""

import logging
from typing import Optional, List, Dict, Any
from crmApp.models import Activity, Employee
from crmApp.serializers import ActivitySerializer, ActivityListSerializer

logger = logging.getLogger(__name__)

def register_activity_tools(mcp):
    """Register all activity-related tools"""
    
    @mcp.tool()
    def list_activities(
        activity_type: Optional[str] = None,
        status: Optional[str] = None,
        customer_id: Optional[int] = None,
        lead_id: Optional[int] = None,
        deal_id: Optional[int] = None,
        assigned_to: Optional[int] = None,
        search: Optional[str] = None,
        limit: int = 20
    ) -> List[Dict[str, Any]]:
        """
        List activities with filtering options.
        
        Args:
            activity_type: Filter by type (call, email, telegram, meeting, note, task)
            status: Filter by status (scheduled, in_progress, completed, cancelled)
            customer_id: Filter by customer ID
            lead_id: Filter by lead ID
            deal_id: Filter by deal ID
            assigned_to: Filter by assigned employee ID
            search: Search by title or description
            limit: Maximum number of results (default: 20, max: 100)
        
        Returns:
            List of activity objects
        """
        try:
            mcp.check_permission('activity', 'read')
            org_id = mcp.get_organization_id()
            
            if not org_id:
                return {"error": "No organization context found"}
            
            queryset = Activity.objects.filter(organization_id=org_id)
            
            # Apply filters
            if activity_type:
                queryset = queryset.filter(activity_type=activity_type)
            
            if status:
                queryset = queryset.filter(status=status)
            
            if customer_id:
                queryset = queryset.filter(customer_id=customer_id)
            
            if lead_id:
                queryset = queryset.filter(lead_id=lead_id)
            
            if deal_id:
                queryset = queryset.filter(deal_id=deal_id)
            
            if assigned_to:
                queryset = queryset.filter(assigned_to_id=assigned_to)
            
            if search:
                from django.db.models import Q
                queryset = queryset.filter(
                    Q(title__icontains=search) |
                    Q(description__icontains=search) |
                    Q(customer_name__icontains=search)
                )
            
            # Limit results
            limit = min(limit, 100)  # Cap at 100
            queryset = queryset.select_related(
                'customer', 'lead', 'deal', 'assigned_to', 'created_by'
            ).order_by('-created_at')[:limit]
            
            # Serialize
            serializer = ActivityListSerializer(queryset, many=True)
            
            logger.info(f"Retrieved {len(serializer.data)} activities for org {org_id}")
            return serializer.data
            
        except PermissionError as e:
            return {"error": str(e)}
        except Exception as e:
            logger.error(f"Error listing activities: {str(e)}", exc_info=True)
            return {"error": f"Failed to list activities: {str(e)}"}
    
    @mcp.tool()
    def get_activity(activity_id: int) -> Dict[str, Any]:
        """
        Get detailed information about a specific activity.
        
        Args:
            activity_id: The ID of the activity to retrieve
        
        Returns:
            Activity object with full details
        """
        try:
            mcp.check_permission('activity', 'read')
            org_id = mcp.get_organization_id()
            
            activity = Activity.objects.select_related(
                'customer', 'lead', 'deal', 'assigned_to', 'created_by'
            ).get(
                id=activity_id,
                organization_id=org_id
            )
            
            serializer = ActivitySerializer(activity)
            logger.info(f"Retrieved activity {activity_id} for org {org_id}")
            return serializer.data
            
        except Activity.DoesNotExist:
            return {"error": f"Activity {activity_id} not found or access denied"}
        except PermissionError as e:
            return {"error": str(e)}
        except Exception as e:
            logger.error(f"Error getting activity {activity_id}: {str(e)}", exc_info=True)
            return {"error": f"Failed to get activity: {str(e)}"}
    
    @mcp.tool()
    def create_activity(
        activity_type: str,
        title: str,
        description: Optional[str] = None,
        customer_id: Optional[int] = None,
        lead_id: Optional[int] = None,
        deal_id: Optional[int] = None,
        assigned_to: Optional[int] = None,
        status: str = "scheduled",
        scheduled_at: Optional[str] = None,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Create a new activity.
        
        Args:
            activity_type: Type of activity (call, email, telegram, meeting, note, task)
            title: Activity title (required)
            description: Activity description
            customer_id: Related customer ID
            lead_id: Related lead ID
            deal_id: Related deal ID
            assigned_to: Assigned employee ID
            status: Status (scheduled, in_progress, completed, cancelled)
            scheduled_at: Scheduled datetime (ISO format)
            **kwargs: Additional activity-specific fields
        
        Returns:
            Created activity object
        """
        try:
            mcp.check_permission('activity', 'create')
            org_id = mcp.get_organization_id()
            user_id = mcp.get_user_id()
            
            if not org_id:
                return {"error": "No organization context found"}
            
            # Validate activity type
            valid_types = ['call', 'email', 'telegram', 'meeting', 'note', 'task']
            if activity_type not in valid_types:
                return {"error": f"Invalid activity_type. Must be one of: {', '.join(valid_types)}"}
            
            # Build activity data
            activity_data = {
                'organization_id': org_id,
                'activity_type': activity_type,
                'title': title,
                'description': description,
                'status': status,
                'created_by_id': user_id,
            }
            
            # Add relationships
            if customer_id:
                from crmApp.models import Customer
                try:
                    customer = Customer.objects.get(id=customer_id, organization_id=org_id)
                    activity_data['customer_id'] = customer_id
                    activity_data['customer_name'] = customer.name
                except Customer.DoesNotExist:
                    return {"error": f"Customer {customer_id} not found in your organization"}
            
            if lead_id:
                from crmApp.models import Lead
                try:
                    lead = Lead.objects.get(id=lead_id, organization_id=org_id)
                    activity_data['lead_id'] = lead_id
                except Lead.DoesNotExist:
                    return {"error": f"Lead {lead_id} not found in your organization"}
            
            if deal_id:
                from crmApp.models import Deal
                try:
                    deal = Deal.objects.get(id=deal_id, organization_id=org_id)
                    activity_data['deal_id'] = deal_id
                except Deal.DoesNotExist:
                    return {"error": f"Deal {deal_id} not found in your organization"}
            
            if assigned_to:
                try:
                    employee = Employee.objects.get(id=assigned_to, organization_id=org_id)
                    activity_data['assigned_to_id'] = assigned_to
                except Employee.DoesNotExist:
                    return {"error": f"Employee {assigned_to} not found in your organization"}
            
            # Parse scheduled_at if provided
            if scheduled_at:
                from django.utils.dateparse import parse_datetime
                parsed_date = parse_datetime(scheduled_at)
                if parsed_date:
                    activity_data['scheduled_at'] = parsed_date
                else:
                    return {"error": "Invalid scheduled_at format. Use ISO 8601 format (e.g., 2024-01-15T10:30:00Z)"}
            
            # Add activity-specific fields from kwargs
            activity_specific_fields = {
                'phone_number', 'call_duration', 'call_recording_url',
                'email_subject', 'email_body', 'email_attachments',
                'telegram_username', 'telegram_chat_id',
                'meeting_location', 'meeting_url', 'attendees',
                'task_priority', 'task_due_date',
                'video_call_room', 'video_call_url',
                'duration_minutes', 'is_pinned'
            }
            
            for field in activity_specific_fields:
                if field in kwargs:
                    activity_data[field] = kwargs[field]
            
            # Create activity
            activity = Activity.objects.create(**activity_data)
            serializer = ActivitySerializer(activity)
            
            logger.info(f"Created activity {activity.id} in org {org_id}")
            return {
                "success": True,
                "message": f"Activity '{title}' created successfully",
                "activity": serializer.data
            }
            
        except PermissionError as e:
            return {"error": str(e)}
        except Exception as e:
            logger.error(f"Error creating activity: {str(e)}", exc_info=True)
            return {"error": f"Failed to create activity: {str(e)}"}
    
    @mcp.tool()
    def update_activity(
        activity_id: int,
        title: Optional[str] = None,
        description: Optional[str] = None,
        status: Optional[str] = None,
        assigned_to: Optional[int] = None,
        scheduled_at: Optional[str] = None,
        completed_at: Optional[str] = None,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Update an existing activity.
        
        Args:
            activity_id: The ID of the activity to update
            title: Update title
            description: Update description
            status: Update status (scheduled, in_progress, completed, cancelled)
            assigned_to: Update assigned employee ID
            scheduled_at: Update scheduled datetime (ISO format)
            completed_at: Update completed datetime (ISO format)
            **kwargs: Additional fields to update
        
        Returns:
            Updated activity object
        """
        try:
            mcp.check_permission('activity', 'update')
            org_id = mcp.get_organization_id()
            
            activity = Activity.objects.get(
                id=activity_id,
                organization_id=org_id
            )
            
            # Update fields
            if title is not None:
                activity.title = title
            if description is not None:
                activity.description = description
            if status is not None:
                activity.status = status
            if assigned_to is not None:
                try:
                    employee = Employee.objects.get(id=assigned_to, organization_id=org_id)
                    activity.assigned_to_id = assigned_to
                except Employee.DoesNotExist:
                    return {"error": f"Employee {assigned_to} not found in your organization"}
            
            # Parse datetime fields
            if scheduled_at:
                from django.utils.dateparse import parse_datetime
                parsed_date = parse_datetime(scheduled_at)
                if parsed_date:
                    activity.scheduled_at = parsed_date
                else:
                    return {"error": "Invalid scheduled_at format. Use ISO 8601 format"}
            
            if completed_at:
                from django.utils.dateparse import parse_datetime
                parsed_date = parse_datetime(completed_at)
                if parsed_date:
                    activity.completed_at = parsed_date
                else:
                    return {"error": "Invalid completed_at format. Use ISO 8601 format"}
            
            # Update activity-specific fields
            activity_specific_fields = {
                'phone_number', 'call_duration', 'call_recording_url',
                'email_subject', 'email_body', 'email_attachments',
                'telegram_username', 'telegram_chat_id',
                'meeting_location', 'meeting_url', 'attendees',
                'task_priority', 'task_due_date',
                'video_call_room', 'video_call_url',
                'duration_minutes', 'is_pinned'
            }
            
            for field in activity_specific_fields:
                if field in kwargs:
                    setattr(activity, field, kwargs[field])
            
            activity.save()
            serializer = ActivitySerializer(activity)
            
            logger.info(f"Updated activity {activity_id} in org {org_id}")
            return {
                "success": True,
                "message": f"Activity updated successfully",
                "activity": serializer.data
            }
            
        except Activity.DoesNotExist:
            return {"error": f"Activity {activity_id} not found or access denied"}
        except PermissionError as e:
            return {"error": str(e)}
        except Exception as e:
            logger.error(f"Error updating activity {activity_id}: {str(e)}", exc_info=True)
            return {"error": f"Failed to update activity: {str(e)}"}
    
    @mcp.tool()
    def get_activity_stats(
        activity_type: Optional[str] = None,
        customer_id: Optional[int] = None,
        assigned_to: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Get activity statistics for the organization.
        
        Args:
            activity_type: Filter by activity type
            customer_id: Filter by customer ID
            assigned_to: Filter by assigned employee ID
        
        Returns:
            Activity statistics
        """
        try:
            mcp.check_permission('activity', 'read')
            org_id = mcp.get_organization_id()
            
            queryset = Activity.objects.filter(organization_id=org_id)
            
            if activity_type:
                queryset = queryset.filter(activity_type=activity_type)
            if customer_id:
                queryset = queryset.filter(customer_id=customer_id)
            if assigned_to:
                queryset = queryset.filter(assigned_to_id=assigned_to)
            
            total_activities = queryset.count()
            by_type = {}
            by_status = {}
            
            for activity_type_choice in ['call', 'email', 'telegram', 'meeting', 'note', 'task']:
                count = queryset.filter(activity_type=activity_type_choice).count()
                if count > 0:
                    by_type[activity_type_choice] = count
            
            for status_choice in ['scheduled', 'in_progress', 'completed', 'cancelled']:
                count = queryset.filter(status=status_choice).count()
                if count > 0:
                    by_status[status_choice] = count
            
            completed_count = queryset.filter(status='completed').count()
            pending_count = queryset.filter(status__in=['scheduled', 'in_progress']).count()
            
            logger.info(f"Retrieved activity stats for org {org_id}")
            return {
                "total_activities": total_activities,
                "completed": completed_count,
                "pending": pending_count,
                "by_type": by_type,
                "by_status": by_status
            }
            
        except PermissionError as e:
            return {"error": str(e)}
        except Exception as e:
            logger.error(f"Error getting activity stats: {str(e)}", exc_info=True)
            return {"error": f"Failed to get activity stats: {str(e)}"}
    
    logger.info("Activity tools registered")

