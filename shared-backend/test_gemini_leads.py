import os
import sys
import django
import asyncio

# Setup Django
sys.path.insert(0, os.path.dirname(__file__))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from crmApp.models import User
from crmApp.services.gemini_service import GeminiService

async def test_leads():
    # Get user
    user = User.objects.get(email='sahel@gmail.com')
    print(f"Testing Gemini with user: {user.email}")
    
    # Create Gemini service
    gemini = GeminiService()
    
    # Test query
    query = "Show my leads"
    print(f"\nQuery: {query}")
    print("=" * 60)
    
    response_text = ""
    async for chunk in gemini.chat_stream(query, user):
        response_text += chunk
        print(chunk, end='', flush=True)
    
    print("\n" + "=" * 60)
    print(f"\nTotal response length: {len(response_text)}")

# Run async function
asyncio.run(test_leads())

