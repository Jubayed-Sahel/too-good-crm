# Android API Implementation Guide

## Overview
This guide documents the API implementation patterns for the Android app frontend, based on analysis of the web frontend and backend architecture.

**Last Updated:** 2024-11-23  
**Author:** Android Development Team

---

## Table of Contents
1. [Architecture Pattern](#architecture-pattern)
2. [API Configuration](#api-configuration)
3. [Customer CRUD Implementation](#customer-crud-implementation)
4. [Best Practices](#best-practices)
5. [Error Handling](#error-handling)
6. [Testing Guidelines](#testing-guidelines)

---

## Architecture Pattern

### Three-Layer Architecture

```
┌─────────────────────────────────────┐
│         UI Layer (Compose)           │
│  ├─ Screens                          │
│  └─ ViewModels                       │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│      Repository Layer                │
│  ├─ CustomerRepository               │
│  ├─ UserRepository                   │
│  └─ ... other repositories           │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│        API Layer (Retrofit)          │
│  ├─ CustomerApiService               │
│  ├─ AuthApiService                   │
│  └─ ApiClient (configuration)        │
└─────────────────────────────────────┘
```

### Key Principles

1. **Single Source of Truth**: Repository is the single source of data
2. **Unidirectional Data Flow**: UI → ViewModel → Repository → API
3. **Kotlin Result Type**: Consistent error handling across layers
4. **Coroutines**: All API calls are suspending functions
5. **Singleton Pattern**: Repositories use thread-safe singletons

---

## API Configuration

### Web Frontend Pattern (Reference)

**File:** `web-frontend/src/lib/apiClient.ts`

```typescript
// Axios instance with interceptors
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' }
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

// Response interceptor - Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
    }
    return Promise.reject(error);
  }
);
```

### Android Pattern

**File:** `app-frontend/app/src/main/java/too/good/crm/data/api/ApiClient.kt`

```kotlin
object ApiClient {
    private const val BASE_URL = "http://10.0.2.2:8000/api/"
    
    private val okHttpClient = OkHttpClient.Builder()
        .addInterceptor { chain ->
            val token = TokenManager.getToken()
            val request = chain.request().newBuilder()
                .addHeader("Authorization", "Token $token")
                .addHeader("Content-Type", "application/json")
                .build()
            chain.proceed(request)
        }
        .addInterceptor(HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY
        })
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .build()
    
    private val retrofit = Retrofit.Builder()
        .baseUrl(BASE_URL)
        .client(okHttpClient)
        .addConverterFactory(GsonConverterFactory.create())
        .build()
    
    val customerApiService: CustomerApiService = 
        retrofit.create(CustomerApiService::class.java)
}
```

---

## Customer CRUD Implementation

### Backend API Endpoints

**Source:** `shared-backend/crmApp/viewsets/customer.py`

```python
class CustomerViewSet(viewsets.ModelViewSet):
    """
    Django REST Framework ModelViewSet provides:
    - GET    /api/customers/          - List (paginated)
    - POST   /api/customers/          - Create
    - GET    /api/customers/{id}/     - Retrieve
    - PUT    /api/customers/{id}/     - Full Update
    - PATCH  /api/customers/{id}/     - Partial Update
    - DELETE /api/customers/{id}/     - Delete
    """
```

### Web Frontend Pattern

**File:** `web-frontend/src/services/customer.service.ts`

```typescript
class CustomerService {
  async getCustomers(params?: CustomerFilters): Promise<PaginatedResponse<Customer>> {
    const url = buildUrl(API_CONFIG.ENDPOINTS.CUSTOMERS.LIST, params);
    return api.get<PaginatedResponse<Customer>>(url);
  }

  async createCustomer(data: Partial<Customer>): Promise<Customer> {
    return api.post<Customer>(API_CONFIG.ENDPOINTS.CUSTOMERS.LIST, data);
  }

  async updateCustomer(id: number, data: Partial<Customer>): Promise<Customer> {
    const url = API_CONFIG.ENDPOINTS.CUSTOMERS.DETAIL(id);
    return api.patch<Customer>(url, data);
  }

  async deleteCustomer(id: number): Promise<void> {
    const url = API_CONFIG.ENDPOINTS.CUSTOMERS.DETAIL(id);
    return api.delete(url);
  }
}
```

### Android Implementation

#### 1. API Service Interface

**File:** `CustomerApiService.kt`

```kotlin
interface CustomerApiService {
    @GET("customers/")
    suspend fun getCustomers(
        @Query("status") status: String? = null,
        @Query("search") search: String? = null,
        @Query("page") page: Int? = null
    ): Response<PaginatedResponse<Customer>>

    @POST("customers/")
    suspend fun createCustomer(
        @Body request: CreateCustomerRequest
    ): Response<Customer>

    @GET("customers/{id}/")
    suspend fun getCustomer(
        @Path("id") id: Int
    ): Response<Customer>

    @PUT("customers/{id}/")
    suspend fun updateCustomer(
        @Path("id") id: Int,
        @Body request: CreateCustomerRequest
    ): Response<Customer>

    @PATCH("customers/{id}/")
    suspend fun patchCustomer(
        @Path("id") id: Int,
        @Body request: CreateCustomerRequest
    ): Response<Customer>

    @DELETE("customers/{id}/")
    suspend fun deleteCustomer(
        @Path("id") id: Int
    ): Response<Unit>
}
```

#### 2. Repository Implementation

**File:** `CustomerRepository.kt`

```kotlin
class CustomerRepository {
    private val apiService = ApiClient.customerApiService

    suspend fun getCustomers(
        status: String? = null,
        search: String? = null,
        page: Int? = null
    ): Result<List<Customer>> {
        return try {
            Log.d(TAG, "Fetching customers")
            val response = apiService.getCustomers(status, search, page)
            
            if (response.isSuccessful) {
                val customers = response.body()?.results ?: emptyList()
                Result.success(customers)
            } else {
                Result.failure(Exception(handleHttpError(response.code())))
            }
        } catch (e: Exception) {
            Result.failure(Exception(handleException(e)))
        }
    }

    suspend fun createCustomer(request: CreateCustomerRequest): Result<Customer> {
        return try {
            Log.d(TAG, "Creating customer: ${request.name}")
            val response = apiService.createCustomer(request)
            
            if (response.isSuccessful) {
                val customer = response.body()!!
                Result.success(customer)
            } else {
                Result.failure(Exception(handleHttpError(response.code())))
            }
        } catch (e: Exception) {
            Result.failure(Exception(handleException(e)))
        }
    }

    suspend fun updateCustomer(id: Int, request: CreateCustomerRequest): Result<Customer> {
        return try {
            val response = apiService.patchCustomer(id, request)
            
            if (response.isSuccessful) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(handleHttpError(response.code())))
            }
        } catch (e: Exception) {
            Result.failure(Exception(handleException(e)))
        }
    }

    suspend fun deleteCustomer(id: Int): Result<Unit> {
        return try {
            val response = apiService.deleteCustomer(id)
            
            if (response.isSuccessful) {
                Result.success(Unit)
            } else {
                Result.failure(Exception(handleHttpError(response.code())))
            }
        } catch (e: Exception) {
            Result.failure(Exception(handleException(e)))
        }
    }

    companion object {
        private const val TAG = "CustomerRepository"
        
        @Volatile
        private var instance: CustomerRepository? = null

        fun getInstance(): CustomerRepository {
            return instance ?: synchronized(this) {
                instance ?: CustomerRepository().also { instance = it }
            }
        }
    }
}
```

#### 3. ViewModel Usage

**File:** `CustomersViewModel.kt`

```kotlin
class CustomersViewModel : ViewModel() {
    private val repository = CustomerRepository.getInstance()
    
    private val _customers = MutableStateFlow<List<Customer>>(emptyList())
    val customers: StateFlow<List<Customer>> = _customers.asStateFlow()
    
    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()
    
    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()

    fun loadCustomers(status: String? = null, search: String? = null) {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null
            
            repository.getCustomers(status, search).fold(
                onSuccess = { customers ->
                    _customers.value = customers
                },
                onFailure = { exception ->
                    _error.value = exception.message
                }
            )
            
            _isLoading.value = false
        }
    }

    fun createCustomer(request: CreateCustomerRequest) {
        viewModelScope.launch {
            _isLoading.value = true
            
            repository.createCustomer(request).fold(
                onSuccess = { newCustomer ->
                    _customers.value = _customers.value + newCustomer
                    // Show success message
                },
                onFailure = { exception ->
                    _error.value = exception.message
                }
            )
            
            _isLoading.value = false
        }
    }

    fun deleteCustomer(id: Int) {
        viewModelScope.launch {
            repository.deleteCustomer(id).fold(
                onSuccess = {
                    _customers.value = _customers.value.filter { it.id != id }
                },
                onFailure = { exception ->
                    _error.value = exception.message
                }
            )
        }
    }
}
```

---

## Best Practices

### 1. Kotlin Coroutines

✅ **DO:**
```kotlin
suspend fun getData(): Result<Data> {
    // Suspending function for async operations
}

viewModelScope.launch {
    val result = repository.getData()
}
```

❌ **DON'T:**
```kotlin
fun getData(): LiveData<Data> {
    // Blocking main thread
}
```

### 2. Error Handling

✅ **DO:**
```kotlin
suspend fun getData(): Result<Data> {
    return try {
        val response = apiService.getData()
        if (response.isSuccessful) {
            Result.success(response.body()!!)
        } else {
            Result.failure(Exception(handleError(response.code())))
        }
    } catch (e: Exception) {
        Result.failure(e)
    }
}
```

❌ **DON'T:**
```kotlin
suspend fun getData(): Data? {
    return try {
        apiService.getData().body()
    } catch (e: Exception) {
        null // Losing error information
    }
}
```

### 3. Nullability

✅ **DO:**
```kotlin
val customer = response.body()
if (customer != null) {
    Result.success(customer)
} else {
    Result.failure(Exception("Empty response"))
}
```

❌ **DON'T:**
```kotlin
val customer = response.body()!!  // Can crash!
```

### 4. Logging

✅ **DO:**
```kotlin
Log.d(TAG, "Fetching customer ID: $id")
// ... API call
Log.d(TAG, "Successfully fetched customer: ${customer.name}")
```

### 5. Singleton Pattern

✅ **DO:**
```kotlin
companion object {
    @Volatile
    private var instance: Repository? = null

    fun getInstance(): Repository {
        return instance ?: synchronized(this) {
            instance ?: Repository().also { instance = it }
        }
    }
}
```

---

## Error Handling

### HTTP Status Codes

| Code | Meaning | User Message |
|------|---------|--------------|
| 200 | OK | Success |
| 201 | Created | Created successfully |
| 204 | No Content | Deleted successfully |
| 400 | Bad Request | Invalid data. Please check all fields |
| 401 | Unauthorized | Please login again |
| 403 | Forbidden | Access denied |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Already exists |
| 500 | Server Error | Server error. Try again later |

### Exception Types

```kotlin
private fun handleException(e: Exception, action: String): String {
    return when (e) {
        is SocketTimeoutException -> 
            "Connection timeout. Check your network."
        is ConnectException -> 
            "Cannot connect to server."
        is UnknownHostException -> 
            "Cannot reach server. Check internet."
        is JsonSyntaxException -> 
            "Data format error."
        else -> e.message ?: "Failed to $action"
    }
}
```

---

## Testing Guidelines

### Unit Testing Repository

```kotlin
@Test
fun `getCustomers returns success with data`() = runTest {
    // Given
    val mockResponse = PaginatedResponse(
        count = 1,
        results = listOf(mockCustomer)
    )
    coEvery { apiService.getCustomers() } returns Response.success(mockResponse)
    
    // When
    val result = repository.getCustomers()
    
    // Then
    assertTrue(result.isSuccess)
    assertEquals(1, result.getOrNull()?.size)
}

@Test
fun `createCustomer handles 401 error`() = runTest {
    // Given
    coEvery { apiService.createCustomer(any()) } returns 
        Response.error(401, "".toResponseBody())
    
    // When
    val result = repository.createCustomer(mockRequest)
    
    // Then
    assertTrue(result.isFailure)
    assertTrue(result.exceptionOrNull()?.message?.contains("Unauthorized") == true)
}
```

---

## Migration Checklist

When implementing a new API endpoint:

- [ ] Check backend endpoint in `shared-backend/crmApp/viewsets/`
- [ ] Check web implementation in `web-frontend/src/services/`
- [ ] Create/update model in `data/model/`
- [ ] Add endpoint to API service interface
- [ ] Implement repository method with error handling
- [ ] Add comprehensive logging
- [ ] Update ViewModel if needed
- [ ] Write unit tests
- [ ] Test with actual backend
- [ ] Document any differences from web implementation

---

## Related Files

### Web Frontend
- `web-frontend/src/lib/apiClient.ts` - Axios configuration
- `web-frontend/src/config/api.config.ts` - API endpoints
- `web-frontend/src/services/customer.service.ts` - Customer service

### Backend
- `shared-backend/crmApp/viewsets/customer.py` - Customer ViewSet
- `shared-backend/crmApp/serializers/customer.py` - Serializers
- `shared-backend/crmApp/models/customer.py` - Customer model

### Android
- `app-frontend/app/src/main/java/too/good/crm/data/api/` - API services
- `app-frontend/app/src/main/java/too/good/crm/data/repository/` - Repositories
- `app-frontend/app/src/main/java/too/good/crm/data/model/` - Data models

---

## Support

For questions or issues, refer to:
- Backend API documentation
- Web frontend implementation
- Android architecture documentation
- Kotlin best practices guide

**Last Review:** 2024-11-23

