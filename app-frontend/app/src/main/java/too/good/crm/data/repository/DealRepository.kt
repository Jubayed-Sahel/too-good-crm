package too.good.crm.data.repository

import too.good.crm.data.NetworkResult
import too.good.crm.data.api.ApiClient
import too.good.crm.data.model.*
import too.good.crm.data.safeApiCall

/**
 * Deal Repository
 * Handles all deal-related data operations
 */
class DealRepository {
    private val apiService = ApiClient.dealApiService
    
    /**
     * Get all deals with optional filters
     */
    suspend fun getDeals(
        page: Int? = null,
        pageSize: Int? = 20,
        status: String? = null,
        stage: Int? = null,
        priority: String? = null,
        assignedTo: Int? = null,
        customer: Int? = null,
        isWon: Boolean? = null,
        isLost: Boolean? = null,
        search: String? = null,
        ordering: String? = "-created_at"
    ): NetworkResult<DealsListResponse> = safeApiCall {
        apiService.getDeals(
            page = page,
            pageSize = pageSize,
            status = status,
            stage = stage,
            priority = priority,
            assignedTo = assignedTo,
            customer = customer,
            isWon = isWon,
            isLost = isLost,
            search = search,
            ordering = ordering
        )
    }
    
    /**
     * Get single deal by ID
     */
    suspend fun getDeal(id: Int): NetworkResult<Deal> = safeApiCall {
        apiService.getDeal(id)
    }
    
    /**
     * Create new deal
     */
    suspend fun createDeal(deal: CreateDealRequest): NetworkResult<Deal> {
        android.util.Log.d("DealRepository", "📤 POST /api/deals/")
        android.util.Log.d("DealRepository", "Request body: $deal")
        
        return safeApiCall {
            val result = apiService.createDeal(deal)
            android.util.Log.d("DealRepository", "✅ Deal created: ${result.id} - ${result.title}")
            result
        }
    }
    
    /**
     * Update existing deal
     */
    suspend fun updateDeal(id: Int, deal: CreateDealRequest): NetworkResult<Deal> = safeApiCall {
        apiService.updateDeal(id, deal)
    }
    
    /**
     * Partial update deal
     */
    suspend fun patchDeal(id: Int, updates: Map<String, Any>): NetworkResult<Deal> = safeApiCall {
        apiService.patchDeal(id, updates)
    }
    
    /**
     * Delete deal
     */
    suspend fun deleteDeal(id: Int): NetworkResult<Unit> = safeApiCall {
        apiService.deleteDeal(id)
    }
    
    /**
     * Mark deal as won
     */
    suspend fun winDeal(id: Int): NetworkResult<Deal> = safeApiCall {
        apiService.markDealWon(id)
    }
    
    /**
     * Mark deal as lost
     */
    suspend fun loseDeal(id: Int, lossReason: String? = null): NetworkResult<Deal> = safeApiCall {
        val body = lossReason?.let { mapOf("lost_reason" to it) }
        apiService.markDealLost(id, body)
    }
    
    /**
     * Get deals for a specific customer
     */
    suspend fun getCustomerDeals(customerId: Int): NetworkResult<DealsListResponse> = safeApiCall {
        apiService.getDeals(customer = customerId, pageSize = 100)
    }
    
    /**
     * Reopen closed deal
     */
    suspend fun reopenDeal(id: Int): NetworkResult<Deal> = safeApiCall {
        apiService.reopenDeal(id)
    }
    
    /**
     * Move deal to different stage
     */
    suspend fun moveDealStage(id: Int, stageId: Int): NetworkResult<Deal> = safeApiCall {
        apiService.moveDealStage(id, mapOf("stage_id" to stageId))
    }
    
    /**
     * Get all pipelines
     */
    suspend fun getPipelines(): NetworkResult<List<Pipeline>> = safeApiCall {
        apiService.getPipelines().results
    }
    
    /**
     * Get single pipeline with stages
     */
    suspend fun getPipeline(id: Int): NetworkResult<Pipeline> = safeApiCall {
        apiService.getPipeline(id)
    }
    
    /**
     * Get default pipeline (filter by is_default)
     */
    suspend fun getDefaultPipeline(): NetworkResult<Pipeline?> {
        return when (val result = getPipelines()) {
            is NetworkResult.Success -> {
                val defaultPipeline = result.data.firstOrNull { it.isDefault }
                if (defaultPipeline != null) {
                    NetworkResult.Success(defaultPipeline)
                } else {
                    NetworkResult.Error("No default pipeline found")
                }
            }
            is NetworkResult.Error -> NetworkResult.Error(result.message)
            is NetworkResult.Exception -> NetworkResult.Exception(result.exception)
        }
    }
    
    /**
     * Get pipeline stages
     */
    suspend fun getPipelineStages(pipelineId: Int): NetworkResult<List<PipelineStage>> = safeApiCall {
        apiService.getPipelineStages(pipelineId)
    }
    
    /**
     * Get open deals
     */
    suspend fun getOpenDeals(): NetworkResult<DealsListResponse> {
        return getDeals(status = "open")
    }
    
    /**
     * Get won deals
     */
    suspend fun getWonDeals(): NetworkResult<DealsListResponse> {
        return getDeals(isWon = true)
    }
    
    /**
     * Get my assigned deals
     */
    suspend fun getMyDeals(employeeId: Int): NetworkResult<DealsListResponse> {
        return getDeals(assignedTo = employeeId)
    }
    
    /**
     * Search deals
     */
    suspend fun searchDeals(query: String): NetworkResult<DealsListResponse> {
        return getDeals(search = query)
    }
}

