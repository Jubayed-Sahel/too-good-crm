# Backend-Frontend Integration Quick Reference

## 🚀 Quick Start

### Start Backend
```bash
cd shared-backend
python manage.py runserver
```
Server runs at: `http://127.0.0.1:8000`

### Start Frontend
```bash
cd web-frontend
npm run dev
```
Server runs at: `http://localhost:5173`

---

## 🔗 API Connection

### Frontend Configuration
File: `web-frontend/.env`
```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

### Backend Configuration
File: `shared-backend/crmAdmin/settings.py`
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
```

---

## 📋 Complete Endpoint Mapping

### Authentication Flow

**Registration** → **Login** → **Get User** → **Use Token**

```typescript
// 1. Register
POST /api/users/
Body: { username, email, password, full_name }
Response: { user, token }

// 2. Login
POST /api/auth/login/
Body: { username, password }
Response: { token, user }

// 3. Get Current User
GET /api/users/me/
Headers: { Authorization: "Token {token}" }
Response: { id, username, email, full_name, ... }

// 4. Use token in all requests
Headers: { Authorization: "Token {token}" }
```

---

## 📊 Data Flow Examples

### Customer Management Flow

```
Frontend                Backend
--------                -------
1. Load Customers Page
   └─> GET /api/customers/
         └─> Filter by org
         └─> Paginate results
         └─> Return { count, results }

2. View Customer Details
   └─> GET /api/customers/5/
         └─> Get customer
         └─> Load relationships
         └─> Return full data

3. Create Customer
   └─> POST /api/customers/
         └─> Validate data
         └─> Create record
         └─> Return new customer

4. Update Customer
   └─> PUT /api/customers/5/
         └─> Validate data
         └─> Update record
         └─> Return updated customer

5. Add Note
   └─> POST /api/customers/5/add_note/
         └─> Create activity
         └─> Return note
```

### Lead Conversion Flow

```
Frontend                Backend
--------                -------
1. View Lead
   └─> GET /api/leads/10/
         └─> Return lead data

2. Convert Lead
   └─> POST /api/leads/10/convert/
         ├─> Create customer from lead
         ├─> Mark lead as converted
         ├─> Link records
         └─> Return { customer_id, lead }

3. Redirect to Customer
   └─> GET /api/customers/{customer_id}/
         └─> Show new customer
```

### Deal Pipeline Flow

```
Frontend                Backend
--------                -------
1. Load Pipeline
   └─> GET /api/pipelines/
   └─> GET /api/pipeline-stages/?pipeline=1
         └─> Return stages in order

2. Load Deals by Stage
   └─> GET /api/deals/?stage=1
   └─> GET /api/deals/?stage=2
   └─> GET /api/deals/?stage=3
         └─> Return deals per stage

3. Move Deal
   └─> POST /api/deals/5/move_stage/
       Body: { stage_id: 3 }
         ├─> Update stage
         ├─> Update probability
         └─> Return updated deal

4. Win Deal
   └─> POST /api/deals/5/mark_won/
         ├─> Set is_won = true
         ├─> Set close date
         ├─> Update status
         └─> Return won deal
```

---

## 🔍 Filtering & Search

### All List Endpoints Support:

```typescript
// Search
GET /api/customers/?search=john

// Filter by status
GET /api/customers/?status=active

// Filter by type
GET /api/customers/?customer_type=business

// Filter by assignment
GET /api/leads/?assigned_to=5

// Combine filters
GET /api/deals/?status=active&priority=high&assigned_to=3

// Pagination
GET /api/customers/?page=2&page_size=25

// Sorting
GET /api/deals/?ordering=-created_at
```

---

## 📈 Analytics Endpoints

### Dashboard Stats
```typescript
GET /api/analytics/dashboard/

Response: {
  customers: { total, active, inactive, growth },
  leads: { total, qualified, converted, hot },
  deals: { total, won, lost, revenue, win_rate },
  revenue: { current_month, last_month, growth }
}
```

### Sales Funnel
```typescript
GET /api/analytics/sales_funnel/

Response: {
  stages: [
    { name: "Total Leads", count: 100, conversion: 100% },
    { name: "Qualified", count: 60, conversion: 60% },
    { name: "Deals Created", count: 40, conversion: 40% },
    { name: "Won", count: 15, conversion: 15% }
  ]
}
```

### Revenue by Period
```typescript
GET /api/analytics/revenue_by_period/?period=month&limit=12

Response: {
  periods: [
    { period: "2025-01", revenue: 50000, deals: 10 },
    { period: "2025-02", revenue: 65000, deals: 13 },
    ...
  ]
}
```

---

## 🔐 Authentication Headers

### All Requests (except login/register)
```typescript
{
  headers: {
    'Authorization': 'Token abc123def456...',
    'Content-Type': 'application/json'
  }
}
```

### Token Storage
```typescript
// Login response
{ token: "abc123def456..." }

// Store in localStorage
localStorage.setItem('authToken', token);

// Add to all requests
const token = localStorage.getItem('authToken');
axios.defaults.headers.common['Authorization'] = `Token ${token}`;
```

---

## ⚠️ Error Handling

### HTTP Status Codes

| Code | Meaning | Action |
|------|---------|--------|
| 200 | Success | Process response |
| 201 | Created | Show success, redirect |
| 400 | Bad Request | Show validation errors |
| 401 | Unauthorized | Redirect to login |
| 403 | Forbidden | Show permission error |
| 404 | Not Found | Show not found message |
| 500 | Server Error | Show error message |

### Error Response Format
```json
{
  "error": "Validation failed",
  "details": {
    "email": ["This field is required"],
    "phone": ["Invalid phone number"]
  }
}
```

---

## 🧪 Testing

### Test User Credentials
```
Username: testuser
Password: testpass123
Email: test@example.com
```

### Test with cURL
```bash
# Login
curl -X POST http://127.0.0.1:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "testpass123"}'

# Get customers (with token)
curl http://127.0.0.1:8000/api/customers/ \
  -H "Authorization: Token YOUR_TOKEN_HERE"
```

### Test with Python
```python
import requests

# Login
response = requests.post('http://127.0.0.1:8000/api/auth/login/', json={
    'username': 'testuser',
    'password': 'testpass123'
})
token = response.json()['token']

# Get customers
response = requests.get('http://127.0.0.1:8000/api/customers/', headers={
    'Authorization': f'Token {token}'
})
customers = response.json()
```

---

## 📦 Data Models

### Relationships

```
Organization
  ├─> Employees
  ├─> Customers
  ├─> Leads
  ├─> Deals
  ├─> Vendors
  └─> Pipelines

Customer
  ├─> Deals
  └─> Activities

Lead
  ├─> Activities
  └─> Converted to Customer

Deal
  ├─> Customer (required)
  ├─> Pipeline & Stage
  └─> Assigned Employee

Pipeline
  └─> Stages (ordered)
```

---

## 🎯 Common Tasks

### Create a Customer
```typescript
const customer = await api.post('/customers/', {
  name: "John Doe",
  email: "john@example.com",
  phone: "+1234567890",
  company_name: "Acme Corp",
  customer_type: "business",
  status: "active",
  organization: 1
});
```

### Convert Lead to Customer
```typescript
const result = await api.post(`/leads/${leadId}/convert/`, {
  create_deal: true,
  deal_title: "New Deal",
  deal_value: 50000
});

const customerId = result.customer_id;
```

### Move Deal to Next Stage
```typescript
const deal = await api.post(`/deals/${dealId}/move_stage/`, {
  stage_id: nextStageId
});
```

### Get Dashboard Stats
```typescript
const stats = await api.get('/analytics/dashboard/');

console.log(stats.customers.total);
console.log(stats.deals.revenue);
console.log(stats.revenue.growth);
```

---

## 🔧 Troubleshooting

### Issue: CORS Error
**Solution**: Check `CORS_ALLOWED_ORIGINS` in `settings.py`

### Issue: 401 Unauthorized
**Solution**: 
1. Check token is stored: `localStorage.getItem('authToken')`
2. Check header: `Authorization: Token {token}`
3. Re-login if token expired

### Issue: 404 Not Found
**Solution**: 
1. Verify endpoint URL matches backend routes
2. Check API base URL in `.env`
3. Ensure backend server is running

### Issue: Empty Data
**Solution**:
1. Run seed data: `python seed_data.py`
2. Check organization associations
3. Verify user has access to organization

---

## 📚 Documentation Files

- **API_ENDPOINT_COMPARISON.md** - Detailed endpoint mapping
- **BACKEND_FULFILLMENT_REPORT.md** - Complete coverage analysis
- **API_ARCHITECTURE.md** - Frontend API usage guide
- **REFACTORING_SUMMARY.md** - Frontend refactoring details
- **verify_api.py** - Backend endpoint verification script

---

## ✅ Verification Checklist

- [ ] Backend server running on port 8000
- [ ] Frontend server running on port 5173
- [ ] CORS configured correctly
- [ ] Environment variables set
- [ ] Seed data loaded
- [ ] Test user can login
- [ ] API calls working from frontend
- [ ] Data displays correctly
- [ ] Token authentication working

---

**Everything is ready! Start both servers and test the application.** 🚀
