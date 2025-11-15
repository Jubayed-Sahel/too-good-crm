# 📋 Issue Tracking - User Guide

Welcome to the Issue Tracking system in Too Good CRM!

---

## 🎯 What is Issue Tracking?

Issue tracking helps you manage problems, complaints, and tasks related to:
- **Vendors** - Issues with suppliers or partners
- **Orders** - Problems with specific orders
- **Operations** - General organizational issues
- **Customer Complaints** - Issues raised by your clients

---

## 🚀 Getting Started

### Accessing Issues
1. Login to the CRM
2. Look for **"Issues"** in the sidebar (📋 icon)
3. Click to view all issues

### Your First Issue
1. Click **"Create Issue"** button
2. Fill in:
   - **Title**: Short description (e.g., "Order #123 - Late Delivery")
   - **Description**: Full details of the problem
   - **Priority**: How urgent is it?
     - Low: Can wait
     - Medium: Normal priority
     - High: Important
     - Urgent/Critical: Needs immediate attention
   - **Category**: Type of issue
     - Quality: Product/service quality
     - Delivery: Shipping problems
     - Billing: Payment issues
     - Communication: Miscommunication
     - Technical: System problems
     - Other: Everything else
3. Click **"Create"**
4. Done! Your issue is logged.

---

## 📊 Understanding Issue Status

Issues move through these stages:

```
1. OPEN
   ↓ (Someone starts working on it)
2. IN PROGRESS  
   ↓ (Problem is fixed)
3. RESOLVED
   ↓ (Everything confirmed)
4. CLOSED
```

You can also **reopen** resolved issues if needed.

---

## 🎨 The Issues Page

### Main View
- **Statistics Cards** - Quick overview of all issues
- **Search Bar** - Find issues quickly
- **Filters** - Narrow down by status, priority, category
- **Table** - List of all issues with actions

### Issue Details
Click any issue to see:
- Full description
- Current status and priority
- Who created it
- Who's working on it
- Resolution notes (if resolved)
- Related vendor/order info
- Linear integration status (if enabled)

---

## 🔍 Finding Issues

### By Search
Type in the search box:
- Issue number (e.g., "ISS-2025-0001")
- Keywords from title or description

### By Filters
Use dropdown filters:
- **Status**: Open, In Progress, Resolved, Closed
- **Priority**: Low, Medium, High, Urgent, Critical
- **Category**: All available categories

### By Vendor/Order
Filter to see issues for specific:
- Vendor
- Order number

---

## ⚡ Common Actions

### Create Issue
- Button: **"Create Issue"**
- Who: Employees with `issue:create` permission
- When: When you discover a problem

### View Issue
- Click: Any issue in the list
- Who: Anyone with `issue:view` permission
- See: Full details and history

### Edit Issue
- Button: **"Edit"** on detail page
- Who: Users with `issue:update` permission
- What: Update title, description, priority, etc.

### Resolve Issue
- Button: **"Resolve"** on detail page
- Who: Users with `issue:update` permission
- Required: Resolution notes explaining the fix
- Result: Status changes to "Resolved"

### Close Issue
- Button: **"Close"** on detail page
- Who: Users with `issue:update` permission
- When: After resolution is confirmed
- Result: Status changes to "Closed"

### Reopen Issue
- Button: **"Reopen"** on detail page
- Who: Users with `issue:update` permission
- When: If problem resurfaces
- Result: Status back to "Open"

### Delete Issue
- Button: **"Delete"** on detail page
- Who: Users with `issue:delete` permission
- Warning: This is permanent!

---

## 👥 For Different Users

### As an Employee
You can:
- ✅ Create issues for your organization
- ✅ View all issues in your organization
- ✅ Edit issues (if you have permission)
- ✅ Resolve issues
- ✅ Assign issues to team members
- ✅ Link issues to vendors and orders

### As a Vendor
You can:
- ✅ View issues related to your business
- ✅ Create issues about orders or operations
- ✅ Resolve issues assigned to you
- ✅ Update issue status

### As a Customer
You can:
- ✅ Raise issues about vendors (via "Client Issues")
- ✅ View issues you've raised
- ✅ Add comments to your issues
- ✅ Track resolution progress
- ❌ Cannot see internal issues

---

## 🎯 Real-World Examples

### Example 1: Quality Issue
```
Scenario: Customer receives defective product

Steps:
1. Create issue
2. Title: "Order #5678 - Defective product"
3. Category: Quality
4. Priority: High
5. Link to Order #5678
6. Assign to quality team member
7. Team investigates
8. Team sends replacement
9. Resolve with notes: "Sent replacement on [date]"
10. Close after customer confirms
```

### Example 2: Delivery Delay
```
Scenario: Shipment is late

Steps:
1. Create issue
2. Title: "Order #1234 - Delayed delivery"
3. Category: Delivery
4. Priority: Medium
5. Link to vendor and order
6. Status: In Progress
7. Track shipment
8. Resolve when delivered
9. Add notes about cause and prevention
```

### Example 3: Customer Complaint
```
Scenario: Customer not satisfied with service

Customer's view:
1. Login to client portal
2. Navigate to "Issues"
3. Click "Raise Issue"
4. Select vendor
5. Describe problem
6. Submit

Vendor's view:
1. Receives notification
2. Reviews issue in Issues page
3. Assigns to support team
4. Team contacts customer
5. Resolves problem
6. Updates status to Resolved
7. Customer sees update
```

---

## 💡 Best Practices

### When Creating Issues
✅ **DO:**
- Use clear, descriptive titles
- Provide detailed descriptions
- Set appropriate priority
- Link to related vendors/orders
- Assign to responsible person

❌ **DON'T:**
- Use vague titles like "Problem"
- Leave description empty
- Over-prioritize (not everything is urgent)
- Create duplicates (search first!)

### When Resolving Issues
✅ **DO:**
- Add clear resolution notes
- Explain what was done
- Include next steps if any
- Mark resolved only when truly fixed

❌ **DON'T:**
- Resolve without notes
- Close prematurely
- Leave questions unanswered

### When Managing Issues
✅ **DO:**
- Review open issues regularly
- Update status as work progresses
- Communicate with stakeholders
- Learn from patterns

❌ **DON'T:**
- Let issues sit unaddressed
- Forget to update status
- Close without verification

---

## 🔔 Notifications

Currently, the system requires manual checking. Future enhancements will include:
- Email notifications on issue creation
- Alerts when assigned an issue
- Updates when status changes
- Daily/weekly summaries

---

## 📱 On Mobile

The Android app also supports issue tracking:
- View issues on the go
- Create new issues
- Check status updates
- Respond to customer issues

---

## 🔐 Permissions

You need these permissions:

| Action | Permission Required |
|--------|-------------------|
| View issues | `issue:view` |
| Create issues | `issue:create` |
| Edit issues | `issue:update` |
| Resolve issues | `issue:update` |
| Delete issues | `issue:delete` |

**Note**: Customers don't need permissions to raise and view their own issues.

---

## 🔗 Linear Integration

If your organization uses Linear:
- Issues auto-sync to Linear
- Status updates sync both ways
- Track in Linear project boards
- Team collaboration across tools
- Links back to CRM for full context

---

## ❓ FAQs

**Q: How do I know my issue number?**
A: Issues are auto-numbered as ISS-YYYY-NNNN (e.g., ISS-2025-0001)

**Q: Can I attach files to issues?**
A: Not yet - text descriptions only. Coming in future update.

**Q: Who gets notified when I create an issue?**
A: Currently no automatic notifications. Check planned enhancements.

**Q: Can I bulk update multiple issues?**
A: Not yet - update one at a time. Future enhancement.

**Q: What happens to closed issues?**
A: They stay in the system for records. Filter them out if needed.

**Q: Can I export issues?**
A: Not yet - planned for future release.

**Q: How long are issues kept?**
A: Indefinitely - they're your historical record.

---

## 🆘 Need Help?

### Can't See Issues
- Check you're logged in
- Verify your organization is active
- Confirm you have view permission

### Can't Create Issues
- Check you have create permission
- Verify all required fields are filled
- Try refreshing the page

### Issue Not Updating
- Check you have update permission
- Verify network connection
- Look for error messages

### For More Help
- Check documentation files
- Ask your administrator
- Review backend logs

---

## 📚 Additional Resources

- **INTEGRATION_SUMMARY.md** - Quick reference
- **ISSUE_TRACKING_QUICKSTART.md** - Getting started
- **ISSUE_TRACKING_SYSTEM.md** - Technical details
- **ISSUE_TRACKING_FLOWS.md** - Visual diagrams

---

## 🎉 Tips for Success

1. **Be Consistent** - Use the same categories and priorities
2. **Be Detailed** - Future you will thank you
3. **Follow Up** - Check on issues regularly
4. **Communicate** - Keep stakeholders informed
5. **Learn** - Use data to prevent future issues

---

**Happy Issue Tracking!** 📋✨

*Version 1.0.0 | Last Updated: November 9, 2025*

