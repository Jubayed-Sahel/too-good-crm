# Environment Variables Setup

## Linear Integration Variables

To use Linear integration, you need to create a `.env` file in the `shared-backend` directory with the following variables:

### Required Variables

```env
# Linear API Key
# Get this from: https://linear.app/settings/api
# Steps:
# 1. Go to Linear Settings > API
# 2. Click "Create API Key"
# 3. Copy the key and paste it below
LINEAR_API_KEY=your_linear_api_key_here

# Linear Webhook Secret
# Get this when setting up webhooks in Linear
# Steps:
# 1. Go to Linear Settings > Webhooks
# 2. Click "Create Webhook"
# 3. Set the URL to: https://your-domain.com/api/webhooks/linear/
# 4. Copy the webhook secret provided
LINEAR_WEBHOOK_SECRET=your_linear_webhook_secret_here
```

### Complete .env File Template

Create a file named `.env` in the `shared-backend` directory with this content:

```env
# Django Settings
DEBUG=True
SECRET_KEY=django-insecure-2kis-l)_d58wfz-d9ehcfypf-6%9x*g@^yne+hi)&k9jfg%hf)
ALLOWED_HOSTS=localhost,127.0.0.1

# Linear Integration
LINEAR_API_KEY=your_linear_api_key_here
LINEAR_WEBHOOK_SECRET=your_linear_webhook_secret_here

# Twilio Integration (Optional)
# TWILIO_ACCOUNT_SID=your_twilio_account_sid
# TWILIO_AUTH_TOKEN=your_twilio_auth_token
# TWILIO_PHONE_NUMBER=your_twilio_phone_number
```

## How to Get Linear API Key

1. **Log in to Linear**: Go to https://linear.app
2. **Open Settings**: Click your profile → Settings
3. **Go to API Section**: Navigate to Settings > API
4. **Create API Key**: Click "Create API Key"
5. **Copy the Key**: The key will be shown once - copy it immediately
6. **Paste in .env**: Add it to your `.env` file as `LINEAR_API_KEY`

## How to Get Linear Webhook Secret

1. **Go to Webhooks**: Linear Settings > Webhooks
2. **Create Webhook**: Click "Create Webhook"
3. **Set URL**: 
   - For local development: Use a tool like ngrok to expose your local server
   - URL format: `https://your-domain.com/api/webhooks/linear/`
4. **Select Events**: Choose which events to listen to (Issue create, update, etc.)
5. **Copy Secret**: Linear will provide a webhook secret - copy it
6. **Paste in .env**: Add it to your `.env` file as `LINEAR_WEBHOOK_SECRET`

## Quick Setup Commands

### Windows (PowerShell)
```powershell
cd shared-backend
New-Item -Path .env -ItemType File -Force
# Then edit the file and add the variables above
```

### Linux/Mac
```bash
cd shared-backend
touch .env
# Then edit the file and add the variables above
```

## Verification

After setting up the `.env` file, restart your Django server. The Linear integration will automatically use these variables.

To verify:
1. Check Django logs for any Linear API connection errors
2. Try creating an issue - it should sync to Linear if configured correctly
3. Check Linear app to see if issues appear

## Security Note

⚠️ **Never commit `.env` files to git!** The `.env` file is already in `.gitignore` to prevent accidental commits.

