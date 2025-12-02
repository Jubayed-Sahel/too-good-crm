# 🧪 AI Assistant Testing Guide - Quick Start

## Prerequisites

✅ Backend server running with Gemini API configured
✅ Android device/emulator with Google Play Services
✅ App installed and logged in
✅ Internet connection

---

## 🚀 Quick Test (5 Minutes)

### **Step 1: Access AI Assistant**
1. Open the app
2. Navigate to **Messages** tab
3. Look for **"🤖 AI Assistant"** card at the top
4. Tap the card

**Expected:** AI Assistant screen opens with empty state

---

### **Step 2: Test Text Chat**
1. Type: `"Hello, can you help me?"`
2. Tap send button (blue circle with arrow)
3. Watch for streaming response

**Expected:** 
- ✅ Message appears in blue bubble on right
- ✅ Assistant response streams in gray bubble on left
- ✅ Typing indicator (3 dots) shows during streaming
- ✅ Message completes successfully

---

### **Step 3: Test Voice Input**
1. Tap the **microphone button** (left side)
2. If prompted, grant microphone permission
3. Say: `"Show me my customers"`
4. Wait for speech recognition

**Expected:**
- ✅ Permission dialog appears (first time only)
- ✅ Speech recognition dialog opens
- ✅ Your speech converts to text
- ✅ Message sends automatically
- ✅ Response streams back

---

### **Step 4: Test Voice Output**
1. Tap the **settings icon** (top right)
2. Enable **"Auto-speak responses"** toggle
3. Close settings
4. Send any text message
5. Listen for response

**Expected:**
- ✅ Response plays through speaker automatically
- ✅ Speaking indicator (pulsing volume icon) appears
- ✅ Indicator disappears when done

---

### **Step 5: Test Manual Speak**
1. Disable auto-speak (if enabled)
2. Send a message and wait for response
3. Tap the **speaker icon** (🔊) next to the assistant message

**Expected:**
- ✅ Message plays through speaker
- ✅ Speaking indicator shows
- ✅ Can tap multiple times to replay

---

## ✅ Checklist

- [ ] AI Assistant card visible on Messages screen
- [ ] Can open AI Assistant screen
- [ ] Can send text messages
- [ ] Responses stream in real-time
- [ ] Can use microphone button
- [ ] Voice input works correctly
- [ ] Auto-speak toggle works
- [ ] Manual speak button works
- [ ] Can clear chat
- [ ] Error messages appear if backend down
- [ ] Can retry after error

---

## 🐛 Common Issues & Solutions

### **Issue: "AI Assistant is currently unavailable"**
**Solution:**
1. Check if backend server is running
2. Verify Gemini API key in backend `.env`
3. Test backend: `curl http://YOUR_IP:8000/api/gemini/status/`
4. Check Android app's backend URL in `build.gradle.kts`

### **Issue: Microphone button doesn't work**
**Solution:**
1. Grant microphone permission in app settings
2. Verify Google Play Services installed
3. Test device microphone in another app
4. Check if `RECORD_AUDIO` permission in manifest

### **Issue: Voice output doesn't work**
**Solution:**
1. Check device volume is not muted
2. Test TextToSpeech in device settings
3. Verify TTS language data installed
4. Check if settings show "Text-to-speech not available"

### **Issue: No response from AI**
**Solution:**
1. Check backend logs for errors
2. Verify Gemini API key is valid
3. Check network connection
4. Look for error message in app
5. Try clearing app data and re-login

### **Issue: Streaming stops mid-response**
**Solution:**
1. Check backend timeout settings
2. Verify stable internet connection
3. Check backend logs for exceptions
4. Try shorter queries first

---

## 📊 Test Scenarios

### **Basic Functionality**
```
✅ Send "Hello"
✅ Send "Show me my customers"
✅ Send "List my open deals"
✅ Send "What is my total revenue?"
```

### **Voice Commands**
```
✅ Say "Show me customer statistics"
✅ Say "List high priority leads"
✅ Say "What are my open deals"
```

### **Error Handling**
```
✅ Turn off backend → Try to send message → Should show error
✅ Turn on backend → Tap retry → Should recover
✅ Send very long message → Should handle gracefully
```

### **UI/UX**
```
✅ Send 10 messages → Should auto-scroll
✅ Rotate device → Should maintain state
✅ Put app in background → Come back → Should work
✅ Clear chat → Should clear all messages
```

---

## 📱 Device Testing Matrix

| Device Type | Min Android | Status | Notes |
|-------------|-------------|---------|-------|
| Emulator (Pixel 5) | 24 (7.0) | ⬜ Test | Standard test device |
| Physical Phone | 24+ | ⬜ Test | Real-world conditions |
| Tablet | 24+ | ⬜ Test | Larger screen |
| Low-end device | 24 | ⬜ Test | Performance check |

---

## 🎯 Success Criteria

**Test passes if:**
- ✅ All 5 quick test steps complete successfully
- ✅ No crashes or freezes
- ✅ UI is responsive
- ✅ Voice features work on first try
- ✅ Error recovery works
- ✅ Messages are readable and well-formatted

**Test fails if:**
- ❌ App crashes
- ❌ Messages don't stream
- ❌ Voice input doesn't recognize speech
- ❌ Voice output doesn't play
- ❌ Permissions crash the app
- ❌ Error states don't allow recovery

---

## 📝 Bug Report Template

If you find an issue, report with:

```
**Issue:** [Brief description]
**Steps to Reproduce:**
1. 
2. 
3. 

**Expected Behavior:** [What should happen]
**Actual Behavior:** [What actually happened]
**Device:** [Phone model, Android version]
**Backend Status:** [Running/Not running]
**Logs:** [Logcat output if available]
**Screenshots:** [If applicable]
```

---

## 🔍 Debug Tools

### **Check Backend**
```bash
# Test status endpoint
curl http://YOUR_IP:8000/api/gemini/status/

# Test chat endpoint (requires auth)
curl -X POST http://YOUR_IP:8000/api/gemini/chat/ \
  -H "Authorization: Token YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello"}'
```

### **Check Android Logs**
```bash
# Filter AI Assistant logs
adb logcat | grep "AIAssistantViewModel"
adb logcat | grep "GeminiRepository"

# Filter all app logs
adb logcat | grep "too.good.crm"
```

---

## ✅ Final Checklist

Before marking as complete:

- [ ] Tested on at least 2 different devices
- [ ] Tested with backend on/off
- [ ] Tested voice input with permission flow
- [ ] Tested voice output with auto-speak
- [ ] Tested error recovery
- [ ] Tested conversation flow (multiple messages)
- [ ] Tested clearing chat
- [ ] Tested settings dialog
- [ ] Verified no memory leaks (long conversation)
- [ ] Verified no crashes
- [ ] Verified smooth UI performance
- [ ] Verified network error handling
- [ ] Documentation updated
- [ ] Known issues documented

---

**Happy Testing! 🎉**

For additional help, refer to `ANDROID_AI_ASSISTANT_IMPLEMENTATION.md`
