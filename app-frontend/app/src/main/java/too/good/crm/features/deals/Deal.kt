package too.good.crm.features.deals

data class Deal(
    val id: String,
    val title: String,
    val customerName: String,
    val value: Double,
    val probability: Int,
    val stage: DealStage,
    val status: DealStatus,
    val expectedCloseDate: String,
    val createdDate: String,
    val owner: String
)

enum class DealStage {
    PROSPECTING,
    QUALIFICATION,
    PROPOSAL,
    NEGOTIATION,
    CLOSED_WON,
    CLOSED_LOST
}

enum class DealStatus {
    ACTIVE,
    WON,
    LOST
}

object DealSampleData {
    fun getDeals() = listOf(
        Deal(
            id = "1",
            title = "Enterprise Software License",
            customerName = "TechCorp Solutions",
            value = 125000.0,
            probability = 80,
            stage = DealStage.NEGOTIATION,
            status = DealStatus.ACTIVE,
            expectedCloseDate = "2024-11-30",
            createdDate = "2024-10-01",
            owner = "John Doe"
        ),
        Deal(
            id = "2",
            title = "Cloud Infrastructure Migration",
            customerName = "Innovate Inc",
            value = 85000.0,
            probability = 65,
            stage = DealStage.PROPOSAL,
            status = DealStatus.ACTIVE,
            expectedCloseDate = "2024-12-15",
            createdDate = "2024-10-10",
            owner = "Jane Smith"
        ),
        Deal(
            id = "3",
            title = "Annual Support Contract",
            customerName = "Global Corp",
            value = 200000.0,
            probability = 90,
            stage = DealStage.NEGOTIATION,
            status = DealStatus.ACTIVE,
            expectedCloseDate = "2024-11-20",
            createdDate = "2024-09-15",
            owner = "Mike Johnson"
        ),
        Deal(
            id = "4",
            title = "Custom Development Project",
            customerName = "StartupXYZ",
            value = 45000.0,
            probability = 50,
            stage = DealStage.QUALIFICATION,
            status = DealStatus.ACTIVE,
            expectedCloseDate = "2024-12-30",
            createdDate = "2024-10-20",
            owner = "Sarah Williams"
        ),
        Deal(
            id = "5",
            title = "Consulting Services",
            customerName = "Retail Solutions",
            value = 30000.0,
            probability = 100,
            stage = DealStage.CLOSED_WON,
            status = DealStatus.WON,
            expectedCloseDate = "2024-10-31",
            createdDate = "2024-09-01",
            owner = "David Brown"
        ),
        Deal(
            id = "6",
            title = "Training Program",
            customerName = "Finance Group",
            value = 15000.0,
            probability = 0,
            stage = DealStage.CLOSED_LOST,
            status = DealStatus.LOST,
            expectedCloseDate = "2024-10-15",
            createdDate = "2024-08-20",
            owner = "Emily Davis"
        )
    )
}

