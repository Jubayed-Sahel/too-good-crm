"""
Test Pusher Video Call Notifications
Run this to test if Pusher is working correctly
"""
import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'shared-backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from django.contrib.auth import get_user_model
from crmApp.services.jitsi_service import jitsi_service

User = get_user_model()

def test_pusher_connection():
    """Test if Pusher is configured and can connect"""
    print("=" * 60)
    print("Testing Pusher Configuration")
    print("=" * 60)
    
    from django.conf import settings
    
    # Check settings
    print(f"\nPusher Settings:")
    print(f"  PUSHER_APP_ID: {getattr(settings, 'PUSHER_APP_ID', 'NOT SET')}")
    print(f"  PUSHER_KEY: {getattr(settings, 'PUSHER_KEY', 'NOT SET')}")
    print(f"  PUSHER_SECRET: {'***' if getattr(settings, 'PUSHER_SECRET', None) else 'NOT SET'}")
    print(f"  PUSHER_CLUSTER: {getattr(settings, 'PUSHER_CLUSTER', 'NOT SET')}")
    
    # Try to import and initialize Pusher
    try:
        import pusher
        print("\n✅ Pusher package is installed")
        
        pusher_client = pusher.Pusher(
            app_id=settings.PUSHER_APP_ID,
            key=settings.PUSHER_KEY,
            secret=settings.PUSHER_SECRET,
            cluster=settings.PUSHER_CLUSTER,
            ssl=True
        )
        print("✅ Pusher client initialized")
        
        # Test trigger
        result = pusher_client.trigger('test-channel', 'test-event', {'message': 'Hello Pusher!'})
        print(f"✅ Test event triggered: {result}")
        
    except ImportError:
        print("\n❌ Pusher package not installed. Run: pip install pusher")
        return False
    except Exception as e:
        print(f"\n❌ Error initializing Pusher: {e}")
        return False
    
    return True

def test_video_call_notification():
    """Test video call notification system"""
    print("\n" + "=" * 60)
    print("Testing Video Call Notification System")
    print("=" * 60)
    
    # Get two users for testing
    users = User.objects.filter(is_active=True)[:2]
    
    if len(users) < 2:
        print("\n❌ Need at least 2 active users to test. Please create test users.")
        return False
    
    initiator = users[0]
    recipient = users[1]
    
    print(f"\nTest Users:")
    print(f"  Initiator: {initiator.username} (ID: {initiator.id})")
    print(f"  Recipient: {recipient.username} (ID: {recipient.id})")
    
    try:
        # Make sure recipient is available for calls
        from crmApp.models import UserPresence
        recipient_presence, created = UserPresence.objects.get_or_create(user=recipient)
        recipient_presence.available_for_calls = True
        recipient_presence.status = 'online'
        recipient_presence.save()
        print(f"  Set recipient as available for calls")
        
        # Try to get user's organization (optional)
        from crmApp.models import UserProfile
        profile = UserProfile.objects.filter(user=initiator, status='active').first()
        organization = None
        
        if profile and profile.organization:
            organization = profile.organization
            print(f"  Organization: {organization.name}")
        else:
            print(f"  Organization: None (not required)")
        
        # Initiate a test call
        print("\nInitiating test call...")
        call_session = jitsi_service.initiate_call(
            initiator=initiator,
            recipient=recipient,
            call_type='audio',
            organization=organization
        )
        
        print(f"✅ Call session created: {call_session.id}")
        print(f"   Room: {call_session.room_name}")
        print(f"   Status: {call_session.status}")
        print(f"\nPusher should have sent notifications to:")
        print(f"  - private-user-{initiator.id} (Initiator)")
        print(f"  - private-user-{recipient.id} (Recipient)")
        
        # Clean up
        call_session.status = 'completed'
        call_session.save()
        print(f"\n✅ Test call cleaned up")
        
        return True
        
    except Exception as e:
        print(f"\n❌ Error during test: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    print("\n🔧 Pusher Video Call Test Script\n")
    
    # Test 1: Pusher connection
    if not test_pusher_connection():
        print("\n❌ Pusher connection test failed")
        sys.exit(1)
    
    # Test 2: Video call notification
    if not test_video_call_notification():
        print("\n❌ Video call notification test failed")
        sys.exit(1)
    
    print("\n" + "=" * 60)
    print("✅ All tests passed!")
    print("=" * 60)
    print("\nNext steps:")
    print("1. Make sure frontend dev server is running with .env loaded")
    print("2. Open browser console and check for Pusher logs")
    print("3. Login as two different users")
    print("4. Initiate a call and watch the console")
    print("\nExpected console logs:")
    print("  [Pusher] Initialized with user: <id>")
    print("  [Pusher] ✅ Connected to Pusher")
    print("  [Pusher] ✅ Successfully subscribed to: private-user-<id>")
    print("  [Pusher] Call initiated: <call data>")
    print()
