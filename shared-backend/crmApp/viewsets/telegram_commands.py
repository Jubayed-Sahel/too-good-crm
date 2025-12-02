"""
Additional Telegram Bot Command Handlers
Includes RBAC and permission-related commands
"""
import logging
from typing import Optional

from crmApp.models import TelegramUser, UserProfile
from crmApp.services.telegram_service import TelegramService
from crmApp.services.telegram_rbac_service import TelegramRBACService

logger = logging.getLogger(__name__)


def handle_permissions_command(telegram_user: TelegramUser, telegram_service: TelegramService):
    """
    Handle /permissions command - show user's current permissions.
    """
    chat_id = telegram_user.chat_id
    
    try:
        # Get permission summary
        summary = TelegramRBACService.get_permission_summary(telegram_user)
        
        message = (
            f"<b>🔐 Your Permissions</b>\n\n"
            f"{summary}\n\n"
            f"<i>Permissions are synced with your web/app profile.</i>\n"
            f"Use /switch to change profiles."
        )
        
        telegram_service.send_message(chat_id, message)
        logger.info(f"Sent permissions to {telegram_user.chat_id}")
        
    except Exception as e:
        logger.error(f"Error showing permissions: {str(e)}", exc_info=True)
        telegram_service.send_message(
            chat_id,
            "❌ Error loading permissions. Please try again later."
        )


def check_permission_and_notify(
    telegram_user: TelegramUser,
    telegram_service: TelegramService,
    resource: str,
    action: str,
    silent: bool = False
) -> bool:
    """
    Check if user has permission and optionally send notification if denied.
    
    Args:
        telegram_user: TelegramUser instance
        telegram_service: TelegramService instance
        resource: Resource type (e.g., 'customer', 'deal')
        action: Action type (e.g., 'view', 'create', 'update', 'delete')
        silent: If True, don't send notification on denial
        
    Returns:
        True if user has permission, False otherwise
    """
    has_permission = TelegramRBACService.check_permission(telegram_user, resource, action)
    
    if not has_permission and not silent:
        chat_id = telegram_user.chat_id
        
        profile = telegram_user.selected_profile
        profile_type = profile.get_profile_type_display() if profile else "Unknown"
        
        message = (
            f"❌ <b>Permission Denied</b>\n\n"
            f"You don't have permission to <b>{action}</b> <b>{resource}</b> resources.\n\n"
            f"<b>Your current profile:</b> {profile_type}\n\n"
            f"To view your permissions, use /permissions\n"
            f"To switch profiles, use /switch"
        )
        
        telegram_service.send_message(chat_id, message)
    
    return has_permission


def create_command_help_message_with_rbac() -> str:
    """
    Create help message with RBAC-aware command list.
    """
    return (
        "<b>🤖 Available Commands</b>\n\n"
        "<b>Authentication:</b>\n"
        "/start - Start authentication\n"
        "/login - Login with email\n"
        "/logout - Logout\n"
        "/me - Show account info\n\n"
        "<b>Profile & Permissions:</b>\n"
        "/profiles - List your profiles\n"
        "/switch - Switch to another profile\n"
        "/permissions - Show your permissions\n\n"
        "<b>CRM Operations:</b>\n"
        "/help - Show this help message\n"
        "/features - List available features\n"
        "/actions - Quick action shortcuts\n"
        "/clear - Clear conversation history\n\n"
        "<b>💡 Pro Tip:</b> Just chat naturally!\n"
        "Ask me questions like:\n"
        "• \"Show my deals\"\n"
        "• \"Create a new customer\"\n"
        "• \"What are my pending issues?\"\n"
        "• \"Show this week's statistics\"\n\n"
        "<i>Your permissions are synced with your web/app profile.</i>"
    )

