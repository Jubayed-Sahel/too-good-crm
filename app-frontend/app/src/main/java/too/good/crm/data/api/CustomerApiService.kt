package too.good.crm.data.api

import retrofit2.Response
import retrofit2.http.*
import too.good.crm.data.model.CreateCustomerRequest
import too.good.crm.data.model.Customer

/**
 * Customer API Service
 * Backend returns direct responses (not wrapped in success/data/message)
 */
interface CustomerApiService {
    @GET("customers/")
    suspend fun getCustomers(): Response<List<Customer>>

    @POST("customers/")
    suspend fun createCustomer(@Body request: CreateCustomerRequest): Response<Customer>

    @GET("customers/{id}/")
    suspend fun getCustomer(@Path("id") id: Int): Response<Customer>

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
    suspend fun deleteCustomer(@Path("id") id: Int): Response<Unit>
}
