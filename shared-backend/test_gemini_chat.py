"""
Quick test to verify Gemini API works directly
"""
import os
import asyncio
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')

async def test_gemini_direct():
    """Test Gemini API directly without Django"""
    from google import genai
    from django.conf import settings
    
    api_key = settings.GEMINI_API_KEY
    
    if not api_key:
        print("[ERROR] GEMINI_API_KEY not configured")
        return
    
    print("=" * 60)
    print("Testing Gemini API Directly")
    print("=" * 60)
    print()
    
    print(f"[INFO] API Key: {api_key[:10]}...")
    print(f"[INFO] Model: gemini-2.0-flash-exp")
    print()
    
    # Initialize client
    client = genai.Client(api_key=api_key)
    
    # Test message
    message = "Hello! Introduce yourself as a CRM AI assistant in one sentence."
    print(f"[SENDING] {message}")
    print()
    
    try:
        # Generate response
        response = await client.aio.models.generate_content(
            model="gemini-2.0-flash-exp",
            contents=message,
            config=genai.types.GenerateContentConfig(
                temperature=0.7,
                max_output_tokens=256,
            )
        )
        
        print("[RESPONSE]")
        print(response.text)
        print()
        print("=" * 60)
        print("[SUCCESS] Gemini is working!")
        print("=" * 60)
        
    except Exception as e:
        print(f"[ERROR] {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    import django
    django.setup()
    asyncio.run(test_gemini_direct())

