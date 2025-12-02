package too.good.crm.data.api

import retrofit2.http.*
import too.good.crm.data.model.*

/**
 * Lead API Service
 * Endpoints for lead management
 * Base: /api/leads/
 */
interface LeadApiService {
    
    /**
     * Get all leads (with pagination)
     * GET /api/leads/
     */
    @GET("leads/")
    suspend fun getLeads(
        @Query("page") page: Int? = null,
        @Query("page_size") pageSize: Int? = null,
        @Query("status") status: String? = null,
        @Query("source") source: String? = null,
        @Query("qualification_status") qualificationStatus: String? = null,
        @Query("assigned_to") assignedTo: Int? = null,
        @Query("is_converted") isConverted: Boolean? = null,
        @Query("search") search: String? = null,
        @Query("ordering") ordering: String? = null
    ): LeadsListResponse
    
    /**
     * Get single lead
     * GET /api/leads/{id}/
     */
    @GET("leads/{id}/")
    suspend fun getLead(@Path("id") id: Int): Lead
    
    /**
     * Create new lead
     * POST /api/leads/
     */
    @POST("leads/")
    suspend fun createLead(@Body lead: CreateLeadRequest): Lead
    
    /**
     * Update lead
     * PUT /api/leads/{id}/
     */
    @PUT("leads/{id}/")
    suspend fun updateLead(
        @Path("id") id: Int,
        @Body lead: CreateLeadRequest
    ): Lead
    
    /**
     * Partial update lead
     * PATCH /api/leads/{id}/
     */
    @PATCH("leads/{id}/")
    suspend fun patchLead(
        @Path("id") id: Int,
        @Body updates: Map<String, Any>
    ): Lead
    
    /**
     * Delete lead
     * DELETE /api/leads/{id}/
     */
    @DELETE("leads/{id}/")
    suspend fun deleteLead(@Path("id") id: Int)
    
    /**
     * Convert lead to customer
     * POST /api/leads/{id}/convert/
     */
    @POST("leads/{id}/convert/")
    suspend fun convertLead(@Path("id") id: Int): Lead
    
    /**
     * Assign lead to employee
     * POST /api/leads/{id}/assign/
     */
    @POST("leads/{id}/assign/")
    suspend fun assignLead(
        @Path("id") id: Int,
        @Body body: Map<String, Int> // {"employee_id": 123}
    ): Lead
    
    /**
     * Move lead to different stage
     * POST /api/leads/{id}/move_stage/
     */
    @POST("leads/{id}/move_stage/")
    suspend fun moveLeadStage(
        @Path("id") id: Int,
        @Body body: Map<String, @JvmSuppressWildcards Any> // {"stage_id": 123, "notes": "..."}
    ): Lead
    
    /**
     * Qualify lead
     * POST /api/leads/{id}/qualify/
     */
    @POST("leads/{id}/qualify/")
    suspend fun qualifyLead(@Path("id") id: Int): Lead
    
    /**
     * Disqualify lead
     * POST /api/leads/{id}/disqualify/
     */
    @POST("leads/{id}/disqualify/")
    suspend fun disqualifyLead(@Path("id") id: Int): Lead
    
    /**
     * Update lead score
     * POST /api/leads/{id}/update_score/
     */
    @POST("leads/{id}/update_score/")
    suspend fun updateLeadScore(
        @Path("id") id: Int,
        @Body body: Map<String, Any> // {"score": 75, "reason": "..."}
    ): Lead
    
    /**
     * Convert lead to deal
     * POST /api/leads/{id}/convert_to_deal/
     */
    @POST("leads/{id}/convert_to_deal/")
    suspend fun convertLeadToDeal(
        @Path("id") id: Int,
        @Body body: Map<String, Any> // {"stage_key": "qualified", "stage_id": 1}
    ): Lead
    
    /**
     * Get lead statistics
     * GET /api/leads/stats/
     */
    @GET("leads/stats/")
    suspend fun getLeadStats(): Map<String, Any>
}

