"""
Activity Management Tools for MCP Server
Provides tools for activity logging and tracking with RBAC
"""

import logging
from typing import Optional, List, Dict, Any
from crmApp.models import Activity, Employee, AuditLog, JitsiCallSession
from crmApp.serializers import ActivitySerializer, ActivityListSerializer
from crmApp.serializers.audit_log import AuditLogListSerializer
from crmApp.serializers.jitsi import JitsiCallSessionSerializer

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
            
            from django.db.models import Q
            
            # 1. Get regular activities
            activities_queryset = Activity.objects.filter(organization_id=org_id)
            
            # Apply filters to activities
            if activity_type:
                activities_queryset = activities_queryset.filter(activity_type=activity_type)
            
            if status:
                activities_queryset = activities_queryset.filter(status=status)
            
            if customer_id:
                activities_queryset = activities_queryset.filter(customer_id=customer_id)
            
            if lead_id:
                activities_queryset = activities_queryset.filter(lead_id=lead_id)
            
            if deal_id:
                activities_queryset = activities_queryset.filter(deal_id=deal_id)
            
            if assigned_to:
                activities_queryset = activities_queryset.filter(assigned_to_id=assigned_to)
            
            if search:
                activities_queryset = activities_queryset.filter(
                    Q(title__icontains=search) |
                    Q(description__icontains=search) |
                    Q(customer_name__icontains=search)
                )
            
            activities_queryset = activities_queryset.select_related(
                'customer', 'lead', 'deal', 'assigned_to', 'created_by'
            ).order_by('-created_at')
            
            # 2. Get audit logs (convert to activity format)
            audit_logs_queryset = AuditLog.objects.filter(organization_id=org_id)
            
            if search:
                audit_logs_queryset = audit_logs_queryset.filter(
                    Q(description__icontains=search) |
                    Q(resource_name__icontains=search) |
                    Q(user_email__icontains=search)
                )
            
            audit_logs_queryset = audit_logs_queryset.select_related(
                'user', 'related_customer', 'related_lead', 'related_deal'
            ).order_by('-created_at')
            
            # 3. Get video calls (convert to activity format)
            video_calls_queryset = JitsiCallSession.objects.filter(organization_id=org_id)
            
            if activity_type:
                # Filter video calls if activity_type is 'call'
                if activity_type != 'call':
                    video_calls_queryset = video_calls_queryset.none()
            
            if status:
                # Map activity status to call status
                status_map = {
                    'scheduled': ['pending', 'ringing'],
                    'in_progress': ['active'],
                    'completed': ['completed'],
                    'cancelled': ['cancelled', 'rejected', 'missed', 'failed']
                }
                if status in status_map:
                    video_calls_queryset = video_calls_queryset.filter(status__in=status_map[status])
            
            if search:
                video_calls_queryset = video_calls_queryset.filter(
                    Q(room_name__icontains=search) |
                    Q(notes__icontains=search)
                )
            
            video_calls_queryset = video_calls_queryset.select_related(
                'initiator', 'recipient', 'organization'
            ).order_by('-created_at')
            
            # Serialize all three types
            activities_serializer = ActivityListSerializer(activities_queryset, many=True)
            activities_list = list(activities_serializer.data)
            
            audit_logs_serializer = AuditLogListSerializer(audit_logs_queryset, many=True)
            audit_logs_list = list(audit_logs_serializer.data)
            
            video_calls_serializer = JitsiCallSessionSerializer(video_calls_queryset, many=True)
            video_calls_list = list(video_calls_serializer.data)
            
            # Convert audit logs to activity format (matching frontend conversion)
            audit_logs_as_activities = []
            for log in audit_logs_list:
                # Skip if activity_type filter excludes 'note'
                if activity_type and activity_type != 'note':
                    continue
                
                audit_logs_as_activities.append({
                    'id': f"audit-{log['id']}",  # Prefix to avoid ID collision
                    'activity_type': 'note',
                    'title': log.get('description') or f"{log.get('action_display', '')} {log.get('resource_type_display', '')}",
                    'description': log.get('resource_name') or log.get('description', ''),
                    'customer_name': log.get('user_email', 'System'),
                    'status': 'completed',  # Audit logs are always completed
                    'created_at': log['created_at'],
                    'updated_at': log.get('updated_at', log['created_at']),
                    'scheduled_at': log['created_at'],
                    'completed_at': log['created_at'],
                    'organization': org_id,  # Use org_id from context (AuditLogListSerializer doesn't include organization field)
                    'created_by': log.get('user'),
                    'assigned_to': None,
                })
            
            # Convert video calls to activity format (matching frontend conversion)
            call_status_map = {
                'pending': 'scheduled',
                'ringing': 'scheduled',
                'active': 'in_progress',
                'completed': 'completed',
                'missed': 'cancelled',
                'rejected': 'cancelled',
                'cancelled': 'cancelled',
                'failed': 'cancelled',
            }
            
            video_calls_as_activities = []
            for call in video_calls_list:
                call_status = call_status_map.get(call.get('status', 'completed'), 'completed')
                
                # Skip if status filter doesn't match
                if status and call_status != status:
                    continue
                
                recipient_name = call.get('recipient_name') or call.get('initiator_name', 'Unknown')
                call_title = f"{call.get('call_type', 'audio').title()} Call"
                if call.get('status') == 'completed':
                    call_title += f" with {recipient_name}"
                else:
                    call_title += f" to {recipient_name}"
                
                    video_calls_as_activities.append({
                        'id': call['id'],
                        'activity_type': 'call',
                        'title': call_title,
                        'description': call.get('notes') or f"{call.get('call_type', 'audio')} call - {call.get('status', '')}{(' (' + call.get('duration_formatted', '') + ')') if call.get('duration_formatted') else ''}",
                        'customer_name': recipient_name,
                        'status': call_status,
                        'created_at': call['created_at'],
                        'updated_at': call.get('updated_at', call['created_at']),
                        'scheduled_at': call.get('started_at') or call['created_at'],
                        'completed_at': call.get('ended_at'),
                        'organization': call.get('organization', org_id),  # Use org_id as fallback
                        'created_by': call.get('initiator'),
                        'assigned_to': call.get('recipient'),
                    })
            
            # Merge all activities
            all_activities = activities_list + audit_logs_as_activities + video_calls_as_activities
            
            # Sort by creation date (newest first)
            all_activities.sort(key=lambda x: x.get('created_at', ''), reverse=True)
            
            # Apply limit
            limit = min(limit, 100)  # Cap at 100
            result = all_activities[:limit]
            
            logger.info(f"Retrieved {len(result)} activities for org {org_id} (Regular: {len(activities_list)}, Audit Logs: {len(audit_logs_as_activities)}, Video Calls: {len(video_calls_as_activities)})")
            return result
            
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
        phone_number: Optional[str] = None,
        call_duration: Optional[int] = None,
        email_subject: Optional[str] = None,
        email_body: Optional[str] = None,
        meeting_location: Optional[str] = None,
        meeting_url: Optional[str] = None,
        task_priority: Optional[str] = None,
        task_due_date: Optional[str] = None,
        duration_minutes: Optional[int] = None
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
            phone_number: Phone number (for call activities)
            call_duration: Call duration in seconds (for call activities)
            email_subject: Email subject (for email activities)
            email_body: Email body (for email activities)
            meeting_location: Meeting location (for meeting activities)
            meeting_url: Meeting URL (for meeting activities)
            task_priority: Task priority - low, medium, high (for task activities)
            task_due_date: Task due date (ISO format, for task activities)
            duration_minutes: Activity duration in minutes
        
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
            
            # Add activity-specific fields
            if phone_number:
                activity_data['phone_number'] = phone_number
            if call_duration is not None:
                activity_data['call_duration'] = call_duration
            if email_subject:
                activity_data['email_subject'] = email_subject
            if email_body:
                activity_data['email_body'] = email_body
            if meeting_location:
                activity_data['meeting_location'] = meeting_location
            if meeting_url:
                activity_data['meeting_url'] = meeting_url
            if task_priority:
                activity_data['task_priority'] = task_priority
            if task_due_date:
                from django.utils.dateparse import parse_date
                parsed_date = parse_date(task_due_date)
                if parsed_date:
                    activity_data['task_due_date'] = parsed_date
                else:
                    return {"error": "Invalid task_due_date format. Use ISO date format (e.g., 2024-01-15)"}
            if duration_minutes is not None:
                activity_data['duration_minutes'] = duration_minutes
            
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
        phone_number: Optional[str] = None,
        call_duration: Optional[int] = None,
        email_subject: Optional[str] = None,
        email_body: Optional[str] = None,
        meeting_location: Optional[str] = None,
        meeting_url: Optional[str] = None,
        task_priority: Optional[str] = None,
        task_due_date: Optional[str] = None,
        duration_minutes: Optional[int] = None
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
            phone_number: Update phone number (for call activities)
            call_duration: Update call duration in seconds (for call activities)
            email_subject: Update email subject (for email activities)
            email_body: Update email body (for email activities)
            meeting_location: Update meeting location (for meeting activities)
            meeting_url: Update meeting URL (for meeting activities)
            task_priority: Update task priority - low, medium, high (for task activities)
            task_due_date: Update task due date (ISO format, for task activities)
            duration_minutes: Update activity duration in minutes
        
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
            if phone_number is not None:
                activity.phone_number = phone_number
            if call_duration is not None:
                activity.call_duration = call_duration
            if email_subject is not None:
                activity.email_subject = email_subject
            if email_body is not None:
                activity.email_body = email_body
            if meeting_location is not None:
                activity.meeting_location = meeting_location
            if meeting_url is not None:
                activity.meeting_url = meeting_url
            if task_priority is not None:
                activity.task_priority = task_priority
            if task_due_date is not None:
                from django.utils.dateparse import parse_date
                parsed_date = parse_date(task_due_date)
                if parsed_date:
                    activity.task_due_date = parsed_date
                else:
                    return {"error": "Invalid task_due_date format. Use ISO date format"}
            if duration_minutes is not None:
                activity.duration_minutes = duration_minutes
            
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

