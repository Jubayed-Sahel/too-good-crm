"""
Gemini AI ViewSet
Provides endpoints for AI-powered CRM assistance
"""

import json
import asyncio
import logging
import uuid
from django.http import StreamingHttpResponse
from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from asgiref.sync import sync_to_async

from crmApp.services.gemini_service import GeminiService
from crmApp.models import GeminiConversation

logger = logging.getLogger(__name__)


class GeminiViewSet(viewsets.ViewSet):
    """
    ViewSet for Gemini AI chat interactions.
    Provides streaming chat responses with MCP tool access.
    """
    permission_classes = [IsAuthenticated]
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.gemini_service = GeminiService()
    
    @action(detail=False, methods=['post'], url_path='chat')
    def chat(self, request):
        """
        Stream Gemini AI responses with real-time CRM tool access.
        
        POST /api/gemini/chat/
        
        Request body:
        {
            "message": "Show me all high-priority customers",
            "conversation_id": "optional-uuid",
            "history": [optional previous messages]
        }
        
        Response:
            Streaming text/event-stream with Gemini responses
        """
        try:
            message = request.data.get('message')
            conversation_id = request.data.get('conversation_id')
            history = request.data.get('history', [])
            
            if not message:
                return Response(
                    {'error': 'Message is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            user = request.user
            
            # Get organization from user's active profile
            org_id = None
            active_profile = user.user_profiles.filter(status='active', is_primary=True).first()
            if not active_profile:
                active_profile = user.user_profiles.filter(status='active').first()
            if active_profile:
                org_id = active_profile.organization_id
            
            # Get or create conversation
            if not conversation_id:
                conversation_id = str(uuid.uuid4())
            
            conversation, created = GeminiConversation.objects.get_or_create(
                conversation_id=conversation_id,
                defaults={
                    'user': user,
                    'organization_id': org_id,
                    'messages': []
                }
            )
            
            # If conversation exists but belongs to different user, reject
            if not created and conversation.user != user:
                return Response(
                    {'error': 'Conversation not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Load history from database if not provided
            if not history and conversation.messages:
                history = [
                    {'role': msg['role'], 'content': msg['content']}
                    for msg in conversation.messages
                ]
            
            # Add user message to conversation
            conversation.add_message('user', message)
            
        except Exception as e:
            logger.error(f"Error parsing request: {str(e)}", exc_info=True)
            return Response(
                {'error': f'Invalid request: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        logger.info(
            f"Gemini chat request from user {user.id}: "
            f"message_length={len(message)}, conversation_id={conversation_id}, "
            f"history_length={len(history)}"
        )
        logger.info(f"API key configured: {bool(self.gemini_service.api_key)}")
        
        async def event_stream():
            """Generate Server-Sent Events stream"""
            assistant_response = ""
            try:
                logger.info("Starting SSE event stream")
                # Send initial connection message with conversation_id
                yield f"data: {json.dumps({'type': 'connected', 'conversation_id': conversation_id})}\n\n"
                
                logger.info("Calling gemini_service.chat_stream")
                # Stream Gemini responses
                chunk_count = 0
                async for chunk in self.gemini_service.chat_stream(
                    message=message,
                    user=user,
                    conversation_history=history
                ):
                    chunk_count += 1
                    logger.debug(f"Received chunk {chunk_count}: {chunk[:50]}...")
                    assistant_response += chunk
                    # Send each chunk as SSE event
                    event_data = {
                        'type': 'message',
                        'content': chunk
                    }
                    yield f"data: {json.dumps(event_data)}\n\n"
                
                logger.info(f"Stream completed after {chunk_count} chunks")
                
                # Save assistant response to conversation (use sync_to_async to avoid database errors)
                if assistant_response:
                    await sync_to_async(conversation.add_message, thread_sensitive=False)('assistant', assistant_response)
                
                # Send completion message
                yield f"data: {json.dumps({'type': 'completed', 'conversation_id': conversation_id})}\n\n"
                
            except Exception as e:
                error_msg = f"Error in stream: {str(e)}"
                logger.error(error_msg, exc_info=True)
                
                error_data = {
                    'type': 'error',
                    'error': error_msg
                }
                yield f"data: {json.dumps(error_data)}\n\n"
        
        def sync_event_stream():
            """Wrapper to run async stream in sync context"""
            import asyncio
            from asgiref.sync import async_to_sync
            
            # Create a new event loop for this thread
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            
            try:
                # Run the async generator in the new loop
                async def run_stream():
                    async for chunk in event_stream():
                        yield chunk
                
                gen = run_stream()
                while True:
                    try:
                        chunk = loop.run_until_complete(gen.__anext__())
                        yield chunk
                    except StopAsyncIteration:
                        break
            except Exception as e:
                logger.error(f"Error in sync_event_stream: {str(e)}", exc_info=True)
                error_data = {
                    'type': 'error',
                    'error': str(e)
                }
                yield f"data: {json.dumps(error_data)}\n\n"
            finally:
                loop.close()
        
        # Return streaming response
        response = StreamingHttpResponse(
            sync_event_stream(),
            content_type='text/event-stream'
        )
        response['Cache-Control'] = 'no-cache'
        response['X-Accel-Buffering'] = 'no'
        
        return response
    
    @action(detail=False, methods=['get'], url_path='conversations')
    def list_conversations(self, request):
        """
        List user's Gemini conversation history.
        
        GET /api/gemini/conversations/
        
        Response:
        [
            {
                "conversation_id": "uuid",
                "title": "First message...",
                "last_message_at": "2025-11-30T10:00:00Z",
                "message_count": 10
            }
        ]
        """
        try:
            conversations = GeminiConversation.objects.filter(
                user=request.user
            ).order_by('-last_message_at')[:50]  # Last 50 conversations
            
            data = []
            for conv in conversations:
                data.append({
                    'conversation_id': conv.conversation_id,
                    'title': conv.title or 'New Conversation',
                    'last_message_at': conv.last_message_at.isoformat(),
                    'message_count': len(conv.messages),
                    'created_at': conv.created_at.isoformat()
                })
            
            return Response(data)
            
        except Exception as e:
            logger.error(f"Error listing conversations: {str(e)}", exc_info=True)
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'], url_path='conversations/(?P<conversation_id>[^/.]+)')
    def get_conversation(self, request, conversation_id=None):
        """
        Get a specific conversation with full message history.
        
        GET /api/gemini/conversations/{conversation_id}/
        
        Response:
        {
            "conversation_id": "uuid",
            "title": "First message...",
            "messages": [
                {"role": "user", "content": "...", "timestamp": "..."},
                {"role": "assistant", "content": "...", "timestamp": "..."}
            ]
        }
        """
        try:
            conversation = GeminiConversation.objects.get(
                conversation_id=conversation_id,
                user=request.user
            )
            
            return Response({
                'conversation_id': conversation.conversation_id,
                'title': conversation.title or 'New Conversation',
                'messages': conversation.messages,
                'last_message_at': conversation.last_message_at.isoformat(),
                'created_at': conversation.created_at.isoformat()
            })
            
        except GeminiConversation.DoesNotExist:
            return Response(
                {'error': 'Conversation not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error getting conversation: {str(e)}", exc_info=True)
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['delete'], url_path='conversations/(?P<conversation_id>[^/.]+)')
    def delete_conversation(self, request, conversation_id=None):
        """
        Delete a conversation.
        
        DELETE /api/gemini/conversations/{conversation_id}/
        """
        try:
            conversation = GeminiConversation.objects.get(
                conversation_id=conversation_id,
                user=request.user
            )
            conversation.delete()
            
            return Response({'message': 'Conversation deleted'})
            
        except GeminiConversation.DoesNotExist:
            return Response(
                {'error': 'Conversation not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error deleting conversation: {str(e)}", exc_info=True)
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'], url_path='status')
    def status_check(self, request):
        """
        Check Gemini service status.
        
        GET /api/gemini/status/
        
        Response:
        {
            "available": true/false,
            "model": "gemini-2.5-flash",
            "user_context": {...}
        }
        """
        try:
            api_key_configured = self.gemini_service.api_key is not None and len(self.gemini_service.api_key) > 0
            
            user_context = None
            try:
                # Call the synchronous version for this non-async view
                user_context = self.gemini_service.get_user_context_sync(request.user)
            except Exception as e:
                logger.warning(f"Could not get user context: {str(e)}")
            
            # Test API key validity
            api_key_valid = False
            api_test_error = None
            if api_key_configured:
                try:
                    # Quick validation - just check if key has reasonable format
                    api_key_valid = len(self.gemini_service.api_key) > 20
                except Exception as e:
                    api_test_error = str(e)
            
            return Response({
                'available': api_key_configured and api_key_valid,
                'model': self.gemini_service.model_name,
                'api_key_configured': api_key_configured,
                'api_key_format_valid': api_key_valid,
                'api_test_error': api_test_error,
                'user_context': {
                    'user_id': user_context.get('user_id') if user_context else None,
                    'organization_id': user_context.get('organization_id') if user_context else None,
                    'role': user_context.get('role') if user_context else None,
                    'permissions_count': len(user_context.get('permissions', [])) if user_context else 0
                } if user_context else None
            })
            
        except Exception as e:
            logger.error(f"Error checking Gemini status: {str(e)}", exc_info=True)
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

