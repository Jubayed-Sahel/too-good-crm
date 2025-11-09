package too.good.crm.data.api

import retrofit2.Response
import retrofit2.http.*
import too.good.crm.data.model.CreateCustomerRequest
import too.good.crm.data.model.Customer
import too.good.crm.data.model.CustomerResponse
import too.good.crm.data.model.CustomersListResponse

interface CustomerApiService {
    @GET("customers")
    suspend fun getCustomers(): Response<CustomersListResponse>

    @POST("customers")
    suspend fun createCustomer(@Body request: CreateCustomerRequest): Response<CustomerResponse>

    @GET("customers/{id}")
    suspend fun getCustomer(@Path("id") id: String): Response<CustomerResponse>

    @PUT("customers/{id}")
    suspend fun updateCustomer(
        @Path("id") id: String,
        @Body request: CreateCustomerRequest
    ): Response<CustomerResponse>

    @DELETE("customers/{id}")
    suspend fun deleteCustomer(@Path("id") id: String): Response<CustomerResponse>
}
