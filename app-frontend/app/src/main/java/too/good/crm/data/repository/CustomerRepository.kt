package too.good.crm.data.repository

import too.good.crm.data.api.ApiClient
import too.good.crm.data.model.CreateCustomerRequest
import too.good.crm.data.model.Customer
import too.good.crm.data.model.PaginatedResponse

/**
 * Repository for customer data operations
 * Backend uses DRF ModelViewSet which returns direct responses (not wrapped)
 */
class CustomerRepository {
    private val apiService = ApiClient.customerApiService

    suspend fun getCustomers(): Result<List<Customer>> {
        return try {
            val response = apiService.getCustomers()
            if (response.isSuccessful) {
                val paginatedResponse = response.body()
                val customers = paginatedResponse?.results ?: emptyList()
                Result.success(customers)
            } else {
                val errorMessage = when (response.code()) {
                    401 -> "Unauthorized. Please login again."
                    403 -> "Access denied. You don't have permission to view customers."
                    404 -> "Customers endpoint not found"
                    500 -> "Server error. Please try again later"
                    else -> "Failed to fetch customers: ${response.message()}"
                }
                Result.failure(Exception(errorMessage))
            }
        } catch (e: com.google.gson.JsonSyntaxException) {
            Result.failure(Exception("JSON parsing error: ${e.message}. Please check backend response format."))
        } catch (e: java.net.SocketTimeoutException) {
            Result.failure(Exception("Connection timeout. Please check your network."))
        } catch (e: java.net.ConnectException) {
            Result.failure(Exception("Cannot connect to server. Please ensure backend is running."))
        } catch (e: Exception) {
            Result.failure(Exception(e.message ?: "Failed to fetch customers"))
        }
    }

    suspend fun createCustomer(request: CreateCustomerRequest): Result<Customer> {
        return try {
            val response = apiService.createCustomer(request)
            if (response.isSuccessful) {
                val customer = response.body()
                if (customer != null) {
                    Result.success(customer)
                } else {
                    Result.failure(Exception("No customer data returned"))
                }
            } else {
                val errorMessage = when (response.code()) {
                    400 -> "Invalid customer data. Please check all fields."
                    401 -> "Unauthorized. Please login again."
                    403 -> "Access denied. You don't have permission to create customers."
                    else -> "Failed to create customer: ${response.message()}"
                }
                Result.failure(Exception(errorMessage))
            }
        } catch (e: java.net.SocketTimeoutException) {
            Result.failure(Exception("Connection timeout. Please check your network."))
        } catch (e: java.net.ConnectException) {
            Result.failure(Exception("Cannot connect to server. Please ensure backend is running."))
        } catch (e: Exception) {
            Result.failure(Exception(e.message ?: "Failed to create customer"))
        }
    }

    suspend fun updateCustomer(id: Int, request: CreateCustomerRequest): Result<Customer> {
        return try {
            val response = apiService.updateCustomer(id, request)
            if (response.isSuccessful) {
                val customer = response.body()
                if (customer != null) {
                    Result.success(customer)
                } else {
                    Result.failure(Exception("No customer data returned"))
                }
            } else {
                val errorMessage = when (response.code()) {
                    400 -> "Invalid customer data. Please check all fields."
                    401 -> "Unauthorized. Please login again."
                    403 -> "Access denied. You don't have permission to update customers."
                    404 -> "Customer not found"
                    else -> "Failed to update customer: ${response.message()}"
                }
                Result.failure(Exception(errorMessage))
            }
        } catch (e: java.net.SocketTimeoutException) {
            Result.failure(Exception("Connection timeout. Please check your network."))
        } catch (e: java.net.ConnectException) {
            Result.failure(Exception("Cannot connect to server. Please ensure backend is running."))
        } catch (e: Exception) {
            Result.failure(Exception(e.message ?: "Failed to update customer"))
        }
    }

    suspend fun deleteCustomer(id: Int): Result<Unit> {
        return try {
            val response = apiService.deleteCustomer(id)
            if (response.isSuccessful) {
                Result.success(Unit)
            } else {
                val errorMessage = when (response.code()) {
                    401 -> "Unauthorized. Please login again."
                    403 -> "Access denied. You don't have permission to delete customers."
                    404 -> "Customer not found"
                    else -> "Failed to delete customer: ${response.message()}"
                }
                Result.failure(Exception(errorMessage))
            }
        } catch (e: java.net.SocketTimeoutException) {
            Result.failure(Exception("Connection timeout. Please check your network."))
        } catch (e: java.net.ConnectException) {
            Result.failure(Exception("Cannot connect to server. Please ensure backend is running."))
        } catch (e: Exception) {
            Result.failure(Exception(e.message ?: "Failed to delete customer"))
        }
    }

    companion object {
        @Volatile
        private var instance: CustomerRepository? = null

        fun getInstance(): CustomerRepository {
            return instance ?: synchronized(this) {
                instance ?: CustomerRepository().also { instance = it }
            }
        }
    }
}
