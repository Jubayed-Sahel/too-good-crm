package too.good.crm.data.repository

import too.good.crm.data.api.ApiClient
import too.good.crm.data.api.DashboardStatsResponse
import android.content.Context

class DashboardStatsRepository {
    private val apiService = ApiClient.analyticsApiService

    /**
     * Get dashboard statistics
     */
    suspend fun getDashboardStats(organizationId: Int? = null): Result<DashboardStatsResponse> {
        return try {
            val response = apiService.getDashboardStats(organizationId)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to get dashboard stats"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}

