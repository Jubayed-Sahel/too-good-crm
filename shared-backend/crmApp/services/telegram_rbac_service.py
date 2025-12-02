"""
Telegram RBAC Service
Provides role and permission context for Telegram bot users
"""
import logging
from typing import Dict, List, Optional

from crmApp.models import TelegramUser, UserProfile
from crmApp.services.rbac_service import RBACService

logger = logging.getLogger(__name__)


class TelegramRBACService:
    """
    Service for managing role-based access control for Telegram bot users.
    Syncs permissions from web/app to Telegram bot interactions.
    """
    
    @staticmethod
    def get_user_permissions(telegram_user: TelegramUser) -> Dict[str, List[str]]:
        """
        Get all permissions for a Telegram user based on their selected profile.
        
        Args:
            telegram_user: TelegramUser instance
            
        Returns:
            Dictionary of resource -> list of allowed actions
            Example: {'customer': ['view', 'create', 'update'], 'deal': ['view']}
        """
        if not telegram_user.is_authenticated or not telegram_user.user:
            logger.warning(f"Telegram user {telegram_user.chat_id} not authenticated")
            return {}
        
        # Get selected profile (or default to first active profile)
        profile = telegram_user.selected_profile
        
        if not profile:
            profiles = UserProfile.objects.filter(
                user=telegram_user.user,
                status='active'
            ).select_related('organization')
            
            if not profiles.exists():
                logger.warning(f"No active profiles for user {telegram_user.user.email}")
                return {}
            
            profile = profiles.first()
            # Cache the selected profile
            telegram_user.selected_profile = profile
            telegram_user.save(update_fields=['selected_profile'])
        
        # Get permissions based on profile type
        permissions = {}
        
        # Vendors have all permissions in their organization
        if profile.profile_type == 'vendor' and profile.organization:
            permissions = {
                'customer': ['view', 'create', 'update', 'delete'],
                'deal': ['view', 'create', 'update', 'delete'],
                'lead': ['view', 'create', 'update', 'delete'],
                'employee': ['view', 'create', 'update', 'delete'],
                'issue': ['view', 'create', 'update', 'delete'],
                'order': ['view', 'create', 'update', 'delete'],
                'payment': ['view', 'create', 'update', 'delete'],
                'activity': ['view', 'create', 'update', 'delete'],
                'message': ['view', 'create', 'update', 'delete'],
                'pipeline': ['view', 'create', 'update', 'delete'],
                'analytics': ['view'],
            }
            logger.info(f"✅ Vendor permissions loaded for {telegram_user.user.email}")
        
        # Employees have permissions based on their role
        elif profile.profile_type == 'employee' and profile.organization:
            # Get employee's role permissions using RBACService
            rbac = RBACService()
            user_roles = profile.user.user_roles.filter(
                organization=profile.organization
            ).select_related('role')
            
            for user_role in user_roles:
                role = user_role.role
                role_permissions = role.permissions.all()
                
                for perm in role_permissions:
                    resource = perm.resource_type
                    action = perm.action_type
                    
                    if resource not in permissions:
                        permissions[resource] = []
                    
                    if action not in permissions[resource]:
                        permissions[resource].append(action)
            
            logger.info(f"✅ Employee permissions loaded for {telegram_user.user.email}: {permissions}")
        
        # Customers have limited permissions
        elif profile.profile_type == 'customer':
            permissions = {
                'issue': ['view', 'create'],
                'order': ['view'],
                'payment': ['view'],
                'message': ['view', 'create'],
            }
            logger.info(f"✅ Customer permissions loaded for {telegram_user.user.email}")
        
        return permissions
    
    @staticmethod
    def check_permission(
        telegram_user: TelegramUser,
        resource: str,
        action: str
    ) -> bool:
        """
        Check if a Telegram user has permission to perform an action on a resource.
        
        Args:
            telegram_user: TelegramUser instance
            resource: Resource type (e.g., 'customer', 'deal')
            action: Action type (e.g., 'view', 'create', 'update', 'delete')
            
        Returns:
            True if user has permission, False otherwise
        """
        permissions = TelegramRBACService.get_user_permissions(telegram_user)
        
        if resource not in permissions:
            logger.warning(
                f"❌ Permission denied: {telegram_user.user.email if telegram_user.user else telegram_user.chat_id} "
                f"does not have access to resource '{resource}'"
            )
            return False
        
        if action not in permissions[resource]:
            logger.warning(
                f"❌ Permission denied: {telegram_user.user.email if telegram_user.user else telegram_user.chat_id} "
                f"cannot perform '{action}' on '{resource}'"
            )
            return False
        
        logger.debug(
            f"✅ Permission granted: {telegram_user.user.email if telegram_user.user else telegram_user.chat_id} "
            f"can perform '{action}' on '{resource}'"
        )
        return True
    
    @staticmethod
    def get_organization_context(telegram_user: TelegramUser) -> Optional[int]:
        """
        Get the organization ID for a Telegram user's current context.
        
        Args:
            telegram_user: TelegramUser instance
            
        Returns:
            Organization ID or None
        """
        if not telegram_user.is_authenticated or not telegram_user.user:
            return None
        
        profile = telegram_user.selected_profile
        
        if not profile:
            profiles = UserProfile.objects.filter(
                user=telegram_user.user,
                status='active'
            ).select_related('organization').first()
            
            if profiles:
                profile = profiles
                telegram_user.selected_profile = profile
                telegram_user.save(update_fields=['selected_profile'])
        
        if profile and profile.organization:
            return profile.organization.id
        
        return None
    
    @staticmethod
    def get_permission_summary(telegram_user: TelegramUser) -> str:
        """
        Get a formatted summary of user's permissions for display in Telegram.
        
        Args:
            telegram_user: TelegramUser instance
            
        Returns:
            Formatted permission summary string
        """
        if not telegram_user.is_authenticated or not telegram_user.user:
            return "❌ Not authenticated"
        
        profile = telegram_user.selected_profile
        if not profile:
            profiles = UserProfile.objects.filter(
                user=telegram_user.user,
                status='active'
            ).first()
            profile = profiles if profiles else None
        
        if not profile:
            return "❌ No active profile found"
        
        permissions = TelegramRBACService.get_user_permissions(telegram_user)
        
        # Format profile info
        org_name = profile.organization.name if profile.organization else "Standalone"
        profile_type = profile.get_profile_type_display()
        
        summary = f"<b>Profile:</b> {profile_type}\n"
        summary += f"<b>Organization:</b> {org_name}\n\n"
        summary += "<b>Permissions:</b>\n"
        
        if not permissions:
            summary += "• No permissions assigned\n"
        else:
            for resource, actions in sorted(permissions.items()):
                actions_str = ", ".join(sorted(actions))
                summary += f"• <b>{resource.title()}:</b> {actions_str}\n"
        
        return summary
    
    @staticmethod
    def switch_profile(telegram_user: TelegramUser, profile_id: int) -> bool:
        """
        Switch Telegram user to a different profile.
        
        Args:
            telegram_user: TelegramUser instance
            profile_id: ID of profile to switch to
            
        Returns:
            True if successful, False otherwise
        """
        try:
            profile = UserProfile.objects.get(
                id=profile_id,
                user=telegram_user.user,
                status='active'
            )
            
            telegram_user.selected_profile = profile
            telegram_user.save(update_fields=['selected_profile'])
            
            logger.info(
                f"✅ Switched Telegram user {telegram_user.chat_id} to profile {profile_id}"
            )
            return True
        
        except UserProfile.DoesNotExist:
            logger.error(
                f"❌ Profile {profile_id} not found for user {telegram_user.user.email}"
            )
            return False

