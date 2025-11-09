package too.good.crm.data.repository

import too.good.crm.data.api.ApiClient
import too.good.crm.data.model.CreateCustomerRequest
import too.good.crm.data.model.Customer

class CustomerRepository {
    private val apiService = ApiClient.customerApiService

    suspend fun getCustomers(): Result<List<Customer>> {
        return try {
            val response = apiService.getCustomers()
            if (response.isSuccessful && response.body()?.success == true) {
                Result.success(response.body()?.data ?: emptyList())
            } else {
                Result.failure(Exception(response.body()?.message ?: "Failed to fetch customers"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun createCustomer(request: CreateCustomerRequest): Result<Customer> {
        return try {
            val response = apiService.createCustomer(request)
            if (response.isSuccessful && response.body()?.success == true) {
                val customerData = response.body()?.data
                if (customerData != null) {
                    Result.success(customerData)
                } else {
                    Result.failure(Exception("No customer data returned"))
                }
            } else {
                Result.failure(Exception(response.body()?.message ?: "Failed to create customer"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun updateCustomer(id: Int, request: CreateCustomerRequest): Result<Customer> {
        return try {
            val response = apiService.updateCustomer(id.toString(), request)
            if (response.isSuccessful && response.body()?.success == true) {
                val customerData = response.body()?.data
                if (customerData != null) {
                    Result.success(customerData)
                } else {
                    Result.failure(Exception("No customer data returned"))
                }
            } else {
                Result.failure(Exception(response.body()?.message ?: "Failed to update customer"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun deleteCustomer(id: Int): Result<Unit> {
        return try {
            val response = apiService.deleteCustomer(id.toString())
            if (response.isSuccessful && response.body()?.success == true) {
                Result.success(Unit)
            } else {
                Result.failure(Exception(response.body()?.message ?: "Failed to delete customer"))
            }
        } catch (e: Exception) {
            Result.failure(e)
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
