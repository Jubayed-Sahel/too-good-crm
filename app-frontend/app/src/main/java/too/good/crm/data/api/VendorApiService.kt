package too.good.crm.data.api

import retrofit2.http.*
import too.good.crm.data.model.*

/**
 * Vendor API Service
 * Endpoints for vendor management
 * Base: /api/vendors/
 */
interface VendorApiService {
    
    /**
     * Get all vendors (with pagination)
     * GET /api/vendors/
     * Backend filters: vendor_type, status, search, ordering, organization
     */
    @GET("vendors/")
    suspend fun getVendors(
        @Query("page") page: Int? = null,
        @Query("page_size") pageSize: Int? = null,
        @Query("vendor_type") vendorType: String? = null,
        @Query("status") status: String? = null,
        @Query("search") search: String? = null,
        @Query("ordering") ordering: String? = null,
        @Query("assigned_employee") assignedEmployee: Int? = null,
        @Query("organization") organizationId: Int? = null
    ): VendorListResponse
    
    /**
     * Get single vendor
     * GET /api/vendors/{id}/
     */
    @GET("vendors/{id}/")
    suspend fun getVendor(@Path("id") id: Int): Vendor
    
    /**
     * Create new vendor
     * POST /api/vendors/
     */
    @POST("vendors/")
    suspend fun createVendor(@Body vendor: CreateVendorRequest): Vendor
    
    /**
     * Update vendor
     * PUT /api/vendors/{id}/
     */
    @PUT("vendors/{id}/")
    suspend fun updateVendor(
        @Path("id") id: Int,
        @Body vendor: CreateVendorRequest
    ): Vendor
    
    /**
     * Partial update vendor
     * PATCH /api/vendors/{id}/
     */
    @PATCH("vendors/{id}/")
    suspend fun patchVendor(
        @Path("id") id: Int,
        @Body updates: Map<String, Any>
    ): Vendor
    
    /**
     * Delete vendor
     * DELETE /api/vendors/{id}/
     */
    @DELETE("vendors/{id}/")
    suspend fun deleteVendor(@Path("id") id: Int)
    
    /**
     * Get vendor statistics
     * GET /api/vendors/stats/
     */
    @GET("vendors/stats/")
    suspend fun getVendorStats(
        @Query("vendor_type") vendorType: String? = null,
        @Query("status") status: String? = null
    ): VendorStats
}
