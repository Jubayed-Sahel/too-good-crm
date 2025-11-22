package too.good.crm.features.deals

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import too.good.crm.data.NetworkResult
import too.good.crm.data.model.*
import too.good.crm.data.repository.DealRepository

/**
 * ViewModel for Deals Screen
 * Manages deal pipeline and stages
 */
class DealsViewModel : ViewModel() {
    private val repository = DealRepository()
    
    private val _uiState = MutableStateFlow(DealsUiState())
    val uiState: StateFlow<DealsUiState> = _uiState.asStateFlow()
    
    init {
        loadDeals()
        loadPipelines()
    }
    
    /**
     * Load all deals
     */
    fun loadDeals(refresh: Boolean = false) {
        viewModelScope.launch {
            if (refresh) {
                _uiState.value = _uiState.value.copy(isRefreshing = true)
            } else {
                _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            }
            
            when (val result = repository.getDeals(pageSize = 50)) {
                is NetworkResult.Success -> {
                    _uiState.value = _uiState.value.copy(
                        deals = result.data.results,
                        totalCount = result.data.count,
                        isLoading = false,
                        isRefreshing = false,
                        error = null
                    )
                }
                is NetworkResult.Error -> {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        isRefreshing = false,
                        error = result.message
                    )
                }
                is NetworkResult.Exception -> {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        isRefreshing = false,
                        error = result.exception.message ?: "Unknown error occurred"
                    )
                }
            }
        }
    }
    
    /**
     * Load pipelines
     */
    fun loadPipelines() {
        viewModelScope.launch {
            when (val result = repository.getPipelines()) {
                is NetworkResult.Success -> {
                    _uiState.value = _uiState.value.copy(pipelines = result.data)
                    // Load default pipeline stages
                    result.data.firstOrNull { it.isDefault }?.let { pipeline ->
                        loadPipelineStages(pipeline.id)
                    }
                }
                is NetworkResult.Error -> {
                    // Silently fail pipeline loading
                }
                is NetworkResult.Exception -> {
                    // Silently fail pipeline loading
                }
            }
        }
    }
    
    /**
     * Load pipeline stages
     */
    fun loadPipelineStages(pipelineId: Int) {
        viewModelScope.launch {
            when (val result = repository.getPipelineStages(pipelineId)) {
                is NetworkResult.Success -> {
                    _uiState.value = _uiState.value.copy(stages = result.data)
                }
                is NetworkResult.Error -> {
                    // Silently fail stages loading
                }
                is NetworkResult.Exception -> {
                    // Silently fail stages loading
                }
            }
        }
    }
    
    /**
     * Filter deals by stage
     */
    fun filterByStage(stage: String?) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null, selectedStage = stage)
            
            val stageId = _uiState.value.stages.find { it.name.equals(stage, ignoreCase = true) }?.id
            
            when (val result = repository.getDeals(stage = stageId, pageSize = 50)) {
                is NetworkResult.Success -> {
                    _uiState.value = _uiState.value.copy(
                        deals = result.data.results,
                        totalCount = result.data.count,
                        isLoading = false,
                        error = null
                    )
                }
                is NetworkResult.Error -> {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = result.message
                    )
                }
                is NetworkResult.Exception -> {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = result.exception.message ?: "Unknown error occurred"
                    )
                }
            }
        }
    }
    
    /**
     * Filter deals by status
     */
    fun filterByStatus(status: String?) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null, selectedStatus = status)
            
            when (val result = repository.getDeals(status = status, pageSize = 50)) {
                is NetworkResult.Success -> {
                    _uiState.value = _uiState.value.copy(
                        deals = result.data.results,
                        totalCount = result.data.count,
                        isLoading = false,
                        error = null
                    )
                }
                is NetworkResult.Error -> {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = result.message
                    )
                }
                is NetworkResult.Exception -> {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = result.exception.message ?: "Unknown error occurred"
                    )
                }
            }
        }
    }
    
    /**
     * Search deals
     */
    fun searchDeals(query: String) {
        if (query.isBlank()) {
            loadDeals()
            return
        }
        
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null, searchQuery = query)
            
            when (val result = repository.searchDeals(query)) {
                is NetworkResult.Success -> {
                    _uiState.value = _uiState.value.copy(
                        deals = result.data.results,
                        totalCount = result.data.count,
                        isLoading = false,
                        error = null
                    )
                }
                is NetworkResult.Error -> {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = result.message
                    )
                }
                is NetworkResult.Exception -> {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = result.exception.message ?: "Unknown error occurred"
                    )
                }
            }
        }
    }
    
    /**
     * Create new deal
     */
    fun createDeal(deal: CreateDealRequest, onSuccess: () -> Unit) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isCreating = true, error = null)
            
            when (val result = repository.createDeal(deal)) {
                is NetworkResult.Success -> {
                    _uiState.value = _uiState.value.copy(isCreating = false, error = null)
                    loadDeals(refresh = true)
                    onSuccess()
                }
                is NetworkResult.Error -> {
                    _uiState.value = _uiState.value.copy(
                        isCreating = false,
                        error = result.message
                    )
                }
                is NetworkResult.Exception -> {
                    _uiState.value = _uiState.value.copy(
                        isCreating = false,
                        error = result.exception.message ?: "Failed to create deal"
                    )
                }
            }
        }
    }
    
    /**
     * Win deal
     */
    fun winDeal(dealId: Int, onSuccess: () -> Unit) {
        viewModelScope.launch {
            when (val result = repository.winDeal(dealId)) {
                is NetworkResult.Success -> {
                    loadDeals(refresh = true)
                    onSuccess()
                }
                is NetworkResult.Error -> {
                    _uiState.value = _uiState.value.copy(error = result.message)
                }
                is NetworkResult.Exception -> {
                    _uiState.value = _uiState.value.copy(
                        error = result.exception.message ?: "Failed to win deal"
                    )
                }
            }
        }
    }
    
    /**
     * Lose deal
     */
    fun loseDeal(dealId: Int, lossReason: String?, onSuccess: () -> Unit) {
        viewModelScope.launch {
            when (val result = repository.loseDeal(dealId, lossReason)) {
                is NetworkResult.Success -> {
                    loadDeals(refresh = true)
                    onSuccess()
                }
                is NetworkResult.Error -> {
                    _uiState.value = _uiState.value.copy(error = result.message)
                }
                is NetworkResult.Exception -> {
                    _uiState.value = _uiState.value.copy(
                        error = result.exception.message ?: "Failed to mark deal as lost"
                    )
                }
            }
        }
    }
    
    /**
     * Move deal to different stage
     */
    fun moveDealStage(dealId: Int, stageId: Int, onSuccess: () -> Unit) {
        viewModelScope.launch {
            when (val result = repository.moveDealStage(dealId, stageId)) {
                is NetworkResult.Success -> {
                    loadDeals(refresh = true)
                    onSuccess()
                }
                is NetworkResult.Error -> {
                    _uiState.value = _uiState.value.copy(error = result.message)
                }
                is NetworkResult.Exception -> {
                    _uiState.value = _uiState.value.copy(
                        error = result.exception.message ?: "Failed to move deal"
                    )
                }
            }
        }
    }
    
    /**
     * Delete deal
     */
    fun deleteDeal(dealId: Int, onSuccess: () -> Unit) {
        viewModelScope.launch {
            when (val result = repository.deleteDeal(dealId)) {
                is NetworkResult.Success -> {
                    loadDeals(refresh = true)
                    onSuccess()
                }
                is NetworkResult.Error -> {
                    _uiState.value = _uiState.value.copy(error = result.message)
                }
                is NetworkResult.Exception -> {
                    _uiState.value = _uiState.value.copy(
                        error = result.exception.message ?: "Failed to delete deal"
                    )
                }
            }
        }
    }
    
    /**
     * Clear error message
     */
    fun clearError() {
        _uiState.value = _uiState.value.copy(error = null)
    }
    
    /**
     * Refresh deals
     */
    fun refresh() {
        loadDeals(refresh = true)
    }
}

/**
 * UI State for Deals Screen
 */
data class DealsUiState(
    val deals: List<DealListItem> = emptyList(),
    val pipelines: List<Pipeline> = emptyList(),
    val stages: List<PipelineStage> = emptyList(),
    val totalCount: Int = 0,
    val isLoading: Boolean = false,
    val isRefreshing: Boolean = false,
    val isCreating: Boolean = false,
    val error: String? = null,
    val searchQuery: String = "",
    val selectedStage: String? = null,
    val selectedStatus: String? = null,
    val selectedPriority: String? = null
)

