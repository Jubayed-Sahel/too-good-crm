package too.good.crm.features.client.issues

data class Issue(
    val id: String,
    val issueNumber: String,
    val title: String,
    val vendorName: String,
    val priority: IssuePriority,
    val status: IssueStatus,
    val createdDate: String,
    val description: String
)

enum class IssuePriority {
    LOW,
    MEDIUM,
    HIGH,
    URGENT
}

enum class IssueStatus {
    OPEN,
    IN_PROGRESS,
    RESOLVED,
    CLOSED
}

object IssueSampleData {
    fun getIssues() = listOf(
        Issue(
            id = "1",
            issueNumber = "ISS-2024-001",
            title = "Delayed Delivery",
            vendorName = "Office Supplies Co",
            priority = IssuePriority.HIGH,
            status = IssueStatus.IN_PROGRESS,
            createdDate = "2024-11-03",
            description = "Order #ORD-2024-002 delivery was delayed by 3 days"
        ),
        Issue(
            id = "2",
            issueNumber = "ISS-2024-002",
            title = "Incorrect Items Received",
            vendorName = "Tech Solutions Inc",
            priority = IssuePriority.URGENT,
            status = IssueStatus.OPEN,
            createdDate = "2024-11-05",
            description = "Received wrong model of laptops in order #ORD-2024-001"
        ),
        Issue(
            id = "3",
            issueNumber = "ISS-2024-003",
            title = "Missing Invoice",
            vendorName = "Cloud Hosting Pro",
            priority = IssuePriority.MEDIUM,
            status = IssueStatus.RESOLVED,
            createdDate = "2024-10-28",
            description = "Invoice for October services not received"
        ),
        Issue(
            id = "4",
            issueNumber = "ISS-2024-004",
            title = "Quality Concern",
            vendorName = "Office Supplies Co",
            priority = IssuePriority.LOW,
            status = IssueStatus.CLOSED,
            createdDate = "2024-10-20",
            description = "Paper quality below expected standards"
        ),
        Issue(
            id = "5",
            issueNumber = "ISS-2024-005",
            title = "Billing Discrepancy",
            vendorName = "Marketing Agency Plus",
            priority = IssuePriority.HIGH,
            status = IssueStatus.OPEN,
            createdDate = "2024-11-04",
            description = "Charged for services not in agreed scope"
        )
    )
}

