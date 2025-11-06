package too.good.crm.features.client

data class Order(
    val id: String,
    val orderNumber: String,
    val vendorName: String,
    val amount: Double,
    val status: OrderStatus,
    val orderDate: String,
    val deliveryDate: String?,
    val items: Int
)

enum class OrderStatus {
    PENDING,
    PROCESSING,
    SHIPPED,
    DELIVERED,
    CANCELLED
}

object OrderSampleData {
    fun getOrders() = listOf(
        Order(
            id = "1",
            orderNumber = "ORD-2024-001",
            vendorName = "Tech Solutions Inc",
            amount = 5499.99,
            status = OrderStatus.DELIVERED,
            orderDate = "2024-10-15",
            deliveryDate = "2024-10-20",
            items = 5
        ),
        Order(
            id = "2",
            orderNumber = "ORD-2024-002",
            vendorName = "Office Supplies Co",
            amount = 1250.00,
            status = OrderStatus.SHIPPED,
            orderDate = "2024-11-01",
            deliveryDate = "2024-11-08",
            items = 12
        ),
        Order(
            id = "3",
            orderNumber = "ORD-2024-003",
            vendorName = "Cloud Hosting Pro",
            amount = 2999.00,
            status = OrderStatus.PROCESSING,
            orderDate = "2024-11-03",
            deliveryDate = null,
            items = 1
        ),
        Order(
            id = "4",
            orderNumber = "ORD-2024-004",
            vendorName = "Marketing Agency Plus",
            amount = 8750.00,
            status = OrderStatus.PENDING,
            orderDate = "2024-11-05",
            deliveryDate = null,
            items = 3
        ),
        Order(
            id = "5",
            orderNumber = "ORD-2024-005",
            vendorName = "Office Supplies Co",
            amount = 450.00,
            status = OrderStatus.DELIVERED,
            orderDate = "2024-10-25",
            deliveryDate = "2024-10-28",
            items = 8
        ),
        Order(
            id = "6",
            orderNumber = "ORD-2024-006",
            vendorName = "Tech Solutions Inc",
            amount = 3200.00,
            status = OrderStatus.CANCELLED,
            orderDate = "2024-10-18",
            deliveryDate = null,
            items = 4
        )
    )
}

