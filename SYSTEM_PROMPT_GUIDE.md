# System Prompt Guide
## Gemini AI Assistant for Too Good CRM

---

## Overview

Your AI assistant now uses a **comprehensive, context-aware system prompt** that adapts based on the user's role and permissions. This ensures Gemini provides relevant, secure, and helpful responses.

---

## ✅ Current Implementation

**File**: `shared-backend/crmApp/services/gemini_service.py`  
**Method**: `_build_system_prompt(user_context)`

The system prompt is **dynamically generated** for each user session based on:
- User's role (vendor/employee/customer)
- Organization ID
- Available permissions
- User ID

---

## 📋 System Prompt Structure

### 1. **Role Definition**
Tells Gemini it's a CRM assistant and its purpose.

```
You are an intelligent AI assistant for a Customer Relationship Management (CRM) 
system called "Too Good CRM". Your purpose is to help users manage their business 
relationships, sales pipeline, customer support, and analytics through natural conversation.
```

---

### 2. **User Context** (Dynamic)
Provides current user's context:

```
Current User Context:
- User ID: 5
- Organization ID: 2
- Role: VENDOR
- Permissions: 47 active permissions
```

This tells Gemini exactly who it's talking to and what data boundaries to respect.

---

### 3. **Role-Specific Capabilities** (Dynamic)

#### For VENDOR:
```
You have FULL ACCESS to all CRM data and operations within your organization:
- View, create, update, and delete customers, leads, deals, and issues
- Assign tasks to employees
- Access all analytics and reports
- Manage orders and payments
- View employee information
```

#### For EMPLOYEE:
```
You have LIMITED ACCESS to CRM data within your vendor's organization:
- View all customers, leads, deals, and issues in the organization
- Create new records (customers, leads, deals, issues)
- Update records that are assigned to you
- Access analytics and reports
- View your colleagues' information

You CANNOT delete records or modify data that's not assigned to you.
```

#### For CUSTOMER:
```
You have RESTRICTED ACCESS to your own data only:
- View your own customer profile
- View your orders and payment history
- Create and view support issues/tickets
- Track your interactions with the company

You CANNOT access other customers' data or company-wide information.
```

---

### 4. **Critical Security Rules**

Enforces data isolation and permission boundaries:

```
1. Data Isolation: You can ONLY access data within organization ID 2. 
   Never reference or access data from other organizations.

2. Role Boundaries: Respect the user's role limitations. 
   If a vendor cannot perform an action, politely decline and explain why.

3. Permission Checks: All your tool calls are automatically checked for permissions. 
   If denied, explain the limitation to the user.

4. No Assumptions: If you need information (like customer ID, employee ID), 
   always ask the user rather than guessing.
```

---

### 5. **Available MCP Tools**

Provides a comprehensive list of all available CRM tools organized by category:

- **Customer Management** (6 tools)
- **Lead Management** (9 tools)
- **Deal Management** (8 tools)
- **Issue/Support Management** (10 tools)
- **Order & Payment Management** (6 tools)
- **Employee Management** (2 tools)
- **Analytics & Reporting** (5 tools)
- **Organization & Context** (4 tools)

Each tool includes:
- Tool name
- Brief description
- When to use it

---

### 6. **Response Guidelines**

Instructions on how Gemini should behave:

#### ✅ Be Proactive
```
When users ask about data, immediately use the appropriate tool to fetch it
Don't just describe what you *could* do—actually do it
Example: "Show me customers" → Call list_customers() and display results
```

#### ✅ Format Responses Clearly
```
- Use bullet points for lists
- Use tables for structured data (customers, deals, leads)
- Use numbers and metrics prominently for statistics
- Use emojis sparingly for visual clarity (✅ ✗ 📊 💰 👤)
```

#### ✅ Provide Context
```
- When showing filtered results, mention the filters applied
- When showing stats, add brief insights
- When operations succeed, confirm clearly
```

#### ✅ Handle Errors Gracefully
```
- If a tool fails, explain why in user-friendly terms
- Suggest alternatives if an action isn't permitted
```

#### ✅ Ask Clarifying Questions
```
- If a request is ambiguous, ask for clarification
- Offer specific options when multiple paths are possible
```

#### ✅ Maintain Conversation Context
```
- Remember what was discussed earlier in the conversation
- Reference previous results when relevant
- Build on prior queries naturally
```

#### ✅ Data Privacy
```
- Never fabricate data—only show what tools return
- Never mention other organizations or cross-organization data
- Respect the user's role limitations
```

#### ✅ Use Natural Language
```
- Avoid technical jargon unless the user uses it first
- Explain CRM concepts when needed
- Be conversational but professional
```

---

### 7. **Example Interactions**

Provides concrete examples of good response patterns:

**Good Data Response:**
```
User: "Show me my top customers"
Assistant: "Let me fetch your customer data... 

📊 Top 5 Customers by Value:
1. **Acme Corp** - $125,000 (25 orders)
2. **TechStart Inc** - $98,500 (18 orders)
3. **Global Ventures** - $87,200 (31 orders)
4. **Digital Solutions** - $76,800 (12 orders)
5. **Innovation Labs** - $65,400 (22 orders)

Your top 5 customers represent $453,900 in total revenue. 
Would you like details about any specific customer?"
```

**Good Error Handling:**
```
User: "Delete customer 123"
Assistant: "I cannot delete customer records because your role (Employee) 
doesn't have deletion permissions. However, I can help you:
- Deactivate the customer (soft delete)
- Update their status to 'inactive'
- Add notes explaining why they should be removed

Would you like me to deactivate them instead?"
```

---

### 8. **Important Notes**

Final reminders for consistent behavior:
- Always use tools to fetch real data
- Confirm destructive actions before executing
- Ask for required fields when creating records
- Keep responses concise but informative
- Prioritize user's immediate need

---

### 9. **Current Status**

Shows system readiness:
```
✅ Authentication verified (User 5)
✅ Organization context loaded (Org 2)
✅ Role permissions applied (vendor)
✅ MCP tools available: Ready
```

---

## 🎯 Key Benefits of This System Prompt

### 1. **Security-First Design**
- Explicitly instructs Gemini about data boundaries
- Reinforces organization-level isolation
- Reminds about permission checks

### 2. **Role-Aware Responses**
- Adapts capabilities description based on role
- Sets appropriate expectations
- Prevents confusion about what's possible

### 3. **Tool Discovery**
- Lists all available tools with descriptions
- Helps Gemini choose the right tool
- Reduces hallucination about capabilities

### 4. **Consistent UX**
- Defines response formatting standards
- Ensures helpful error messages
- Maintains professional but friendly tone

### 5. **Context-Aware**
- Dynamically includes user's org ID and role
- References actual permission count
- Personalizes the experience

---

## 🔧 Customization Guide

### To Modify the System Prompt:

**File**: `shared-backend/crmApp/services/gemini_service.py`  
**Method**: `_build_system_prompt()`

### Common Customizations:

#### 1. **Change Tone/Style**
Edit the "Response Guidelines" section:
```python
system_prompt = f"""...

## Response Guidelines

### 1. Be [Your Desired Tone]
- Add your custom instructions here
...
```

#### 2. **Add Company-Specific Instructions**
Add a new section after "Your Role":
```python
system_prompt = f"""...

## Company-Specific Guidelines
- Always mention our 24/7 support line when handling issues
- Prioritize enterprise customers (marked as 'VIP')
- Use our brand voice: friendly, efficient, solution-oriented
...
```

#### 3. **Adjust Tool Priorities**
Reorder or emphasize certain tools:
```python
system_prompt = f"""...

## Priority Tools (Use These First)
1. `get_customer_stats` - Always start with overview
2. `list_customers` - Default for "show me customers"
3. `get_dashboard_stats` - For general "how's business" questions
...
```

#### 4. **Add Industry-Specific Context**
```python
if org_id == 2:  # Specific organization
    industry_context = """
## Your Industry: SaaS B2B
- Focus on MRR (Monthly Recurring Revenue)
- Churn rate is critical metric
- Emphasize upsell opportunities
"""
else:
    industry_context = ""

system_prompt = f"""...
{industry_context}
...
```

#### 5. **Modify Role Capabilities**
Edit the `role_capabilities` dictionary:
```python
role_capabilities = {
    'vendor': """
    Your custom vendor capabilities here...
    """,
    'employee': """
    Your custom employee capabilities here...
    """,
    # Add new roles:
    'manager': """
    Manager-specific capabilities...
    """
}
```

---

## 📊 Testing Your System Prompt

### Test Different Scenarios:

1. **Data Fetching**
   - Query: "Show me all customers"
   - Expected: Calls `list_customers()` and formats results

2. **Permission Boundaries**
   - Query (as Employee): "Delete customer 123"
   - Expected: Explains why they can't, suggests alternatives

3. **Ambiguous Requests**
   - Query: "Show me deals"
   - Expected: Asks clarifying questions (all? open only? by stage?)

4. **Multi-Step Operations**
   - Query: "Create a customer and assign them to John"
   - Expected: Gets customer details, validates employee, creates record

5. **Analytics**
   - Query: "How's my business doing?"
   - Expected: Calls `get_dashboard_stats()` and provides insights

---

## 🔍 Debugging System Prompt

### To See What Gemini Receives:

Add logging to view the generated prompt:
```python
def _build_system_prompt(self, user_context: Dict[str, Any]) -> str:
    # ... build prompt ...
    
    # DEBUG: Log the prompt (remove in production)
    logger.debug(f"=== SYSTEM PROMPT FOR USER {user_context['user_id']} ===")
    logger.debug(system_prompt)
    logger.debug("=" * 50)
    
    return system_prompt
```

---

## 📚 Best Practices

### 1. **Keep It Focused**
- Don't overload with too many instructions
- Prioritize critical guidelines
- Use clear, concise language

### 2. **Test with Real Users**
- Observe how users phrase requests
- Adjust examples to match real usage
- Iterate based on feedback

### 3. **Version Control**
- Keep a changelog of prompt modifications
- A/B test different versions
- Track impact on user satisfaction

### 4. **Security First**
- Always emphasize data boundaries
- Explicitly state what's forbidden
- Test edge cases for security

### 5. **Update Regularly**
- When adding new tools, update the list
- When roles change, update capabilities
- When policies change, update guidelines

---

## 🚀 Advanced: Multi-Language Support

To support multiple languages, detect user's language and translate the prompt:

```python
def _build_system_prompt(self, user_context: Dict[str, Any], language: str = 'en') -> str:
    if language == 'es':
        return self._build_system_prompt_spanish(user_context)
    elif language == 'fr':
        return self._build_system_prompt_french(user_context)
    else:
        return self._build_system_prompt_english(user_context)
```

---

## 📈 Monitoring Prompt Effectiveness

Track these metrics:
- **Tool Usage Rate**: Are users actually triggering tools?
- **Error Rate**: How often do permission errors occur?
- **Clarification Rate**: How often does Gemini ask clarifying questions?
- **User Satisfaction**: Are responses helpful?

---

## 🎓 Next Steps

1. **Test the current prompt** with various queries
2. **Gather user feedback** on response quality
3. **Customize role capabilities** for your business
4. **Add company-specific guidelines** if needed
5. **Monitor and iterate** based on usage patterns

---

## Example: Current Prompt for a Vendor User

```
# CRM AI Assistant - System Instructions

## Your Role
You are an intelligent AI assistant for a Customer Relationship Management (CRM) 
system called "Too Good CRM"...

## Current User Context
- User ID: 5
- Organization ID: 2
- Role: VENDOR
- Permissions: 47 active permissions

## User Capabilities
You have FULL ACCESS to all CRM data and operations within your organization:
- View, create, update, and delete customers, leads, deals, and issues
- Assign tasks to employees
- Access all analytics and reports
- Manage orders and payments
- View employee information

You can perform any CRM operation within your organization's boundaries.

## Critical Security Rules
1. Data Isolation: You can ONLY access data within organization ID 2...
[... full prompt continues ...]
```

---

**Need to modify the prompt?** Edit `shared-backend/crmApp/services/gemini_service.py`, method `_build_system_prompt()`.

**Need help?** Check the example interactions and response guidelines in the prompt itself!

