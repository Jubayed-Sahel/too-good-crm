package too.good.crm.data.api

import retrofit2.http.*

/**
 * Analytics API Service
 * Endpoints for analytics and reporting
 * Base: /api/analytics/
 * 
 * IMPORTANT: All endpoints match your Django AnalyticsViewSet actions exactly!
 */
interface AnalyticsApiService {
    
    /**
     * Get comprehensive dashboard statistics
     * GET /api/analytics/dashboard/
     * 
     * Returns:
     * - Customer stats (total, active, inactive, growth)
     * - Lead stats (total, qualified, converted, hot leads)
     * - Deal stats (total, won, lost, revenue, win rate)
     * - Revenue stats (monthly comparison, growth)
     */
    @GET("analytics/dashboard/")
    suspend fun getDashboardStats(): Map<String, Any>
    
    /**
     * Get sales funnel conversion rates
     * GET /api/analytics/sales_funnel/
     * 
     * Returns funnel stages:
     * - Total Leads
     * - Qualified Leads
     * - Deals Created
     * - Deals Won
     * With conversion rates at each stage
     */
    @GET("analytics/sales_funnel/")
    suspend fun getSalesFunnel(): Map<String, Any>
    
    /**
     * Get revenue analytics by period
     * GET /api/analytics/revenue_by_period/
     * 
     * Query params:
     * - period: day|week|month|year (default: month)
     * - limit: number of periods to return (default: 12)
     */
    @GET("analytics/revenue_by_period/")
    suspend fun getRevenueByPeriod(
        @Query("period") period: String? = "month",
        @Query("limit") limit: Int? = 12
    ): Map<String, Any>
    
    /**
     * Get employee performance metrics
     * GET /api/analytics/employee_performance/
     * 
     * Returns per-employee stats:
     * - Total customers
     * - Total leads
     * - Total deals
     * - Total revenue
     * - Win rate
     */
    @GET("analytics/employee_performance/")
    suspend fun getEmployeePerformance(): Map<String, Any>
    
    /**
     * Get top performing employees
     * GET /api/analytics/top_performers/
     * 
     * Query params:
     * - metric: revenue|deals|win_rate (default: revenue)
     * - limit: number of employees to return (default: 10)
     */
    @GET("analytics/top_performers/")
    suspend fun getTopPerformers(
        @Query("metric") metric: String? = "revenue",
        @Query("limit") limit: Int? = 10
    ): List<Map<String, Any>>
    
    /**
     * Get quick overview stats for current user
     * GET /api/analytics/quick_stats/
     * 
     * Returns:
     * - My customers count
     * - My leads count
     * - My deals count
     * - My revenue total
     */
    @GET("analytics/quick_stats/")
    suspend fun getQuickStats(): Map<String, Any>
}
