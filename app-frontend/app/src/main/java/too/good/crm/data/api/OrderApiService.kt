package too.good.crm.data.api

<<<<<<< HEAD
import retrofit2.Response
import retrofit2.http.*
import too.good.crm.data.model.Order
import too.good.crm.data.model.OrderListResponse

/**
 * API Service for Order operations
 * Backend: crmApp/views/orders.py
 * Base path: /api/orders/
=======
import retrofit2.http.*
import too.good.crm.data.model.*

/**
 * Order API Service
 * Endpoints for order management
 * Base: /api/orders/
>>>>>>> 3a17723a05d87f1c48f22fe22781f216f42365c6
 */
interface OrderApiService {
    
    /**
<<<<<<< HEAD
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
=======
     * Get all orders (with pagination)
     * GET /api/orders/
     * Backend filters: vendor, customer, order_type, status, assigned_to
     */
    @GET("orders/")
    suspend fun getOrders(
        @Query("page") page: Int? = null,
        @Query("page_size") pageSize: Int? = null,
        @Query("vendor") vendorId: Int? = null,
        @Query("customer") customerId: Int? = null,
        @Query("order_type") orderType: String? = null,
        @Query("status") status: String? = null,
        @Query("assigned_to") assignedToId: Int? = null,
        @Query("search") search: String? = null,
        @Query("ordering") ordering: String? = null
    ): OrderListResponse
    
    /**
     * Get single order
     * GET /api/orders/{id}/
     */
    @GET("orders/{id}/")
    suspend fun getOrder(@Path("id") id: Int): Order
    
    /**
     * Create new order
     * POST /api/orders/
     */
    @POST("orders/")
    suspend fun createOrder(@Body order: CreateOrderRequest): Order
    
    /**
     * Update order
     * PUT /api/orders/{id}/
     */
    @PUT("orders/{id}/")
    suspend fun updateOrder(
        @Path("id") id: Int,
        @Body order: UpdateOrderRequest
    ): Order
    
    /**
     * Partial update order
     * PATCH /api/orders/{id}/
     */
    @PATCH("orders/{id}/")
    suspend fun patchOrder(
        @Path("id") id: Int,
        @Body updates: Map<String, Any>
    ): Order
    
    /**
     * Delete order
     * DELETE /api/orders/{id}/
     */
    @DELETE("orders/{id}/")
    suspend fun deleteOrder(@Path("id") id: Int)
    
    /**
     * Get order statistics
     * GET /api/orders/stats/
     */
    @GET("orders/stats/")
    suspend fun getOrderStats(): OrderStats
    
    /**
     * Complete an order
     * POST /api/orders/{id}/complete/
     */
    @POST("orders/{id}/complete/")
    suspend fun completeOrder(@Path("id") id: Int): Order
    
    /**
     * Cancel an order
     * POST /api/orders/{id}/cancel/
     */
    @POST("orders/{id}/cancel/")
    suspend fun cancelOrder(@Path("id") id: Int): Order
    
    /**
     * Get order items
     * GET /api/orders/{id}/items/
     */
    @GET("orders/{id}/items/")
    suspend fun getOrderItems(@Path("id") id: Int): List<OrderItem>
>>>>>>> 3a17723a05d87f1c48f22fe22781f216f42365c6
}
