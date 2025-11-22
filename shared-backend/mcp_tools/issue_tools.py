"""
Issue Tracking Tools for MCP Server
"""

import logging
from typing import Optional, List, Dict, Any
from crmApp.models import Issue, Employee, IssueComment, Customer
from crmApp.serializers import IssueSerializer, IssueListSerializer

logger = logging.getLogger(__name__)

def register_issue_tools(mcp):
    """Register all issue-related tools"""
    
    @mcp.tool()
    def list_issues(
        status: Optional[str] = None,
        priority: Optional[str] = None,
        category: Optional[str] = None,
        assigned_to: Optional[int] = None,
        is_client_issue: Optional[bool] = None,
        search: Optional[str] = None,
        limit: int = 20
    ) -> List[Dict[str, Any]]:
        """
        List issues with filtering options.
        
        Args:
            status: Filter by status (open, in_progress, resolved, closed)
            priority: Filter by priority (low, medium, high, critical)
            category: Filter by category (quality, delivery, payment, communication, other)
            assigned_to: Filter by assigned employee ID
            is_client_issue: Filter client-raised vs internal issues
            search: Search by title or description
            limit: Maximum results (default: 20, max: 100)
        
        Returns:
            List of issue objects
        """
        try:
            # Check permissions based on role
            role = mcp.get_user_role()
            org_id = mcp.get_organization_id()
            user_id = mcp.get_user_id()
            
            if role == 'customer':
                # Customers can only see their own issues
                queryset = Issue.objects.filter(raised_by_customer__user_id=user_id)
            else:
                mcp.check_permission('issue', 'read')
                queryset = Issue.objects.filter(organization_id=org_id)
            
            if status:
                queryset = queryset.filter(status=status)
            if priority:
                queryset = queryset.filter(priority=priority)
            if category:
                queryset = queryset.filter(category=category)
            if assigned_to:
                queryset = queryset.filter(assigned_to_id=assigned_to)
            if is_client_issue is not None:
                queryset = queryset.filter(is_client_issue=is_client_issue)
            
            if search:
                from django.db.models import Q
                queryset = queryset.filter(
                    Q(title__icontains=search) |
                    Q(description__icontains=search) |
                    Q(issue_number__icontains=search)
                )
            
            limit = min(limit, 100)
            queryset = queryset.select_related('assigned_to', 'raised_by_customer')[:limit]
            
            serializer = IssueListSerializer(queryset, many=True)
            return serializer.data
            
        except PermissionError as e:
            return {"error": str(e)}
        except Exception as e:
            logger.error(f"Error listing issues: {str(e)}", exc_info=True)
            return {"error": f"Failed to list issues: {str(e)}"}
    
    @mcp.tool()
    def get_issue(issue_id: int) -> Dict[str, Any]:
        """Get detailed information about a specific issue."""
        try:
            role = mcp.get_user_role()
            org_id = mcp.get_organization_id()
            user_id = mcp.get_user_id()
            
            issue = Issue.objects.select_related(
                'assigned_to', 'raised_by_customer', 'resolved_by'
            ).get(id=issue_id)
            
            # Check permissions
            if role == 'customer':
                if not (issue.raised_by_customer and issue.raised_by_customer.user_id == user_id):
                    return {"error": "You can only view your own issues"}
            else:
                if issue.organization_id != org_id:
                    return {"error": "Issue not found in your organization"}
            
            serializer = IssueSerializer(issue)
            return serializer.data
            
        except Issue.DoesNotExist:
            return {"error": f"Issue with ID {issue_id} not found"}
        except Exception as e:
            logger.error(f"Error getting issue: {str(e)}", exc_info=True)
            return {"error": f"Failed to get issue: {str(e)}"}
    
    @mcp.tool()
    def create_issue(
        title: str,
        description: str,
        priority: str = "medium",
        category: str = "other"
    ) -> Dict[str, Any]:
        """
        Create a new issue. Only customers can create issues.
        
        Args:
            title: Issue title (required)
            description: Detailed description (required)
            priority: Priority level (low, medium, high, critical)
            category: Issue category (quality, delivery, payment, communication, other)
        
        Returns:
            Created issue object
        """
        try:
            role = mcp.get_user_role()
            org_id = mcp.get_organization_id()
            user_id = mcp.get_user_id()
            
            # Only customers can raise issues
            if role != 'customer':
                return {"error": "Only customers can create issues. Vendors and employees can view and manage existing issues."}
            
            # Get customer record
            try:
                customer = Customer.objects.get(user_id=user_id, organization_id=org_id)
            except Customer.DoesNotExist:
                return {"error": "Customer record not found. Please contact support."}
            
            issue = Issue.objects.create(
                organization_id=org_id,
                title=title,
                description=description,
                priority=priority,
                category=category,
                status='open',
                is_client_issue=True,
                raised_by_customer=customer
            )
            
            serializer = IssueSerializer(issue)
            logger.info(f"Customer {user_id} created issue {issue.id}")
            
            return {
                "success": True,
                "message": f"Issue '{title}' created successfully. Issue number: {issue.issue_number}",
                "issue": serializer.data
            }
            
        except Exception as e:
            logger.error(f"Error creating issue: {str(e)}", exc_info=True)
            return {"error": f"Failed to create issue: {str(e)}"}
    
    @mcp.tool()
    def update_issue(
        issue_id: int,
        title: Optional[str] = None,
        description: Optional[str] = None,
        priority: Optional[str] = None,
        category: Optional[str] = None
    ) -> Dict[str, Any]:
        """Update an existing issue."""
        try:
            role = mcp.get_user_role()
            org_id = mcp.get_organization_id()
            user_id = mcp.get_user_id()
            
            issue = Issue.objects.get(id=issue_id)
            
            # Permission check
            if role == 'customer':
                if not (issue.raised_by_customer and issue.raised_by_customer.user_id == user_id):
                    return {"error": "You can only update your own issues"}
            else:
                if issue.organization_id != org_id:
                    return {"error": "Issue not found in your organization"}
            
            if title is not None:
                issue.title = title
            if description is not None:
                issue.description = description
            if priority is not None:
                issue.priority = priority
            if category is not None:
                issue.category = category
            
            issue.save()
            serializer = IssueSerializer(issue)
            
            return {
                "success": True,
                "message": "Issue updated successfully",
                "issue": serializer.data
            }
            
        except Issue.DoesNotExist:
            return {"error": "Issue not found"}
        except Exception as e:
            logger.error(f"Error updating issue: {str(e)}", exc_info=True)
            return {"error": f"Failed to update issue: {str(e)}"}
    
    @mcp.tool()
    def resolve_issue(issue_id: int, resolution_notes: Optional[str] = None) -> Dict[str, Any]:
        """Resolve an issue. Only vendors and employees can resolve issues."""
        try:
            role = mcp.get_user_role()
            org_id = mcp.get_organization_id()
            user_id = mcp.get_user_id()
            
            if role == 'customer':
                return {"error": "Only vendors and employees can resolve issues"}
            
            issue = Issue.objects.get(id=issue_id, organization_id=org_id)
            
            if issue.status == 'resolved':
                return {"error": "Issue is already resolved"}
            
            from django.utils import timezone
            issue.status = 'resolved'
            issue.resolved_at = timezone.now()
            issue.resolution_notes = resolution_notes or ''
            
            try:
                employee = Employee.objects.get(user_id=user_id, organization_id=org_id)
                issue.resolved_by = employee
            except Employee.DoesNotExist:
                pass
            
            issue.save()
            serializer = IssueSerializer(issue)
            
            return {
                "success": True,
                "message": "Issue resolved successfully",
                "issue": serializer.data
            }
            
        except Issue.DoesNotExist:
            return {"error": "Issue not found"}
        except Exception as e:
            logger.error(f"Error resolving issue: {str(e)}", exc_info=True)
            return {"error": f"Failed to resolve issue: {str(e)}"}
    
    @mcp.tool()
    def reopen_issue(issue_id: int) -> Dict[str, Any]:
        """Reopen a resolved issue. Only vendors and employees can reopen issues."""
        try:
            role = mcp.get_user_role()
            org_id = mcp.get_organization_id()
            
            if role == 'customer':
                return {"error": "Only vendors and employees can reopen issues"}
            
            issue = Issue.objects.get(id=issue_id, organization_id=org_id)
            issue.status = 'open'
            issue.resolved_at = None
            issue.resolved_by = None
            issue.save()
            
            serializer = IssueSerializer(issue)
            return {
                "success": True,
                "message": "Issue reopened successfully",
                "issue": serializer.data
            }
            
        except Issue.DoesNotExist:
            return {"error": "Issue not found"}
        except Exception as e:
            return {"error": f"Failed to reopen issue: {str(e)}"}
    
    @mcp.tool()
    def assign_issue(issue_id: int, employee_id: int) -> Dict[str, Any]:
        """Assign an issue to an employee. Only vendors and employees can assign."""
        try:
            role = mcp.get_user_role()
            org_id = mcp.get_organization_id()
            
            if role == 'customer':
                return {"error": "Only vendors and employees can assign issues"}
            
            issue = Issue.objects.get(id=issue_id, organization_id=org_id)
            employee = Employee.objects.get(id=employee_id, organization_id=org_id, status='active')
            
            issue.assigned_to = employee
            if issue.status == 'open':
                issue.status = 'in_progress'
            issue.save()
            
            serializer = IssueSerializer(issue)
            return {
                "success": True,
                "message": f"Issue assigned to {employee.full_name}",
                "issue": serializer.data
            }
            
        except (Issue.DoesNotExist, Employee.DoesNotExist):
            return {"error": "Issue or employee not found"}
        except Exception as e:
            return {"error": f"Failed to assign issue: {str(e)}"}
    
    @mcp.tool()
    def add_issue_comment(issue_id: int, content: str) -> Dict[str, Any]:
        """Add a comment to an issue."""
        try:
            role = mcp.get_user_role()
            org_id = mcp.get_organization_id()
            user_id = mcp.get_user_id()
            
            issue = Issue.objects.get(id=issue_id)
            
            # Permission check
            if role == 'customer':
                if not (issue.raised_by_customer and issue.raised_by_customer.user_id == user_id):
                    return {"error": "You can only comment on your own issues"}
            else:
                if issue.organization_id != org_id:
                    return {"error": "Issue not found"}
            
            # Determine author name
            if role == 'customer':
                author_name = issue.raised_by_customer.name
            else:
                try:
                    employee = Employee.objects.get(user_id=user_id, organization_id=org_id)
                    author_name = employee.full_name
                except Employee.DoesNotExist:
                    author_name = "Staff"
            
            comment = IssueComment.objects.create(
                issue=issue,
                content=content,
                author_name=author_name
            )
            
            return {
                "success": True,
                "message": "Comment added successfully",
                "comment": {
                    "id": comment.id,
                    "content": comment.content,
                    "author": comment.author_name,
                    "created_at": comment.created_at.isoformat()
                }
            }
            
        except Issue.DoesNotExist:
            return {"error": "Issue not found"}
        except Exception as e:
            logger.error(f"Error adding comment: {str(e)}", exc_info=True)
            return {"error": f"Failed to add comment: {str(e)}"}
    
    @mcp.tool()
    def get_issue_comments(issue_id: int) -> Dict[str, Any]:
        """Get all comments for an issue."""
        try:
            role = mcp.get_user_role()
            org_id = mcp.get_organization_id()
            user_id = mcp.get_user_id()
            
            issue = Issue.objects.get(id=issue_id)
            
            # Permission check
            if role == 'customer':
                if not (issue.raised_by_customer and issue.raised_by_customer.user_id == user_id):
                    return {"error": "You can only view comments on your own issues"}
            else:
                if issue.organization_id != org_id:
                    return {"error": "Issue not found"}
            
            comments = issue.comments.all().order_by('created_at')
            
            comment_data = [{
                "id": c.id,
                "content": c.content,
                "author": c.author_name,
                "created_at": c.created_at.isoformat()
            } for c in comments]
            
            return {
                "count": len(comment_data),
                "comments": comment_data
            }
            
        except Issue.DoesNotExist:
            return {"error": "Issue not found"}
        except Exception as e:
            return {"error": f"Failed to get comments: {str(e)}"}
    
    @mcp.tool()
    def get_issue_stats() -> Dict[str, Any]:
        """Get issue statistics for the organization."""
        try:
            mcp.check_permission('issue', 'read')
            org_id = mcp.get_organization_id()
            
            queryset = Issue.objects.filter(organization_id=org_id)
            
            stats = {
                'total': queryset.count(),
                'by_status': {
                    'open': queryset.filter(status='open').count(),
                    'in_progress': queryset.filter(status='in_progress').count(),
                    'resolved': queryset.filter(status='resolved').count(),
                    'closed': queryset.filter(status='closed').count(),
                },
                'by_priority': {
                    'low': queryset.filter(priority='low').count(),
                    'medium': queryset.filter(priority='medium').count(),
                    'high': queryset.filter(priority='high').count(),
                    'critical': queryset.filter(priority='critical').count(),
                },
                'by_source': {
                    'client_raised': queryset.filter(is_client_issue=True).count(),
                    'internal': queryset.filter(is_client_issue=False).count(),
                }
            }
            
            return stats
            
        except PermissionError as e:
            return {"error": str(e)}
        except Exception as e:
            return {"error": f"Failed to get issue stats: {str(e)}"}
    
    logger.info("Issue tools registered")

