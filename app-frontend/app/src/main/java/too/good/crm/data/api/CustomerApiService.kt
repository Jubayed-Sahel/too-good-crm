package too.good.crm.data.api

import retrofit2.Response
import retrofit2.http.*
import too.good.crm.data.model.CreateCustomerRequest
import too.good.crm.data.model.Customer
import too.good.crm.data.model.PaginatedResponse

/**
 * Customer API Service
 * Defines Retrofit interfaces for Customer endpoints
 * 
 * Backend API: Django REST Framework ModelViewSet
 * Base URL: /api/customers/
 * 
 * Supported Query Parameters:
 * - status: Filter by status (active, inactive, prospect, vip)
 * - customer_type: Filter by type (individual, business)
 * - assigned_to: Filter by assigned employee ID
 * - organization: Filter by organization ID
 * - search: Search in name, email, phone
 * - page: Page number for pagination
 * - page_size: Number of items per page
 * - ordering: Sort field (prefix with - for descending)
 * 
 * Example URLs:
 * - GET /api/customers/?status=active
 * - GET /api/customers/?search=john&page=2
 * - GET /api/customers/?ordering=-created_at
 * 
 * Web Frontend Reference: web-frontend/src/services/customer.service.ts
 * Backend Reference: shared-backend/crmApp/viewsets/customer.py
 */
interface CustomerApiService {
    
    /**
     * Get paginated list of customers
     * Backend returns: PaginatedResponse with StandardResultsSetPagination
     * 
     * @param status Filter by customer status
     * @param customerType Filter by customer type
     * @param assignedTo Filter by assigned employee ID
     * @param organization Filter by organization ID
     * @param search Search query (searches name, email, phone)
     * @param page Page number (1-based)
     * @param pageSize Number of items per page (default: 10)
     * @param ordering Sort field (e.g., "name", "-created_at")
     * @return Response with PaginatedResponse<Customer>
     */
    @GET("customers/")
    suspend fun getCustomers(
        @Query("status") status: String? = null,
        @Query("customer_type") customerType: String? = null,
        @Query("assigned_to") assignedTo: Int? = null,
        @Query("organization") organization: Int? = null,
        @Query("search") search: String? = null,
        @Query("page") page: Int? = null,
        @Query("page_size") pageSize: Int? = null,
        @Query("ordering") ordering: String? = null
    ): Response<PaginatedResponse<Customer>>

    /**
     * Create new customer
     * POST /api/customers/
     * 
     * @param request CreateCustomerRequest with customer data
     * @return Response with created Customer
     */
    @POST("customers/")
    suspend fun createCustomer(
        @Body request: CreateCustomerRequest
    ): Response<Customer>

    /**
     * Get single customer by ID
     * GET /api/customers/{id}/
     * 
     * @param id Customer ID
     * @return Response with Customer
     */
    @GET("customers/{id}/")
    suspend fun getCustomer(
        @Path("id") id: Int
    ): Response<Customer>

    /**
     * Full update customer (PUT - all fields required)
     * PUT /api/customers/{id}/
     * 
     * Use this when you have complete customer data
     * All fields must be provided or they will be set to null/default
     * 
     * @param id Customer ID
     * @param request CreateCustomerRequest with all fields
     * @return Response with updated Customer
     */
    @PUT("customers/{id}/")
    suspend fun updateCustomer(
        @Path("id") id: Int,
        @Body request: CreateCustomerRequest
    ): Response<Customer>

    /**
     * Partial update customer (PATCH - only changed fields)
     * PATCH /api/customers/{id}/
     * 
     * Use this when you want to update specific fields
     * Only include fields you want to change
     * 
     * @param id Customer ID
     * @param request CreateCustomerRequest with only fields to update
     * @return Response with updated Customer
     */
    @PATCH("customers/{id}/")
    suspend fun patchCustomer(
        @Path("id") id: Int,
        @Body request: CreateCustomerRequest
    ): Response<Customer>

    /**
     * Delete customer
     * DELETE /api/customers/{id}/
     * 
     * @param id Customer ID
     * @return Response with Unit (204 No Content on success)
     */
    @DELETE("customers/{id}/")
    suspend fun deleteCustomer(
        @Path("id") id: Int
    ): Response<Unit>
    
    /**
     * Get customer statistics
     * GET /api/customers/stats/
     * 
     * Custom action endpoint for analytics
     * Returns aggregated statistics about customers
     * 
     * @return Response with customer stats
     */
    @GET("customers/stats/")
    suspend fun getCustomerStats(): Response<Map<String, Any>>
}
