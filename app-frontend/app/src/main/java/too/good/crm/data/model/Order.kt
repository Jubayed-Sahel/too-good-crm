package too.good.crm.data.model

import com.google.gson.annotations.SerializedName

/**
 * Order Model
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
