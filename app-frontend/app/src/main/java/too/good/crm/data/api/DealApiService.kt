package too.good.crm.data.api

import retrofit2.http.*
import too.good.crm.data.model.*

/**
 * Deal API Service
 * Endpoints for deal/pipeline management
 * Base: /api/deals/, /api/pipelines/, /api/pipeline-stages/
 */
interface DealApiService {
    
    // ========== Deal Endpoints ==========
    
    /**
     * Get all deals (with pagination)
     * GET /api/deals/
     */
    @GET("deals/")
    suspend fun getDeals(
        @Query("page") page: Int? = null,
        @Query("page_size") pageSize: Int? = null,
        @Query("status") status: String? = null,
        @Query("stage") stage: Int? = null,
        @Query("priority") priority: String? = null,
        @Query("assigned_to") assignedTo: Int? = null,
        @Query("customer") customer: Int? = null,
        @Query("is_won") isWon: Boolean? = null,
        @Query("is_lost") isLost: Boolean? = null,
        @Query("search") search: String? = null,
        @Query("ordering") ordering: String? = null
    ): DealsListResponse
    
    /**
     * Get single deal
     * GET /api/deals/{id}/
     */
    @GET("deals/{id}/")
    suspend fun getDeal(@Path("id") id: Int): Deal
    
    /**
     * Create new deal
     * POST /api/deals/
     */
    @POST("deals/")
    suspend fun createDeal(@Body deal: CreateDealRequest): Deal
    
    /**
     * Update deal
     * PUT /api/deals/{id}/
     */
    @PUT("deals/{id}/")
    suspend fun updateDeal(
        @Path("id") id: Int,
        @Body deal: CreateDealRequest
    ): Deal
    
    /**
     * Partial update deal
     * PATCH /api/deals/{id}/
     */
    @PATCH("deals/{id}/")
    suspend fun patchDeal(
        @Path("id") id: Int,
        @Body updates: Map<String, Any>
    ): Deal
    
    /**
     * Delete deal
     * DELETE /api/deals/{id}/
     */
    @DELETE("deals/{id}/")
    suspend fun deleteDeal(@Path("id") id: Int)
    
    /**
     * Mark deal as won
     * POST /api/deals/{id}/mark_won/
     */
    @POST("deals/{id}/mark_won/")
    suspend fun markDealWon(@Path("id") id: Int): Deal
    
    /**
     * Mark deal as lost
     * POST /api/deals/{id}/mark_lost/
     */
    @POST("deals/{id}/mark_lost/")
    suspend fun markDealLost(
        @Path("id") id: Int,
        @Body body: Map<String, String>? = null // {"lost_reason": "..."}
    ): Deal
    
    /**
     * Reopen a closed deal
     * POST /api/deals/{id}/reopen/
     */
    @POST("deals/{id}/reopen/")
    suspend fun reopenDeal(@Path("id") id: Int): Deal
    
    /**
     * Move deal to different stage
     * POST /api/deals/{id}/move_stage/
     */
    @POST("deals/{id}/move_stage/")
    suspend fun moveDealStage(
        @Path("id") id: Int,
        @Body body: Map<String, Int> // {"stage_id": 123}
    ): Deal
    
    /**
     * Get deal statistics
     * GET /api/deals/stats/
     */
    @GET("deals/stats/")
    suspend fun getDealStats(): Map<String, Any>
    
    // ========== Pipeline Endpoints ==========
    
    /**
     * Get all pipelines
     * GET /api/pipelines/
     */
    @GET("pipelines/")
    suspend fun getPipelines(): List<Pipeline>
    
    /**
     * Get single pipeline with stages
     * GET /api/pipelines/{id}/
     */
    @GET("pipelines/{id}/")
    suspend fun getPipeline(@Path("id") id: Int): Pipeline
    
    /**
     * Set pipeline as default
     * POST /api/pipelines/{id}/set_default/
     */
    @POST("pipelines/{id}/set_default/")
    suspend fun setDefaultPipeline(@Path("id") id: Int): Pipeline
    
    /**
     * Reorder pipeline stages
     * POST /api/pipelines/{id}/reorder_stages/
     */
    @POST("pipelines/{id}/reorder_stages/")
    suspend fun reorderPipelineStages(
        @Path("id") id: Int,
        @Body stages: Map<String, List<Map<String, Int>>> // {"stages": [{"id": 1, "order": 0}, ...]}
    ): Map<String, Any>
    
    // ========== Pipeline Stage Endpoints ==========
    
    /**
     * Get all stages for a pipeline
     * GET /api/pipeline-stages/?pipeline={pipeline_id}
     */
    @GET("pipeline-stages/")
    suspend fun getPipelineStages(
        @Query("pipeline") pipelineId: Int
    ): List<PipelineStage>
}

