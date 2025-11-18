# Backend API Endpoints - Customer Management

## Base URL
```
https://stephine-nonconfiding-pseudotribally.ngrok-free.dev/api/
```

**Alternative URLs (for reference):**
- Android Emulator: `http://10.0.2.2:8000/api/`
- Physical Device (same network): `http://192.168.x.x:8000/api/`

---

## API Endpoints Being Called

### 1. **Get All Customers** ✅ (Currently Used)
**Endpoint:** `GET /api/customers`

**Full URL:** 
```
https://stephine-nonconfiding-pseudotribally.ngrok-free.dev/api/customers
```

**Method:** `GET`

**Headers:**
```
Content-Type: application/json
Authorization: Token {auth_token}  // If user is logged in
```

**Response Type:** `CustomersListResponse`
```json
{
  "success": true,
  "message": "Customers retrieved successfully",
  "data": [
    {
      "id": 1,
      "code": "CUST-001",
      "name": "John Doe",
      "first_name": "John",
      "last_name": "Doe",
      "full_name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "company": "Tech Corp",
      "company_name": "Tech Corp",
      "customer_type": "business",
      "status": "active",
      "address": "123 Main St",
      "city": "New York",
      "state": "NY",
      "country": "USA",
      "postal_code": "10001",
      "zip_code": "10001",
      "website": "https://techcorp.com",
      "notes": "Important client",
      "assigned_to": 5,
      "assigned_to_name": "Sales Rep Name",
      "total_value": 150000.00,
      "user_id": 1,
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-11-10T14:20:00Z"
    }
  ]
}
```

**Used In:**
- `CustomerRepository.getCustomers()`
- `CustomersViewModel.loadCustomers()`
- Called on app startup and after creating a customer

---

### 2. **Create Customer** ✅ (Currently Used)
**Endpoint:** `POST /api/customers`

**Full URL:** 
```
https://stephine-nonconfiding-pseudotribally.ngrok-free.dev/api/customers
```

**Method:** `POST`

**Headers:**
```
Content-Type: application/json
Authorization: Token {auth_token}  // If user is logged in
```

**Request Body:** `CreateCustomerRequest`
```json
{
  "name": "Jane Smith",
  "first_name": "Jane",
  "last_name": "Smith",
  "email": "jane@example.com",
  "phone": "+1987654321",
  "company_name": "Innovate Inc",
  "customer_type": "business",
  "status": "active",
  "address": "456 Oak Ave",
  "city": "San Francisco",
  "state": "CA",
  "country": "USA",
  "postal_code": "94102",
  "website": "https://innovateinc.com",
  "notes": "New prospect from trade show"
}
```

**Response Type:** `CustomerResponse`
```json
{
  "success": true,
  "message": "Customer created successfully",
  "data": {
    "id": 42,
    "code": "CUST-042",
    "name": "Jane Smith",
    // ... full customer object
  }
}
```

**Used In:**
- `CustomerRepository.createCustomer()`
- `CustomersViewModel.createCustomer()`
- Triggered when user submits CreateCustomerDialog

---

### 3. **Get Single Customer** (Defined but not yet used)
**Endpoint:** `GET /api/customers/{id}`

**Full URL:** 
```
https://stephine-nonconfiding-pseudotribally.ngrok-free.dev/api/customers/{id}
```

**Method:** `GET`

**Path Parameter:**
- `id` - Customer ID (string)

**Headers:**
```
Content-Type: application/json
Authorization: Token {auth_token}
```

**Response Type:** `CustomerResponse`
```json
{
  "success": true,
  "message": "Customer retrieved successfully",
  "data": {
    "id": 42,
    // ... full customer object
  }
}
```

**Status:** Defined in `CustomerApiService` but not yet implemented in repository/viewmodel

---

### 4. **Update Customer** (Defined but not yet used)
**Endpoint:** `PUT /api/customers/{id}`

**Full URL:** 
```
https://stephine-nonconfiding-pseudotribally.ngrok-free.dev/api/customers/{id}
```

**Method:** `PUT`

**Path Parameter:**
- `id` - Customer ID (string)

**Headers:**
```
Content-Type: application/json
Authorization: Token {auth_token}
```

**Request Body:** `CreateCustomerRequest` (same as create)
```json
{
  "name": "Jane Smith Updated",
  "email": "jane.updated@example.com",
  // ... other fields
}
```

**Response Type:** `CustomerResponse`
```json
{
  "success": true,
  "message": "Customer updated successfully",
  "data": {
    "id": 42,
    // ... updated customer object
  }
}
```

**Used In:**
- `CustomerRepository.updateCustomer()` - ⚠️ Not yet called from ViewModel/UI

---

### 5. **Delete Customer** (Defined but not yet used)
**Endpoint:** `DELETE /api/customers/{id}`

**Full URL:** 
```
https://stephine-nonconfiding-pseudotribally.ngrok-free.dev/api/customers/{id}
```

**Method:** `DELETE`

**Path Parameter:**
- `id` - Customer ID (string)

**Headers:**
```
Content-Type: application/json
Authorization: Token {auth_token}
```

**Response Type:** `CustomerResponse`
```json
{
  "success": true,
  "message": "Customer deleted successfully",
  "data": null
}
```

**Used In:**
- `CustomerRepository.deleteCustomer()` - ⚠️ Not yet called from ViewModel/UI

---

## Currently Active Endpoints

### ✅ **Being Called:**
1. `GET /api/customers` - Load customer list
2. `POST /api/customers` - Create new customer

### ⚠️ **Defined but NOT Being Called:**
3. `GET /api/customers/{id}` - Get single customer
4. `PUT /api/customers/{id}` - Update customer
5. `DELETE /api/customers/{id}` - Delete customer

---

## Authentication

**Token Storage:**
- Stored in `ApiClient.authToken`
- Set via `ApiClient.setAuthToken(token)`

**Token Header Format:**
```
Authorization: Token {token_value}
```

**Setting Token Example:**
```kotlin
ApiClient.setAuthToken("your_auth_token_here")
```

---

## Error Handling

All endpoints return a standard response format:

**Success Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* result data */ }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error description",
  "data": null
}
```

**Network Errors:**
- Caught in repository layer
- Wrapped in `Result.failure(Exception)`
- Displayed in UI via ViewModel state

---

## Request Flow

```
User Action (UI)
    ↓
CustomersScreen → calls ViewModel function
    ↓
CustomersViewModel → calls Repository function
    ↓
CustomerRepository → calls ApiService
    ↓
CustomerApiService (Retrofit) → makes HTTP request
    ↓
ApiClient (OkHttp) → adds auth headers, logging
    ↓
Backend API (Django/FastAPI)
    ↓
Response flows back through the same chain
```

---

## Configuration Files

**API Service Definition:**
- `app/src/main/java/too/good/crm/data/api/CustomerApiService.kt`

**HTTP Client Configuration:**
- `app/src/main/java/too/good/crm/data/api/ApiClient.kt`

**Repository (Business Logic):**
- `app/src/main/java/too/good/crm/data/repository/CustomerRepository.kt`

**Data Models:**
- `app/src/main/java/too/good/crm/data/model/Customer.kt`
- `app/src/main/java/too/good/crm/data/model/CustomerResponse.kt`

---

## Testing the Endpoints

You can test these endpoints using:

1. **Android App** - Current implementation
2. **Postman/Insomnia** - Manual API testing
3. **curl** - Command line testing

**Example curl command:**
```bash
curl -X GET \
  https://stephine-nonconfiding-pseudotribally.ngrok-free.dev/api/customers \
  -H "Content-Type: application/json" \
  -H "Authorization: Token your_token_here"
```

---

**Last Updated:** November 10, 2025

