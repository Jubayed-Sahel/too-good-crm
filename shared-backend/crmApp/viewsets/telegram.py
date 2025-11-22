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
                conversation_history=conversation_history
            ):
                response_text += chunk
        
        # Run async function
        async_to_sync(process_gemini_stream)()
        
        # Check if response contains error about leaked API key
        response_lower = response_text.lower()
        if ("403" in response_text or "permission_denied" in response_lower) and "leaked" in response_lower:
            error_message = (
                "🔒 <b>API Key Security Issue</b>\n\n"
                "Your Gemini API key has been reported as leaked and is no longer valid.\n\n"
                "<b>To fix this:</b>\n"
                "1. Go to Google AI Studio (https://aistudio.google.com/apikey)\n"
                "2. Create a new API key\n"
                "3. Update the GEMINI_API_KEY in your environment variables\n"
                "4. Restart the backend server\n\n"
                "⚠️ <b>Important:</b> Never commit API keys to version control or share them publicly."
            )
            telegram_service.send_message_chunked(chat_id, error_message)
            return
        
        # Format response for Telegram
        formatted_response = format_crm_response_for_telegram(response_text)
        
        # Send response
        telegram_service.send_message_chunked(chat_id, formatted_response)
        
        # Add to conversation history
        telegram_user.add_to_conversation_history('assistant', response_text)
        
        logger.info(f"Successfully processed message for user {user.email} via Telegram")
    
    except Exception as e:
        error_str = str(e)
        error_repr = repr(e)
        logger.error(f"Error processing Gemini request: {str(e)}", exc_info=True)
        
        # Check for specific error types and provide helpful messages
        if ("403" in error_str or "PERMISSION_DENIED" in error_str) and ("leaked" in error_str.lower() or "leaked" in error_repr.lower()):
            error_message = (
                "🔒 <b>API Key Security Issue</b>\n\n"
                "Your Gemini API key has been reported as leaked and is no longer valid.\n\n"
                "<b>To fix this:</b>\n"
                "1. Go to Google AI Studio (https://aistudio.google.com/apikey)\n"
                "2. Create a new API key\n"
                "3. Update the GEMINI_API_KEY in your environment variables\n"
                "4. Restart the backend server\n\n"
                "⚠️ <b>Important:</b> Never commit API keys to version control or share them publicly."
            )
        elif "403" in error_str or "PERMISSION_DENIED" in error_str:
            error_message = (
                "⚠️ <b>API Access Denied</b>\n\n"
                "There's an issue with the Gemini API key permissions.\n\n"
                "Please contact your administrator to check the API key configuration."
            )
        elif "429" in error_str or "RESOURCE_EXHAUSTED" in error_str:
            error_message = "⏸️ Rate limit exceeded. Please wait a moment and try again."
        elif "401" in error_str or "UNAUTHORIZED" in error_str:
            error_message = (
                "⚠️ <b>Authentication Failed</b>\n\n"
                "The Gemini API key is invalid or not configured.\n\n"
                "Please contact your administrator."
            )
        else:
            error_message = (
                "❌ Sorry, I encountered an error processing your request.\n\n"
                "Please try again or contact support.\n\n"
                f"<i>Error: {error_str[:100]}</i>"
            )
        
        telegram_service.send_message(chat_id, error_message)


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

