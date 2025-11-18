"""
Pusher Authentication Endpoint
Required for private channels
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

# Try to import pusher, but handle gracefully if not installed
try:
    import pusher
    PUSHER_AVAILABLE = True
except ImportError:
    PUSHER_AVAILABLE = False
    logger.warning("Pusher package not installed. Real-time messaging will be disabled.")

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def pusher_auth(request):
    """
    Authenticate Pusher private channel subscription
    
    POST /api/pusher/auth/
    {
        "socket_id": "123.456",
        "channel_name": "private-user-123"
    }
    """
    if not PUSHER_AVAILABLE:
        return Response(
            {'error': 'Pusher not installed. Please install pusher package: pip install pusher'},
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )
    
    socket_id = request.data.get('socket_id')
    channel_name = request.data.get('channel_name')
    
    if not socket_id or not channel_name:
        return Response(
            {'error': 'socket_id and channel_name are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Verify user can access this channel
    if channel_name.startswith('private-user-'):
        try:
            user_id = int(channel_name.split('-')[-1])
            if user_id != request.user.id:
                return Response(
                    {'error': 'Unauthorized - you can only subscribe to your own channel'},
                    status=status.HTTP_403_FORBIDDEN
                )
        except (ValueError, IndexError):
            return Response(
                {'error': 'Invalid channel name format'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    # Get Pusher credentials
    app_id = getattr(settings, 'PUSHER_APP_ID', None)
    key = getattr(settings, 'PUSHER_KEY', None)
    secret = getattr(settings, 'PUSHER_SECRET', None)
    cluster = getattr(settings, 'PUSHER_CLUSTER', 'ap2')
    
    if not all([app_id, key, secret]):
        logger.error("Pusher credentials not configured")
        return Response(
            {'error': 'Pusher not configured'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
    try:
        # Generate auth signature
        pusher_client = pusher.Pusher(
            app_id=app_id,
            key=key,
            secret=secret,
            cluster=cluster,
            ssl=True
        )
        
        auth = pusher_client.authenticate(
            channel=channel_name,
            socket_id=socket_id
        )
        
        return Response(auth)
    except Exception as e:
        logger.error(f"Pusher authentication failed: {e}", exc_info=True)
        return Response(
            {'error': 'Authentication failed'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

