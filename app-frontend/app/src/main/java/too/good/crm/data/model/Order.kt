package too.good.crm.data.model

import com.google.gson.annotations.SerializedName

/**
 * Order Model
<<<<<<< HEAD
 * Represents an order in the CRM system
 * Backend: crmApp/models/order.py
 * Endpoint: /api/orders/
 */
data class Order(
    val id: Int,
    
    @SerializedName("order_number")
    val orderNumber: String,
    
    val organization: Int,
    
    @SerializedName("organization_name")
    val organizationName: String?,
    
    val vendor: Int?,
    
    @SerializedName("vendor_name")
    val vendorName: String?,
    
    val customer: Int?,
    
    @SerializedName("customer_name")
    val customerName: String?,
    
    val status: String, // pending, confirmed, shipped, delivered, cancelled
    
    @SerializedName("status_display")
    val statusDisplay: String?,
    
    @SerializedName("order_date")
    val orderDate: String,
    
    @SerializedName("delivery_date")
    val deliveryDate: String?,
    
    @SerializedName("total_amount")
    val totalAmount: Double?,
    
    val notes: String?,
    
    @SerializedName("created_at")
    val createdAt: String,
    
    @SerializedName("updated_at")
    val updatedAt: String
)

/**
 * Paginated Order List Response
 */
data class OrderListResponse(
    val count: Int,
    val next: String?,
    val previous: String?,
    val results: List<Order>
)
=======
 * Represents an order in the system
 * Backend: /api/orders/
 */
data class Order(
    @SerializedName("id") val id: Int,
    @SerializedName("order_number") val orderNumber: String,
    @SerializedName("title") val title: String,
    @SerializedName("description") val description: String? = null,
    @SerializedName("order_type") val orderType: String, // "purchase" or "service"
    @SerializedName("status") val status: String, // "pending", "confirmed", "processing", "completed", "cancelled"
    @SerializedName("order_date") val orderDate: String,
    @SerializedName("delivery_date") val deliveryDate: String? = null,
    @SerializedName("total_amount") val totalAmount: String,
    @SerializedName("notes") val notes: String? = null,
    
    // Foreign keys
    @SerializedName("vendor") val vendorId: Int? = null,
    @SerializedName("vendor_name") val vendorName: String? = null,
    @SerializedName("customer") val customerId: Int? = null,
    @SerializedName("customer_name") val customerName: String? = null,
    @SerializedName("assigned_to") val assignedToId: Int? = null,
    @SerializedName("assigned_to_name") val assignedToName: String? = null,
    @SerializedName("organization") val organizationId: Int,
    
    // Timestamps
    @SerializedName("created_at") val createdAt: String,
    @SerializedName("updated_at") val updatedAt: String,
    
    // Additional fields
    @SerializedName("created_by") val createdById: Int? = null,
    @SerializedName("created_by_name") val createdByName: String? = null,
    
    // Items (optional, might need separate fetch)
    @SerializedName("items") val items: List<OrderItem>? = null
)

/**
 * Order Item Model
 * Represents items within an order
 */
data class OrderItem(
    @SerializedName("id") val id: Int,
    @SerializedName("order") val orderId: Int,
    @SerializedName("name") val name: String,
    @SerializedName("description") val description: String? = null,
    @SerializedName("quantity") val quantity: Int,
    @SerializedName("unit_price") val unitPrice: String,
    @SerializedName("total_price") val totalPrice: String,
    @SerializedName("created_at") val createdAt: String,
    @SerializedName("updated_at") val updatedAt: String
)

/**
 * Order Statistics
 * Backend: /api/orders/stats/
 */
data class OrderStats(
    @SerializedName("total") val total: Int,
    @SerializedName("total_revenue") val totalRevenue: Double,
    @SerializedName("by_status") val byStatus: OrderStatusBreakdown,
    @SerializedName("by_type") val byType: OrderTypeBreakdown
)

data class OrderStatusBreakdown(
    @SerializedName("pending") val pending: Int,
    @SerializedName("confirmed") val confirmed: Int,
    @SerializedName("processing") val processing: Int,
    @SerializedName("completed") val completed: Int,
    @SerializedName("cancelled") val cancelled: Int
)

data class OrderTypeBreakdown(
    @SerializedName("purchase") val purchase: Int,
    @SerializedName("service") val service: Int
)

/**
 * Paginated Order Response
 * Backend returns paginated results
 */
data class OrderListResponse(
    @SerializedName("count") val count: Int,
    @SerializedName("next") val next: String? = null,
    @SerializedName("previous") val previous: String? = null,
    @SerializedName("results") val results: List<Order>
)

/**
 * Create Order Request
 * Used when creating a new order
 */
data class CreateOrderRequest(
    @SerializedName("title") val title: String,
    @SerializedName("description") val description: String? = null,
    @SerializedName("order_type") val orderType: String,
    @SerializedName("order_date") val orderDate: String,
    @SerializedName("delivery_date") val deliveryDate: String? = null,
    @SerializedName("vendor") val vendorId: Int? = null,
    @SerializedName("customer") val customerId: Int? = null,
    @SerializedName("assigned_to") val assignedToId: Int? = null,
    @SerializedName("notes") val notes: String? = null,
    @SerializedName("items") val items: List<CreateOrderItemRequest>? = null
)

/**
 * Create Order Item Request
 */
data class CreateOrderItemRequest(
    @SerializedName("name") val name: String,
    @SerializedName("description") val description: String? = null,
    @SerializedName("quantity") val quantity: Int,
    @SerializedName("unit_price") val unitPrice: String
)

/**
 * Update Order Request
 * Used when updating an existing order
 */
data class UpdateOrderRequest(
    @SerializedName("title") val title: String? = null,
    @SerializedName("description") val description: String? = null,
    @SerializedName("status") val status: String? = null,
    @SerializedName("order_date") val orderDate: String? = null,
    @SerializedName("delivery_date") val deliveryDate: String? = null,
    @SerializedName("notes") val notes: String? = null
)

/**
 * Order Status Enum
 * For type-safe status handling
 */
enum class OrderStatus(val value: String, val displayName: String) {
    PENDING("pending", "Pending"),
    CONFIRMED("confirmed", "Confirmed"),
    PROCESSING("processing", "Processing"),
    COMPLETED("completed", "Completed"),
    CANCELLED("cancelled", "Cancelled");
    
    companion object {
        fun fromValue(value: String): OrderStatus? {
            return values().find { it.value == value }
        }
    }
}

/**
 * Order Type Enum
 */
enum class OrderType(val value: String, val displayName: String) {
    PURCHASE("purchase", "Purchase"),
    SERVICE("service", "Service");
    
    companion object {
        fun fromValue(value: String): OrderType? {
            return values().find { it.value == value }
        }
    }
}
>>>>>>> 3a17723a05d87f1c48f22fe22781f216f42365c6
