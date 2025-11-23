#!/usr/bin/env python
"""Test JWT generation for existing call"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from crmApp.models import JitsiCallSession, User
from crmApp.services.jitsi_service import jitsi_service

# Get existing call
call = JitsiCallSession.objects.filter(id=1).first()

if call:
    print(f"\n✅ Found call ID: {call.id}")
    print(f"Room: {call.room_name}")
    print(f"Status: {call.status}")
    
    # Try to get video URL
    try:
        user = User.objects.get(id=27)
        url_data = jitsi_service.get_video_url(call, user)
        
        print(f"\n✅ Video URL generated successfully!")
        print(f"JWT Token length: {len(url_data['jwt_token'])}")
        print(f"Video URL: {url_data['video_url']}")
        print(f"Room name: {url_data['room_name']}")
        print(f"App ID: {url_data['app_id']}")
        print(f"Server: {url_data['server_domain']}")
        
    except Exception as e:
        print(f"\n❌ Error generating video URL: {e}")
        import traceback
        traceback.print_exc()
else:
    print("❌ No call found with ID 1")
