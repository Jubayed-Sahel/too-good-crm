"""
RBAC ViewSets
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db import transaction

from crmApp.models import Permission, Role, RolePermission, UserRole, Employee, User
from crmApp.serializers import (
    PermissionSerializer,
    RoleSerializer,
    RoleCreateSerializer,
    UserRoleSerializer,
)
from crmApp.services import RBACService


class PermissionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Permission management.
    Vendors can create custom permissions for their organization.
    """
    queryset = Permission.objects.all()
    serializer_class = PermissionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filter permissions by organization"""
        try:
            # Get user's organizations
            user_orgs = self.request.user.user_organizations.filter(
                is_active=True
            ).values_list('organization_id', flat=True)
            
            # If user has no organizations, return empty queryset
            if not user_orgs:
                return Permission.objects.none()
            
            # Debug logging
            print(f"[DEBUG] User: {self.request.user.email}")
            print(f"[DEBUG] User organizations: {list(user_orgs)}")
            
            permissions = Permission.objects.filter(organization_id__in=user_orgs)
            print(f"[DEBUG] Found {permissions.count()} permissions")
            
            return permissions
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Error in PermissionViewSet.get_queryset: {str(e)}", exc_info=True)
            return Permission.objects.none()
    
    def perform_create(self, serializer):
        """Ensure permission is created for user's organization"""
        # Get user's primary organization
        user_org = self.request.user.user_organizations.filter(
            is_active=True
        ).first()
        
        if not user_org:
            raise ValueError('User must belong to an organization')
        
        serializer.save(organization=user_org.organization)
    
    @action(detail=False, methods=['get'])
    def by_resource(self, request):
        """Group permissions by resource"""
        try:
            permissions = self.get_queryset()
            grouped = {}
            
            for perm in permissions:
                if perm.resource not in grouped:
                    grouped[perm.resource] = []
                grouped[perm.resource].append(PermissionSerializer(perm).data)
            
            return Response(grouped)
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Error in PermissionViewSet.by_resource: {str(e)}", exc_info=True)
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['get'])
    def available_resources(self, request):
        """Get list of available resources"""
        user_org = request.user.user_organizations.filter(
            is_active=True
        ).first()
        
        if not user_org:
            return Response({'resources': []})
        
        resources = RBACService.get_available_resources(user_org.organization)
        return Response({'resources': resources})
    
    @action(detail=False, methods=['get'])
    def available_actions(self, request):
        """Get list of available actions, optionally filtered by resource"""
        user_org = request.user.user_organizations.filter(
            is_active=True
        ).first()
        
        if not user_org:
            return Response({'actions': []})
        
        resource = request.query_params.get('resource')
        actions = RBACService.get_available_actions(user_org.organization, resource)
        return Response({'actions': actions})
    
    @action(detail=False, methods=['get'])
    def debug_context(self, request):
        """Debug endpoint to check user's organization context and permissions"""
        from crmApp.models import UserOrganization
        
        user = request.user
        user_orgs = UserOrganization.objects.filter(user=user).select_related('organization')
        
        debug_info = {
            'user': {
                'id': user.id,
                'email': user.email,
                'full_name': user.full_name,
            },
            'organizations': [],
            'permissions_count': 0,
            'sample_permissions': []
        }
        
        for uo in user_orgs:
            org_perms = Permission.objects.filter(organization=uo.organization)
            debug_info['organizations'].append({
                'id': uo.organization.id,
                'name': uo.organization.name,
                'slug': uo.organization.slug,
                'is_active': uo.is_active,
                'is_owner': uo.is_owner,
                'permissions_count': org_perms.count(),
            })
        
        # Get active organizations
        active_orgs = user_orgs.filter(is_active=True)
        if active_orgs.exists():
            active_org_ids = [uo.organization_id for uo in active_orgs]
            all_perms = Permission.objects.filter(organization_id__in=active_org_ids)
            debug_info['permissions_count'] = all_perms.count()
            
            # Get sample permissions
            sample = all_perms[:10]
            debug_info['sample_permissions'] = [
                {
                    'id': p.id,
                    'resource': p.resource,
                    'action': p.action,
                    'description': p.description,
                    'organization_id': p.organization_id,
                }
                for p in sample
            ]
        
        return Response(debug_info)
    
    @action(detail=False, methods=['post'])
    def fix_missing_permissions(self, request):
        """Create missing default permissions for user's organizations"""
        from crmApp.models import UserOrganization, Organization
        from crmApp.serializers.organization import OrganizationCreateSerializer
        
        user = request.user
        user_orgs = UserOrganization.objects.filter(
            user=user,
            is_active=True
        ).select_related('organization')
        
        if not user_orgs.exists():
            return Response(
                {'error': 'No active organization found'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        results = []
        total_created = 0
        
        for uo in user_orgs:
            org = uo.organization
            existing_count = Permission.objects.filter(organization=org).count()
            
            if existing_count == 0:
                # Create default permissions
                serializer = OrganizationCreateSerializer()
                serializer._create_default_permissions(org)
                
                new_count = Permission.objects.filter(organization=org).count()
                total_created += new_count
                
                results.append({
                    'organization_id': org.id,
                    'organization_name': org.name,
                    'permissions_created': new_count,
                    'status': 'created'
                })
            else:
                results.append({
                    'organization_id': org.id,
                    'organization_name': org.name,
                    'existing_permissions': existing_count,
                    'status': 'skipped'
                })
        
        return Response({
            'message': f'Successfully created {total_created} permissions',
            'total_created': total_created,
            'organizations': results
        })


class RoleViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Role management.
    Vendors can create custom roles and assign permissions.
    """
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return RoleCreateSerializer
        return RoleSerializer
    
    def get_queryset(self):
        """Filter roles by organization and query parameters"""
        try:
            user_orgs = self.request.user.user_organizations.filter(
                is_active=True
            ).values_list('organization_id', flat=True)
            
            # If user has no organizations, return empty queryset
            if not user_orgs:
                import logging
                logger = logging.getLogger(__name__)
                logger.warning(f"User {self.request.user.email} has no active organizations")
                return Role.objects.none()
            
            queryset = Role.objects.filter(
                organization_id__in=user_orgs
            ).prefetch_related('role_permissions__permission')
            
            # Filter by is_active if provided in query params
            is_active_param = self.request.query_params.get('is_active')
            if is_active_param is not None:
                is_active = is_active_param.lower() in ('true', '1', 'yes')
                queryset = queryset.filter(is_active=is_active)
            
            # Filter by organization if provided in query params (for specific org filtering)
            org_param = self.request.query_params.get('organization')
            if org_param:
                try:
                    org_id = int(org_param)
                    # Only filter if the org_id is in user's accessible orgs
                    if org_id in user_orgs:
                        queryset = queryset.filter(organization_id=org_id)
                except (ValueError, TypeError):
                    pass  # Ignore invalid org_id
            
            # Search filter if provided
            search_param = self.request.query_params.get('search')
            if search_param:
                queryset = queryset.filter(
                    name__icontains=search_param
                ) | queryset.filter(
                    description__icontains=search_param
                )
            
            # Debug logging
            import logging
            logger = logging.getLogger(__name__)
            logger.debug(f"User {self.request.user.email} has access to organizations: {list(user_orgs)}")
            logger.debug(f"Found {queryset.count()} roles for user")
            
            return queryset
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Error in RoleViewSet.get_queryset: {str(e)}", exc_info=True)
            return Role.objects.none()
    
    def perform_create(self, serializer):
        """Create role for user's organization"""
        user_org = self.request.user.user_organizations.filter(
            is_active=True
        ).first()
        
        if not user_org:
            raise ValueError('User must belong to an organization')
        
        # Auto-generate slug from name
        from django.utils.text import slugify
        name = serializer.validated_data.get('name')
        base_slug = slugify(name)
        slug = base_slug
        
        # Ensure slug is unique within organization
        counter = 1
        while Role.objects.filter(
            organization=user_org.organization,
            slug=slug
        ).exists():
            slug = f"{base_slug}-{counter}"
            counter += 1
        
        # Add organization and slug to validated_data so they're available in create()
        serializer.validated_data['organization'] = user_org.organization
        serializer.validated_data['slug'] = slug
        
        serializer.save()
    
    def create(self, request, *args, **kwargs):
        """Override create to return full role object"""
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            
            # Return full role using RoleSerializer
            role = serializer.instance
            response_serializer = RoleSerializer(role)
            headers = self.get_success_headers(response_serializer.data)
            return Response(
                response_serializer.data,
                status=status.HTTP_201_CREATED,
                headers=headers
            )
        except ValueError as e:
            # Handle organization-related errors
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            # Handle any other unexpected errors
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Error creating role: {str(e)}", exc_info=True)
            return Response(
                {'error': f'Failed to create role: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['post'])
    def assign_permission(self, request, pk=None):
        """Assign a permission to a role"""
        role = self.get_object()
        permission_id = request.data.get('permission_id')
        
        if not permission_id:
            return Response(
                {'error': 'permission_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            permission = Permission.objects.get(
                id=permission_id,
                organization=role.organization
            )
            
            role_perm, created = RolePermission.objects.get_or_create(
                role=role,
                permission=permission
            )
            
            return Response({
                'message': 'Permission assigned successfully.',
                'created': created
            })
        except Permission.DoesNotExist:
            return Response(
                {'error': 'Permission not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['post'])
    def remove_permission(self, request, pk=None):
        """Remove a permission from a role"""
        role = self.get_object()
        permission_id = request.data.get('permission_id')
        
        if not permission_id:
            return Response(
                {'error': 'permission_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        deleted_count, _ = RolePermission.objects.filter(
            role=role,
            permission_id=permission_id
        ).delete()
        
        return Response({
            'message': 'Permission removed successfully.',
            'removed': deleted_count > 0
        })
    
    @action(detail=True, methods=['post'])
    @transaction.atomic
    def update_permissions(self, request, pk=None):
        """
        Update all permissions for a role at once.
        Replaces existing permissions with new set.
        """
        try:
            role = self.get_object()
        except Exception as e:
            # If get_object fails, provide more helpful error message
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Error getting role {pk} for update_permissions: {str(e)}")
            
            # Check if role exists at all
            try:
                role_exists = Role.objects.filter(id=pk).exists()
                if role_exists:
                    # Role exists but user doesn't have access
                    user_orgs = self.request.user.user_organizations.filter(
                        is_active=True
                    ).values_list('organization_id', flat=True)
                    role_org = Role.objects.filter(id=pk).values_list('organization_id', flat=True).first()
                    
                    return Response(
                        {
                            'error': 'Role not found or you do not have access to it',
                            'detail': f'The role exists but does not belong to your organization(s): {list(user_orgs)}. Role belongs to organization: {role_org}'
                        },
                        status=status.HTTP_404_NOT_FOUND
                    )
            except Exception:
                pass
            
            return Response(
                {
                    'error': 'Role not found',
                    'detail': 'The role does not exist or you do not have access to it.'
                },
                status=status.HTTP_404_NOT_FOUND
            )
        permission_ids = request.data.get('permission_ids', [])
        
        if not isinstance(permission_ids, list):
            return Response(
                {'error': 'permission_ids must be a list'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate that all permission IDs are valid integers
        try:
            permission_ids = [int(pid) for pid in permission_ids if pid is not None]
        except (ValueError, TypeError) as e:
            return Response(
                {'error': f'Invalid permission_ids format: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if all permission IDs belong to the role's organization
        if permission_ids:
            valid_permissions = Permission.objects.filter(
                id__in=permission_ids,
                organization=role.organization
            )
            valid_permission_ids = set(valid_permissions.values_list('id', flat=True))
            invalid_ids = set(permission_ids) - valid_permission_ids
            
            if invalid_ids:
                return Response(
                    {
                        'error': f'Some permission IDs do not belong to this organization: {list(invalid_ids)}',
                        'invalid_ids': list(invalid_ids)
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Remove all existing permissions
        RolePermission.objects.filter(role=role).delete()
        
        # Add new permissions
        if permission_ids:
            permissions = Permission.objects.filter(
                id__in=permission_ids,
                organization=role.organization
            )
            
            created_count = 0
            for permission in permissions:
                RolePermission.objects.create(
                    role=role,
                    permission=permission
                )
                created_count += 1
        else:
            created_count = 0
        
        return Response({
            'message': f'Updated {created_count} permissions for role.',
            'permission_count': created_count
        })
    
    @action(detail=False, methods=['post'])
    @transaction.atomic
    def ensure_all_roles_have_permissions(self, request):
        """
        Ensure all roles in the user's organization have at least basic permissions.
        This is a bulk operation to assign default permissions to roles without any.
        """
        user_orgs = request.user.user_organizations.filter(
            is_active=True
        ).values_list('organization_id', flat=True)

        if not user_orgs:
            return Response(
                {'error': 'User must belong to an organization'},
                status=status.HTTP_400_BAD_REQUEST
            )

        roles = Role.objects.filter(
            organization_id__in=user_orgs,
            is_active=True
        ).prefetch_related('role_permissions')

        roles_without_permissions = [
            role for role in roles 
            if role.role_permissions.count() == 0
        ]

        if not roles_without_permissions:
            return Response({
                'message': 'All roles already have permissions assigned',
                'roles_updated': 0
            })

        # Default basic permissions
        basic_resources = ['customers', 'deals', 'leads', 'activities']
        basic_actions = ['read', 'create', 'update']

        total_permissions_assigned = 0
        roles_updated = []

        for role in roles_without_permissions:
            org = role.organization
            permissions_assigned = 0

            for resource in basic_resources:
                for action in basic_actions:
                    permission = Permission.objects.filter(
                        organization=org,
                        resource=resource,
                        action=action
                    ).first()

                    if permission:
                        role_perm, created = RolePermission.objects.get_or_create(
                            role=role,
                            permission=permission
                        )
                        if created:
                            permissions_assigned += 1

            total_permissions_assigned += permissions_assigned
            roles_updated.append({
                'role_id': role.id,
                'role_name': role.name,
                'permissions_assigned': permissions_assigned
            })

        return Response({
            'message': f'Assigned permissions to {len(roles_without_permissions)} role(s)',
            'roles_updated': len(roles_without_permissions),
            'total_permissions_assigned': total_permissions_assigned,
            'details': roles_updated
        })

    @action(detail=True, methods=['get'])
    def permissions(self, request, pk=None):
        """Get all permissions for this role"""
        try:
            role = self.get_object()
        except Exception as e:
            # If get_object fails, provide more helpful error message
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Error getting role {pk} for permissions: {str(e)}")
            
            # Check if role exists at all
            try:
                role_exists = Role.objects.filter(id=pk).exists()
                if role_exists:
                    # Role exists but user doesn't have access
                    user_orgs = self.request.user.user_organizations.filter(
                        is_active=True
                    ).values_list('organization_id', flat=True)
                    role_org = Role.objects.filter(id=pk).values_list('organization_id', flat=True).first()
                    
                    return Response(
                        {
                            'error': 'Role not found or you do not have access to it',
                            'detail': f'The role exists but does not belong to your organization(s): {list(user_orgs)}. Role belongs to organization: {role_org}'
                        },
                        status=status.HTTP_404_NOT_FOUND
                    )
            except Exception:
                pass
            
            return Response(
                {
                    'error': 'Role not found',
                    'detail': 'The role does not exist or you do not have access to it.'
                },
                status=status.HTTP_404_NOT_FOUND
            )
        permissions = Permission.objects.filter(
            role_permissions__role=role
        )
        serializer = PermissionSerializer(permissions, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def users(self, request, pk=None):
        """Get all users assigned to this role"""
        role = self.get_object()
        
        # Users from UserRole
        user_roles = UserRole.objects.filter(
            role=role,
            is_active=True
        ).select_related('user')
        
        # Users from Employee.role
        employees = Employee.objects.filter(
            role=role,
            status='active'
        ).select_related('user')
        
        user_data = []
        
        # Add UserRole assignments
        for ur in user_roles:
            user_data.append({
                'id': ur.user.id,
                'email': ur.user.email,
                'full_name': ur.user.full_name,
                'source': 'user_role',
                'assigned_at': ur.assigned_at
            })
        
        # Add Employee role assignments
        for emp in employees:
            if emp.user:
                user_data.append({
                    'id': emp.user.id,
                    'email': emp.user.email,
                    'full_name': emp.user.full_name,
                    'source': 'employee_role',
                    'employee_code': emp.code
                })
        
        return Response({'users': user_data})


class UserRoleViewSet(viewsets.ModelViewSet):
    """
    ViewSet for UserRole management.
    Vendors can assign additional roles to employees beyond their primary role.
    """
    queryset = UserRole.objects.all()
    serializer_class = UserRoleSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filter user roles by organization"""
        user_orgs = self.request.user.user_organizations.filter(
            is_active=True
        ).values_list('organization_id', flat=True)
        
        return UserRole.objects.filter(
            organization_id__in=user_orgs
        ).select_related('user', 'role', 'assigned_by')
    
    def perform_create(self, serializer):
        """Create user role assignment"""
        user_org = self.request.user.user_organizations.filter(
            is_active=True
        ).first()
        
        if not user_org:
            raise ValueError('User must belong to an organization')
        
        serializer.save(
            organization=user_org.organization,
            assigned_by=self.request.user
        )
    
    @action(detail=False, methods=['post'])
    @transaction.atomic
    def bulk_assign(self, request):
        """
        Assign a role to multiple users at once.
        Expects: {role_id: int, user_ids: [int, ...]}
        """
        role_id = request.data.get('role_id')
        user_ids = request.data.get('user_ids', [])
        
        if not role_id or not isinstance(user_ids, list):
            return Response(
                {'error': 'role_id and user_ids (list) are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user_org = request.user.user_organizations.filter(
            is_active=True
        ).first()
        
        if not user_org:
            return Response(
                {'error': 'User must belong to an organization'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            role = Role.objects.get(
                id=role_id,
                organization=user_org.organization
            )
        except Role.DoesNotExist:
            return Response(
                {'error': 'Role not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        created_count = 0
        skipped_count = 0
        
        for user_id in user_ids:
            try:
                user = User.objects.get(id=user_id)
                _, created = UserRole.objects.get_or_create(
                    user=user,
                    role=role,
                    organization=user_org.organization,
                    defaults={'assigned_by': request.user}
                )
                if created:
                    created_count += 1
                else:
                    skipped_count += 1
            except User.DoesNotExist:
                skipped_count += 1
        
        return Response({
            'message': f'Assigned role to {created_count} users.',
            'created': created_count,
            'skipped': skipped_count
        })
    
    @action(detail=False, methods=['post'])
    @transaction.atomic
    def bulk_remove(self, request):
        """
        Remove a role from multiple users at once.
        Expects: {role_id: int, user_ids: [int, ...]}
        """
        role_id = request.data.get('role_id')
        user_ids = request.data.get('user_ids', [])
        
        if not role_id or not isinstance(user_ids, list):
            return Response(
                {'error': 'role_id and user_ids (list) are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user_org = request.user.user_organizations.filter(
            is_active=True
        ).first()
        
        if not user_org:
            return Response(
                {'error': 'User must belong to an organization'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        deleted_count, _ = UserRole.objects.filter(
            role_id=role_id,
            user_id__in=user_ids,
            organization=user_org.organization
        ).delete()
        
        return Response({
            'message': f'Removed role from {deleted_count} users.',
            'removed': deleted_count
        })
    
    @action(detail=False, methods=['get'])
    def by_role(self, request):
        """
        Get all user role assignments for a specific role.
        Query param: role_id
        """
        role_id = request.query_params.get('role_id')
        
        if not role_id:
            return Response(
                {'error': 'role_id query parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user_org = request.user.user_organizations.filter(
            is_active=True
        ).first()
        
        if not user_org:
            return Response(
                {'error': 'User must belong to an organization'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user_roles = UserRole.objects.filter(
            role_id=role_id,
            organization=user_org.organization,
            is_active=True
        ).select_related('user', 'role', 'assigned_by')
        
        serializer = self.get_serializer(user_roles, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_user(self, request):
        """
        Get all role assignments for a specific user.
        Query param: user_id
        """
        user_id = request.query_params.get('user_id')
        
        if not user_id:
            return Response(
                {'error': 'user_id query parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user_org = request.user.user_organizations.filter(
            is_active=True
        ).first()
        
        if not user_org:
            return Response(
                {'error': 'User must belong to an organization'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user_roles = UserRole.objects.filter(
            user_id=user_id,
            organization=user_org.organization,
            is_active=True
        ).select_related('user', 'role', 'assigned_by')
        
        # Also get the employee's primary role if exists
        employee_role = None
        try:
            employee = Employee.objects.get(
                user_id=user_id,
                organization=user_org.organization,
                status='active'
            )
            if employee.role:
                employee_role = {
                    'id': employee.role.id,
                    'name': employee.role.name,
                    'slug': employee.role.slug,
                    'is_primary': True
                }
        except Employee.DoesNotExist:
            pass
        
        serializer = self.get_serializer(user_roles, many=True)
        
        return Response({
            'user_roles': serializer.data,
            'primary_role': employee_role
        })
    
    @action(detail=False, methods=['post'])
    def toggle_active(self, request):
        """
        Activate or deactivate a user role assignment.
        Expects: {user_role_id: int, is_active: bool}
        """
        user_role_id = request.data.get('user_role_id')
        is_active = request.data.get('is_active')
        
        if user_role_id is None or is_active is None:
            return Response(
                {'error': 'user_role_id and is_active are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            user_role = self.get_queryset().get(id=user_role_id)
            user_role.is_active = is_active
            user_role.save(update_fields=['is_active'])
            
            return Response({
                'message': f'User role {"activated" if is_active else "deactivated"} successfully.',
                'is_active': user_role.is_active
            })
        except UserRole.DoesNotExist:
            return Response(
                {'error': 'User role assignment not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['get'])
    def my_roles(self, request):
        """Get roles for current user"""
        roles = UserRole.objects.filter(
            user=request.user,
            is_active=True
        )
        serializer = self.get_serializer(roles, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def user_permissions(self, request):
        """
        Get all permissions for a user in an organization.
        Uses RBACService.get_user_permissions for proper permission calculation.
        
        Query params:
            - user_id (required): User ID
            - organization_id (required): Organization ID
        
        Returns:
            {
                "permissions": [
                    {"id": 1, "resource": "customers", "action": "read", "description": "..."},
                    ...
                ],
                "roles": [...]
            }
        """
        user_id = request.query_params.get('user_id')
        organization_id = request.query_params.get('organization_id')
        
        if not user_id or not organization_id:
            return Response(
                {'error': 'user_id and organization_id query parameters are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            from crmApp.models import Organization, User
            user = User.objects.get(id=user_id)
            organization = Organization.objects.get(id=organization_id)
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Organization.DoesNotExist:
            return Response(
                {'error': 'Organization not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Get permissions using RBACService
        permissions = RBACService.get_user_permissions(user, organization)
        
        # Get roles for the user
        roles = RBACService.get_user_roles(user, organization)
        
        # Serialize roles
        from crmApp.serializers import RoleSerializer
        roles_data = RoleSerializer(roles, many=True).data
        
        return Response({
            'permissions': permissions,
            'roles': roles_data,
        })