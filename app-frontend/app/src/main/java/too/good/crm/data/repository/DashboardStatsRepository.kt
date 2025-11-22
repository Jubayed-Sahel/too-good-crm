package too.good.crm.data.repository

import too.good.crm.data.NetworkResult
import too.good.crm.data.api.ApiClient
import too.good.crm.data.safeApiCall

/**
 * Dashboard Statistics Repository
 * Handles analytics and dashboard data operations
 */
class DashboardStatsRepository {
    private val apiService = ApiClient.analyticsApiService

    /**
     * Get comprehensive dashboard statistics
     */
    suspend fun getDashboardStats(): NetworkResult<Map<String, Any>> = safeApiCall {
        apiService.getDashboardStats()
    }
    
    /**
     * Get sales funnel data
     */
    suspend fun getSalesFunnel(): NetworkResult<Map<String, Any>> = safeApiCall {
        apiService.getSalesFunnel()
    }
    
    /**
     * Get revenue by period
     */
    suspend fun getRevenueByPeriod(
        period: String = "month",
        limit: Int = 12
    ): NetworkResult<Map<String, Any>> = safeApiCall {
        apiService.getRevenueByPeriod(period, limit)
    }
    
    /**
     * Get employee performance
     */
    suspend fun getEmployeePerformance(): NetworkResult<Map<String, Any>> = safeApiCall {
        apiService.getEmployeePerformance()
    }
    
    /**
     * Get top performers
     */
    suspend fun getTopPerformers(
        metric: String = "revenue",
        limit: Int = 10
    ): NetworkResult<List<Map<String, Any>>> = safeApiCall {
        apiService.getTopPerformers(metric, limit)
    }
    
    /**
     * Get quick stats for current user
     */
    suspend fun getQuickStats(): NetworkResult<Map<String, Any>> = safeApiCall {
        apiService.getQuickStats()
    }
}
