package too.good.crm.data.repository

import too.good.crm.data.NetworkResult
import too.good.crm.data.api.ApiClient
import too.good.crm.data.safeApiCall
import too.good.crm.data.model.DashboardStats
import too.good.crm.data.model.SalesFunnelResponse
import too.good.crm.data.model.RevenueByPeriodResponse
import too.good.crm.data.model.EmployeePerformanceResponse
import too.good.crm.data.model.TopPerformersResponse
import too.good.crm.data.model.QuickStats

/**
 * Dashboard Statistics Repository
 * Handles analytics and dashboard data operations
 * 
 * Note: Analytics endpoints have been removed from backend.
 * This repository now calculates stats from individual resource endpoints.
 */
class DashboardStatsRepository {
    private val apiService = ApiClient.analyticsApiService
    private val customerService = ApiClient.customerApiService
    private val leadService = ApiClient.leadApiService
    private val dealService = ApiClient.dealApiService
    private val activityService = ApiClient.activityApiService

    /**
     * Get comprehensive dashboard statistics
     * Calculates stats from individual API endpoints
     */
    suspend fun getDashboardStats(
        startDate: String? = null,
        endDate: String? = null
    ): NetworkResult<DashboardStats> {
        return try {
            // Fetch data from individual services
            val customersResponse = customerService.getCustomers()
            val leadsResponse = leadService.getLeads()
            val dealsResponse = dealService.getDeals()
            val activitiesResponse = activityService.getActivities()

            // Extract data from responses (handle Response wrapper)
            val customers = customersResponse.body()?.results ?: emptyList()
            val leads = leadsResponse.results
            val deals = dealsResponse.results
            val activities = activitiesResponse.results.take(10)

            // Calculate statistics
            val totalCustomers = customers.size
            val totalLeads = leads.size
            val totalDeals = deals.size
            
            val wonDeals = deals.filter { it.isWon }
            val wonDealsCount = wonDeals.size
            val lostDeals = deals.filter { it.isLost }
            val lostDealsCount = lostDeals.size
            
            val totalRevenue = wonDeals.sumOf { it.value.toDoubleOrNull() ?: 0.0 }
            val activeDealsValue = deals
                .filter { !it.isWon && !it.isLost }
                .sumOf { it.value.toDoubleOrNull() ?: 0.0 }
            
            val conversionRate = if (totalDeals > 0) {
                (wonDealsCount.toDouble() / totalDeals.toDouble()) * 100
            } else 0.0

            // Create DashboardStats object
            val stats = DashboardStats(
                totalLeads = totalLeads,
                totalDeals = totalDeals,
                totalCustomers = totalCustomers,
                totalRevenue = totalRevenue,
                activeDealsValue = activeDealsValue,
                wonDealsCount = wonDealsCount,
                lostDealsCount = lostDealsCount,
                conversionRate = conversionRate,
                recentActivities = null // ActivityListItem doesn't match Activity type
            )

            NetworkResult.Success(stats)
        } catch (e: Exception) {
            NetworkResult.Exception(e)
        }
    }
    
    /**
     * Get sales funnel data
     */
    suspend fun getSalesFunnel(
        startDate: String? = null,
        endDate: String? = null
    ): NetworkResult<SalesFunnelResponse> = safeApiCall {
        apiService.getSalesFunnel(startDate, endDate)
    }
    
    /**
     * Get revenue by period
     */
    suspend fun getRevenueByPeriod(
        period: String = "month",
        startDate: String? = null,
        endDate: String? = null
    ): NetworkResult<RevenueByPeriodResponse> = safeApiCall {
        apiService.getRevenueByPeriod(period, startDate, endDate)
    }
    
    /**
     * Get employee performance
     */
    suspend fun getEmployeePerformance(
        startDate: String? = null,
        endDate: String? = null,
        employeeId: Int? = null
    ): NetworkResult<EmployeePerformanceResponse> = safeApiCall {
        apiService.getEmployeePerformance(startDate, endDate, employeeId)
    }
    
    /**
     * Get top performers
     */
    suspend fun getTopPerformers(
        metric: String = "revenue",
        limit: Int = 10,
        startDate: String? = null,
        endDate: String? = null
    ): NetworkResult<TopPerformersResponse> = safeApiCall {
        apiService.getTopPerformers(metric, limit, startDate, endDate)
    }
    
    /**
     * Get quick stats for current user
     */
    suspend fun getQuickStats(): NetworkResult<QuickStats> = safeApiCall {
        apiService.getQuickStats()
    }
}
