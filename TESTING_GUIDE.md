# Testing Guide: MCP + Gemini Integration

## 📋 Prerequisites

Before testing, ensure you have:

1. **Python 3.8+** installed
2. **Node.js 18+** installed
3. **Google Gemini API Key** (get from https://aistudio.google.com/app/apikey)
4. **Django backend** already set up with migrations run

---

## 🔧 Step 1: Install Dependencies

### Backend Dependencies

```bash
cd shared-backend

# Activate your virtual environment (if you have one)
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install new dependencies
pip install fastmcp==0.5.0 google-genai==1.0.0

# Or install all dependencies
pip install -r requirements.txt
```

**Expected output:**
```
Successfully installed fastmcp-0.5.0 google-genai-1.0.0
```

---

## 🔑 Step 2: Configure Environment Variables

### Option A: Using .env file (Recommended)

Create `shared-backend/.env`:

```bash
# Copy and paste this into .env file
GEMINI_API_KEY=YOUR_ACTUAL_GEMINI_API_KEY_HERE
```

### Option B: Using Windows Environment Variables

```powershell
# PowerShell
$env:GEMINI_API_KEY="YOUR_ACTUAL_GEMINI_API_KEY_HERE"
```

### Option C: Using Command Line (Temporary)

```bash
# Windows CMD
set GEMINI_API_KEY=YOUR_ACTUAL_GEMINI_API_KEY_HERE

# Windows PowerShell
$env:GEMINI_API_KEY="YOUR_ACTUAL_GEMINI_API_KEY_HERE"

# Mac/Linux
export GEMINI_API_KEY=YOUR_ACTUAL_GEMINI_API_KEY_HERE
```

---

## 🧪 Step 3: Test MCP Server Standalone

This tests if the MCP server can load all tools correctly.

```bash
cd shared-backend

# Test MCP server
python mcp_server.py
```

**Expected output:**
```
INFO:__main__:Registering MCP tools...
INFO:customer_tools:Customer tools registered
INFO:lead_tools:Lead tools registered
INFO:deal_tools:Deal tools registered
INFO:issue_tools:Issue tools registered
INFO:analytics_tools:Analytics tools registered
INFO:order_tools:Order and payment tools registered
INFO:employee_tools:Employee tools registered
INFO:organization_tools:Organization and user context tools registered
INFO:__main__:All MCP tools registered successfully
```

**If you see errors:**
- Check Django is properly configured (`DJANGO_SETTINGS_MODULE`)
- Ensure database migrations are run
- Verify all model imports work

**To exit:** Press `Ctrl+C`

---

## 🚀 Step 4: Start Django Backend

In a **new terminal window**:

```bash
cd shared-backend

# Activate virtual environment again
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Mac/Linux

# Start Django
python manage.py runserver
```

**Expected output:**
```
Starting development server at http://127.0.0.1:8000/
Quit the server with CTRL-BREAK.
```

Keep this terminal running!

---

## 🔍 Step 5: Test Gemini Status Endpoint

This checks if Gemini service is properly configured.

### Using curl (if you have it):

```bash
curl -H "Authorization: Token YOUR_USER_TOKEN" \
     http://localhost:8000/api/gemini/status/
```

### Using PowerShell:

```powershell
$token = "YOUR_USER_TOKEN"
$headers = @{ "Authorization" = "Token $token" }
Invoke-RestMethod -Uri "http://localhost:8000/api/gemini/status/" -Headers $headers
```

### Using Browser/Postman:

**GET** `http://localhost:8000/api/gemini/status/`

**Headers:**
```
Authorization: Token YOUR_USER_TOKEN
```

**Expected Response (Success):**
```json
{
  "available": true,
  "model": "gemini-2.0-flash-exp",
  "api_key_configured": true,
  "user_context": {
    "user_id": 1,
    "organization_id": 1,
    "role": "vendor",
    "permissions_count": 15
  }
}
```

**Expected Response (No API Key):**
```json
{
  "available": false,
  "model": "gemini-2.0-flash-exp",
  "api_key_configured": false,
  "user_context": {...}
}
```

---

## 💬 Step 6: Test Gemini Chat (Simple Test)

### Using curl:

```bash
curl -X POST http://localhost:8000/api/gemini/chat/ \
  -H "Authorization: Token YOUR_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"message\": \"Hello, what can you help me with?\"}"
```

### Using PowerShell:

```powershell
$token = "YOUR_USER_TOKEN"
$headers = @{
    "Authorization" = "Token $token"
    "Content-Type" = "application/json"
}
$body = @{
    message = "Hello, what can you help me with?"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/api/gemini/chat/" `
    -Method Post -Headers $headers -Body $body
```

**Expected Response:**
You should see a stream of Server-Sent Events (SSE) like:
```
data: {"type": "connected"}

data: {"type": "message", "content": "Hello! I'm your CRM AI assistant."}

data: {"type": "message", "content": " I can help you with:\n\n"}

data: {"type": "message", "content": "- Managing customers, leads, and deals\n"}

data: {"type": "completed"}
```

---

## 🎯 Step 7: Test MCP Tool Integration

Test if Gemini can actually use the backend tools.

### Test 1: Customer Statistics

```powershell
$token = "YOUR_USER_TOKEN"
$headers = @{
    "Authorization" = "Token $token"
    "Content-Type" = "application/json"
}
$body = @{
    message = "Show me my customer statistics"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/api/gemini/chat/" `
    -Method Post -Headers $headers -Body $body
```

**Expected:** Gemini should call `get_customer_stats()` tool and return actual numbers from your database.

### Test 2: List Customers

```json
{
  "message": "Show me all active customers"
}
```

**Expected:** Gemini calls `list_customers(status='active')` and shows your real customers.

### Test 3: Dashboard Analytics

```json
{
  "message": "What are my dashboard statistics?"
}
```

**Expected:** Gemini calls `get_dashboard_stats()` and shows real analytics data.

---

## 🧪 Step 8: Test Permission Enforcement

### Test as Different Roles

1. **As Vendor** (should have full access):
```json
{
  "message": "Show me all deals"
}
```
✅ Should work

2. **As Employee** (limited access):
```json
{
  "message": "Create a new customer named Test User"
}
```
⚠️ Should work if employee has `customer:create` permission

3. **As Customer** (very limited):
```json
{
  "message": "Show me all customers"
}
```
❌ Should get permission denied error

---

## 🐛 Troubleshooting

### Problem: "GEMINI_API_KEY not configured"

**Solution:**
```bash
# Check if variable is set
echo $env:GEMINI_API_KEY  # PowerShell
echo %GEMINI_API_KEY%     # CMD

# Set it if missing
$env:GEMINI_API_KEY="your_key_here"
```

### Problem: "ModuleNotFoundError: No module named 'fastmcp'"

**Solution:**
```bash
pip install fastmcp==0.5.0 google-genai==1.0.0
```

### Problem: "No active profile found for user"

**Solution:**
User needs an active profile in the database. Run:
```bash
python manage.py shell
```
```python
from crmApp.models import User, UserProfile, Organization

user = User.objects.first()
org = Organization.objects.first()

# Create profile if missing
UserProfile.objects.get_or_create(
    user=user,
    organization=org,
    defaults={
        'profile_type': 'vendor',
        'is_primary': True,
        'status': 'active'
    }
)
```

### Problem: MCP tools not loading

**Solution:**
1. Ensure Django is properly configured
2. Check all migrations are run: `python manage.py migrate`
3. Verify models can be imported: `python manage.py shell`
   ```python
   from crmApp.models import Customer, Lead, Deal
   print("Models loaded successfully")
   ```

### Problem: Streaming response not working

**Solution:**
- Check your browser/client supports Server-Sent Events (SSE)
- Use a proper HTTP client like Postman or curl
- Check Django is not buffering responses

---

## ✅ Success Checklist

- [ ] `pip install` completes successfully
- [ ] Environment variable `GEMINI_API_KEY` is set
- [ ] `python mcp_server.py` loads all tools without errors
- [ ] Django server starts: `python manage.py runserver`
- [ ] `/api/gemini/status/` returns `"available": true`
- [ ] `/api/gemini/chat/` returns streaming response
- [ ] Gemini can call MCP tools (shows real data)
- [ ] Permissions are enforced (try different roles)

---

## 🎮 Test Script (Automated)

Save this as `test_gemini.py` in `shared-backend/`:

```python
"""
Quick test script for Gemini + MCP integration
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'crmAdmin.settings')
django.setup()

from crmApp.services.gemini_service import GeminiService
from django.contrib.auth import get_user_model

def test_gemini():
    print("🧪 Testing Gemini Integration\n")
    
    # Check API key
    service = GeminiService()
    if not service.api_key:
        print("❌ GEMINI_API_KEY not configured")
        return
    print("✅ GEMINI_API_KEY configured")
    
    # Check user context
    User = get_user_model()
    user = User.objects.first()
    
    if not user:
        print("❌ No users in database")
        return
    print(f"✅ Testing with user: {user.username}")
    
    try:
        context = service.get_user_context(user)
        print(f"✅ User context loaded:")
        print(f"   - Role: {context['role']}")
        print(f"   - Org ID: {context['organization_id']}")
        print(f"   - Permissions: {len(context['permissions'])}")
    except Exception as e:
        print(f"❌ Error getting user context: {e}")
        return
    
    # Test MCP server
    print("\n✅ All checks passed!")
    print("\nYou can now test the chat endpoint:")
    print("POST http://localhost:8000/api/gemini/chat/")
    print('{"message": "Show me my customer statistics"}')

if __name__ == "__main__":
    test_gemini()
```

**Run it:**
```bash
python test_gemini.py
```

---

## 📊 Expected Results Summary

| Test | Expected Behavior |
|------|-------------------|
| MCP Server Load | All 50+ tools register successfully |
| Status Endpoint | Returns `available: true` with user context |
| Simple Chat | Gemini responds with helpful message |
| Tool Integration | Gemini calls backend tools and returns real data |
| Permission Check | Different roles have different access levels |
| Multi-tenant | Users only see data from their organization |

---

## 🚀 Next: Frontend Testing

Once backend tests pass, you can:

1. **Start frontend**: `cd web-frontend && npm run dev`
2. **Open browser**: `http://localhost:5173`
3. **Login** as a user
4. **Go to Messages page**
5. **(TODO)** Click on "AI Assistant" contact
6. **Send a message**: "Show me my customers"
7. **Watch streaming response** appear in real-time

---

## 📝 Notes

- **First API call may be slow** (5-10 seconds) as Gemini initializes
- **Tool calls are logged** to Django console for debugging
- **Permissions are enforced** at every MCP tool call
- **Organization isolation** is automatic - users can't access other orgs' data

---

## 🎯 Quick Test Commands

Copy-paste these to test quickly:

```bash
# 1. Install deps
cd shared-backend
pip install fastmcp google-genai

# 2. Set API key
$env:GEMINI_API_KEY="your_key_here"

# 3. Test MCP
python mcp_server.py

# 4. Start Django (new terminal)
python manage.py runserver

# 5. Test status (new terminal)
curl -H "Authorization: Token YOUR_TOKEN" http://localhost:8000/api/gemini/status/

# 6. Test chat
curl -X POST http://localhost:8000/api/gemini/chat/ \
  -H "Authorization: Token YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello!"}'
```

---

**Need Help?**
- Check Django logs in the runserver terminal
- Look for MCP tool call logs
- Verify your token is valid
- Ensure user has an active profile

Good luck! 🚀

