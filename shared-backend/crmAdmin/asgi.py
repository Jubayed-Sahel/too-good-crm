# asgi.py
import os
import django

# configure settings module path
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')

# initialize django
django.setup()

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from channels.security.websocket import AllowedHostsOriginValidator

# Import after django.setup()
from crmApp.routing import websocket_urlpatterns

# Try to import MCP server (optional)
try:
    from django_mcp import mount_mcp_server
    # get the django http application
    django_http_app = get_asgi_application()
    # Mount MCP server dynamically
    http_app_with_mcp = mount_mcp_server(django_http_app=django_http_app, mcp_base_path='/mcp')
except ImportError:
    # If django_mcp not installed, use standard ASGI app
    http_app_with_mcp = get_asgi_application()

# Configure ASGI application with WebSocket support
application = ProtocolTypeRouter({
    "http": http_app_with_mcp,
    "websocket": AllowedHostsOriginValidator(
        AuthMiddlewareStack(
            URLRouter(websocket_urlpatterns)
        )
    ),
})

# for django-channels ASGI:
# from channels.routing import ProtocolTypeRouter
# application = ProtocolTypeRouter({
#     "http": mount_mcp_server(django_http_app=django_http_app, mcp_base_path='/mcp/<slug:user_uuid>')
