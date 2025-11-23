"""
WebSocket Consumer for Video Call Notifications
Provides real-time updates for Jitsi video calls without Pusher
"""
import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model

logger = logging.getLogger(__name__)
User = get_user_model()


class VideoCallConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer for real-time video call notifications
    Each user connects to their private channel: video_call_{user_id}
    """
    
    async def connect(self):
        """Handle WebSocket connection"""
        try:
            # Get user ID from URL route
            self.user_id = self.scope['url_route']['kwargs']['user_id']
            self.room_group_name = f'video_call_{self.user_id}'
            
            logger.info(f"[WebSocket] User {self.user_id} attempting to connect")
            
            # Join room group
            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )
            
            # Accept the connection
            await self.accept()
            
            # Send connection confirmation
            await self.send(text_data=json.dumps({
                'type': 'connection_established',
                'message': f'Connected to video call notifications',
                'user_id': self.user_id
            }))
            
            logger.info(f"[WebSocket] User {self.user_id} connected successfully to {self.room_group_name}")
            
        except Exception as e:
            logger.error(f"[WebSocket] Connection error: {e}")
            await self.close()
    
    async def disconnect(self, close_code):
        """Handle WebSocket disconnection"""
        try:
            logger.info(f"[WebSocket] User {self.user_id} disconnecting (code: {close_code})")
            
            # Leave room group
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )
            
        except Exception as e:
            logger.error(f"[WebSocket] Disconnect error: {e}")
    
    async def receive(self, text_data):
        """Handle messages received from WebSocket (ping/pong for keep-alive)"""
        try:
            data = json.loads(text_data)
            
            # Handle ping for keep-alive
            if data.get('type') == 'ping':
                await self.send(text_data=json.dumps({
                    'type': 'pong',
                    'timestamp': data.get('timestamp')
                }))
                
        except Exception as e:
            logger.error(f"[WebSocket] Receive error: {e}")
    
    async def video_call_event(self, event):
        """
        Handle video call events from channel layer
        This method is called when a message is sent to the group
        """
        try:
            # Send message to WebSocket
            await self.send(text_data=json.dumps(event['data']))
            logger.info(f"[WebSocket] Sent {event['data'].get('event')} to user {self.user_id}")
            
        except Exception as e:
            logger.error(f"[WebSocket] Send error: {e}")
