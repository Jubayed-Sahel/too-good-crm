# 🔴 IMPORTANT: Restart Required!

## The Problem
Your frontend dev server is still running with OLD code from before the Pusher integration. The `.env` file was updated, but Vite only loads environment variables when it starts.

## Solution: Restart Both Servers

### Step 1: Stop Current Servers
Press `Ctrl+C` in both terminal windows to stop:
- Backend server
- Frontend server

### Step 2: Start Backend
```powershell
cd shared-backend
python manage.py runserver
```

Keep this terminal running.

### Step 3: Start Frontend (New Terminal)
```powershell
cd web-frontend
npm run dev
```

Keep this terminal running.

### Step 4: Hard Refresh Browser
After both servers are running:
- Press `Ctrl + Shift + R` (Chrome/Edge) or `Ctrl + F5` (Firefox)
- Or open a new Incognito/Private window

### Step 5: Check Browser Console (F12)
You should now see these logs:
```
[VideoCallManager] Render - isAuthenticated: true user: <id> hasToken: true
[Pusher] Starting subscription setup for user: <id>
[Pusher] ✅ Connected to Pusher
[Pusher] ✅ Successfully subscribed to: private-user-<id>
```

### Step 6: Test a Call
1. Login as two different users (use incognito for second user)
2. Click phone icon to call
3. **Both users should see updates INSTANTLY without refresh!**

---

## Why This Is Necessary

**Environment Variables:**
- `.env` files are only read when Vite starts
- Your server started at 9:56 AM (before Pusher was added)
- Changes to `.env` won't take effect until restart

**JavaScript Changes:**
- Hot Module Replacement (HMR) doesn't always catch major structural changes
- New hooks and components need a full reload

## Quick Check: Is It Working?

**✅ Working:** Browser console shows Pusher connection logs
**❌ Not Working:** No Pusher logs at all

If you see no Pusher logs after restart, see `PUSHER_TROUBLESHOOTING.md`
