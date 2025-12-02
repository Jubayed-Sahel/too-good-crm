"""
Role and Permission Management Tools for MCP Server
Provides tools for creating roles, managing permissions, and assigning roles to employees
"""

import logging
from typing import Optional, List, Dict, Any
from crmApp.models import Role, Permission, RolePermission, UserRole, Employee, User
from crmApp.serializers import RoleSerializer, PermissionSerializer
from django.db import transaction
from django.utils.text import slugify
from asgiref.sync import sync_to_async

logger = logging.getLogger(__name__)

def register_role_management_tools(mcp):
    """Register all role and permission management tools"""
    
    @mcp.tool()
    async def invite_employee(
        email: str,
        first_name: str,
        last_name: str,
        phone: Optional[str] = None,
        department: Optional[str] = None,
        job_title: Optional[str] = None,
        role_id: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Invite a new or existing employee to join the organization.
        
        Args:
            email: Employee email address (required)
            first_name: Employee first name (required)
            last_name: Employee last name (required)
            phone: Employee phone number (optional)
            department: Employee department (optional)
            job_title: Employee job title (optional)
            role_id: Role ID to assign to employee (optional)
        
        Returns:
            Created employee object with invitation details
        """
        @sync_to_async(thread_sensitive=False)
        def invite():
            try:
                mcp.check_permission('employee', 'create')
                org_id = mcp.get_organization_id()
                user_id = mcp.get_user_id()
                
                if not org_id:
                    return {"error": "No organization context found"}
                
                from crmApp.models import User, UserOrganization, UserProfile, Organization
                from django.utils.crypto import get_random_string
                from django.utils import timezone
                
                organization = Organization.objects.get(id=org_id)
                
                # Check if user already exists
                existing_user = User.objects.filter(email=email).first()
                user_created = False
                
                try:
                    with transaction.atomic():
                        if existing_user:
                            # User exists - check if already an employee in this organization
                            existing_employee = Employee.objects.filter(
                                organization=organization,
                                user=existing_user
                            ).first()
                            
                            if existing_employee:
                                return {"error": f"{existing_user.full_name} is already an employee in this organization"}
                            
                            user = existing_user
                            
                            # Link user to organization if not already linked
                            user_org_link, created = UserOrganization.objects.get_or_create(
                                user=user,
                                organization=organization,
                                defaults={
                                    'is_owner': False,
                                    'is_active': True
                                }
                            )
                            
                            if not created and not user_org_link.is_active:
                                user_org_link.is_active = True
                                user_org_link.save()
                            
                            # Create or update UserProfile
                            user_profile, profile_created = UserProfile.objects.get_or_create(
                                user=user,
                                profile_type='employee',
                                defaults={
                                    'organization': organization,
                                    'is_primary': False,
                                    'status': 'active',
                                    'activated_at': timezone.now()
                                }
                            )
                            
                            if not profile_created:
                                user_profile.organization = organization
                                user_profile.status = 'active'
                                if not user_profile.activated_at:
                                    user_profile.activated_at = timezone.now()
                                user_profile.deactivated_at = None
                                user_profile.save()
                            
                            message = f'Existing user {user.full_name} added as employee'
                            
                        else:
                            # Create new user
                            username = email.split('@')[0]
                            if User.objects.filter(username=username).exists():
                                username = f"{username}_{get_random_string(4)}"
                            
                            temp_password = get_random_string(12)
                            
                            user = User.objects.create_user(
                                username=username,
                                email=email,
                                password=temp_password,
                                first_name=first_name,
                                last_name=last_name,
                                phone=phone
                            )
                            
                            user_created = True
                            
                            # Link user to organization
                            UserOrganization.objects.create(
                                user=user,
                                organization=organization,
                                is_owner=False,
                                is_active=True
                            )
                            
                            # Create UserProfile
                            user_profile = UserProfile.objects.create(
                                user=user,
                                organization=organization,
                                profile_type='employee',
                                is_primary=False,
                                status='active',
                                activated_at=timezone.now()
                            )
                            
                            message = f'New user created and invited as employee'
                        
                        # Create Employee record
                        employee_data = {
                            'organization': organization,
                            'user': user,
                            'first_name': first_name,
                            'last_name': last_name,
                            'email': email,
                            'phone': phone,
                            'department': department,
                            'job_title': job_title,
                            'status': 'active',
                            'hire_date': timezone.now().date()
                        }
                        
                        # Assign role if provided
                        if role_id:
                            try:
                                role = Role.objects.get(id=role_id, organization=organization)
                                employee_data['role'] = role
                            except Role.DoesNotExist:
                                return {"error": f"Role with ID {role_id} not found in your organization"}
                        
                        employee = Employee.objects.create(**employee_data)
                        
                        from crmApp.serializers import EmployeeSerializer
                        serializer = EmployeeSerializer(employee)
                        
                        logger.info(f"Invited employee {employee.id} ({email}) to org {org_id}")
                        
                        return {
                            "success": True,
                            "message": message,
                            "employee": serializer.data,
                            "user_created": user_created
                        }
                        
                except Exception as e:
                    logger.error(f"Error inviting employee: {str(e)}", exc_info=True)
                    return {"error": f"Failed to invite employee: {str(e)}"}
                    
            except PermissionError as e:
                return {"error": str(e)}
            except Exception as e:
                logger.error(f"Error inviting employee: {str(e)}", exc_info=True)
                return {"error": f"Failed to invite employee: {str(e)}"}
        return await invite()
    
    @mcp.tool()
    async def list_roles(
        is_active: Optional[bool] = None,
        search: Optional[str] = None,
        limit: int = 20
    ) -> List[Dict[str, Any]]:
        """
        List roles in the organization.
        
        Args:
            is_active: Filter by active status (True/False)
            search: Search by role name or description
            limit: Maximum number of results (default: 20, max: 100)
        
        Returns:
            List of role objects with permissions
        """
        @sync_to_async(thread_sensitive=False)
        def fetch():
            try:
                mcp.check_permission('role', 'read')  # Assuming 'role' permission exists
                org_id = mcp.get_organization_id()
                
                if not org_id:
                    return {"error": "No organization context found"}
                
                queryset = Role.objects.filter(organization_id=org_id)
                
                if is_active is not None:
                    queryset = queryset.filter(is_active=is_active)
                
                if search:
                    queryset = queryset.filter(
                        name__icontains=search
                    ) | queryset.filter(
                        description__icontains=search
                    )
                
                limit_val = min(limit, 100)
                queryset = queryset.prefetch_related('role_permissions__permission')[:limit_val]
                
                serializer = RoleSerializer(queryset, many=True)
                
                logger.info(f"Retrieved {len(serializer.data)} roles for org {org_id}")
                return serializer.data
                
            except PermissionError as e:
                return {"error": str(e)}
            except Exception as e:
                logger.error(f"Error listing roles: {str(e)}", exc_info=True)
                return {"error": f"Failed to list roles: {str(e)}"}
        return await fetch()
    
    @mcp.tool()
    async def create_role(
        name: str,
        description: Optional[str] = None,
        permission_ids: Optional[List[int]] = None
    ) -> Dict[str, Any]:
        """
        Create a new role in the organization.
        
        Args:
            name: Role name (required)
            description: Role description (optional)
            permission_ids: List of permission IDs to assign to the role (optional)
        
        Returns:
            Created role object with permissions
        """
        @sync_to_async(thread_sensitive=False)
        def create():
            try:
                mcp.check_permission('role', 'create')  # Assuming 'role' permission exists
                org_id = mcp.get_organization_id()
                
                if not org_id:
                    return {"error": "No organization context found"}
                
                from crmApp.models import Organization
                organization = Organization.objects.get(id=org_id)
                
                # Generate slug from name
                base_slug = slugify(name)
                slug = base_slug
                counter = 1
                
                # Ensure slug is unique within organization
                while Role.objects.filter(organization=organization, slug=slug).exists():
                    slug = f"{base_slug}-{counter}"
                    counter += 1
                
                # Create role
                role = Role.objects.create(
                    organization=organization,
                    name=name,
                    slug=slug,
                    description=description,
                    is_system_role=False,
                    is_active=True
                )
                
                # Assign permissions if provided
                if permission_ids:
                    permissions = Permission.objects.filter(
                        id__in=permission_ids,
                        organization=organization
                    )
                    
                    for permission in permissions:
                        RolePermission.objects.get_or_create(
                            role=role,
                            permission=permission
                        )
                
                serializer = RoleSerializer(role)
                
                logger.info(f"Created role {role.id} ({name}) in org {org_id}")
                
                return {
                    "success": True,
                    "message": f"Role '{name}' created successfully",
                    "role": serializer.data
                }
                
            except PermissionError as e:
                return {"error": str(e)}
            except Exception as e:
                logger.error(f"Error creating role: {str(e)}", exc_info=True)
                return {"error": f"Failed to create role: {str(e)}"}
        return await create()
    
    @mcp.tool()
    async def assign_permissions_to_role(
        role_id: int,
        permission_ids: List[int]
    ) -> Dict[str, Any]:
        """
        Assign permissions to a role. Existing permissions are preserved, new ones are added.
        
        Args:
            role_id: Role ID (required)
            permission_ids: List of permission IDs to assign (required)
        
        Returns:
            Updated role object with all permissions
        """
        @sync_to_async(thread_sensitive=False)
        def assign():
            try:
                mcp.check_permission('role', 'update')
                org_id = mcp.get_organization_id()
                
                if not org_id:
                    return {"error": "No organization context found"}
                
                role = Role.objects.get(id=role_id, organization_id=org_id)
                
                # Get permissions that belong to this organization
                permissions = Permission.objects.filter(
                    id__in=permission_ids,
                    organization_id=org_id
                )
                
                # Assign permissions
                assigned_count = 0
                for permission in permissions:
                    _, created = RolePermission.objects.get_or_create(
                        role=role,
                        permission=permission
                    )
                    if created:
                        assigned_count += 1
                
                # Refresh role to get updated permissions
                role.refresh_from_db()
                serializer = RoleSerializer(role)
                
                logger.info(f"Assigned {assigned_count} permissions to role {role_id}")
                
                return {
                    "success": True,
                    "message": f"Assigned {assigned_count} permission(s) to role '{role.name}'",
                    "role": serializer.data
                }
                
            except PermissionError as e:
                return {"error": str(e)}
            except Role.DoesNotExist:
                return {"error": f"Role with ID {role_id} not found in your organization"}
            except Exception as e:
                logger.error(f"Error assigning permissions: {str(e)}", exc_info=True)
                return {"error": f"Failed to assign permissions: {str(e)}"}
        return await assign()
    
    @mcp.tool()
    async def assign_role_to_employee(
        employee_id: int,
        role_id: int
    ) -> Dict[str, Any]:
        """
        Assign a role to an employee. This updates the employee's primary role.
        
        Args:
            employee_id: Employee ID (required)
            role_id: Role ID to assign (required)
        
        Returns:
            Updated employee object
        """
        @sync_to_async(thread_sensitive=False)
        def assign():
            try:
                mcp.check_permission('employee', 'update')
                org_id = mcp.get_organization_id()
                user_id = mcp.get_user_id()
                
                if not org_id:
                    return {"error": "No organization context found"}
                
                employee = Employee.objects.get(id=employee_id, organization_id=org_id)
                role = Role.objects.get(id=role_id, organization_id=org_id)
                
                # Update employee's primary role
                employee.role = role
                employee.save()
                
                # Also create UserRole entry for additional role tracking
                UserRole.objects.get_or_create(
                    user=employee.user,
                    role=role,
                    organization_id=org_id,
                    defaults={
                        'assigned_by_id': user_id,
                        'is_active': True
                    }
                )
                
                from crmApp.serializers import EmployeeSerializer
                serializer = EmployeeSerializer(employee)
                
                logger.info(f"Assigned role {role_id} to employee {employee_id}")
                
                return {
                    "success": True,
                    "message": f"Role '{role.name}' assigned to employee {employee.first_name} {employee.last_name}",
                    "employee": serializer.data
                }
                
            except PermissionError as e:
                return {"error": str(e)}
            except Employee.DoesNotExist:
                return {"error": f"Employee with ID {employee_id} not found in your organization"}
            except Role.DoesNotExist:
                return {"error": f"Role with ID {role_id} not found in your organization"}
            except Exception as e:
                logger.error(f"Error assigning role: {str(e)}", exc_info=True)
                return {"error": f"Failed to assign role: {str(e)}"}
        return await assign()
    
    @mcp.tool()
    async def list_permissions(
        resource: Optional[str] = None,
        action: Optional[str] = None,
        limit: int = 100
    ) -> List[Dict[str, Any]]:
        """
        List available permissions in the organization.
        Useful for finding permission IDs to assign to roles.
        
        Args:
            resource: Filter by resource (e.g., 'customer', 'deal', 'activity')
            action: Filter by action (e.g., 'create', 'read', 'update', 'delete')
            limit: Maximum number of results (default: 100, max: 200)
        
        Returns:
            List of permission objects
        """
        @sync_to_async(thread_sensitive=False)
        def fetch():
            try:
                mcp.check_permission('permission', 'read')  # Assuming 'permission' permission exists
                org_id = mcp.get_organization_id()
                
                if not org_id:
                    return {"error": "No organization context found"}
                
                queryset = Permission.objects.filter(organization_id=org_id)
                
                if resource:
                    queryset = queryset.filter(resource=resource)
                
                if action:
                    queryset = queryset.filter(action=action)
                
                limit_val = min(limit, 200)
                queryset = queryset[:limit_val]
                
                serializer = PermissionSerializer(queryset, many=True)
                
                logger.info(f"Retrieved {len(serializer.data)} permissions for org {org_id}")
                return serializer.data
                
            except PermissionError as e:
                return {"error": str(e)}
            except Exception as e:
                logger.error(f"Error listing permissions: {str(e)}", exc_info=True)
                return {"error": f"Failed to list permissions: {str(e)}"}
        return await fetch()
    
    logger.info("Role management tools registered")

