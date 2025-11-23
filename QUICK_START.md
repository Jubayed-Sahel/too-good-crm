# 🚀 Quick Start Guide

## ✅ Installation Complete!

All requirements have been installed and configured successfully.

## 📋 System Status

- ✅ **Backend Server**: Running at http://localhost:8000
- ✅ **Database**: SQLite with all migrations applied
- ✅ **Python Dependencies**: All installed (Django, DRF, Channels, etc.)
- ✅ **Node Modules**: 375 packages installed
- ✅ **Environment**: `.env` file configured
- ✅ **TypeScript**: Compiles without errors
- ✅ **Authentication**: Working (Login & Registration tested)

## 🎯 Start the Application

### Backend Server (Already Running)
```powershell
cd c:\Users\User\Desktop\p\too-good-crm\shared-backend
.\venv\Scripts\Activate.ps1
python manage.py runserver
```
**Status**: ✅ Currently running at http://localhost:8000

### Frontend Server
```powershell
cd c:\Users\User\Desktop\p\too-good-crm\web-frontend
npm run dev
```
**Access**: http://localhost:5173

## 👤 Test Credentials

### Admin User (Superuser)
- **Username**: `admin`
- **Email**: `admin@example.com`
- **Password**: `admin123`

### Test User
- **Username**: `newuser`
- **Email**: `newuser@example.com`
- **Password**: `test123456`

## 🔧 Configuration Files

### Backend `.env` (Optional)
Create `shared-backend/.env` for custom settings:
```env
DJANGO_SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
```

### Frontend `.env` (Configured)
Location: `web-frontend/.env`
```env
VITE_API_BASE_URL=http://localhost:8000
VITE_WS_BASE_URL=ws://localhost:8000
VITE_APP_ENV=development
VITE_PUSHER_KEY=5ea9fef4e6e142b94ac4
VITE_PUSHER_CLUSTER=ap2
```

## 📦 Installed Dependencies

### Backend (Python)
- Django 5.2.7
- Django REST Framework 3.16.1
- Django CORS Headers 4.6.0
- Channels & Daphne (WebSocket support)
- Pusher 3.3.3 (Real-time messaging)
- FastMCP 2.13.1
- Google Genai 1.0.0

### Frontend (Node.js)
- React 19.2.0
- TypeScript 5.9.3
- Vite 7.1.7
- Chakra UI 3.28.0
- Axios 1.13.1
- React Router DOM 7.9.5
- React Query 5.90.6

## 🧪 Test the Application

### 1. Test Backend API
```powershell
# Test registration
$body = '{"username":"testuser2","email":"test2@example.com","password":"test123456","password_confirm":"test123456","first_name":"Test","last_name":"User"}'
Invoke-RestMethod -Uri "http://localhost:8000/api/users/" -Method POST -Body $body -ContentType "application/json"

# Test login
$body = '{"username":"admin","password":"admin123"}'
Invoke-RestMethod -Uri "http://localhost:8000/api/auth/login/" -Method POST -Body $body -ContentType "application/json"
```

### 2. Access Frontend
Open browser to http://localhost:5173 and:
1. Click "Sign Up" to create a new account
2. Or login with admin credentials

## 🔍 Troubleshooting

### Backend Issues
```powershell
# Check if running
curl http://localhost:8000/api/users/

# View logs
cd shared-backend
.\venv\Scripts\Activate.ps1
python manage.py runserver --verbosity 2
```

### Frontend Issues
```powershell
# Clear cache and restart
cd web-frontend
Remove-Item -Recurse -Force node_modules\.vite
npm run dev
```

### Database Issues
```powershell
cd shared-backend
.\venv\Scripts\Activate.ps1

# Check migrations
python manage.py showmigrations

# Apply migrations
python manage.py migrate
```

## 🎉 Next Steps

1. **Start Frontend**: Run `npm run dev` in `web-frontend` directory
2. **Access Application**: Open http://localhost:5173
3. **Login**: Use admin credentials or register new account
4. **Explore Features**: Customer management, leads, deals, etc.

## 📚 Additional Resources

- **Backend API Docs**: http://localhost:8000/api/
- **Django Admin**: http://localhost:8000/admin/
- **Project README**: See main README.md for detailed documentation

---

**Status**: ✅ All requirements installed and configured
**Last Updated**: November 24, 2025
