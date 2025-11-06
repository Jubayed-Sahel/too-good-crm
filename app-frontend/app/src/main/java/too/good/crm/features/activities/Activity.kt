package too.good.crm.features.activities

data class Activity(
    val id: String,
    val title: String,
    val type: ActivityType,
    val status: ActivityStatus,
    val customerName: String,
    val dueDate: String,
    val createdDate: String,
    val createdBy: String,
    val notes: String = ""
)

enum class ActivityType {
    CALL,
    EMAIL,
    MEETING,
    TASK,
    FOLLOW_UP
}

enum class ActivityStatus {
    PENDING,
    COMPLETED,
    SCHEDULED,
    OVERDUE
}

object ActivitySampleData {
    fun getActivities() = listOf(
        Activity(
            id = "1",
            title = "Follow-up call with TechCorp",
            type = ActivityType.CALL,
            status = ActivityStatus.PENDING,
            customerName = "TechCorp Solutions",
            dueDate = "2024-11-08",
            createdDate = "2024-11-05",
            createdBy = "Sarah Johnson",
            notes = "Discuss contract renewal terms"
        ),
        Activity(
            id = "2",
            title = "Send proposal to Innovate Inc",
            type = ActivityType.EMAIL,
            status = ActivityStatus.COMPLETED,
            customerName = "Innovate Inc",
            dueDate = "2024-11-06",
            createdDate = "2024-11-04",
            createdBy = "Michael Chen",
            notes = "Cloud migration proposal sent"
        ),
        Activity(
            id = "3",
            title = "Quarterly review meeting",
            type = ActivityType.MEETING,
            status = ActivityStatus.SCHEDULED,
            customerName = "Global Corp",
            dueDate = "2024-11-10",
            createdDate = "2024-11-01",
            createdBy = "Emily Davis",
            notes = "Prepare Q4 performance report"
        ),
        Activity(
            id = "4",
            title = "Update CRM records",
            type = ActivityType.TASK,
            status = ActivityStatus.COMPLETED,
            customerName = "Internal",
            dueDate = "2024-11-05",
            createdDate = "2024-11-03",
            createdBy = "David Wilson",
            notes = "Monthly data cleanup"
        ),
        Activity(
            id = "5",
            title = "Demo presentation for StartupXYZ",
            type = ActivityType.MEETING,
            status = ActivityStatus.SCHEDULED,
            customerName = "StartupXYZ",
            dueDate = "2024-11-12",
            createdDate = "2024-11-06",
            createdBy = "Sarah Johnson",
            notes = "Product demo for enterprise features"
        ),
        Activity(
            id = "6",
            title = "Contract negotiation call",
            type = ActivityType.CALL,
            status = ActivityStatus.OVERDUE,
            customerName = "Retail Solutions",
            dueDate = "2024-11-04",
            createdDate = "2024-10-28",
            createdBy = "Michael Chen",
            notes = "Discuss pricing terms"
        )
    )
}

