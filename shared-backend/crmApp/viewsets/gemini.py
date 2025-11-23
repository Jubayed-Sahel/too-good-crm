"""
Gemini AI ViewSet
Provides endpoints for AI-powered CRM assistance
"""

import json
import asyncio
import logging
from django.http import StreamingHttpResponse
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from crmApp.services.gemini_service import GeminiService

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
            try:
                logger.info("Starting SSE event stream")
                # Send initial connection message
                yield f"data: {json.dumps({'type': 'connected'})}\n\n"
                
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
                    # Send each chunk as SSE event
                    event_data = {
                        'type': 'message',
                        'content': chunk
                    }
                    yield f"data: {json.dumps(event_data)}\n\n"
                
                logger.info(f"Stream completed after {chunk_count} chunks")
                # Send completion message
                yield f"data: {json.dumps({'type': 'completed'})}\n\n"
                
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

