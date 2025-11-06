# API Endpoints Quick Reference

## Base URL
All endpoints are prefixed with `/api/`

Example: `http://localhost:8000/api/issues/`

## Authentication
All endpoints require authentication token in header:
```
Authorization: Token <your-auth-token>
```

---

## Issues API

### List Issues
```http
GET /api/issues/
```
**Query Parameters:**
- `vendor` - Filter by vendor ID
- `order` - Filter by order ID
- `priority` - Filter by priority (low, medium, high, critical)
- `category` - Filter by category (quality, delivery, payment, communication, other)
- `status` - Filter by status (open, in_progress, resolved, closed)
- `assigned_to` - Filter by assigned employee ID
- `search` - Search in issue_number, title, description
- `ordering` - Sort by created_at, updated_at, priority, status (prefix with `-` for descending)

**Response:** Array of issues (lightweight)

### Create Issue
```http
POST /api/issues/
Content-Type: application/json

{
  "title": "Quality issue with product batch",
  "description": "Product quality does not meet standards",
  "priority": "high",
  "category": "quality",
  "status": "open",
  "vendor": 1,
  "order": 2,
  "assigned_to": 3
}
```

### Get Issue Details
```http
GET /api/issues/{id}/
```
**Response:** Full issue details with nested vendor/employee objects

### Update Issue
```http
PUT /api/issues/{id}/
Content-Type: application/json

{
  "title": "Updated title",
  "status": "in_progress",
  "priority": "critical"
}
```

### Delete Issue
```http
DELETE /api/issues/{id}/
```

### Resolve Issue
```http
POST /api/issues/{id}/resolve/
```
**Effect:** Sets status to 'resolved', sets resolved_by to current user

### Reopen Issue
```http
POST /api/issues/{id}/reopen/
```
**Effect:** Sets status to 'open', clears resolved_by

### Get Issue Statistics
```http
GET /api/issues/stats/
```
**Response:**
```json
{
  "total": 45,
  "by_status": {
    "open": 15,
    "in_progress": 10,
    "resolved": 18,
    "closed": 2
  },
  "by_priority": {
    "low": 5,
    "medium": 20,
    "high": 15,
    "critical": 5
  },
  "by_category": {
    "quality": 10,
    "delivery": 15,
    "payment": 8,
    "communication": 7,
    "other": 5
  }
}
```

---

## Orders API

### List Orders
```http
GET /api/orders/
```
**Query Parameters:**
- `vendor` - Filter by vendor ID
- `customer` - Filter by customer ID
- `order_type` - Filter by type (purchase, service)
- `status` - Filter by status (pending, confirmed, processing, completed, cancelled)
- `assigned_to` - Filter by assigned employee ID
- `search` - Search in order_number, title, description
- `ordering` - Sort by created_at, updated_at, order_date, total_amount

**Response:** Array of orders (lightweight with items_count)

### Create Order with Items
```http
POST /api/orders/
Content-Type: application/json

{
  "title": "Office Supplies Order",
  "description": "Monthly office supplies",
  "order_type": "purchase",
  "vendor": 1,
  "customer": 2,
  "assigned_to": 3,
  "order_date": "2025-01-15",
  "delivery_date": "2025-01-22",
  "total_amount": 5000.00,
  "status": "pending",
  "items": [
    {
      "item_name": "Paper Reams",
      "description": "A4 white paper",
      "quantity": 50,
      "unit_price": 25.00,
      "sku": "PAPER-A4-500"
    },
    {
      "item_name": "Pens",
      "description": "Blue ballpoint pens",
      "quantity": 100,
      "unit_price": 2.50,
      "sku": "PEN-BLUE-01"
    }
  ]
}
```

### Get Order Details
```http
GET /api/orders/{id}/
```
**Response:** Full order details with nested vendor/customer/employee/items array

### Update Order
```http
PUT /api/orders/{id}/
Content-Type: application/json

{
  "status": "confirmed",
  "delivery_date": "2025-01-20",
  "items": [
    {
      "item_name": "Updated Item",
      "quantity": 60,
      "unit_price": 25.00
    }
  ]
}
```
**Note:** Items array replaces all existing items

### Delete Order
```http
DELETE /api/orders/{id}/
```

### Complete Order
```http
POST /api/orders/{id}/complete/
```
**Effect:** Sets status to 'completed'

### Cancel Order
```http
POST /api/orders/{id}/cancel/
```
**Effect:** Sets status to 'cancelled'

### Get Order Statistics
```http
GET /api/orders/stats/
```
**Response:**
```json
{
  "total": 150,
  "total_revenue": 450000.50,
  "by_status": {
    "pending": 25,
    "confirmed": 40,
    "processing": 35,
    "completed": 45,
    "cancelled": 5
  },
  "by_type": {
    "purchase": 100,
    "service": 50
  }
}
```

---

## Payments API

### List Payments
```http
GET /api/payments/
```
**Query Parameters:**
- `vendor` - Filter by vendor ID
- `customer` - Filter by customer ID
- `order` - Filter by order ID
- `payment_type` - Filter by type (incoming, outgoing)
- `payment_method` - Filter by method (cash, bank_transfer, credit_card, check, online)
- `status` - Filter by status (pending, processing, completed, failed, refunded)
- `search` - Search in payment_number, invoice_number, reference_number, transaction_id
- `ordering` - Sort by created_at, updated_at, payment_date, amount

**Response:** Array of payments (lightweight)

### Create Payment
```http
POST /api/payments/
Content-Type: application/json

{
  "invoice_number": "INV-2025-001",
  "reference_number": "REF-123456",
  "vendor": 1,
  "customer": 2,
  "order": 3,
  "payment_type": "incoming",
  "payment_method": "bank_transfer",
  "amount": 5000.00,
  "currency": "USD",
  "payment_date": "2025-01-15",
  "due_date": "2025-01-30",
  "status": "pending",
  "transaction_id": "TXN-ABC123",
  "notes": "Payment for Order #ORD-2025-0001"
}
```

### Get Payment Details
```http
GET /api/payments/{id}/
```
**Response:** Full payment details with nested vendor/customer/order objects

### Update Payment
```http
PUT /api/payments/{id}/
Content-Type: application/json

{
  "status": "completed",
  "transaction_id": "TXN-ABC123-CONFIRMED"
}
```

### Delete Payment
```http
DELETE /api/payments/{id}/
```

### Process Payment
```http
POST /api/payments/{id}/process/
```
**Effect:** Sets status to 'completed', sets processed_by to current user, auto-sets processed_at

### Mark Payment as Failed
```http
POST /api/payments/{id}/mark_failed/
```
**Effect:** Sets status to 'failed'

### Get Payment Statistics
```http
GET /api/payments/stats/
```
**Response:**
```json
{
  "total": 200,
  "total_amount": 750000.00,
  "by_status": {
    "pending": 50,
    "processing": 30,
    "completed": 110,
    "failed": 5,
    "refunded": 5
  },
  "by_payment_type": {
    "incoming": 600000.00,
    "outgoing": 150000.00
  },
  "by_payment_method": {
    "cash": 20,
    "bank_transfer": 100,
    "credit_card": 50,
    "check": 15,
    "online": 15
  }
}
```

---

## Activities API

### List Activities
```http
GET /api/activities/
```
**Query Parameters:**
- `customer` - Filter by customer ID
- `lead` - Filter by lead ID
- `deal` - Filter by deal ID
- `activity_type` - Filter by type (call, email, telegram, meeting, note, task)
- `status` - Filter by status (scheduled, in_progress, completed, cancelled)
- `assigned_to` - Filter by assigned employee ID
- `search` - Search in title, description, customer_name
- `ordering` - Sort by created_at, updated_at, scheduled_at, completed_at

**Response:** Array of activities (lightweight)

### Create Activity
```http
POST /api/activities/
Content-Type: application/json

{
  "activity_type": "call",
  "title": "Follow-up call with customer",
  "description": "Discuss project requirements",
  "customer": 1,
  "lead": null,
  "deal": 2,
  "assigned_to": 3,
  "status": "scheduled",
  "scheduled_at": "2025-01-16T10:00:00Z",
  "duration_minutes": 30,
  "phone_number": "+1234567890"
}
```

**Activity Types and Type-Specific Fields:**

**Call:**
```json
{
  "activity_type": "call",
  "phone_number": "+1234567890",
  "call_duration": 15,
  "call_recording_url": "https://example.com/recording.mp3"
}
```

**Email:**
```json
{
  "activity_type": "email",
  "email_subject": "Project Proposal",
  "email_body": "Please find attached...",
  "email_attachments": ["proposal.pdf", "timeline.xlsx"]
}
```

**Telegram:**
```json
{
  "activity_type": "telegram",
  "telegram_username": "@johndoe",
  "telegram_chat_id": "123456789"
}
```

**Meeting:**
```json
{
  "activity_type": "meeting",
  "meeting_location": "Conference Room A",
  "meeting_url": "https://meet.google.com/abc-defg-hij",
  "attendees": ["john@example.com", "jane@example.com"]
}
```

**Task:**
```json
{
  "activity_type": "task",
  "task_priority": "high",
  "task_due_date": "2025-01-20"
}
```

**Note:**
```json
{
  "activity_type": "note",
  "is_pinned": true
}
```

### Get Activity Details
```http
GET /api/activities/{id}/
```
**Response:** Full activity details with all type-specific fields

### Update Activity
```http
PUT /api/activities/{id}/
Content-Type: application/json

{
  "status": "completed",
  "description": "Updated description"
}
```
**Note:** When status is set to 'completed', completed_at is auto-set

### Delete Activity
```http
DELETE /api/activities/{id}/
```

### Complete Activity
```http
POST /api/activities/{id}/complete/
```
**Effect:** Sets status to 'completed', auto-sets completed_at

### Cancel Activity
```http
POST /api/activities/{id}/cancel/
```
**Effect:** Sets status to 'cancelled'

### Get Activity Statistics
```http
GET /api/activities/stats/
```
**Response:**
```json
{
  "total": 500,
  "by_status": {
    "scheduled": 150,
    "in_progress": 50,
    "completed": 280,
    "cancelled": 20
  },
  "by_type": {
    "call": 200,
    "email": 150,
    "telegram": 30,
    "meeting": 80,
    "note": 20,
    "task": 20
  }
}
```

### Get Upcoming Activities
```http
GET /api/activities/upcoming/
```
**Response:** Next 10 upcoming scheduled activities (ordered by scheduled_at)

### Get Overdue Activities
```http
GET /api/activities/overdue/
```
**Response:** All scheduled activities past their scheduled_at time

---

## Common Response Codes

- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `204 No Content` - Resource deleted successfully
- `400 Bad Request` - Invalid data in request
- `401 Unauthorized` - Missing or invalid auth token
- `403 Forbidden` - User doesn't have permission
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

## Common Error Response Format
```json
{
  "detail": "Error message here",
  "field_errors": {
    "field_name": ["Error for this field"]
  }
}
```

---

## Pagination

All list endpoints support pagination:

**Request:**
```http
GET /api/issues/?page=2&page_size=20
```

**Response:**
```json
{
  "count": 100,
  "next": "http://localhost:8000/api/issues/?page=3",
  "previous": "http://localhost:8000/api/issues/?page=1",
  "results": [...]
}
```

---

## Example cURL Commands

### Create Issue
```bash
curl -X POST http://localhost:8000/api/issues/ \
  -H "Authorization: Token YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Quality Issue",
    "priority": "high",
    "category": "quality",
    "status": "open",
    "vendor": 1
  }'
```

### List Orders with Filtering
```bash
curl -X GET "http://localhost:8000/api/orders/?status=pending&ordering=-created_at" \
  -H "Authorization: Token YOUR_TOKEN"
```

### Complete Payment
```bash
curl -X POST http://localhost:8000/api/payments/5/process/ \
  -H "Authorization: Token YOUR_TOKEN"
```

### Get Activity Statistics
```bash
curl -X GET http://localhost:8000/api/activities/stats/ \
  -H "Authorization: Token YOUR_TOKEN"
```

---

**Last Updated:** 2025-01-15
