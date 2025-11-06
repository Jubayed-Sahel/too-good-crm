package too.good.crm.features.client.payment

data class Payment(
    val id: String,
    val paymentNumber: String,
    val vendorName: String,
    val amount: Double,
    val status: PaymentStatus,
    val paymentDate: String,
    val dueDate: String?,
    val method: String
)

enum class PaymentStatus {
    PAID,
    PENDING,
    OVERDUE,
    FAILED
}

object PaymentSampleData {
    fun getPayments() = listOf(
        Payment(
            id = "1",
            paymentNumber = "PAY-2024-001",
            vendorName = "Tech Solutions Inc",
            amount = 5499.99,
            status = PaymentStatus.PAID,
            paymentDate = "2024-10-20",
            dueDate = "2024-10-20",
            method = "Credit Card"
        ),
        Payment(
            id = "2",
            paymentNumber = "PAY-2024-002",
            vendorName = "Office Supplies Co",
            amount = 1250.00,
            status = PaymentStatus.PENDING,
            paymentDate = "",
            dueDate = "2024-11-15",
            method = "Bank Transfer"
        ),
        Payment(
            id = "3",
            paymentNumber = "PAY-2024-003",
            vendorName = "Cloud Hosting Pro",
            amount = 2999.00,
            status = PaymentStatus.PAID,
            paymentDate = "2024-11-01",
            dueDate = "2024-11-01",
            method = "Credit Card"
        ),
        Payment(
            id = "4",
            paymentNumber = "PAY-2024-004",
            vendorName = "Marketing Agency Plus",
            amount = 8750.00,
            status = PaymentStatus.OVERDUE,
            paymentDate = "",
            dueDate = "2024-10-30",
            method = "Invoice"
        ),
        Payment(
            id = "5",
            paymentNumber = "PAY-2024-005",
            vendorName = "Office Supplies Co",
            amount = 450.00,
            status = PaymentStatus.PAID,
            paymentDate = "2024-10-28",
            dueDate = "2024-10-28",
            method = "Debit Card"
        )
    )
}

