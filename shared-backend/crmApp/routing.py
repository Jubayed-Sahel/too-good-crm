"""
WebSocket URL routing for Django Channels
"""
from django.urls import re_path
from crmApp.consumers.video_call_consumer import VideoCallConsumer

websocket_urlpatterns = [
    re_path(r'ws/video-call/(?P<user_id>\d+)/$', VideoCallConsumer.as_asgi()),
]
