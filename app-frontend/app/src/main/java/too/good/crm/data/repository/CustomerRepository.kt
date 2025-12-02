package too.good.crm.data.repository

import android.content.Context
import android.util.Log
import too.good.crm.data.api.ApiClient
import too.good.crm.data.model.CreateCustomerRequest
import too.good.crm.data.model.Customer
import too.good.crm.data.model.PaginatedResponse

/**
 * Repository for Customer data operations
 * Implements Repository Pattern following Android/Kotlin best practices
 * 
 * Architecture Pattern:
 * - Single source of truth for customer data
 * - Handles API calls and error transformation
 * - Uses Kotlin Result type for consistent error handling
 * - Implements singleton pattern for efficiency
 * - Comprehensive logging for debugging
 * 
 * Backend API Pattern (Django REST Framework ModelViewSet):
 * - GET    /api/customers/          - List customers (paginated)
 * - POST   /api/customers/          - Create customer
 * - GET    /api/customers/{id}/     - Get customer detail
 * - PUT    /api/customers/{id}/     - Full update (all fields required)
 * - PATCH  /api/customers/{id}/     - Partial update (only changed fields)
 * - DELETE /api/customers/{id}/     - Delete customer
 * 
 * Web Frontend Reference: web-frontend/src/services/customer.service.ts
 * Backend Reference: shared-backend/crmApp/viewsets/customer.py
 * 
 * @author Android Development Team
 */
class CustomerRepository(private val context: Context? = null) {
    private val apiService = ApiClient.customerApiService

    companion object {
        private const val TAG = "CustomerRepository"
        
        @Volatile
        private var instance: CustomerRepository? = null

        /**
         * Get singleton instance of CustomerRepository
         */
        fun getInstance(context: Context? = null): CustomerRepository {
            return instance ?: synchronized(this) {
                instance ?: CustomerRepository(context).also { instance = it }
            }
        }
    }

    /**
     * Get paginated list of customers with optional filters
     * Returns list of customers without pagination metadata
     * 
     * @param status Filter by customer status (active, inactive, prospect, vip)
     * @param customerType Filter by customer type (individual, business)
     * @param assignedTo Filter by assigned employee ID
     * @param organization Filter by organization ID
     * @param search Search query (searches name, email, phone)
     * @param page Page number (1-based)
     * @param pageSize Number of items per page
     * @param ordering Sort field (e.g., "name", "-created_at" for descending)
     * @return Result<List<Customer>> - Success with customer list or failure with exception
     */
    suspend fun getCustomers(
        status: String? = null,
        customerType: String? = null,
        assignedTo: Int? = null,
        organization: Int? = null,
        search: String? = null,
        page: Int? = null,
        pageSize: Int? = null,
        ordering: String? = null
    ): Result<List<Customer>> {
        return try {
            Log.d(TAG, "Fetching customers list with filters: status=$status, search=$search, page=$page")
            val response = apiService.getCustomers(
                status = status,
                customerType = customerType,
                assignedTo = assignedTo,
                organization = organization,
                search = search,
                page = page,
                pageSize = pageSize,
                ordering = ordering
            )
            
            if (response.isSuccessful) {
                val paginatedResponse = response.body()
                val customers = paginatedResponse?.results ?: emptyList()
                Log.d(TAG, "Successfully fetched ${customers.size} customers")
                Result.success(customers)
            } else {
                val errorMessage = handleHttpError(response.code(), "fetch customers")
                Log.e(TAG, errorMessage)
                Result.failure(Exception(errorMessage))
            }
        } catch (e: Exception) {
            val errorMessage = handleException(e, "fetch customers")
            Log.e(TAG, errorMessage, e)
            Result.failure(Exception(errorMessage))
        }
    }
    
    /**
     * Get paginated response with metadata and filters
     * Returns full pagination information including count, next, previous
     * 
     * @param status Filter by customer status
     * @param customerType Filter by customer type
     * @param assignedTo Filter by assigned employee ID
     * @param organization Filter by organization ID
     * @param search Search query
     * @param page Page number
     * @param pageSize Number of items per page
     * @param ordering Sort field
     * @return Result<PaginatedResponse<Customer>> - Success with paginated data or failure
     */
    suspend fun getCustomersPaginated(
        status: String? = null,
        customerType: String? = null,
        assignedTo: Int? = null,
        organization: Int? = null,
        search: String? = null,
        page: Int? = null,
        pageSize: Int? = null,
        ordering: String? = null
    ): Result<PaginatedResponse<Customer>> {
        return try {
            Log.d(TAG, "Fetching customers with pagination metadata and filters")
            val response = apiService.getCustomers(
                status = status,
                customerType = customerType,
                assignedTo = assignedTo,
                organization = organization,
                search = search,
                page = page,
                pageSize = pageSize,
                ordering = ordering
            )
            
            if (response.isSuccessful) {
                val paginatedResponse = response.body()
                if (paginatedResponse != null) {
                    Log.d(TAG, "Successfully fetched paginated response: ${paginatedResponse.count} total customers")
                    Result.success(paginatedResponse)
                } else {
                    Result.failure(Exception("Empty response body"))
                }
            } else {
                val errorMessage = handleHttpError(response.code(), "fetch customers")
                Log.e(TAG, errorMessage)
                Result.failure(Exception(errorMessage))
            }
        } catch (e: Exception) {
            val errorMessage = handleException(e, "fetch customers")
            Log.e(TAG, errorMessage, e)
            Result.failure(Exception(errorMessage))
        }
    }
    
    /**
     * Get customer statistics
     * 
     * @return Result<Map<String, Any>> - Success with stats or failure
     */
    suspend fun getCustomerStats(): Result<Map<String, Any>> {
        return try {
            Log.d(TAG, "Fetching customer statistics")
            val response = apiService.getCustomerStats()
            
            if (response.isSuccessful) {
                val stats = response.body()
                if (stats != null) {
                    Log.d(TAG, "Successfully fetched customer stats")
                    Result.success(stats)
                } else {
                    Result.failure(Exception("Empty response body"))
                }
            } else {
                val errorMessage = handleHttpError(response.code(), "fetch customer stats")
                Log.e(TAG, errorMessage)
                Result.failure(Exception(errorMessage))
            }
        } catch (e: Exception) {
            val errorMessage = handleException(e, "fetch customer stats")
            Log.e(TAG, errorMessage, e)
            Result.failure(Exception(errorMessage))
        }
    }
    
    /**
     * Get single customer by ID
     * 
     * @param id Customer ID
     * @return Result<Customer> - Success with customer data or failure
     */
    suspend fun getCustomer(id: Int): Result<Customer> {
        return try {
            Log.d(TAG, "Fetching customer with ID: $id")
            val response = apiService.getCustomer(id)
            
            if (response.isSuccessful) {
                val customer = response.body()
                if (customer != null) {
                    Log.d(TAG, "Successfully fetched customer: ${customer.name}")
                    Result.success(customer)
                } else {
                    Result.failure(Exception("Empty response body"))
                }
            } else {
                val errorMessage = handleHttpError(response.code(), "fetch customer")
                Log.e(TAG, errorMessage)
                Result.failure(Exception(errorMessage))
            }
        } catch (e: Exception) {
            val errorMessage = handleException(e, "fetch customer")
            Log.e(TAG, errorMessage, e)
            Result.failure(Exception(errorMessage))
        }
    }

    /**
     * Create new customer
     * 
     * @param request CreateCustomerRequest with customer data
     * @return Result<Customer> - Success with created customer or failure
     */
    suspend fun createCustomer(request: CreateCustomerRequest): Result<Customer> {
        return try {
            Log.d(TAG, "Creating customer: ${request.name}")
            val response = apiService.createCustomer(request)
            
            if (response.isSuccessful) {
                val customer = response.body()
                if (customer != null) {
                    Log.d(TAG, "Successfully created customer with ID: ${customer.id}")
                    Result.success(customer)
                } else {
                    Result.failure(Exception("No customer data returned"))
                }
            } else {
                val errorMessage = handleHttpError(response.code(), "create customer")
                Log.e(TAG, errorMessage)
                Result.failure(Exception(errorMessage))
            }
        } catch (e: Exception) {
            val errorMessage = handleException(e, "create customer")
            Log.e(TAG, errorMessage, e)
            Result.failure(Exception(errorMessage))
        }
    }

    /**
     * Update customer with PUT method (full update - all fields required)
     * Use this when you have complete customer data
     * 
     * @param id Customer ID to update
     * @param request CreateCustomerRequest with all customer fields
     * @return Result<Customer> - Success with updated customer or failure
     */
    suspend fun updateCustomer(id: Int, request: CreateCustomerRequest): Result<Customer> {
        return try {
            Log.d(TAG, "Updating customer ID: $id (PUT - full update)")
            val response = apiService.updateCustomer(id, request)
            
            if (response.isSuccessful) {
                val customer = response.body()
                if (customer != null) {
                    Log.d(TAG, "Successfully updated customer: ${customer.name}")
                    Result.success(customer)
                } else {
                    Result.failure(Exception("No customer data returned"))
                }
            } else {
                val errorMessage = handleHttpError(response.code(), "update customer")
                Log.e(TAG, errorMessage)
                Result.failure(Exception(errorMessage))
            }
        } catch (e: Exception) {
            val errorMessage = handleException(e, "update customer")
            Log.e(TAG, errorMessage, e)
            Result.failure(Exception(errorMessage))
        }
    }
    
    /**
     * Patch customer with PATCH method (partial update - only changed fields)
     * Use this when you want to update specific fields without sending all data
     * 
     * @param id Customer ID to update
     * @param request CreateCustomerRequest with only fields to update
     * @return Result<Customer> - Success with updated customer or failure
     */
    suspend fun patchCustomer(id: Int, request: CreateCustomerRequest): Result<Customer> {
        return try {
            Log.d(TAG, "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
            Log.d(TAG, "🔄 PATCH CUSTOMER REQUEST DEBUG")
            Log.d(TAG, "Customer ID: $id")
            Log.d(TAG, "Request Data:")
            Log.d(TAG, "  - Name: ${request.name}")
            Log.d(TAG, "  - Email: ${request.email}")
            Log.d(TAG, "  - Phone: ${request.phone}")
            Log.d(TAG, "  - First Name: ${request.firstName}")
            Log.d(TAG, "  - Last Name: ${request.lastName}")
            Log.d(TAG, "  - Company: ${request.companyName}")
            Log.d(TAG, "  - Status: ${request.status}")
            Log.d(TAG, "  - Customer Type: ${request.customerType}")
            
            // Log authentication info for debugging
            try {
                val authToken = ApiClient.getAuthToken()
                Log.d(TAG, "Auth Context:")
                Log.d(TAG, "  - Has Auth Token: ${authToken != null}")
                Log.d(TAG, "  - Auth Token Length: ${authToken?.length ?: 0}")
                Log.d(TAG, "  - Auth Token Prefix: ${authToken?.take(10) ?: "N/A"}...")
            } catch (e: Exception) {
                Log.w(TAG, "  - Error logging auth context: ${e.message}")
            }
            
            Log.d(TAG, "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
            
            val response = apiService.patchCustomer(id, request)
            
            if (response.isSuccessful) {
                val customer = response.body()
                if (customer != null) {
                    Log.d(TAG, "Successfully patched customer: ${customer.name}")
                    Result.success(customer)
                } else {
                    Result.failure(Exception("No customer data returned"))
                }
            } else {
                // Try to extract detailed error message from response body
                val errorBody = response.errorBody()?.string()
                val detailedError = if (errorBody != null && errorBody.isNotBlank()) {
                    Log.e(TAG, "API Error Response (${response.code()}): $errorBody")
                    // Try to extract common error message formats
                    try {
                        // Check for common JSON error formats
                        when {
                            errorBody.contains("\"detail\"") -> {
                                // Extract detail field from JSON
                                val detailMatch = Regex("\"detail\"\\s*:\\s*\"([^\"]+)\"").find(errorBody)
                                detailMatch?.groupValues?.get(1) ?: errorBody.take(200)
                            }
                            errorBody.contains("\"error\"") -> {
                                val errorMatch = Regex("\"error\"\\s*:\\s*\"([^\"]+)\"").find(errorBody)
                                errorMatch?.groupValues?.get(1) ?: errorBody.take(200)
                            }
                            errorBody.contains("\"message\"") -> {
                                val messageMatch = Regex("\"message\"\\s*:\\s*\"([^\"]+)\"").find(errorBody)
                                messageMatch?.groupValues?.get(1) ?: errorBody.take(200)
                            }
                            else -> errorBody.take(200) // Show first 200 chars if can't parse
                        }
                    } catch (e: Exception) {
                        // If parsing fails, use raw error body (limited length)
                        errorBody.take(200)
                    }
                } else {
                    null
                }
                
                // Use detailed error if available, otherwise use generic error handler
                val finalErrorMessage = if (detailedError != null) {
                    // Enhance the detailed error message for customer.update permission issues
                    if (response.code() == 403 && (detailedError.contains("customer.update", ignoreCase = true) || 
                                                    detailedError.contains("customer:update", ignoreCase = true))) {
                        "$detailedError\n\n" +
                        "If you're a vendor, this might be a backend configuration issue.\n" +
                        "Please check:\n" +
                        "• Your vendor profile is active in the correct organization\n" +
                        "• The customer belongs to your organization\n" +
                        "• Your active profile is set correctly"
                    } else {
                        detailedError
                    }
                } else {
                    handleHttpError(response.code(), "patch customer")
                }
                Log.e(TAG, "Patch customer failed (${response.code()}): $finalErrorMessage")
                Result.failure(Exception(finalErrorMessage))
            }
        } catch (e: Exception) {
            val errorMessage = handleException(e, "patch customer")
            Log.e(TAG, errorMessage, e)
            Result.failure(Exception(errorMessage))
        }
    }

    /**
     * Delete customer
     * 
     * @param id Customer ID to delete
     * @return Result<Unit> - Success or failure
     */
    suspend fun deleteCustomer(id: Int): Result<Unit> {
        return try {
            Log.d(TAG, "Deleting customer ID: $id")
            val response = apiService.deleteCustomer(id)
            
            if (response.isSuccessful) {
                Log.d(TAG, "Successfully deleted customer ID: $id")
                Result.success(Unit)
            } else {
                val errorMessage = handleHttpError(response.code(), "delete customer")
                Log.e(TAG, errorMessage)
                Result.failure(Exception(errorMessage))
            }
        } catch (e: Exception) {
            val errorMessage = handleException(e, "delete customer")
            Log.e(TAG, errorMessage, e)
            Result.failure(Exception(errorMessage))
        }
    }

    /**
     * Handle HTTP error codes and return user-friendly messages
     * Follows REST API standard error codes
     * 
     * @param code HTTP status code
     * @param action Action being performed (for context)
     * @return User-friendly error message
     */
    private fun handleHttpError(code: Int, action: String): String {
        return when (code) {
            400 -> "Invalid data. Please check all fields and try again."
            401 -> "Unauthorized. Please login again."
            403 -> {
                "Permission denied. You don't have permission to $action.\n\n" +
                "If you're a vendor, ensure:\n" +
                "• Your vendor profile is active\n" +
                "• You're logged into the correct organization\n" +
                "• Your account has the necessary permissions"
            }
            404 -> "Customer not found."
            409 -> "Conflict. A customer with this information already exists."
            422 -> "Validation error. Please check your input."
            429 -> "Too many requests. Please try again later."
            500 -> "Server error. Please try again later."
            502 -> "Bad gateway. The server is temporarily unavailable."
            503 -> "Service unavailable. Please try again later."
            else -> "Failed to $action. Error code: $code"
        }
    }

    /**
     * Handle exceptions and return user-friendly messages
     * Provides specific messages for common network issues
     * 
     * @param e Exception that occurred
     * @param action Action being performed (for context)
     * @return User-friendly error message
     */
    private fun handleException(e: Exception, action: String): String {
        return when (e) {
            is java.net.SocketTimeoutException -> 
                "Connection timeout. Please check your network and try again."
            is java.net.ConnectException -> 
                "Cannot connect to server. Please ensure you have internet connection."
            is java.net.UnknownHostException -> 
                "Cannot reach server. Please check your internet connection."
            is com.google.gson.JsonSyntaxException -> 
                "Data format error. Please try again or contact support."
            is javax.net.ssl.SSLException -> 
                "Secure connection error. Please check your network settings."
            else -> e.message ?: "Failed to $action. Please try again."
        }
    }
}
