# asgi.py
import os
import django
from django.core.asgi import get_asgi_application

# new import
from django_mcp import mount_mcp_server

# configure settings module path
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')

# initialize django
django.setup()

# get the django http application
django_http_app = get_asgi_application()

# Mount MCP server dynamically using a URL parameter (e.g., user_uuid)
application = mount_mcp_server(django_http_app=django_http_app, mcp_base_path='/mcp')

# for django-channels ASGI:
# from channels.routing import ProtocolTypeRouter
# application = ProtocolTypeRouter({
#     "http": mount_mcp_server(django_http_app=django_http_app, mcp_base_path='/mcp/<slug:user_uuid>')
