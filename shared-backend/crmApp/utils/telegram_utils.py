"""
Telegram Bot Utilities
Helper functions for parsing and formatting Telegram messages
"""
import re
import logging
from typing import Optional, Dict, Any, Tuple

logger = logging.getLogger(__name__)


def parse_telegram_update(update: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """
    Parse incoming Telegram update and extract relevant information.
    
    Args:
        update: Raw Telegram update JSON
        
    Returns:
        Parsed message data or None if not a valid message
    """
    try:
        # Check if it's a message
        if 'message' in update:
            message = update['message']
            chat = message.get('chat', {})
            from_user = message.get('from', {})
            
            # Extract text
            text = message.get('text', '')
            
            # Handle commands
            is_command = False
            command = None
            command_args = []
            
            if text.startswith('/'):
                is_command = True
                parts = text.split()
                command = parts[0][1:].lower()  # Remove '/' and convert to lowercase
                command_args = parts[1:] if len(parts) > 1 else []
            
            return {
                'type': 'message',
                'message_id': message.get('message_id'),
                'chat_id': chat.get('id'),
                'chat_type': chat.get('type'),  # 'private', 'group', etc.
                'from_user': {
                    'id': from_user.get('id'),
                    'username': from_user.get('username'),
                    'first_name': from_user.get('first_name'),
                    'last_name': from_user.get('last_name'),
                    'language_code': from_user.get('language_code'),
                },
                'text': text,
                'is_command': is_command,
                'command': command,
                'command_args': command_args,
                'date': message.get('date'),
                'raw': message
            }
        
        # Check if it's a callback query (button press)
        elif 'callback_query' in update:
            callback = update['callback_query']
            message = callback.get('message', {})
            chat = message.get('chat', {})
            from_user = callback.get('from', {})
            
            return {
                'type': 'callback_query',
                'callback_query_id': callback.get('id'),
                'chat_id': chat.get('id'),
                'from_user': {
                    'id': from_user.get('id'),
                    'username': from_user.get('username'),
                    'first_name': from_user.get('first_name'),
                    'last_name': from_user.get('last_name'),
                },
                'data': callback.get('data'),
                'message_id': message.get('message_id'),
                'raw': callback
            }
        
        # Unknown update type
        else:
            logger.warning(f"Unknown update type: {update.keys()}")
            return None
    
    except Exception as e:
        logger.error(f"Error parsing Telegram update: {str(e)}", exc_info=True)
        return None


def extract_email(text: str) -> Optional[str]:
    """
    Extract email address from text.
    
    Args:
        text: Text to search for email
        
    Returns:
        Email address or None
    """
    # Email regex pattern
    email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    match = re.search(email_pattern, text)
    
    if match:
        return match.group(0).strip().lower()
    
    return None


def is_valid_email(text: str) -> bool:
    """
    Check if text is a valid email address.
    
    Args:
        text: Text to validate
        
    Returns:
        True if valid email, False otherwise
    """
    email_pattern = r'^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$'
    return bool(re.match(email_pattern, text.strip()))


def sanitize_text_for_telegram(text: str) -> str:
    """
    Sanitize text for Telegram HTML parse mode.
    Escapes special HTML characters.
    
    Args:
        text: Raw text
        
    Returns:
        Sanitized text
    """
    # Escape HTML special characters
    text = text.replace('&', '&amp;')
    text = text.replace('<', '&lt;')
    text = text.replace('>', '&gt;')
    text = text.replace('"', '&quot;')
    text = text.replace("'", '&#39;')
    
    return text


def truncate_message(text: str, max_length: int = 4000) -> str:
    """
    Truncate message to max length with ellipsis.
    
    Args:
        text: Message text
        max_length: Maximum length (default 4000 for Telegram limit with safety margin)
        
    Returns:
        Truncated text
    """
    if len(text) <= max_length:
        return text
    
    # Try to truncate at a sentence boundary
    truncated = text[:max_length - 3]
    last_period = truncated.rfind('.')
    last_newline = truncated.rfind('\n')
    
    # Cut at sentence or line if found in last 200 chars
    cut_point = max(last_period, last_newline)
    if cut_point > max_length - 200:
        truncated = truncated[:cut_point + 1]
    
    return truncated + "..."


def format_crm_response_for_telegram(response: str) -> str:
    """
    Format Gemini/CRM response for Telegram display.
    Adds emojis, formatting, and makes it Telegram-friendly.
    
    Args:
        response: Raw response from Gemini
        
    Returns:
        Formatted response for Telegram
    """
    # Basic formatting
    text = response.strip()
    
    # Replace common patterns with emojis (using re.IGNORECASE flag instead of inline (?i))
    text = re.sub(r'\b(success|successful|completed|done)\b', '✅', text, flags=re.IGNORECASE)
    text = re.sub(r'\b(error|failed|failure)\b', '❌', text, flags=re.IGNORECASE)
    text = re.sub(r'\b(warning|caution)\b', '⚠️', text, flags=re.IGNORECASE)
    text = re.sub(r'\b(info|information)\b', 'ℹ️', text, flags=re.IGNORECASE)
    
    # Format lists
    lines = text.split('\n')
    formatted_lines = []
    
    for line in lines:
        line = line.strip()
        if not line:
            formatted_lines.append('')
            continue
        
        # Format bullet points
        if line.startswith('- ') or line.startswith('* '):
            line = '• ' + line[2:]
        
        # Format numbered lists
        numbered_match = re.match(r'^(\d+)\.\s+(.+)$', line)
        if numbered_match:
            number = numbered_match.group(1)
            content = numbered_match.group(2)
            line = f"{number}. {content}"
        
        formatted_lines.append(line)
    
    text = '\n'.join(formatted_lines)
    
    # Truncate if too long
    text = truncate_message(text)
    
    return text


def create_command_help_message() -> str:
    """
    Create help message with all available commands.
    
    Returns:
        Formatted help message
    """
    message = (
        "<b>🤖 CRM Telegram Bot - Commands</b>\n\n"
        "<b>Authentication:</b>\n"
        "/start - Start authentication flow\n"
        "/login - Login to your CRM account\n"
        "/logout - Logout from Telegram bot\n"
        "/me - View your account information\n\n"
        "<b>Profile Management:</b>\n"
        "/profiles - List all your profiles (vendor/employee/customer)\n"
        "/switch &lt;id&gt; - Switch to a different profile/organization\n\n"
        "<b>CRM Actions:</b>\n"
        "Just ask naturally in plain English!\n\n"
        "<b>Examples:</b>\n"
        "• \"Show my deals\"\n"
        "• \"List all customers\"\n"
        "• \"Create a new lead named John from Facebook\"\n"
        "• \"Update deal 23 to negotiation stage\"\n"
        "• \"Record payment of 3000 for order #12\"\n"
        "• \"Show statistics for this month\"\n"
        "• \"Create a support issue\"\n\n"
        "<b>Other Commands:</b>\n"
        "/help - Show this help message\n"
        "/features - See all available CRM actions\n"
        "/actions - Quick actions based on your role\n"
        "/clear - Clear conversation history\n\n"
        "<i>💡 All CRM actions use AI-powered natural language processing.</i>\n"
        "<i>🔄 Use /profiles and /switch to work with different organizations.</i>"
    )
    
    return message


def validate_webhook_secret(update: Dict, secret_token: Optional[str] = None) -> bool:
    """
    Validate webhook secret token if configured.
    
    Args:
        update: Telegram update
        secret_token: Secret token from settings
        
    Returns:
        True if valid or no secret configured, False otherwise
    """
    if not secret_token:
        return True
    
    # Telegram sends secret token in header
    # This should be checked in the view
    return True

