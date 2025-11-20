package too.good.crm.data.api

import com.google.gson.annotations.SerializedName
import retrofit2.Response
import retrofit2.http.*

interface AnalyticsApiService {
    /**
     * Get dashboard statistics
     */
    @GET("analytics/dashboard/")
    suspend fun getDashboardStats(
        @Query("organization") organizationId: Int? = null
    ): Response<DashboardStatsResponse>
}

// Dashboard Stats Models
data class DashboardStatsResponse(
    @SerializedName("total_customers")
    val totalCustomers: Int = 0,
    @SerializedName("total_deals")
    val totalDeals: Int = 0,
    @SerializedName("total_revenue")
    val totalRevenue: Double = 0.0,
    @SerializedName("active_leads")
    val activeLeads: Int = 0,
    @SerializedName("won_deals")
    val wonDeals: Int = 0,
    @SerializedName("pending_tasks")
    val pendingTasks: Int = 0,
    @SerializedName("upcoming_activities")
    val upcomingActivities: Int = 0,
    @SerializedName("customer_growth_percent")
    val customerGrowthPercent: Double? = null,
    @SerializedName("revenue_growth_percent")
    val revenueGrowthPercent: Double? = null,
    @SerializedName("deal_growth_percent")
    val dealGrowthPercent: Double? = null,
    @SerializedName("lead_growth_percent")
    val leadGrowthPercent: Double? = null
)

