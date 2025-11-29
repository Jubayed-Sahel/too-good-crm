package too.good.crm.data.api

import retrofit2.http.*
import too.good.crm.data.model.*

/**
 * Activity API Service
 * Endpoints for activity tracking
 * Base: /api/activities/
 */
interface ActivityApiService {
    
    /**
     * Get all activities (with pagination)
     * GET /api/activities/
     * Backend filters: customer, lead, deal, activity_type, status, assigned_to
     */
    @GET("activities/")
    suspend fun getActivities(
        @Query("page") page: Int? = null,
        @Query("page_size") pageSize: Int? = null,
        @Query("activity_type") activityType: String? = null,
        @Query("customer") customer: Int? = null,
        @Query("lead") lead: Int? = null,
        @Query("deal") deal: Int? = null,
        @Query("assigned_to") assignedTo: Int? = null,
        @Query("status") status: String? = null,
        @Query("search") search: String? = null,
        @Query("ordering") ordering: String? = null
    ): ActivitiesListResponse
    
    /**
     * Get single activity
     * GET /api/activities/{id}/
     */
    @GET("activities/{id}/")
    suspend fun getActivity(@Path("id") id: Int): Activity
    
    /**
     * Create new activity
     * POST /api/activities/
     */
    @POST("activities/")
    suspend fun createActivity(@Body activity: CreateActivityRequest): Activity
    
    /**
     * Update activity
     * PUT /api/activities/{id}/
     */
    @PUT("activities/{id}/")
    suspend fun updateActivity(
        @Path("id") id: Int,
        @Body activity: CreateActivityRequest
    ): Activity
    
    /**
     * Partial update activity
     * PATCH /api/activities/{id}/
     */
    @PATCH("activities/{id}/")
    suspend fun patchActivity(
        @Path("id") id: Int,
        @Body updates: Map<String, Any>
    ): Activity
    
    /**
     * Delete activity
     * DELETE /api/activities/{id}/
     */
    @DELETE("activities/{id}/")
    suspend fun deleteActivity(@Path("id") id: Int)
    
    /**
     * Mark activity as completed
     * POST /api/activities/{id}/complete/
     */
    @POST("activities/{id}/complete/")
    suspend fun completeActivity(@Path("id") id: Int): Activity
    
    /**
     * Cancel activity
     * POST /api/activities/{id}/cancel/
     */
    @POST("activities/{id}/cancel/")
    suspend fun cancelActivity(@Path("id") id: Int): Activity
    
}

