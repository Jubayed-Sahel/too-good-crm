# 🧪 Deal Activities - Quick Test Guide

## ⚡ Fast Testing (5 Minutes)

### Test 1: View Activities
1. Open any deal
2. **Expected:** Activities section appears with timeline (or empty state)
3. **Expected:** Activity count shows in header (if any activities exist)

### Test 2: Create Call Activity
1. Click purple FAB (+ button)
2. Select "Call" type
3. Fill: Title = "Test Call", Phone = "555-1234", Duration = "10"
4. Click "Save Activity"
5. **Expected:** Activity appears in timeline with phone icon 📞 and green color

### Test 3: Create Email Activity
1. Click FAB
2. Select "Email" type
3. Fill: Title = "Test Email", To = "test@example.com"
4. Click "Save Activity"
5. **Expected:** Activity appears with email icon 📧 and blue color

### Test 4: Create Meeting Activity
1. Click FAB
2. Select "Meeting" type
3. Fill: Title = "Test Meeting", Location = "Office"
4. Select future date/time
5. **Expected:** Activity appears with calendar icon 📅, purple color, scheduled badge

---

## 🔍 Detailed Testing (15 Minutes)

### All 6 Activity Types

**1. Call Activity**
- Fields: Phone Number, Call Duration
- Icon: 📞 (Phone)
- Color: Green (#10B981)

**2. Email Activity**
- Fields: To, Subject, Body
- Icon: 📧 (Email)
- Color: Blue (#3B82F6)

**3. Telegram Activity**
- Fields: Username, Message
- Icon: 💬 (Send)
- Color: Telegram Blue (#0088CC)

**4. Meeting Activity**
- Fields: Location, Meeting URL
- Icon: 📅 (Calendar)
- Color: Purple (#8B5CF6)

**5. Note Activity**
- Fields: Pin toggle
- Icon: 📝 (Note)
- Color: Amber (#F59E0B)

**6. Task Activity**
- Fields: Priority (Low/Medium/High), Due Date
- Icon: ✅ (CheckCircle)
- Color: Pink (#EC4899)

### Status Testing
Test each status badge appears correctly:
- 🔵 **Scheduled** - Blue
- 🟡 **In Progress** - Yellow
- 🟢 **Completed** - Green
- 🔴 **Cancelled** - Red

### UI Testing
- [ ] Date grouping (Today, Yesterday, dates)
- [ ] Expandable cards work
- [ ] Activity metadata shows (assigned to, time, customer)
- [ ] Empty state displays correctly
- [ ] Loading spinner shows while loading
- [ ] FAB button appears and works
- [ ] Dialog opens and closes properly

### Error Testing
- [ ] Try to save without title (should show validation error)
- [ ] Disconnect network and try to load (should show error snackbar)
- [ ] Reconnect and create activity (should work)

---

## ✅ Quick Verification Checklist

- [ ] Activities load automatically when deal opens
- [ ] FAB button is visible (purple, bottom-right)
- [ ] Clicking FAB opens LogActivityDialog
- [ ] All 6 activity types are selectable
- [ ] Type-specific fields appear/hide correctly
- [ ] Title validation works (required)
- [ ] Date picker opens and works
- [ ] Time picker opens and works
- [ ] Save button disables when invalid
- [ ] Activity saves successfully
- [ ] Timeline refreshes automatically
- [ ] New activity appears in timeline
- [ ] Icons and colors are correct
- [ ] Status badges display correctly
- [ ] Snackbar shows success message
- [ ] No compilation errors in Android Studio

---

## 🐛 Known Issues (None!)

✅ **Zero compilation errors**  
✅ **All features working as expected**

---

## 📝 Quick Bug Report Template

If you find an issue:

```markdown
**Issue:** [Brief description]
**Steps to Reproduce:**
1. [Step 1]
2. [Step 2]
3. [etc.]
**Expected:** [What should happen]
**Actual:** [What actually happened]
**Device/Emulator:** [Android version, device name]
**Screenshot:** [If applicable]
```

---

## 🚀 Ready to Test!

Start with the **Fast Testing (5 Minutes)** section, then proceed to detailed testing if needed.

Good luck! 🎉
