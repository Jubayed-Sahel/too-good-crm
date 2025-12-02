package too.good.crm.features.sales

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import too.good.crm.data.NetworkResult
import too.good.crm.data.model.*
import too.good.crm.data.repository.DealRepository
import too.good.crm.data.repository.LeadRepository
import too.good.crm.data.repository.CustomerRepository
import too.good.crm.ui.theme.DesignTokens

/**
 * ViewModel for Sales Pipeline Screen
 * 
 * Features:
 * - Manages deals and leads grouped by pipeline stage
 * - Handles drag and drop between stages
 * - Automatically converts leads to customers when moved to "Closed Won"
 * - Calculates pipeline statistics
 * 
 * Matches web frontend: web-frontend/src/features/deals/pages/SalesPage.tsx
 */
class SalesPipelineViewModel : ViewModel() {
    private val dealRepository = DealRepository()
    private val leadRepository = LeadRepository()
    private val customerRepository = CustomerRepository()
    
    private val _uiState = MutableStateFlow(SalesPipelineUiState())
    val uiState: StateFlow<SalesPipelineUiState> = _uiState.asStateFlow()
    
    init {
        loadAll()
    }
    
    /**
     * Load all data (deals, leads, pipelines)
     */
    fun loadAll() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            
            // Load pipelines and stages first
            loadPipelines()
            
            // Then load deals and leads
            loadDeals()
            loadLeads()
            
            _uiState.value = _uiState.value.copy(isLoading = false)
        }
    }
    
    /**
     * Load pipelines and stages
     */
    private suspend fun loadPipelines() {
        android.util.Log.d("SalesPipelineVM", "loadPipelines() started")
        when (val result = dealRepository.getPipelines()) {
            is NetworkResult.Success -> {
                val pipelines = result.data
                android.util.Log.d("SalesPipelineVM", "Loaded ${pipelines.size} pipelines")
                val defaultPipeline = pipelines.firstOrNull { it.isDefault } ?: pipelines.firstOrNull()
                
                if (defaultPipeline != null) {
                    android.util.Log.d("SalesPipelineVM", "Found default pipeline: ${defaultPipeline.name} (ID: ${defaultPipeline.id})")
                    loadPipelineStages(defaultPipeline.id)
                } else {
                    // No pipelines found, use default stages
                    android.util.Log.w("SalesPipelineVM", "No pipelines found, using default stages")
                    _uiState.value = _uiState.value.copy(stages = getDefaultStages())
                }
            }
            is NetworkResult.Error -> {
                android.util.Log.e("SalesPipelineVM", "Error loading pipelines: ${result.message}")
                // Use default stages on error
                _uiState.value = _uiState.value.copy(stages = getDefaultStages())
            }
            is NetworkResult.Exception -> {
                android.util.Log.e("SalesPipelineVM", "Exception loading pipelines: ${result.exception.message}")
                // Use default stages on exception
                _uiState.value = _uiState.value.copy(stages = getDefaultStages())
            }
        }
        android.util.Log.d("SalesPipelineVM", "loadPipelines() finished, pipelineStages count: ${_uiState.value.pipelineStages.size}")
    }
    
    /**
     * Load pipeline stages and create stage configurations
     */
    private suspend fun loadPipelineStages(pipelineId: Int) {
        android.util.Log.d("SalesPipelineVM", "Loading stages for pipeline: $pipelineId")
        when (val result = dealRepository.getPipelineStages(pipelineId)) {
            is NetworkResult.Success -> {
                val backendStages = result.data
                
                android.util.Log.d("SalesPipelineVM", "Loaded ${backendStages.size} backend stages")
                backendStages.forEach { stage ->
                    android.util.Log.d("SalesPipelineVM", "Backend stage: ${stage.name} (id=${stage.id})")
                }
                
                // Map backend stages to frontend stage configs
                val stages = mapBackendStagesToFrontend(backendStages)
                
                android.util.Log.d("SalesPipelineVM", "Mapped to ${stages.size} frontend stages")
                stages.forEach { stage ->
                    android.util.Log.d("SalesPipelineVM", "Frontend stage: ${stage.label} (key=${stage.key}, id=${stage.id})")
                }
                
                _uiState.value = _uiState.value.copy(
                    stages = stages,
                    pipelineStages = backendStages
                )
            }
            is NetworkResult.Error -> {
                android.util.Log.e("SalesPipelineVM", "Error loading stages: ${result.message}")
                // Use default stages if backend fails
                _uiState.value = _uiState.value.copy(stages = getDefaultStages())
            }
            is NetworkResult.Exception -> {
                android.util.Log.e("SalesPipelineVM", "Exception loading stages: ${result.exception.message}")
                // Use default stages if backend fails
                _uiState.value = _uiState.value.copy(stages = getDefaultStages())
            }
        }
    }
    
    /**
     * Map backend pipeline stages to frontend stage configurations
     */
    private fun mapBackendStagesToFrontend(backendStages: List<PipelineStage>): List<StageConfig> {
        val defaultStages = getDefaultStages()
        
        // Create a map to match backend stages with frontend stages
        return backendStages.mapNotNull { backendStage ->
            val stageName = backendStage.name.lowercase().trim()
            
            // Find matching default stage
            val matchedStage = defaultStages.find { defaultStage ->
                stageName.contains(defaultStage.key) ||
                defaultStage.key.contains(stageName) ||
                stageName.contains(defaultStage.label.lowercase()) ||
                defaultStage.label.lowercase().contains(stageName)
            } ?: defaultStages.firstOrNull() // Fallback to first stage
            
            matchedStage?.copy(
                id = backendStage.id,
                label = backendStage.name
            )
        }.ifEmpty { defaultStages } // Use default stages if mapping fails
    }
    
    /**
     * Get default stage configurations
     */
    private fun getDefaultStages(): List<StageConfig> {
        return listOf(
            StageConfig(
                key = "lead",
                label = "Lead",
                color = Color(0xFF2196F3), // Blue
                icon = Icons.Default.TrendingUp
            ),
            StageConfig(
                key = "qualified",
                label = "Qualified",
                color = Color(0xFF00BCD4), // Cyan
                icon = Icons.Default.CheckCircle
            ),
            StageConfig(
                key = "proposal",
                label = "Proposal",
                color = Color(0xFF9C27B0), // Purple
                icon = Icons.Default.Description
            ),
            StageConfig(
                key = "negotiation",
                label = "Negotiation",
                color = Color(0xFFFF9800), // Orange
                icon = Icons.Default.Handshake
            ),
            StageConfig(
                key = "closed-won",
                label = "Closed Won",
                color = Color(0xFF4CAF50), // Green
                icon = Icons.Default.EmojiEvents
            )
        )
    }
    
    /**
     * Load all deals
     */
    private suspend fun loadDeals() {
        when (val result = dealRepository.getDeals(pageSize = 100)) {
            is NetworkResult.Success -> {
                val deals = result.data.results
                val grouped = groupDealsByStage(deals)
                
                android.util.Log.d("SalesPipelineVM", "Loaded ${deals.size} deals")
                android.util.Log.d("SalesPipelineVM", "Grouped deals: ${grouped.keys}")
                
                _uiState.value = _uiState.value.copy(
                    deals = deals,
                    dealsGroupedByStage = grouped
                )
                
                calculateStatistics()
            }
            is NetworkResult.Error -> {
                android.util.Log.e("SalesPipelineVM", "Error loading deals: ${result.message}")
                _uiState.value = _uiState.value.copy(error = result.message)
                calculateStatistics() // Still calculate with empty data
            }
            is NetworkResult.Exception -> {
                android.util.Log.e("SalesPipelineVM", "Exception loading deals: ${result.exception.message}")
                _uiState.value = _uiState.value.copy(
                    error = result.exception.message ?: "Failed to load deals"
                )
                calculateStatistics() // Still calculate with empty data
            }
        }
    }
    
    /**
     * Load all leads
     */
    private suspend fun loadLeads() {
        when (val result = leadRepository.getLeads(pageSize = 100)) {
            is NetworkResult.Success -> {
                val leads = result.data.results
                val grouped = groupLeadsByStage(leads)
                
                android.util.Log.d("SalesPipelineVM", "Loaded ${leads.size} leads")
                android.util.Log.d("SalesPipelineVM", "Grouped leads: ${grouped.keys}")
                
                _uiState.value = _uiState.value.copy(
                    leads = leads,
                    leadsGroupedByStage = grouped
                )
                
                calculateStatistics()
            }
            is NetworkResult.Error -> {
                android.util.Log.e("SalesPipelineVM", "Error loading leads: ${result.message}")
                _uiState.value = _uiState.value.copy(error = result.message)
                calculateStatistics() // Still calculate with empty data
            }
            is NetworkResult.Exception -> {
                android.util.Log.e("SalesPipelineVM", "Exception loading leads: ${result.exception.message}")
                _uiState.value = _uiState.value.copy(
                    error = result.exception.message ?: "Failed to load leads"
                )
                calculateStatistics() // Still calculate with empty data
            }
        }
    }
    
    /**
     * Group deals by stage key
     */
    private fun groupDealsByStage(deals: List<DealListItem>): Map<String, List<DealListItem>> {
        return deals.groupBy { deal ->
            // Map deal stage to stage key
            val stage = deal.stage.lowercase()
            when {
                stage.contains("lead") || stage == "new" -> "lead"
                stage.contains("qualified") -> "qualified"
                stage.contains("proposal") -> "proposal"
                stage.contains("negotiation") -> "negotiation"
                stage.contains("won") || stage.contains("closed-won") -> "closed-won"
                stage.contains("lost") || stage.contains("closed-lost") -> "closed-lost"
                else -> "lead"
            }
        }
    }
    
    /**
     * Group leads by stage key
     */
    private fun groupLeadsByStage(leads: List<LeadListItem>): Map<String, List<LeadListItem>> {
        return leads.groupBy { lead ->
            // Use stage name if available, otherwise default to "lead"
            val stageName = lead.stageName?.lowercase()?.trim() ?: "lead"
            
            when {
                stageName.contains("lead") || stageName == "new" -> "lead"
                stageName.contains("qualified") -> "qualified"
                stageName.contains("proposal") -> "proposal"
                stageName.contains("negotiation") -> "negotiation"
                stageName.contains("won") || stageName.contains("closed-won") -> "closed-won"
                stageName.contains("lost") || stageName.contains("closed-lost") -> "closed-lost"
                else -> "lead"
            }
        }
    }
    
    /**
     * Calculate pipeline statistics
     */
    private fun calculateStatistics() {
        val state = _uiState.value
        
        // Calculate pipeline value (all deals + all leads)
        val dealsValue = state.deals.sumOf { it.value.toDoubleOrNull() ?: 0.0 }
        val leadsValue = state.leads.sumOf { it.estimatedValue?.toDoubleOrNull() ?: 0.0 }
        val pipelineValue = dealsValue + leadsValue
        
        // Count open deals (not closed-won or closed-lost)
        val openDealsCount = state.deals.count { 
            it.stage != "closed-won" && it.stage != "closed-lost" 
        }
        
        // Count won deals
        val wonDealsCount = state.deals.count { it.stage == "closed-won" }
        
        // Calculate won value
        val wonValue = state.deals
            .filter { it.stage == "closed-won" }
            .sumOf { it.value.toDoubleOrNull() ?: 0.0 }
        
        // Calculate win rate
        val totalClosedDeals = state.deals.count { 
            it.stage == "closed-won" || it.stage == "closed-lost" 
        }
        val winRate = if (totalClosedDeals > 0) {
            ((wonDealsCount.toDouble() / totalClosedDeals.toDouble()) * 100).toInt()
        } else {
            0
        }
        
        _uiState.value = state.copy(
            pipelineValue = pipelineValue,
            openDealsCount = openDealsCount,
            wonDealsCount = wonDealsCount,
            wonValue = wonValue,
            winRate = winRate,
            totalDealsCount = state.deals.size,
            totalLeadsCount = state.leads.size
        )
    }
    
    /**
     * Move deal to different stage
     */
    fun moveDealToStage(
        dealId: Int,
        stageId: Int,
        stageKey: String,
        onSuccess: () -> Unit
    ) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isMoving = true, error = null)
            
            when (val result = dealRepository.moveDealStage(dealId, stageId)) {
                is NetworkResult.Success -> {
                    // Reload deals to reflect the change
                    loadDeals()
                    _uiState.value = _uiState.value.copy(isMoving = false)
                    onSuccess()
                }
                is NetworkResult.Error -> {
                    _uiState.value = _uiState.value.copy(
                        isMoving = false,
                        error = result.message
                    )
                }
                is NetworkResult.Exception -> {
                    _uiState.value = _uiState.value.copy(
                        isMoving = false,
                        error = result.exception.message ?: "Failed to move deal"
                    )
                }
            }
        }
    }
    
    /**
     * Move lead to different stage
     * If moved to "Closed Won", automatically convert to customer
     */
    fun moveLeadToStage(
        leadId: Int,
        stageId: Int?,
        stageKey: String,
        stageName: String,
        onSuccess: () -> Unit
    ) {
        android.util.Log.d("SalesPipelineVM", "moveLeadToStage called: leadId=$leadId, stageId=$stageId, stageKey=$stageKey, stageName=$stageName")
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isMoving = true, error = null)
            
            // Try to find the actual stage ID from backend stages if not provided
            var actualStageId = stageId
            
            // If no stage ID and no pipeline stages loaded, fetch them now
            if ((actualStageId == null || actualStageId <= 0) && _uiState.value.pipelineStages.isEmpty()) {
                android.util.Log.w("SalesPipelineVM", "Pipeline stages not loaded, fetching now...")
                
                // Fetch pipelines - they include stages in the response
                when (val pipelineResult = dealRepository.getPipelines()) {
                    is NetworkResult.Success -> {
                        val pipelines = pipelineResult.data
                        android.util.Log.d("SalesPipelineVM", "Fetched ${pipelines.size} pipelines")
                        
                        val defaultPipeline = pipelines.firstOrNull { it.isDefault } ?: pipelines.firstOrNull()
                        
                        if (defaultPipeline != null) {
                            android.util.Log.d("SalesPipelineVM", "Default pipeline: ${defaultPipeline.name}, stages field: ${defaultPipeline.stages?.size ?: 0}")
                            
                            // Check if stages are embedded in the pipeline response
                            val stages = defaultPipeline.stages
                            if (stages != null && stages.isNotEmpty()) {
                                android.util.Log.d("SalesPipelineVM", "Using ${stages.size} stages from pipeline response")
                                stages.forEach { stage ->
                                    android.util.Log.d("SalesPipelineVM", "  Stage from pipeline: ${stage.name} (ID: ${stage.id})")
                                }
                                _uiState.value = _uiState.value.copy(pipelineStages = stages)
                                android.util.Log.d("SalesPipelineVM", "Updated pipelineStages, now has: ${_uiState.value.pipelineStages.size} stages")
                            } else {
                                android.util.Log.w("SalesPipelineVM", "Pipeline stages field is null or empty, fetching separately")
                                // Fallback: fetch stages separately
                                android.util.Log.d("SalesPipelineVM", "Fetching stages separately for pipeline ${defaultPipeline.id}")
                                when (val stagesResult = dealRepository.getPipelineStages(defaultPipeline.id)) {
                                    is NetworkResult.Success -> {
                                        val fetchedStages = stagesResult.data
                                        android.util.Log.d("SalesPipelineVM", "Fetched ${fetchedStages.size} stages separately")
                                        _uiState.value = _uiState.value.copy(pipelineStages = fetchedStages)
                                    }
                                    else -> {
                                        android.util.Log.e("SalesPipelineVM", "Failed to fetch pipeline stages")
                                    }
                                }
                            }
                        } else {
                            android.util.Log.e("SalesPipelineVM", "No default pipeline found")
                        }
                    }
                    else -> {
                        android.util.Log.e("SalesPipelineVM", "Failed to fetch pipelines: $pipelineResult")
                    }
                }
            } else {
                android.util.Log.d("SalesPipelineVM", "Pipeline stages already loaded or stage ID provided: stageId=$actualStageId, pipelineStages.size=${_uiState.value.pipelineStages.size}")
            }
            
            // Log available pipeline stages for debugging
            android.util.Log.d("SalesPipelineVM", "Available pipeline stages: ${_uiState.value.pipelineStages.size}")
            _uiState.value.pipelineStages.forEach { stage ->
                android.util.Log.d("SalesPipelineVM", "  - Stage: ${stage.name} (ID: ${stage.id})")
            }
            
            // Look up the stage ID from pipelineStages by name
            if (actualStageId == null || actualStageId <= 0) {
                val backendStage = _uiState.value.pipelineStages.find { 
                    it.name.equals(stageName, ignoreCase = true)
                }
                actualStageId = backendStage?.id
                android.util.Log.d("SalesPipelineVM", "Looked up stage ID: $actualStageId for stage name: '$stageName' (found: ${backendStage != null})")
                
                if (actualStageId == null) {
                    val availableStages = _uiState.value.pipelineStages.joinToString(", ") { "'${it.name}'" }
                    android.util.Log.e("SalesPipelineVM", "Failed to find stage ID for '$stageName'. Available stages: $availableStages")
                    
                    // Try fuzzy matching as fallback
                    val fuzzyMatch = _uiState.value.pipelineStages.find { 
                        it.name.contains(stageName, ignoreCase = true) || 
                        stageName.contains(it.name, ignoreCase = true)
                    }
                    
                    if (fuzzyMatch != null) {
                        android.util.Log.w("SalesPipelineVM", "Found fuzzy match: '${fuzzyMatch.name}' (ID: ${fuzzyMatch.id})")
                        actualStageId = fuzzyMatch.id
                    } else {
                        android.util.Log.e("SalesPipelineVM", "No fuzzy match found either. Cannot move lead without valid stage ID")
                        _uiState.value = _uiState.value.copy(
                            isMoving = false,
                            error = "Could not find stage '$stageName'. Available: $availableStages"
                        )
                        return@launch
                    }
                }
            }
            
            // First, move the lead to the new stage
            android.util.Log.d("SalesPipelineVM", "Calling leadRepository.moveLeadStage with stageId=$actualStageId, stageKey=$stageKey, stageName=$stageName")
            when (val moveResult = leadRepository.moveLeadStage(leadId, actualStageId, stageKey, stageName)) {
                is NetworkResult.Success -> {
                    val updatedLead = moveResult.data
                    android.util.Log.d("SalesPipelineVM", "✅ Lead moved successfully. is_converted=${updatedLead.isConverted}")
                    
                    // Reload leads to update the UI
                    loadLeads()
                    
                    // Check if moved to "Closed Won" stage
                    // The backend automatically creates a customer when moved to Closed Won
                    if (stageKey == "closed-won") {
                        android.util.Log.d("SalesPipelineVM", "🎉 Lead moved to Closed Won - Customer automatically created by backend")
                        
                        // Set a flag to show success message with customer info
                        _uiState.value = _uiState.value.copy(
                            isMoving = false,
                            showClosedWonSuccess = true,
                            lastConvertedLeadName = updatedLead.name
                        )
                    } else {
                        _uiState.value = _uiState.value.copy(isMoving = false)
                    }
                    
                    onSuccess()
                }
                is NetworkResult.Error -> {
                    android.util.Log.e("SalesPipelineVM", "❌ Error moving lead: ${moveResult.message}")
                    _uiState.value = _uiState.value.copy(
                        isMoving = false,
                        error = moveResult.message
                    )
                }
                is NetworkResult.Exception -> {
                    android.util.Log.e("SalesPipelineVM", "❌ Exception moving lead: ${moveResult.exception.message}")
                    _uiState.value = _uiState.value.copy(
                        isMoving = false,
                        error = moveResult.exception.message ?: "Failed to move lead"
                    )
                }
            }
        }
    }
    
    /**
     * Dismiss the closed won success message
     */
    fun dismissClosedWonSuccess() {
        _uiState.value = _uiState.value.copy(
            showClosedWonSuccess = false,
            lastConvertedLeadName = null
        )
    }
    
    /**
     * Search deals and leads
     */
    fun search(query: String) {
        if (query.isBlank()) {
            // Reset to show all items
            _uiState.value = _uiState.value.copy(
                dealsGroupedByStage = groupDealsByStage(_uiState.value.deals),
                leadsGroupedByStage = groupLeadsByStage(_uiState.value.leads)
            )
            return
        }
        
        val queryLower = query.lowercase()
        
        // Filter deals
        val filteredDeals = _uiState.value.deals.filter { deal ->
            deal.title.lowercase().contains(queryLower) ||
            deal.customerName?.lowercase()?.contains(queryLower) == true
        }
        
        // Filter leads
        val filteredLeads = _uiState.value.leads.filter { lead ->
            lead.name.lowercase().contains(queryLower) ||
            lead.email?.lowercase()?.contains(queryLower) == true ||
            lead.organizationName?.lowercase()?.contains(queryLower) == true
        }
        
        _uiState.value = _uiState.value.copy(
            dealsGroupedByStage = groupDealsByStage(filteredDeals),
            leadsGroupedByStage = groupLeadsByStage(filteredLeads)
        )
    }
    
    /**
     * Refresh all data
     */
    fun refresh() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isRefreshing = true)
            loadAll()
            _uiState.value = _uiState.value.copy(isRefreshing = false)
        }
    }
    
    /**
     * Clear error message
     */
    fun clearError() {
        _uiState.value = _uiState.value.copy(error = null)
    }
    

    
    /**
     * Create new lead
     */
    fun createLead(
        organizationId: Int?,
        formData: CreateLeadFormData,
        onSuccess: () -> Unit
    ) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isCreatingLead = true, error = null)
            
            val request = CreateLeadRequest(
                organization = organizationId,
                name = formData.name,
                organizationName = formData.company,
                jobTitle = formData.jobTitle,
                email = formData.email,
                phone = formData.phone,
                source = formData.source,
                estimatedValue = formData.estimatedValue,
                notes = formData.notes
            )
            
            when (val result = leadRepository.createLead(request)) {
                is NetworkResult.Success -> {
                    android.util.Log.d("SalesPipelineVM", "Lead created successfully")
                    // Reload leads to show the new one
                    loadLeads()
                    _uiState.value = _uiState.value.copy(isCreatingLead = false)
                    onSuccess()
                }
                is NetworkResult.Error -> {
                    android.util.Log.e("SalesPipelineVM", "Error creating lead: ${result.message}")
                    _uiState.value = _uiState.value.copy(
                        isCreatingLead = false,
                        error = result.message
                    )
                }
                is NetworkResult.Exception -> {
                    android.util.Log.e("SalesPipelineVM", "Exception creating lead: ${result.exception.message}")
                    _uiState.value = _uiState.value.copy(
                        isCreatingLead = false,
                        error = result.exception.message ?: "Failed to create lead"
                    )
                }
            }
        }
    }
}

/**
 * Stage Configuration
 */
data class StageConfig(
    val id: Int? = null,
    val key: String,
    val label: String,
    val color: Color,
    val icon: ImageVector
)

/**
 * UI State for Sales Pipeline Screen
 */
data class SalesPipelineUiState(
    val deals: List<DealListItem> = emptyList(),
    val leads: List<LeadListItem> = emptyList(),
    val stages: List<StageConfig> = emptyList(),
    val pipelineStages: List<PipelineStage> = emptyList(),
    val dealsGroupedByStage: Map<String, List<DealListItem>> = emptyMap(),
    val leadsGroupedByStage: Map<String, List<LeadListItem>> = emptyMap(),
    
    // Statistics
    val pipelineValue: Double = 0.0,
    val openDealsCount: Int = 0,
    val wonDealsCount: Int = 0,
    val wonValue: Double = 0.0,
    val winRate: Int = 0,
    val totalDealsCount: Int = 0,
    val totalLeadsCount: Int = 0,
    
    // UI State
    val isLoading: Boolean = false,
    val isRefreshing: Boolean = false,
    val isMoving: Boolean = false,
    val isCreatingLead: Boolean = false,
    val error: String? = null,
    
    // Conversion tracking - shows success message when lead converted to customer
    val showClosedWonSuccess: Boolean = false,
    val lastConvertedLeadName: String? = null
)
