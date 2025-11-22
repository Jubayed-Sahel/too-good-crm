"""
Telegram Bot Service
Handles all interactions with Telegram Bot API
"""
import os
import logging
import requests
from typing import Optional, Dict, Any
from django.conf import settings
from django.utils import timezone
from datetime import timedelta

logger = logging.getLogger(__name__)


class TelegramService:
    """
    Service for interacting with Telegram Bot API.
    Handles sending messages, handling commands, and managing bot interactions.
    """
    
    TELEGRAM_API_BASE_URL = "https://api.telegram.org/bot"
    
    def __init__(self):
        self.bot_token = getattr(settings, 'TG_BOT_TOKEN', None) or os.getenv('TG_BOT_TOKEN')
        
        if not self.bot_token:
            logger.warning("TG_BOT_TOKEN not configured. Telegram bot features will not be available.")
            self.bot_api_url = None
        else:
            self.bot_api_url = f"{self.TELEGRAM_API_BASE_URL}{self.bot_token}"
    
    def _make_request(self, method: str, data: Optional[Dict] = None) -> Optional[Dict]:
        """
        Make a request to Telegram Bot API.
        
        Args:
            method: Telegram Bot API method (e.g., 'sendMessage', 'sendPhoto')
            data: Request payload
            
        Returns:
            Response JSON or None if error
        """
        if not self.bot_api_url:
            logger.error("Telegram bot token not configured")
            return None
        
        url = f"{self.bot_api_url}/{method}"
        
        try:
            response = requests.post(url, json=data, timeout=10)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"Telegram API request failed: {str(e)}")
            return None
    
    def send_message(
        self,
        chat_id: int,
        text: str,
        parse_mode: str = "HTML",
        reply_markup: Optional[Dict] = None,
        disable_web_page_preview: bool = True
    ) -> bool:
        """
        Send a text message to a Telegram chat.
        
        Args:
            chat_id: Telegram chat ID
            text: Message text
            parse_mode: HTML or Markdown
            reply_markup: Inline keyboard markup
            disable_web_page_preview: Disable link previews
            
        Returns:
            True if successful, False otherwise
        """
        data = {
            "chat_id": chat_id,
            "text": text,
            "parse_mode": parse_mode,
            "disable_web_page_preview": disable_web_page_preview,
        }
        
        if reply_markup:
            data["reply_markup"] = reply_markup
        
        result = self._make_request("sendMessage", data)
        
        if result and result.get("ok"):
            logger.debug(f"Message sent to chat {chat_id}")
            return True
        else:
            error_desc = result.get("description", "Unknown error") if result else "No response"
            logger.error(f"Failed to send message to chat {chat_id}: {error_desc}")
            return False
    
    def send_message_chunked(
        self,
        chat_id: int,
        text: str,
        max_length: int = 4096,
        **kwargs
    ) -> bool:
        """
        Send a long message split into chunks (Telegram has 4096 character limit).
        
        Args:
            chat_id: Telegram chat ID
            text: Message text to split
            max_length: Maximum length per message (default 4096)
            **kwargs: Additional arguments for send_message
            
        Returns:
            True if all chunks sent successfully, False otherwise
        """
        if len(text) <= max_length:
            return self.send_message(chat_id, text, **kwargs)
        
        # Split text into chunks
        chunks = []
        lines = text.split('\n')
        current_chunk = ""
        
        for line in lines:
            if len(current_chunk) + len(line) + 1 <= max_length:
                current_chunk += line + '\n' if current_chunk else line + '\n'
            else:
                if current_chunk:
                    chunks.append(current_chunk.strip())
                current_chunk = line + '\n'
        
        if current_chunk:
            chunks.append(current_chunk.strip())
        
        # Send all chunks
        all_sent = True
        for chunk in chunks:
            if not self.send_message(chat_id, chunk, **kwargs):
                all_sent = False
        
        return all_sent
    
    def send_typing_action(self, chat_id: int) -> bool:
        """
        Send "typing..." action to show bot is processing.
        
        Args:
            chat_id: Telegram chat ID
            
        Returns:
            True if successful, False otherwise
        """
        data = {
            "chat_id": chat_id,
            "action": "typing"
        }
        
        result = self._make_request("sendChatAction", data)
        return result and result.get("ok", False)
    
    def send_keyboard(
        self,
        chat_id: int,
        text: str,
        keyboard: list,
        resize_keyboard: bool = True,
        one_time_keyboard: bool = False
    ) -> bool:
        """
        Send message with inline keyboard buttons.
        
        Args:
            chat_id: Telegram chat ID
            text: Message text
            keyboard: List of button rows, each row is list of button dicts
                     Example: [[{"text": "Option 1"}, {"text": "Option 2"}]]
            resize_keyboard: Auto-resize keyboard
            one_time_keyboard: Hide keyboard after use
            
        Returns:
            True if successful, False otherwise
        """
        reply_markup = {
            "keyboard": keyboard,
            "resize_keyboard": resize_keyboard,
            "one_time_keyboard": one_time_keyboard
        }
        
        return self.send_message(chat_id, text, reply_markup=reply_markup)
    
    def send_inline_keyboard(
        self,
        chat_id: int,
        text: str,
        inline_keyboard: list
    ) -> bool:
        """
        Send message with inline keyboard buttons.
        
        Args:
            chat_id: Telegram chat ID
            text: Message text
            inline_keyboard: List of button rows
                           Example: [[{"text": "Button", "callback_data": "data"}]]
            
        Returns:
            True if successful, False otherwise
        """
        reply_markup = {
            "inline_keyboard": inline_keyboard
        }
        
        return self.send_message(chat_id, text, reply_markup=reply_markup)
    
    def edit_message(
        self,
        chat_id: int,
        message_id: int,
        text: str,
        reply_markup: Optional[Dict] = None
    ) -> bool:
        """
        Edit an existing message.
        
        Args:
            chat_id: Telegram chat ID
            message_id: Message ID to edit
            text: New message text
            reply_markup: New keyboard markup
            
        Returns:
            True if successful, False otherwise
        """
        data = {
            "chat_id": chat_id,
            "message_id": message_id,
            "text": text,
            "parse_mode": "HTML"
        }
        
        if reply_markup:
            data["reply_markup"] = reply_markup
        
        result = self._make_request("editMessageText", data)
        return result and result.get("ok", False)
    
    def delete_message(self, chat_id: int, message_id: int) -> bool:
        """
        Delete a message.
        
        Args:
            chat_id: Telegram chat ID
            message_id: Message ID to delete
            
        Returns:
            True if successful, False otherwise
        """
        data = {
            "chat_id": chat_id,
            "message_id": message_id
        }
        
        result = self._make_request("deleteMessage", data)
        return result and result.get("ok", False)
    
    def set_webhook(self, webhook_url: str) -> bool:
        """
        Set webhook URL for receiving updates.
        
        Args:
            webhook_url: Full URL where Telegram should send updates
            
        Returns:
            True if successful, False otherwise
        """
        data = {
            "url": webhook_url
        }
        
        result = self._make_request("setWebhook", data)
        
        if result and result.get("ok"):
            logger.info(f"Webhook set to: {webhook_url}")
            return True
        else:
            error_desc = result.get("description", "Unknown error") if result else "No response"
            logger.error(f"Failed to set webhook: {error_desc}")
            return False
    
    def get_webhook_info(self) -> Optional[Dict]:
        """
        Get current webhook information.
        
        Returns:
            Webhook info dict or None if error
        """
        result = self._make_request("getWebhookInfo")
        
        if result and result.get("ok"):
            return result.get("result")
        return None
    
    def delete_webhook(self) -> bool:
        """
        Delete webhook (switch to polling mode).
        
        Returns:
            True if successful, False otherwise
        """
        result = self._make_request("deleteWebhook")
        return result and result.get("ok", False)
    
    def get_me(self) -> Optional[Dict]:
        """
        Get bot information.
        
        Returns:
            Bot info dict or None if error
        """
        result = self._make_request("getMe")
        
        if result and result.get("ok"):
            return result.get("result")
        return None
    
    def format_message_for_telegram(self, text: str) -> str:
        """
        Format message text for Telegram HTML parse mode.
        Escapes HTML special characters and formats common patterns.
        
        Args:
            text: Raw message text
            
        Returns:
            Formatted HTML text
        """
        # Escape HTML special characters
        text = text.replace('&', '&amp;')
        text = text.replace('<', '&lt;')
        text = text.replace('>', '&gt;')
        
        # Format markdown-style patterns to HTML
        import re
        
        # Bold: **text** -> <b>text</b>
        text = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', text)
        
        # Italic: *text* -> <i>text</i>
        text = re.sub(r'\*(.+?)\*', r'<i>\1</i>', text)
        
        # Code: `code` -> <code>code</code>
        text = re.sub(r'`(.+?)`', r'<code>\1</code>', text)
        
        # Code block: ```code``` -> <pre><code>code</code></pre>
        text = re.sub(r'```(.+?)```', r'<pre><code>\1</code></pre>', text, flags=re.DOTALL)
        
        # Links: [text](url) -> <a href="url">text</a>
        text = re.sub(r'\[(.+?)\]\((.+?)\)', r'<a href="\2">\1</a>', text)
        
        return text

