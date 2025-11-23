"""
Telegram Bot Webhook ViewSet
Handles incoming Telegram updates and integrates with Gemini AI
"""
import logging
import json
import asyncio
from typing import Optional, Dict, Any
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.utils.decorators import method_decorator
from django.conf import settings
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from asgiref.sync import async_to_sync

from crmApp.models import TelegramUser, User
from crmApp.services.telegram_service import TelegramService
from crmApp.services.telegram_auth_service import TelegramAuthService
from crmApp.services.gemini_service import GeminiService
from crmApp.utils.telegram_utils import (
    parse_telegram_update,
    extract_email,
    is_valid_email,
    format_crm_response_for_telegram,
    create_command_help_message,
)
from crmApp.utils.telegram_features import (
    create_features_message,
    create_quick_actions_message,
)

logger = logging.getLogger(__name__)


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def telegram_webhook(request):
    """
    Webhook endpoint for receiving Telegram updates.
    Handles messages, commands, and forwards to Gemini AI.
    """
    try:
        # Parse incoming update
        update = json.loads(request.body)
        logger.info(f"Received Telegram update: {update.get('update_id')}")
        
        # Parse update
        parsed = parse_telegram_update(update)
        
        if not parsed:
            logger.warning("Failed to parse Telegram update")
            return JsonResponse({'ok': True})  # Return 200 to acknowledge
        
        # Only handle private messages for now
        if parsed.get('chat_type') != 'private':
            logger.info(f"Ignoring non-private message from chat type: {parsed.get('chat_type')}")
            return JsonResponse({'ok': True})
        
        # Handle the message
        if parsed['type'] == 'message':
            handle_telegram_message(parsed)
        elif parsed['type'] == 'callback_query':
            handle_telegram_callback(parsed)
        
        return JsonResponse({'ok': True})
    
    except json.JSONDecodeError as e:
        logger.error(f"Invalid JSON in webhook: {str(e)}")
        return JsonResponse({'ok': False, 'error': 'Invalid JSON'}, status=400)
    
    except Exception as e:
        logger.error(f"Error processing Telegram webhook: {str(e)}", exc_info=True)
        return JsonResponse({'ok': True})  # Still return 200 to avoid retries


def handle_telegram_message(parsed: Dict[str, Any]):
    """
    Handle incoming Telegram message.
    Routes to appropriate handler based on authentication state and message type.
    """
    chat_id = parsed['chat_id']
    text = parsed['text']
    from_user = parsed['from_user']
    
    telegram_service = TelegramService()
    
    # Get or create Telegram user
    telegram_user = TelegramAuthService.get_or_create_telegram_user(
        chat_id=chat_id,
        telegram_username=from_user.get('username'),
        first_name=from_user.get('first_name'),
        last_name=from_user.get('last_name')
    )
    
    # Update last activity
    telegram_user.update_last_activity()
    
    # Handle commands
    if parsed['is_command']:
        handle_command(telegram_user, parsed, telegram_service)
        return
    
    # Check authentication state
    if not telegram_user.is_authenticated:
        handle_unauthenticated_message(telegram_user, text, telegram_service, parsed.get('message_id'))
        return
    
    # Handle authenticated message - forward to Gemini
    handle_authenticated_message(telegram_user, text, telegram_service)


def handle_command(telegram_user: TelegramUser, parsed: Dict[str, Any], telegram_service: TelegramService):
    """
    Handle Telegram bot commands.
    """
    command = parsed['command']
    args = parsed['command_args']
    chat_id = parsed['chat_id']
    
    logger.info(f"Handling command: /{command} from chat {chat_id}")
    
    # Update last command
    telegram_user.last_command_used = command
    telegram_user.save(update_fields=['last_command_used'])
    
    # Command handlers
    if command == 'start':
        handle_start_command(telegram_user, telegram_service)
    
    elif command == 'help':
        message = create_command_help_message()
        telegram_service.send_message(chat_id, message)
    
    elif command == 'login':
        handle_login_command(telegram_user, args, telegram_service)
    
    elif command == 'logout':
        message = TelegramAuthService.logout(telegram_user)
        telegram_service.send_message(chat_id, message)
    
    elif command == 'me':
        message = TelegramAuthService.get_user_info(telegram_user)
        telegram_service.send_message(chat_id, message)
    
    elif command == 'clear':
        telegram_user.clear_conversation_history()
        telegram_service.send_message(
            chat_id,
            "✅ Conversation history cleared.\n\nYou can start a fresh conversation now."
        )
    
    elif command == 'features':
        # Get user role if authenticated
        user_role = None
        if telegram_user.is_authenticated and telegram_user.user:
            # Get user's primary role
            user_profiles = telegram_user.user.user_profiles.filter(status='active')
            if user_profiles.exists():
                profile = user_profiles.first()
                user_role = profile.profile_type  # vendor, employee, or customer
        
        message = create_features_message(user_role)
        telegram_service.send_message(chat_id, message)
    
    elif command == 'actions':
        # Get user role if authenticated
        user_role = None
        if telegram_user.is_authenticated and telegram_user.user:
            user_profiles = telegram_user.user.user_profiles.filter(status='active')
            if user_profiles.exists():
                profile = user_profiles.first()
                user_role = profile.profile_type
        
        message = create_quick_actions_message(user_role)
        telegram_service.send_message(chat_id, message)
    
    elif command == 'profiles':
        if not telegram_user.is_authenticated:
            telegram_service.send_message(chat_id, "🔐 Please authenticate first with /start")
        else:
            handle_profiles_command(telegram_user, telegram_service)
    
    elif command == 'switch':
        if not telegram_user.is_authenticated:
            telegram_service.send_message(chat_id, "🔐 Please authenticate first with /start")
        else:
            handle_switch_command(telegram_user, args, telegram_service)
    
    else:
        telegram_service.send_message(
            chat_id,
            f"❓ Unknown command: /{command}\n\nType /help to see available commands."
        )


def handle_start_command(telegram_user: TelegramUser, telegram_service: TelegramService):
    """
    Handle /start command - initiate authentication flow.
    """
    chat_id = telegram_user.chat_id
    
    if telegram_user.is_authenticated:
        message = (
            f"👋 Welcome back, {telegram_user.user.full_name}!\n\n"
            f"You're already authenticated.\n\n"
            f"Ask me anything about your CRM data, or type /help for commands."
        )
        telegram_service.send_message(chat_id, message)
    else:
        message = (
            f"👋 <b>Welcome to CRM Telegram Bot!</b>\n\n"
            f"I'm your AI-powered CRM assistant. I can help you:\n"
            f"• View and manage deals\n"
            f"• Track customers and leads\n"
            f"• Create support issues\n"
            f"• View analytics and statistics\n"
            f"• And much more!\n\n"
            f"🔐 <b>To get started, please authenticate:</b>\n\n"
            f"Send me your CRM account email address.\n\n"
            f"<i>Example: john@company.com</i>"
        )
        telegram_user.conversation_state = 'waiting_for_email'
        telegram_user.save(update_fields=['conversation_state'])
        telegram_service.send_message(chat_id, message)


def handle_login_command(telegram_user: TelegramUser, args: list, telegram_service: TelegramService):
    """
    Handle /login command with optional email argument.
    """
    chat_id = telegram_user.chat_id
    
    if telegram_user.is_authenticated:
        telegram_service.send_message(
            chat_id,
            f"ℹ️ You're already logged in as {telegram_user.user.email}\n\nType /logout to logout first."
        )
        return
    
    if args and len(args) > 0:
        email = args[0]
        if is_valid_email(email):
            success, message = TelegramAuthService.start_auth_flow(telegram_user, email)
            telegram_service.send_message(chat_id, message)
        else:
            telegram_service.send_message(
                chat_id,
                f"❌ Invalid email format: {email}\n\nPlease provide a valid email address."
            )
    else:
        telegram_service.send_message(
            chat_id,
            "🔐 Please send your CRM account email address.\n\n<i>Example: /login john@company.com</i>"
        )
        telegram_user.conversation_state = 'waiting_for_email'
        telegram_user.save(update_fields=['conversation_state'])


def handle_unauthenticated_message(telegram_user: TelegramUser, text: str, telegram_service: TelegramService, message_id: Optional[int] = None):
    """
    Handle messages from unauthenticated users.
    Manages authentication flow.
    """
    chat_id = telegram_user.chat_id
    state = telegram_user.conversation_state
    
    # Waiting for email
    if state == 'waiting_for_email':
        email = extract_email(text) or text.strip()
        
        if not is_valid_email(email):
            telegram_service.send_message(
                chat_id,
                f"❌ Invalid email format.\n\nPlease send a valid email address.\n\n<i>Example: john@company.com</i>"
            )
            return
        
        success, message = TelegramAuthService.start_auth_flow(telegram_user, email)
        telegram_service.send_message(chat_id, message)
    
    # Waiting for password
    elif state == 'waiting_for_password':
        password = text.strip()
        
        if not password:
            telegram_service.send_message(
                chat_id,
                "❌ Password cannot be empty.\n\nPlease send your password."
            )
            return
        
        # Show typing indicator
        telegram_service.send_typing_action(chat_id)
        
        success, message, user = TelegramAuthService.verify_password(telegram_user, password)
        telegram_service.send_message(chat_id, message)
        
        # Delete the password message for security (best effort)
        if message_id:
            try:
                telegram_service.delete_message(chat_id, message_id)
            except:
                pass
    
    # Not in auth flow
    else:
        telegram_service.send_message(
            chat_id,
            "🔐 You need to authenticate first.\n\nType /start to begin authentication."
        )


def handle_authenticated_message(telegram_user: TelegramUser, text: str, telegram_service: TelegramService):
    """
    Handle messages from authenticated users.
    Forwards to Gemini AI for processing.
    """
    chat_id = telegram_user.chat_id
    user = telegram_user.user
    
    if not user:
        telegram_service.send_message(
            chat_id,
            "❌ Authentication error. Please /logout and /start again."
        )
        return
    
    # Show typing indicator
    telegram_service.send_typing_action(chat_id)
    
    # Add to conversation history
    telegram_user.add_to_conversation_history('user', text)
    
    # Forward to Gemini
    try:
        # Get conversation history (last 10 messages)
        conversation_history = telegram_user.conversation_history[-10:] if telegram_user.conversation_history else []
        
        # Call Gemini service
        gemini_service = GeminiService()
        
        # Collect response from Gemini stream
        response_text = ""
        
        async def process_gemini_stream():
            nonlocal response_text
            async for chunk in gemini_service.chat_stream(
                message=text,
                user=user,
                conversation_history=conversation_history,
                telegram_user=telegram_user
            ):
                response_text += chunk
        
        # Run async function
        async_to_sync(process_gemini_stream)()
        
        # Format response for Telegram
        formatted_response = format_crm_response_for_telegram(response_text)
        
        # Send response
        telegram_service.send_message_chunked(chat_id, formatted_response)
        
        # Add to conversation history
        telegram_user.add_to_conversation_history('assistant', response_text)
        
        logger.info(f"Successfully processed message for user {user.email} via Telegram")
    
    except Exception as e:
        logger.error(f"Error processing Gemini request: {str(e)}", exc_info=True)
        telegram_service.send_message(
            chat_id,
            "❌ Sorry, I encountered an error processing your request.\n\nPlease try again or contact support."
        )


def handle_telegram_callback(parsed: Dict[str, Any]):
    """
    Handle Telegram callback queries (button presses).
    """
    chat_id = parsed['chat_id']
    callback_data = parsed['data']
    
    telegram_service = TelegramService()
    
    # Handle callback data
    logger.info(f"Received callback: {callback_data} from chat {chat_id}")
    
    # Answer callback query to remove loading state
    telegram_service._make_request('answerCallbackQuery', {
        'callback_query_id': parsed['callback_query_id'],
        'text': 'Processing...'
    })
    
    # Handle specific callbacks here
    # For now, just acknowledge
    telegram_service.send_message(chat_id, f"Received: {callback_data}")


def handle_profiles_command(telegram_user: TelegramUser, telegram_service: TelegramService):
    """
    Handle /profiles command - list all available profiles for the user.
    """
    chat_id = telegram_user.chat_id
    user = telegram_user.user
    
    if not user:
        telegram_service.send_message(chat_id, "❌ No user linked to this Telegram account.")
        return
    
    # Get all profiles
    profiles = user.user_profiles.filter(status='active').order_by('-is_primary', 'profile_type')
    
    if not profiles.exists():
        telegram_service.send_message(chat_id, "❌ You don't have any active profiles.")
        return
    
    # Get currently selected profile
    current_profile = telegram_user.selected_profile or profiles.filter(is_primary=True).first() or profiles.first()
    
    # Build message
    message_lines = ["<b>👤 Your Profiles</b>\n"]
    
    for idx, profile in enumerate(profiles, 1):
        is_current = (current_profile and profile.id == current_profile.id)
        
        # Profile type icon
        icon = {
            'vendor': '💼',
            'employee': '👔',
            'customer': '🛒'
        }.get(profile.profile_type, '👤')
        
        # Build profile line
        profile_line = f"{idx}. {icon} <b>{profile.profile_type.title()}</b>"
        
        if profile.organization:
            profile_line += f" at <i>{profile.organization.name}</i>"
        else:
            profile_line += " <i>(No organization)</i>"
        
        # Mark primary and current
        badges = []
        if profile.is_primary:
            badges.append("⭐ Primary")
        if is_current:
            badges.append("✅ Active")
        
        if badges:
            profile_line += f" [{', '.join(badges)}]"
        
        profile_line += f"\n   <code>ID: {profile.id}</code>"
        
        # Add org ID if exists
        if profile.organization:
            profile_line += f" | <code>Org: {profile.organization_id}</code>"
        
        message_lines.append(profile_line)
    
    message_lines.append("\n<i>💡 Use /switch &lt;profile_id&gt; to change your active profile</i>")
    message_lines.append("<i>Example: /switch 43</i>")
    
    message = "\n".join(message_lines)
    telegram_service.send_message(chat_id, message)


def handle_switch_command(telegram_user: TelegramUser, args: list, telegram_service: TelegramService):
    """
    Handle /switch command - switch to a different profile.
    """
    chat_id = telegram_user.chat_id
    user = telegram_user.user
    
    if not user:
        telegram_service.send_message(chat_id, "❌ No user linked to this Telegram account.")
        return
    
    if not args or len(args) == 0:
        telegram_service.send_message(
            chat_id,
            "❌ Please provide a profile ID.\n\n<i>Usage: /switch &lt;profile_id&gt;</i>\n<i>Use /profiles to see available profiles</i>"
        )
        return
    
    try:
        profile_id = int(args[0])
    except ValueError:
        telegram_service.send_message(
            chat_id,
            f"❌ Invalid profile ID: {args[0]}\n\n<i>Profile ID must be a number</i>"
        )
        return
    
    # Get the profile
    from crmApp.models import UserProfile
    try:
        profile = UserProfile.objects.get(
            id=profile_id,
            user=user,
            status='active'
        )
    except UserProfile.DoesNotExist:
        telegram_service.send_message(
            chat_id,
            f"❌ Profile ID {profile_id} not found or not accessible.\n\n<i>Use /profiles to see available profiles</i>"
        )
        return
    
    # Update selected profile
    telegram_user.selected_profile = profile
    telegram_user.save(update_fields=['selected_profile'])
    
    # Clear conversation history for clean context
    telegram_user.clear_conversation_history()
    
    # Build confirmation message
    icon = {
        'vendor': '💼',
        'employee': '👔',
        'customer': '🛒'
    }.get(profile.profile_type, '👤')
    
    org_info = f" at <b>{profile.organization.name}</b>" if profile.organization else " (No organization)"
    org_id_info = f"\n<code>Organization ID: {profile.organization_id}</code>" if profile.organization else ""
    
    message = (
        f"✅ <b>Profile switched successfully!</b>\n\n"
        f"{icon} <b>{profile.profile_type.title()}</b>{org_info}\n"
        f"<code>Profile ID: {profile.id}</code>{org_id_info}\n\n"
        f"<i>All new data (leads, customers, deals) will now be linked to this organization.</i>\n\n"
        f"💡 <i>Your conversation history has been cleared for a fresh start.</i>"
    )
    
    telegram_service.send_message(chat_id, message)


@api_view(['GET'])
@permission_classes([AllowAny])
def telegram_webhook_info(request):
    """
    Get current webhook information.
    """
    telegram_service = TelegramService()
    webhook_info = telegram_service.get_webhook_info()
    
    if webhook_info:
        return JsonResponse({
            'ok': True,
            'webhook_info': webhook_info
        })
    else:
        return JsonResponse({
            'ok': False,
            'error': 'Failed to get webhook info'
        }, status=500)


@api_view(['POST'])
@permission_classes([AllowAny])
def telegram_set_webhook(request):
    """
    Set webhook URL for Telegram bot.
    """
    webhook_url = request.data.get('webhook_url')
    
    if not webhook_url:
        return JsonResponse({
            'ok': False,
            'error': 'webhook_url is required'
        }, status=400)
    
    telegram_service = TelegramService()
    success = telegram_service.set_webhook(webhook_url)
    
    if success:
        return JsonResponse({
            'ok': True,
            'message': f'Webhook set to: {webhook_url}'
        })
    else:
        return JsonResponse({
            'ok': False,
            'error': 'Failed to set webhook'
        }, status=500)


@api_view(['GET'])
@permission_classes([AllowAny])
def telegram_bot_info(request):
    """
    Get bot information.
    """
    telegram_service = TelegramService()
    bot_info = telegram_service.get_me()
    
    if bot_info:
        return JsonResponse({
            'ok': True,
            'bot_info': bot_info
        })
    else:
        return JsonResponse({
            'ok': False,
            'error': 'Failed to get bot info'
        }, status=500)

