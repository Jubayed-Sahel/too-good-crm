package too.good.crm.data.api

import retrofit2.http.*
import too.good.crm.data.model.*

/**
 * Analytics API Service
 * Endpoints for analytics and reporting
 * Base: /api/analytics/
 */
interface AnalyticsApiService {

    /**
     * Get dashboard statistics
     * GET /api/analytics/dashboard-stats/
     */
    @GET("analytics/dashboard-stats/")
    suspend fun getDashboardStats(
        @Query("start_date") startDate: String? = null,
        @Query("end_date") endDate: String? = null
    ): DashboardStats

    /**
     * Get sales funnel data
     * GET /api/analytics/sales_funnel/
     */
    @GET("analytics/sales_funnel/")
    suspend fun getSalesFunnel(
        @Query("start_date") startDate: String? = null,
        @Query("end_date") endDate: String? = null
    ): SalesFunnelResponse

    /**
     * Get revenue by period
     * GET /api/analytics/revenue_by_period/
     */
    @GET("analytics/revenue_by_period/")
    suspend fun getRevenueByPeriod(
        @Query("period") period: String = "month", // day, week, month, quarter, year
        @Query("start_date") startDate: String? = null,
        @Query("end_date") endDate: String? = null
    ): RevenueByPeriodResponse

    /**
     * Get employee performance
     * GET /api/analytics/employee_performance/
     */
    @GET("analytics/employee_performance/")
    suspend fun getEmployeePerformance(
        @Query("start_date") startDate: String? = null,
        @Query("end_date") endDate: String? = null,
        @Query("employee_id") employeeId: Int? = null
    ): EmployeePerformanceResponse

    /**
     * Get top performers
     * GET /api/analytics/top_performers/
     */
    @GET("analytics/top_performers/")
    suspend fun getTopPerformers(
        @Query("metric") metric: String = "revenue", // revenue, deals, leads, conversion
        @Query("limit") limit: Int = 10,
        @Query("start_date") startDate: String? = null,
        @Query("end_date") endDate: String? = null
    ): TopPerformersResponse

    /**
     * Get quick statistics
     * GET /api/analytics/quick_stats/
     */
    @GET("analytics/quick_stats/")
    suspend fun getQuickStats(): QuickStats
}
