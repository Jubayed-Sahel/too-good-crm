package too.good.crm.data.model

import com.google.gson.annotations.SerializedName

/**
 * Dashboard Statistics Model
 */
data class DashboardStats(
    @SerializedName("total_leads")
    val totalLeads: Int,

    @SerializedName("total_deals")
    val totalDeals: Int,

    @SerializedName("total_customers")
    val totalCustomers: Int,

    @SerializedName("total_revenue")
    val totalRevenue: Double,

    @SerializedName("active_deals_value")
    val activeDealsValue: Double,

    @SerializedName("won_deals_count")
    val wonDealsCount: Int,

    @SerializedName("lost_deals_count")
    val lostDealsCount: Int,

    @SerializedName("conversion_rate")
    val conversionRate: Double,

    @SerializedName("recent_activities")
    val recentActivities: List<Activity>? = null
)

/**
 * Sales Funnel Data Model
 */
data class SalesFunnelData(
    @SerializedName("stage")
    val stage: String,

    @SerializedName("count")
    val count: Int,

    @SerializedName("value")
    val value: Double,

    @SerializedName("conversion_rate")
    val conversionRate: Double? = null
)

/**
 * Sales Funnel Response
 */
data class SalesFunnelResponse(
    @SerializedName("funnel_data")
    val funnelData: List<SalesFunnelData>
)

/**
 * Revenue Data Model
 */
data class RevenueData(
    @SerializedName("period")
    val period: String,

    @SerializedName("revenue")
    val revenue: Double,

    @SerializedName("deals_count")
    val dealsCount: Int,

    @SerializedName("average_deal_value")
    val averageDealValue: Double? = null
)

/**
 * Revenue by Period Response
 */
data class RevenueByPeriodResponse(
    @SerializedName("revenue_data")
    val revenueData: List<RevenueData>
)

/**
 * Employee Performance Model
 */
data class EmployeePerformance(
    @SerializedName("employee_id")
    val employeeId: Int,

    @SerializedName("employee_name")
    val employeeName: String,

    @SerializedName("total_leads")
    val totalLeads: Int,

    @SerializedName("converted_leads")
    val convertedLeads: Int,

    @SerializedName("total_deals")
    val totalDeals: Int,

    @SerializedName("won_deals")
    val wonDeals: Int,

    @SerializedName("total_revenue")
    val totalRevenue: Double,

    @SerializedName("conversion_rate")
    val conversionRate: Double,

    @SerializedName("average_deal_value")
    val averageDealValue: Double? = null
)

/**
 * Employee Performance Response
 */
data class EmployeePerformanceResponse(
    @SerializedName("performance_data")
    val performanceData: List<EmployeePerformance>
)

/**
 * Top Performer Model
 */
data class TopPerformer(
    @SerializedName("employee_id")
    val employeeId: Int,

    @SerializedName("employee_name")
    val employeeName: String,

    @SerializedName("metric")
    val metric: String,

    @SerializedName("value")
    val value: Double,

    @SerializedName("rank")
    val rank: Int
)

/**
 * Top Performers Response
 */
data class TopPerformersResponse(
    @SerializedName("top_performers")
    val topPerformers: List<TopPerformer>
)

/**
 * Quick Stats Model
 */
data class QuickStats(
    @SerializedName("today_leads")
    val todayLeads: Int,

    @SerializedName("today_deals")
    val todayDeals: Int,

    @SerializedName("today_revenue")
    val todayRevenue: Double,

    @SerializedName("this_week_leads")
    val thisWeekLeads: Int,

    @SerializedName("this_week_deals")
    val thisWeekDeals: Int,

    @SerializedName("this_week_revenue")
    val thisWeekRevenue: Double,

    @SerializedName("this_month_leads")
    val thisMonthLeads: Int,

    @SerializedName("this_month_deals")
    val thisMonthDeals: Int,

    @SerializedName("this_month_revenue")
    val thisMonthRevenue: Double
)
