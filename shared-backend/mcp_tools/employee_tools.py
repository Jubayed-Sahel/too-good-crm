"""
Employee Management Tools for MCP Server
"""

import logging
from typing import Optional, List, Dict, Any
from crmApp.models import Employee
from crmApp.serializers import EmployeeSerializer

logger = logging.getLogger(__name__)

def register_employee_tools(mcp):
    """Register all employee-related tools"""
    
    @mcp.tool()
    def list_employees(
        status: str = "active",
        search: Optional[str] = None,
        limit: int = 20
    ) -> List[Dict[str, Any]]:
        """
        List employees in the organization.
        
        Args:
            status: Filter by status (active, inactive, all)
            search: Search by name or email
            limit: Maximum results
        
        Returns:
            List of employee objects
        """
        try:
            mcp.check_permission('employee', 'read')
            org_id = mcp.get_organization_id()
            
            queryset = Employee.objects.filter(organization_id=org_id)
            
            if status and status.lower() != 'all':
                queryset = queryset.filter(status=status)
            
            if search:
                from django.db.models import Q
                queryset = queryset.filter(
                    Q(first_name__icontains=search) |
                    Q(last_name__icontains=search) |
                    Q(email__icontains=search)
                )
            
            limit = min(limit, 100)
            queryset = queryset.select_related('user')[:limit]
            
            serializer = EmployeeSerializer(queryset, many=True)
            logger.info(f"Retrieved {len(serializer.data)} employees for org {org_id}")
            return serializer.data
            
        except PermissionError as e:
            return {"error": str(e)}
        except Exception as e:
            logger.error(f"Error listing employees: {str(e)}", exc_info=True)
            return {"error": f"Failed to list employees: {str(e)}"}
    
    @mcp.tool()
    def get_employee(employee_id: int) -> Dict[str, Any]:
        """
        Get detailed information about a specific employee.
        
        Args:
            employee_id: The ID of the employee to retrieve
        
        Returns:
            Employee object with full details
        """
        try:
            mcp.check_permission('employee', 'read')
            org_id = mcp.get_organization_id()
            
            employee = Employee.objects.select_related('user', 'organization').get(
                id=employee_id,
                organization_id=org_id
            )
            
            serializer = EmployeeSerializer(employee)
            logger.info(f"Retrieved employee {employee_id} for org {org_id}")
            return serializer.data
            
        except PermissionError as e:
            return {"error": str(e)}
        except Employee.DoesNotExist:
            return {"error": f"Employee with ID {employee_id} not found"}
        except Exception as e:
            logger.error(f"Error getting employee {employee_id}: {str(e)}", exc_info=True)
            return {"error": f"Failed to get employee: {str(e)}"}
    
    logger.info("Employee tools registered")

