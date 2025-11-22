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
     */
    @GET("activities/")
    suspend fun getActivities(
        @Query("page") page: Int? = null,
        @Query("page_size") pageSize: Int? = null,
        @Query("activity_type") activityType: String? = null,
        @Query("related_to_type") relatedToType: String? = null,
        @Query("related_to_id") relatedToId: Int? = null,
        @Query("performed_by") performedBy: Int? = null,
        @Query("status") status: String? = null,
        @Query("priority") priority: String? = null,
        @Query("date_from") dateFrom: String? = null,
        @Query("date_to") dateTo: String? = null,
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
    
    /**
     * Get activities for a specific entity (lead, customer, deal)
     * GET /api/activities/for_entity/?type={type}&id={id}
     */
    @GET("activities/for_entity/")
    suspend fun getActivitiesForEntity(
        @Query("type") type: String, // lead, customer, deal, order
        @Query("id") id: Int,
        @Query("page") page: Int? = null,
        @Query("page_size") pageSize: Int? = null
    ): ActivitiesListResponse
    
    /**
     * Get upcoming activities
     * GET /api/activities/upcoming/
     */
    @GET("activities/upcoming/")
    suspend fun getUpcomingActivities(
        @Query("page") page: Int? = null,
        @Query("page_size") pageSize: Int? = null
    ): ActivitiesListResponse
    
    /**
     * Get overdue activities
     * GET /api/activities/overdue/
     */
    @GET("activities/overdue/")
    suspend fun getOverdueActivities(
        @Query("page") page: Int? = null,
        @Query("page_size") pageSize: Int? = null
    ): ActivitiesListResponse
}

