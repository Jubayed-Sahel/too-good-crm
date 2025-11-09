# Credentials & Environment Variables Guide

This document outlines all credentials and environment variables needed for the Too Good CRM application.

## 🔐 Application Login Credentials

### Default Admin User

After running the seed scripts, you can login with:

- **Email**: `admin@crm.com`
- **Username**: `admin`
- **Password**: `admin123`

**Note**: Change this password in production!

### Creating Admin User

If you need to create an admin user manually:

```bash
cd shared-backend
python manage.py createsuperuser
```

Or use the seed script:

```bash
cd shared-backend
python manage.py seed_data
# or
python scripts/seed/seed_admin_data.py
```

## 🔑 Backend Environment Variables

Create a `.env` file in the `shared-backend/` directory with the following variables:

### Required for Basic Operation

```env
# Django Settings
SECRET_KEY=your-secret-key-here-change-in-production
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database (SQLite by default, PostgreSQL for production)
DATABASE_URL=sqlite:///db.sqlite3
# For PostgreSQL:
# DATABASE_URL=postgresql://user:password@localhost:5432/crmdb
```

### Optional: Linear Integration

```env
# Linear API Integration (for issue tracking)
LINEAR_API_KEY=your-linear-api-key
LINEAR_WEBHOOK_SECRET=your-linear-webhook-secret
```

**How to get Linear credentials:**
1. Go to https://linear.app/settings/api
2. Create a new API key
3. Copy the API key to `LINEAR_API_KEY`
4. For webhooks, create a webhook secret in Linear settings

### Optional: Twilio Integration

```env
# Twilio SMS and Call Integration
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890
```

**How to get Twilio credentials:**
1. Sign up at https://www.twilio.com/
2. Get your Account SID and Auth Token from the Twilio Console
3. Get a phone number from Twilio
4. Add all three values to your `.env` file

### Environment File Template

Create `shared-backend/.env`:

```env
# Django Core Settings
SECRET_KEY=django-insecure-change-this-in-production
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DATABASE_URL=sqlite:///db.sqlite3

# Linear Integration (Optional)
LINEAR_API_KEY=
LINEAR_WEBHOOK_SECRET=

# Twilio Integration (Optional)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
```

## 🌐 Frontend Environment Variables

Create a `.env` file in the `web-frontend/` directory:

### Required

```env
# API Base URL
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

For production, change to your production API URL:

```env
VITE_API_BASE_URL=https://api.yourdomain.com/api
```

## 🤖 MCP (Model Context Protocol) Configuration

### Claude Desktop Configuration

Edit your Claude Desktop MCP configuration (usually at `~/Library/Application Support/Claude/claude_desktop_config.json` on Mac or `%APPDATA%\Claude\claude_desktop_config.json` on Windows):

```json
{
  "mcpServers": {
    "django-crm": {
      "command": "python",
      "args": [
        "shared-backend/mcp_server.py"
      ],
      "cwd": "${workspaceFolder}",
      "env": {
        "DJANGO_SETTINGS_MODULE": "crmAdmin.settings"
      }
    },
    "chakra-ui-assistant": {
      "command": "npx",
      "args": [
        "-y",
        "@chakra-ui/mcp-server"
      ],
      "env": {
        "CHAKRA_PRO_API_KEY": "your-api-key-here"
      }
    },
    "edge-devtools": {
      "command": "npx",
      "args": [
        "-y",
        "@syunnrai/edge-devtools-mcp"
      ],
      "env": {
        "EDGE_DEBUG_PORT": "9222",
        "EDGE_DEBUG_HOST": "localhost",
        "EDGE_HEADLESS": "false"
      }
    },
    "sequential-thinking": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-sequential-thinking"
      ]
    }
  }
}
```

### Chakra UI MCP API Key (Optional)

The Chakra UI MCP server requires an API key if you want to use Chakra Pro features:

1. Sign up at https://chakra-ui.com/pro
2. Get your API key from the dashboard
3. Add it to the MCP configuration or environment variable `CHAKRA_PRO_API_KEY`

**Note**: The Chakra UI MCP server works without the API key for basic features.

### Sequential Thinking MCP Server

The Sequential Thinking MCP server provides enhanced reasoning capabilities for complex problem-solving tasks. No configuration required - it works out of the box.

**Configuration**:
```json
"sequential-thinking": {
  "command": "npx",
  "args": [
    "-y",
    "@modelcontextprotocol/server-sequential-thinking"
  ]
}
```

## 📋 Setup Checklist

### Backend Setup

- [ ] Create `shared-backend/.env` file
- [ ] Set `SECRET_KEY` (generate a new one for production)
- [ ] Set `DEBUG=False` for production
- [ ] Configure database (SQLite for dev, PostgreSQL for prod)
- [ ] Add Linear credentials (if using Linear integration)
- [ ] Add Twilio credentials (if using Twilio integration)
- [ ] Run migrations: `python manage.py migrate`
- [ ] Create admin user: `python manage.py seed_data`
- [ ] Start server: `python manage.py runserver`

### Frontend Setup

- [ ] Create `web-frontend/.env` file
- [ ] Set `VITE_API_BASE_URL` to your backend URL
- [ ] Install dependencies: `npm install`
- [ ] Start dev server: `npm run dev`

### MCP Setup

- [ ] Configure Claude Desktop MCP settings
- [ ] Add Chakra UI API key (optional)
- [ ] Start Edge in debug mode (for Edge DevTools MCP)
- [ ] Sequential Thinking MCP server (automatically configured)
- [ ] Test MCP connection

## 🔒 Security Notes

### Production Security

1. **Never commit `.env` files** - They are in `.gitignore`
2. **Change SECRET_KEY** - Generate a new secret key for production
3. **Set DEBUG=False** - Disable debug mode in production
4. **Use strong passwords** - Change default admin password
5. **Use HTTPS** - Enable SSL in production
6. **Rotate API keys** - Regularly rotate Linear and Twilio API keys
7. **Use environment variables** - Never hardcode credentials in code

### Generating a Secure SECRET_KEY

```python
from django.core.management.utils import get_random_secret_key
print(get_random_secret_key())
```

Or use:

```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

## 🧪 Testing Credentials

### Test Admin User

After running seed scripts:

```bash
Email: admin@crm.com
Password: admin123
```

### API Testing

```bash
# Login to get token
curl -X POST http://127.0.0.1:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'

# Use token in subsequent requests
curl -X GET http://127.0.0.1:8000/api/customers/ \
  -H "Authorization: Token YOUR_TOKEN_HERE"
```

## 📞 Getting Help

If you need help with credentials:

1. Check the [README.md](README.md) for setup instructions
2. See [MCP_SETUP.md](MCP_SETUP.md) for MCP configuration
3. Check backend logs: `shared-backend/logs/django.log`
4. Run verification scripts:
   - `python scripts/verify_mcp_servers.py`
   - `python scripts/verify/verify_api.py`

## 🔄 Resetting Credentials

### Reset Admin Password

```bash
cd shared-backend
python manage.py changepassword admin
```

### Reset Database and Credentials

```bash
cd shared-backend
# Delete database
rm db.sqlite3

# Run migrations
python manage.py migrate

# Seed data (creates admin user)
python manage.py seed_data
```

---

**Remember**: Always keep your credentials secure and never commit them to version control!

