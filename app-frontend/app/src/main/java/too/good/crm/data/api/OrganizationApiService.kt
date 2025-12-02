package too.good.crm.data.api

import retrofit2.Response
import retrofit2.http.*
import too.good.crm.data.model.Organization
import too.good.crm.data.model.OrganizationListResponse

/**
 * API Service for Organization operations
 * Backend: crmApp/views/organizations.py
 * Base path: /api/organizations/
 */
interface OrganizationApiService {
    
    /**
     * Get all organizations (filtered by user membership)
     * GET /api/organizations/
     */
    @GET("organizations/")
    suspend fun getAllOrganizations(
        @Query("page") page: Int? = null,
        @Query("page_size") pageSize: Int? = null,
        @Query("search") search: String? = null
    ): Response<OrganizationListResponse>
    
    /**
     * Get all organizations in database (for customers raising issues)
     * GET /api/organizations/all_organizations/
     * Returns all organizations for customers, filtered for other profile types
     */
    @GET("organizations/all_organizations/")
    suspend fun getAllOrganizationsForIssues(): Response<List<Organization>>
    
    /**
     * Get single organization
     * GET /api/organizations/{id}/
     */
    @GET("organizations/{id}/")
    suspend fun getOrganization(
        @Path("id") id: Int
    ): Response<Organization>
    
    /**
     * Get organizations for current user (customer)
     * GET /api/client/organizations/
     * Returns organizations the customer belongs to via CustomerOrganization
     */
    @GET("client/organizations/")
    suspend fun getCustomerOrganizations(): Response<List<Organization>>
}
