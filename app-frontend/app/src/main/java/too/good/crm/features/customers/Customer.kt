package too.good.crm.features.customers

data class Customer(
    val id: String,
    val name: String,
    val email: String,
    val phone: String,
    val company: String,
    val status: CustomerStatus,
    val value: Double,
    val createdDate: String,
    val lastContact: String,
    val industry: String = "",
    val website: String = "",
    val userId: Int? = null  // User ID for video calling
)

enum class CustomerStatus {
    ACTIVE,
    INACTIVE,
    PENDING
}

object CustomerSampleData {
    fun getCustomers() = listOf(
        Customer(
            id = "1",
            name = "Sarah Johnson",
            email = "sarah.j@techcorp.com",
            phone = "+1 (555) 123-4567",
            company = "TechCorp Solutions",
            status = CustomerStatus.ACTIVE,
            value = 125000.0,
            createdDate = "2024-01-15",
            lastContact = "2024-11-01",
            industry = "Technology",
            website = "techcorp.com",
            userId = 2  // Sample user ID for testing
        ),
        Customer(
            id = "2",
            name = "Michael Chen",
            email = "m.chen@innovate.io",
            phone = "+1 (555) 234-5678",
            company = "Innovate Inc",
            status = CustomerStatus.ACTIVE,
            value = 85000.0,
            createdDate = "2024-02-20",
            lastContact = "2024-10-28",
            industry = "Software",
            website = "innovate.io",
            userId = 3  // Sample user ID for testing
        ),
        Customer(
            id = "3",
            name = "Emily Davis",
            email = "emily@globalcorp.com",
            phone = "+1 (555) 345-6789",
            company = "Global Corp",
            status = CustomerStatus.ACTIVE,
            value = 200000.0,
            createdDate = "2023-11-10",
            lastContact = "2024-11-03",
            industry = "Enterprise",
            website = "globalcorp.com",
            userId = 4  // Sample user ID for testing
        ),
        Customer(
            id = "4",
            name = "David Wilson",
            email = "dwilson@startupxyz.com",
            phone = "+1 (555) 456-7890",
            company = "StartupXYZ",
            status = CustomerStatus.ACTIVE,
            value = 45000.0,
            createdDate = "2024-05-12",
            lastContact = "2024-10-15",
            industry = "Tech Startup",
            website = "startupxyz.com"
        ),
        Customer(
            id = "5",
            name = "Jessica Brown",
            email = "jbrown@retail.com",
            phone = "+1 (555) 567-8901",
            company = "Retail Solutions",
            status = CustomerStatus.INACTIVE,
            value = 30000.0,
            createdDate = "2024-03-08",
            lastContact = "2024-08-20",
            industry = "Retail",
            website = "retailsolutions.com"
        )
    )
}

