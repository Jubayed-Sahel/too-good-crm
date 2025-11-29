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
        customer: Int? = null,
        lead: Int? = null,
        deal: Int? = null,
        assignedTo: Int? = null,
        status: String? = null,
        search: String? = null,
        ordering: String? = "-created_at"
    ): NetworkResult<ActivitiesListResponse> = safeApiCall {
        apiService.getActivities(
            page = page,
            pageSize = pageSize,
            activityType = activityType,
            customer = customer,
            lead = lead,
            deal = deal,
            assignedTo = assignedTo,
            status = status,
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
     * Get activities for a customer
     */
    suspend fun getCustomerActivities(
        customerId: Int,
        page: Int? = null,
        pageSize: Int? = 20
    ): NetworkResult<ActivitiesListResponse> = getActivities(
        customer = customerId,
        page = page,
        pageSize = pageSize
    )
    
    /**
     * Get activities for a lead
     */
    suspend fun getLeadActivities(
        leadId: Int,
        page: Int? = null,
        pageSize: Int? = 20
    ): NetworkResult<ActivitiesListResponse> = getActivities(
        lead = leadId,
        page = page,
        pageSize = pageSize
    )
    
    /**
     * Get activities for a deal
     */
    suspend fun getDealActivities(
        dealId: Int,
        page: Int? = null,
        pageSize: Int? = 20
    ): NetworkResult<ActivitiesListResponse> = getActivities(
        deal = dealId,
        page = page,
        pageSize = pageSize
    )
    
    /**
     * Get activities by type
     */
    suspend fun getActivitiesByType(
        activityType: String,
        page: Int? = null,
        pageSize: Int? = 20
    ): NetworkResult<ActivitiesListResponse> = getActivities(
        activityType = activityType,
        page = page,
        pageSize = pageSize
    )
    
    /**
     * Get activities assigned to an employee
     */
    suspend fun getEmployeeActivities(
        employeeId: Int,
        page: Int? = null,
        pageSize: Int? = 20
    ): NetworkResult<ActivitiesListResponse> = getActivities(
        assignedTo = employeeId,
        page = page,
        pageSize = pageSize
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

