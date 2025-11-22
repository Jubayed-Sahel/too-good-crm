package too.good.crm.data.repository

import too.good.crm.data.NetworkResult
import too.good.crm.data.api.ApiClient
import too.good.crm.data.model.*
import too.good.crm.data.safeApiCall

/**
 * Activity Repository
 * Handles all activity-related data operations
 */
class ActivityRepository {
    private val apiService = ApiClient.activityApiService
    
    /**
     * Get all activities with optional filters
     */
    suspend fun getActivities(
        page: Int? = null,
        pageSize: Int? = 20,
        activityType: String? = null,
        relatedToType: String? = null,
        relatedToId: Int? = null,
        performedBy: Int? = null,
        status: String? = null,
        priority: String? = null,
        dateFrom: String? = null,
        dateTo: String? = null,
        search: String? = null,
        ordering: String? = "-performed_at"
    ): NetworkResult<ActivitiesListResponse> = safeApiCall {
        apiService.getActivities(
            page = page,
            pageSize = pageSize,
            activityType = activityType,
            relatedToType = relatedToType,
            relatedToId = relatedToId,
            performedBy = performedBy,
            status = status,
            priority = priority,
            dateFrom = dateFrom,
            dateTo = dateTo,
            search = search,
            ordering = ordering
        )
    }
    
    /**
     * Get single activity by ID
     */
    suspend fun getActivity(id: Int): NetworkResult<Activity> = safeApiCall {
        apiService.getActivity(id)
    }
    
    /**
     * Create new activity
     */
    suspend fun createActivity(activity: CreateActivityRequest): NetworkResult<Activity> = safeApiCall {
        apiService.createActivity(activity)
    }
    
    /**
     * Update existing activity
     */
    suspend fun updateActivity(
        id: Int,
        activity: CreateActivityRequest
    ): NetworkResult<Activity> = safeApiCall {
        apiService.updateActivity(id, activity)
    }
    
    /**
     * Partial update activity
     */
    suspend fun patchActivity(id: Int, updates: Map<String, Any>): NetworkResult<Activity> = safeApiCall {
        apiService.patchActivity(id, updates)
    }
    
    /**
     * Delete activity
     */
    suspend fun deleteActivity(id: Int): NetworkResult<Unit> = safeApiCall {
        apiService.deleteActivity(id)
    }
    
    /**
     * Mark activity as completed
     */
    suspend fun completeActivity(id: Int): NetworkResult<Activity> = safeApiCall {
        apiService.completeActivity(id)
    }
    
    /**
     * Cancel activity
     */
    suspend fun cancelActivity(id: Int): NetworkResult<Activity> = safeApiCall {
        apiService.cancelActivity(id)
    }
    
    /**
     * Get activities for a specific entity (lead, customer, deal, order)
     */
    suspend fun getActivitiesForEntity(
        type: String,
        id: Int,
        page: Int? = null,
        pageSize: Int? = 20
    ): NetworkResult<ActivitiesListResponse> = safeApiCall {
        apiService.getActivitiesForEntity(
            type = type,
            id = id,
            page = page,
            pageSize = pageSize
        )
    }
    
    /**
     * Get upcoming activities
     */
    suspend fun getUpcomingActivities(
        page: Int? = null,
        pageSize: Int? = 20
    ): NetworkResult<ActivitiesListResponse> = safeApiCall {
        apiService.getUpcomingActivities(page = page, pageSize = pageSize)
    }
    
    /**
     * Get overdue activities
     */
    suspend fun getOverdueActivities(
        page: Int? = null,
        pageSize: Int? = 20
    ): NetworkResult<ActivitiesListResponse> = safeApiCall {
        apiService.getOverdueActivities(page = page, pageSize = pageSize)
    }
    
    /**
     * Get activities by type
     */
    suspend fun getActivitiesByType(activityType: String): NetworkResult<ActivitiesListResponse> {
        return getActivities(activityType = activityType)
    }
    
    /**
     * Get my activities
     */
    suspend fun getMyActivities(employeeId: Int): NetworkResult<ActivitiesListResponse> {
        return getActivities(performedBy = employeeId)
    }
    
    /**
     * Get activities for a lead
     */
    suspend fun getLeadActivities(leadId: Int): NetworkResult<ActivitiesListResponse> {
        return getActivitiesForEntity("lead", leadId)
    }
    
    /**
     * Get activities for a customer
     */
    suspend fun getCustomerActivities(customerId: Int): NetworkResult<ActivitiesListResponse> {
        return getActivitiesForEntity("customer", customerId)
    }
    
    /**
     * Get activities for a deal
     */
    suspend fun getDealActivities(dealId: Int): NetworkResult<ActivitiesListResponse> {
        return getActivitiesForEntity("deal", dealId)
    }
    
    /**
     * Search activities
     */
    suspend fun searchActivities(query: String): NetworkResult<ActivitiesListResponse> {
        return getActivities(search = query)
    }
}

