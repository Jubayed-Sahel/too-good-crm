package too.good.crm.data.repository

import too.good.crm.data.NetworkResult
import too.good.crm.data.api.ApiClient
import too.good.crm.data.safeApiCall
import too.good.crm.data.model.*

/**
 * Order Repository
 * Handles order data operations with NetworkResult error handling
 * Backend: /api/orders/
 */
class OrderRepository {
    private val apiService = ApiClient.orderApiService
    
    /**
     * Get all orders with optional filters
     */
    suspend fun getOrders(
        page: Int? = null,
        pageSize: Int? = 20,
        vendorId: Int? = null,
        customerId: Int? = null,
        orderType: String? = null,
        status: String? = null,
        assignedToId: Int? = null,
        search: String? = null,
        ordering: String? = null
    ): NetworkResult<OrderListResponse> = safeApiCall {
        apiService.getOrders(
            page = page,
            pageSize = pageSize,
            vendorId = vendorId,
            customerId = customerId,
            orderType = orderType,
            status = status,
            assignedToId = assignedToId,
            search = search,
            ordering = ordering
        )
    }
    
    /**
     * Get single order by ID
     */
    suspend fun getOrder(id: Int): NetworkResult<Order> = safeApiCall {
        apiService.getOrder(id)
    }
    
    /**
     * Create new order
     */
    suspend fun createOrder(order: CreateOrderRequest): NetworkResult<Order> = safeApiCall {
        apiService.createOrder(order)
    }
    
    /**
     * Update existing order (full update)
     */
    suspend fun updateOrder(
        id: Int,
        order: UpdateOrderRequest
    ): NetworkResult<Order> = safeApiCall {
        apiService.updateOrder(id, order)
    }
    
    /**
     * Partially update order (PATCH)
     */
    suspend fun patchOrder(
        id: Int,
        updates: Map<String, Any>
    ): NetworkResult<Order> = safeApiCall {
        apiService.patchOrder(id, updates)
    }
    
    /**
     * Delete order
     */
    suspend fun deleteOrder(id: Int): NetworkResult<Unit> = safeApiCall {
        apiService.deleteOrder(id)
    }
    
    /**
     * Get order statistics
     */
    suspend fun getOrderStats(): NetworkResult<OrderStats> = safeApiCall {
        apiService.getOrderStats()
    }
    
    /**
     * Complete an order
     */
    suspend fun completeOrder(id: Int): NetworkResult<Order> = safeApiCall {
        apiService.completeOrder(id)
    }
    
    /**
     * Cancel an order
     */
    suspend fun cancelOrder(id: Int): NetworkResult<Order> = safeApiCall {
        apiService.cancelOrder(id)
    }
    
    /**
     * Get order items
     */
    suspend fun getOrderItems(id: Int): NetworkResult<List<OrderItem>> = safeApiCall {
        apiService.getOrderItems(id)
    }
    
    // Helper methods
    
    /**
     * Get orders by vendor
     */
    suspend fun getOrdersByVendor(
        vendorId: Int,
        page: Int? = null,
        pageSize: Int? = 20
    ): NetworkResult<OrderListResponse> = getOrders(
        vendorId = vendorId,
        page = page,
        pageSize = pageSize
    )
    
    /**
     * Get orders by customer
     */
    suspend fun getOrdersByCustomer(
        customerId: Int,
        page: Int? = null,
        pageSize: Int? = 20
    ): NetworkResult<OrderListResponse> = getOrders(
        customerId = customerId,
        page = page,
        pageSize = pageSize
    )
    
    /**
     * Get orders by status
     */
    suspend fun getOrdersByStatus(
        status: String,
        page: Int? = null,
        pageSize: Int? = 20
    ): NetworkResult<OrderListResponse> = getOrders(
        status = status,
        page = page,
        pageSize = pageSize
    )
    
    /**
     * Get pending orders
     */
    suspend fun getPendingOrders(
        page: Int? = null,
        pageSize: Int? = 20
    ): NetworkResult<OrderListResponse> = getOrdersByStatus(
        status = "pending",
        page = page,
        pageSize = pageSize
    )
    
    /**
     * Get completed orders
     */
    suspend fun getCompletedOrders(
        page: Int? = null,
        pageSize: Int? = 20
    ): NetworkResult<OrderListResponse> = getOrdersByStatus(
        status = "completed",
        page = page,
        pageSize = pageSize
    )
    
    /**
     * Search orders
     */
    suspend fun searchOrders(
        query: String,
        page: Int? = null,
        pageSize: Int? = 20
    ): NetworkResult<OrderListResponse> = getOrders(
        search = query,
        page = page,
        pageSize = pageSize
    )
}
