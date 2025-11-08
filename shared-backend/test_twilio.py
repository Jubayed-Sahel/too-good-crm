"""
Test script to debug Twilio call initiation
"""
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from crmApp.services.twilio_service import twilio_service
from crmApp.models import Customer

print("=" * 60)
print("TWILIO CONFIGURATION TEST")
print("=" * 60)

print(f"\n1. Is Configured: {twilio_service.is_configured()}")
print(f"2. Account SID: {twilio_service.account_sid[:10]}..." if twilio_service.account_sid else "2. Account SID: None")
print(f"3. Phone Number: {twilio_service.phone_number}")

print("\n" + "=" * 60)
print("TESTING CALL INITIATION")
print("=" * 60)

# Get a customer with a phone number
customer = Customer.objects.filter(phone__isnull=False).exclude(phone='').first()

if customer:
    print(f"\nTest Customer: {customer.name}")
    print(f"Phone: {customer.phone}")
    
    try:
        print("\nInitiating test call...")
        result = twilio_service.initiate_call(
            to_number=customer.phone,
            from_number=None
        )
        print(f"\n✅ SUCCESS!")
        print(f"Call SID: {result['call_sid']}")
        print(f"Status: {result['status']}")
        print(f"To: {result['to']}")
        print(f"From: {result['from']}")
        
    except Exception as e:
        print(f"\n❌ ERROR: {type(e).__name__}")
        print(f"Message: {str(e)}")
        import traceback
        print("\nFull traceback:")
        traceback.print_exc()
else:
    print("\n❌ No customer with phone number found!")
    print("Please create a customer with a phone number first.")

print("\n" + "=" * 60)
