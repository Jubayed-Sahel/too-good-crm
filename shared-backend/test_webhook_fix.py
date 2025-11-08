#!/usr/bin/env python
"""
Quick test to verify ALLOWED_HOSTS fix for Linear webhooks
"""
import requests
import time

# Configuration
BASE_URL = "http://localhost:8000"
TOKEN = "e3b23a9b107b617bada0d3baa0cfd5b6c91ac3e6"  # Admin token

def test_webhook_host():
    """Test that the ngrok URL is now in ALLOWED_HOSTS"""
    print("\n🔍 Testing ALLOWED_HOSTS fix...")
    print("=" * 70)
    
    # Wait for server
    time.sleep(2)
    
    # Try to access API with ngrok host header
    headers = {
        "Authorization": f"Token {TOKEN}",
        "Host": "stephine-nonconfiding-pseudotribally.ngrok-free.dev"
    }
    
    try:
        response = requests.get(f"{BASE_URL}/api/issues/", headers=headers)
        if response.status_code == 200:
            print("✅ SUCCESS: ngrok URL is now in ALLOWED_HOSTS!")
            print(f"   Response: {response.status_code}")
            return True
        else:
            print(f"❌ FAILED: Got status {response.status_code}")
            print(f"   Response: {response.text[:200]}")
            return False
    except Exception as e:
        print(f"❌ ERROR: {e}")
        return False

def test_webhook_endpoint():
    """Test the webhook endpoint directly"""
    print("\n🔍 Testing webhook endpoint...")
    print("=" * 70)
    
    # Simulate a Linear webhook payload
    webhook_payload = {
        "action": "update",
        "type": "Issue",
        "data": {
            "id": "test-123",
            "title": "Test Issue",
            "state": {
                "name": "In Progress"
            },
            "priority": 2
        }
    }
    
    headers = {
        "Content-Type": "application/json",
        "Linear-Signature": "test-signature",  # This will fail validation, but that's OK for ALLOWED_HOSTS test
        "Host": "stephine-nonconfiding-pseudotribally.ngrok-free.dev"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/webhooks/linear/",
            json=webhook_payload,
            headers=headers
        )
        
        if response.status_code == 400 and "Invalid signature" in response.text:
            print("✅ SUCCESS: Webhook endpoint accessible (signature validation working)")
            print(f"   Status: {response.status_code}")
            return True
        elif response.status_code == 400 and "Invalid HTTP_HOST" in response.text:
            print("❌ FAILED: Still getting ALLOWED_HOSTS error")
            print(f"   Response: {response.text[:200]}")
            return False
        else:
            print(f"⚠️  Unexpected response: {response.status_code}")
            print(f"   Response: {response.text[:200]}")
            return False
    except Exception as e:
        print(f"❌ ERROR: {e}")
        return False

if __name__ == "__main__":
    print("\n" + "="*70)
    print("🔧 Testing ALLOWED_HOSTS Fix for Linear Webhooks")
    print("="*70)
    
    # Run tests
    test1 = test_webhook_host()
    test2 = test_webhook_endpoint()
    
    print("\n" + "="*70)
    if test1 and test2:
        print("✅ ALL TESTS PASSED!")
        print("   Linear webhooks should now work correctly.")
    else:
        print("❌ SOME TESTS FAILED")
        print("   Check the output above for details.")
    print("="*70 + "\n")
