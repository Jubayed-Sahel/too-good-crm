package too.good.crm.data.api

import retrofit2.Response
import retrofit2.http.*
import too.good.crm.data.model.Order
import too.good.crm.data.model.OrderListResponse

/**
 * API Service for Order operations
 * Backend: crmApp/views/orders.py
 * Base path: /api/orders/
 */
interface OrderApiService {
    
    /**
     * Get all orders
     * GET /api/orders/
     */
    @GET("orders/")
    suspend fun getAllOrders(
        @Query("page") page: Int? = null,
        @Query("page_size") pageSize: Int? = null,
        @Query("organization") organizationId: Int? = null,
        @Query("vendor") vendorId: Int? = null,
        @Query("customer") customerId: Int? = null,
        @Query("status") status: String? = null
    ): Response<OrderListResponse>
    
    /**
     * Get orders by organization (simplified for dropdown)
     * GET /api/orders/?organization={orgId}
     */
    @GET("orders/")
    suspend fun getOrdersByOrganization(
        @Query("organization") organizationId: Int,
        @Query("page_size") pageSize: Int = 100
    ): Response<OrderListResponse>
}
