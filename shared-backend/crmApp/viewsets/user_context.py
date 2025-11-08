"""
User permissions and context ViewSet
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from crmApp.utils import PermissionChecker


class UserContextViewSet(viewsets.ViewSet):
    """
    ViewSet for user context and permissions.
    Provides endpoints to get current user's permissions and context.
    """
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def permissions(self, request):
        """
        Get user's permissions for a specific organization.
        
        Query params:
            - organization (required): Organization ID
        
        Returns:
            {
                "organization_id": 1,
                "is_owner": false,
                "is_employee": true,
                "role": "Support",
                "permissions": [
                    "customer.read",
                    "customer.create",
                    "deal.read"
                ],
                "grouped_permissions": {
                    "customer": ["read", "create"],
                    "deal": ["read"]
                }
            }
        """
        organization_id = request.query_params.get('organization')
        
        if not organization_id:
            return Response(
                {'error': 'organization parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        from crmApp.models import Organization, Employee
        
        try:
            organization = Organization.objects.get(id=organization_id)
        except Organization.DoesNotExist:
            return Response(
                {'error': 'Organization not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        checker = PermissionChecker(request.user, organization)
        permissions = checker.get_all_permissions()
        
        # Group permissions by resource
        grouped = {}
        for perm in permissions:
            if '.' in perm:
                resource, action = perm.split('.', 1)
                if resource not in grouped:
                    grouped[resource] = []
                grouped[resource].append(action)
        
        # Get employee info
        employee = Employee.objects.filter(
            user=request.user,
            organization=organization,
            status='active'
        ).select_related('role').first()
        
        return Response({
            'organization_id': organization.id,
            'organization_name': organization.name,
            'is_owner': checker.is_owner(),
            'is_employee': employee is not None,
            'role': employee.role.name if employee and employee.role else None,
            'role_id': employee.role.id if employee and employee.role else None,
            'permissions': permissions,
            'grouped_permissions': grouped,
        })
    
    @action(detail=False, methods=['post'])
    def check_permission(self, request):
        """
        Check if user has specific permission(s).
        
        Request body:
            {
                "organization": 1,
                "resource": "customer",
                "action": "create"
            }
        
        OR
        
            {
                "organization": 1,
                "permissions": ["customer.create", "customer.read"]
            }
        
        Returns:
            {
                "has_permission": true,
                "permission": "customer.create"
            }
        
        OR for multiple permissions:
            {
                "permissions_check": {
                    "customer.create": true,
                    "customer.read": true,
                    "customer.delete": false
                }
            }
        """
        organization_id = request.data.get('organization')
        
        if not organization_id:
            return Response(
                {'error': 'organization is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        from crmApp.models import Organization
        
        try:
            organization = Organization.objects.get(id=organization_id)
        except Organization.DoesNotExist:
            return Response(
                {'error': 'Organization not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        checker = PermissionChecker(request.user, organization)
        
        # Check single permission
        resource = request.data.get('resource')
        action = request.data.get('action')
        
        if resource and action:
            has_perm = checker.has_permission(resource, action)
            return Response({
                'has_permission': has_perm,
                'permission': f'{resource}.{action}'
            })
        
        # Check multiple permissions
        permissions = request.data.get('permissions', [])
        
        if not permissions:
            return Response(
                {'error': 'Either resource+action or permissions array is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        result = {}
        for perm in permissions:
            if '.' in perm:
                res, act = perm.split('.', 1)
                result[perm] = checker.has_permission(res, act)
            else:
                result[perm] = False
        
        return Response({
            'permissions_check': result
        })
