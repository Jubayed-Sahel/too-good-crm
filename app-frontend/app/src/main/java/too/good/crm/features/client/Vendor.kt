package too.good.crm.features.client

data class Vendor(
    val id: String,
    val name: String,
    val category: String,
    val rating: Double,
    val totalOrders: Int,
    val status: VendorStatus,
    val email: String,
    val phone: String,
    val userId: Int? = null  // User ID for video calling
)

enum class VendorStatus {
    ACTIVE,
    INACTIVE
}

object VendorSampleData {
    fun getVendors() = listOf(
        Vendor(
            id = "1",
            name = "Tech Solutions Inc",
            category = "IT Services",
            rating = 4.8,
            totalOrders = 45,
            status = VendorStatus.ACTIVE,
            email = "contact@techsolutions.com",
            phone = "+1 555-0101",
            userId = 5  // Sample user ID for testing
        ),
        Vendor(
            id = "2",
            name = "Office Supplies Co",
            category = "Supplies",
            rating = 4.5,
            totalOrders = 120,
            status = VendorStatus.ACTIVE,
            email = "sales@officesupplies.com",
            phone = "+1 555-0102",
            userId = 6  // Sample user ID for testing
        ),
        Vendor(
            id = "3",
            name = "Cloud Hosting Pro",
            category = "Cloud Services",
            rating = 4.9,
            totalOrders = 28,
            status = VendorStatus.ACTIVE,
            email = "support@cloudhosting.com",
            phone = "+1 555-0103",
            userId = 7  // Sample user ID for testing
        ),
        Vendor(
            id = "4",
            name = "Marketing Agency Plus",
            category = "Marketing",
            rating = 4.3,
            totalOrders = 15,
            status = VendorStatus.ACTIVE,
            email = "info@marketingplus.com",
            phone = "+1 555-0104"
        ),
        Vendor(
            id = "5",
            name = "Security Systems Ltd",
            category = "Security",
            rating = 4.7,
            totalOrders = 8,
            status = VendorStatus.INACTIVE,
            email = "contact@securitysys.com",
            phone = "+1 555-0105"
        )
    )
}

