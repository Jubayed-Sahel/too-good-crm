package too.good.crm.data.model

import com.google.gson.annotations.SerializedName

/**
 * Analytics data models matching backend API
 * Endpoint: /api/analytics/
 */

/**
 * Dashboard stats response
 */
data class DashboardStats(
    @SerializedName("total_leads") val totalLeads: Int,
    @SerializedName("active_leads") val activeLeads: Int,
    @SerializedName("converted_leads") val convertedLeads: Int,
    @SerializedName("total_customers") val totalCustomers: Int,
    @SerializedName("active_customers") val activeCustomers: Int,
    @SerializedName("total_deals") val totalDeals: Int,
    @SerializedName("open_deals") val openDeals: Int,
    @SerializedName("won_deals") val wonDeals: Int,
    @SerializedName("lost_deals") val lostDeals: Int,
    @SerializedName("total_deal_value") val totalDealValue: String,
    @SerializedName("won_deal_value") val wonDealValue: String,
    @SerializedName("pipeline_value") val pipelineValue: String,
    @SerializedName("total_orders") val totalOrders: Int?,
    @SerializedName("pending_orders") val pendingOrders: Int?,
    @SerializedName("completed_orders") val completedOrders: Int?,
    @SerializedName("total_revenue") val totalRevenue: String?,
    @SerializedName("monthly_revenue") val monthlyRevenue: String?,
    @SerializedName("conversion_rate") val conversionRate: Float,
    @SerializedName("average_deal_value") val averageDealValue: String,
    @SerializedName("average_sales_cycle") val averageSalesCycle: Float?, // days
    @SerializedName("total_activities") val totalActivities: Int?,
    @SerializedName("activities_this_month") val activitiesThisMonth: Int?,
    @SerializedName("top_performers") val topPerformers: List<PerformerStats>?,
    @SerializedName("leads_by_source") val leadsBySource: Map<String, Int>?,
    @SerializedName("deals_by_stage") val dealsByStage: Map<String, Int>?,
    @SerializedName("recent_activities") val recentActivities: List<ActivityListItem>?
)

/**
 * Performer stats for leaderboard
 */
data class PerformerStats(
    val id: Int,
    val name: String,
    @SerializedName("profile_image") val profileImage: String?,
    @SerializedName("deals_won") val dealsWon: Int,
    @SerializedName("total_value") val totalValue: String,
    @SerializedName("leads_converted") val leadsConverted: Int,
    @SerializedName("activities_count") val activitiesCount: Int
)

/**
 * Sales report data
 */
data class SalesReport(
    @SerializedName("time_period") val timePeriod: String,
    @SerializedName("start_date") val startDate: String,
    @SerializedName("end_date") val endDate: String,
    @SerializedName("total_revenue") val totalRevenue: String,
    @SerializedName("revenue_by_month") val revenueByMonth: List<MonthlyRevenue>?,
    @SerializedName("deals_closed") val dealsClosed: Int,
    @SerializedName("new_customers") val newCustomers: Int,
    @SerializedName("conversion_rate") val conversionRate: Float,
    @SerializedName("average_deal_size") val averageDealSize: String,
    @SerializedName("top_products") val topProducts: List<ProductSales>?,
    @SerializedName("sales_by_rep") val salesByRep: List<SalesRepStats>?
)

/**
 * Monthly revenue data
 */
data class MonthlyRevenue(
    val month: String,
    val year: Int,
    val revenue: String,
    @SerializedName("deals_count") val dealsCount: Int
)

/**
 * Product sales data
 */
data class ProductSales(
    val id: Int,
    val name: String,
    val quantity: Int,
    val revenue: String
)

/**
 * Sales rep stats
 */
data class SalesRepStats(
    val id: Int,
    val name: String,
    @SerializedName("deals_closed") val dealsClosed: Int,
    val revenue: String,
    @SerializedName("conversion_rate") val conversionRate: Float
)

