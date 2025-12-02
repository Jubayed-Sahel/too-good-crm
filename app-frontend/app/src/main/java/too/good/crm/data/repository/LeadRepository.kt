package too.good.crm.data.repository

import too.good.crm.data.NetworkResult
import too.good.crm.data.api.ApiClient
import too.good.crm.data.model.*
import too.good.crm.data.safeApiCall

/**
 * Lead Repository
 * Handles all lead-related data operations
 * Following Android best practices for repository pattern
 */
class LeadRepository {
    private val apiService = ApiClient.leadApiService
    
    /**
     * Get all leads with optional filters
     */
    suspend fun getLeads(
        page: Int? = null,
        pageSize: Int? = 20,
        status: String? = null,
        source: String? = null,
        qualificationStatus: String? = null,
        assignedTo: Int? = null,
        isConverted: Boolean? = null,
        search: String? = null,
        ordering: String? = "-created_at" // Default: newest first
    ): NetworkResult<LeadsListResponse> = safeApiCall {
        apiService.getLeads(
            page = page,
            pageSize = pageSize,
            status = status,
            source = source,
            qualificationStatus = qualificationStatus,
            assignedTo = assignedTo,
            isConverted = isConverted,
            search = search,
            ordering = ordering
        )
    }
    
    /**
     * Get single lead by ID
     */
    suspend fun getLead(id: Int): NetworkResult<Lead> = safeApiCall {
        apiService.getLead(id)
    }
    
    /**
     * Create new lead
     */
    suspend fun createLead(lead: CreateLeadRequest): NetworkResult<Lead> = safeApiCall {
        apiService.createLead(lead)
    }
    
    /**
     * Update existing lead
     */
    suspend fun updateLead(id: Int, lead: CreateLeadRequest): NetworkResult<Lead> = safeApiCall {
        apiService.updateLead(id, lead)
    }
    
    /**
     * Partial update lead
     */
    suspend fun patchLead(id: Int, updates: Map<String, Any>): NetworkResult<Lead> = safeApiCall {
        apiService.patchLead(id, updates)
    }
    
    /**
     * Delete lead
     */
    suspend fun deleteLead(id: Int): NetworkResult<Unit> = safeApiCall {
        apiService.deleteLead(id)
    }
    
    /**
     * Convert lead to customer
     */
    suspend fun convertLead(id: Int): NetworkResult<Lead> = safeApiCall {
        apiService.convertLead(id)
    }
    
    /**
     * Assign lead to employee
     */
    suspend fun assignLead(id: Int, employeeId: Int): NetworkResult<Lead> = safeApiCall {
        apiService.assignLead(id, mapOf("employee_id" to employeeId))
    }
    
    /**
     * Move lead to different stage
     */
    suspend fun moveLeadStage(
        id: Int,
        stageId: Int?,
        stageKey: String? = null,
        stageName: String? = null,
        notes: String? = null
    ): NetworkResult<Lead> = safeApiCall {
        val body = mutableMapOf<String, @JvmSuppressWildcards Any>()
        // Only send stage_id if it's valid (not null and > 0)
        if (stageId != null && stageId > 0) {
            body["stage_id"] = stageId
        } else {
            // Don't send stage_id at all - let backend use stage_key and stage_name
            body["stage_id"] = 0
        }
        // Always send stage_key and stage_name to help backend find the right stage
        stageKey?.let { body["stage_key"] = it }
        stageName?.let { body["stage_name"] = it }
        notes?.let { body["notes"] = it }
        apiService.moveLeadStage(id, body)
    }
    
    /**
     * Get leads by status
     */
    suspend fun getLeadsByStatus(status: String): NetworkResult<LeadsListResponse> {
        return getLeads(status = status)
    }
    
    /**
     * Get my assigned leads
     */
    suspend fun getMyLeads(employeeId: Int): NetworkResult<LeadsListResponse> {
        return getLeads(assignedTo = employeeId)
    }
    
    /**
     * Search leads
     */
    suspend fun searchLeads(query: String): NetworkResult<LeadsListResponse> {
        return getLeads(search = query)
    }
}

