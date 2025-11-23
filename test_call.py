#!/usr/bin/env python
"""
Test script for testing calls between sahel and Hasel
"""
import requests
import json

# API Base URL
BASE_URL = "http://localhost:8000/api"

# User tokens
SAHEL_TOKEN = "71e56de560a8809d1bd7dbaa5c0fc436acc73f4d"
HASEL_TOKEN = "1d224bdfd411f5c830efaea30e97fb41909ef55e"

def test_answer_call():
    """Test Hasel answering sahel's call"""
    print("\n" + "="*60)
    print("Testing: Hasel answering call from sahel")
    print("="*60)
    
    headers = {
        "Authorization": f"Token {HASEL_TOKEN}",
        "Content-Type": "application/json"
    }
    
    data = {"action": "answer"}
    
    try:
        response = requests.post(
            f"{BASE_URL}/jitsi-calls/1/update_status/",
            headers=headers,
            json=data
        )
        
        print(f"\nStatus Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("\n✅ Call answered successfully!")
            print(f"\nCall Status: {result['call_session']['status']}")
            print(f"Is Active: {result['call_session']['is_active']}")
            print(f"Room Name: {result['call_session']['room_name']}")
            print(f"Started At: {result['call_session']['started_at']}")
            print(f"\nParticipants:")
            print(f"  Initiator: {result['call_session']['initiator_name']}")
            print(f"  Recipient: {result['call_session']['recipient_name']}")
            return result
        else:
            print(f"\n❌ Error: {response.text}")
            return None
            
    except Exception as e:
        print(f"\n❌ Exception occurred: {str(e)}")
        return None

def test_end_call():
    """Test ending the call"""
    print("\n" + "="*60)
    print("Testing: Ending the call")
    print("="*60)
    
    headers = {
        "Authorization": f"Token {SAHEL_TOKEN}",
        "Content-Type": "application/json"
    }
    
    data = {"action": "end"}
    
    try:
        response = requests.post(
            f"{BASE_URL}/jitsi-calls/1/update_status/",
            headers=headers,
            json=data
        )
        
        print(f"\nStatus Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("\n✅ Call ended successfully!")
            print(f"\nCall Status: {result['call_session']['status']}")
            print(f"Duration: {result['call_session']['duration_formatted']}")
            return result
        else:
            print(f"\n❌ Error: {response.text}")
            return None
            
    except Exception as e:
        print(f"\n❌ Exception occurred: {str(e)}")
        return None

if __name__ == "__main__":
    print("\n🧪 Call Testing Script")
    print("Testing calls between sahel and Hasel\n")
    
    # Test answering the call
    answer_result = test_answer_call()
    
    if answer_result:
        input("\n⏸️  Press Enter to end the call...")
        # Test ending the call
        test_end_call()
    
    print("\n✅ Testing complete!\n")
