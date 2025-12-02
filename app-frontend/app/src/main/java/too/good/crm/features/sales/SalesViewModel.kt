package too.good.crm.features.sales

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
 * ViewModel for Sales Screen
 * Manages deals list and pipeline stages for sales overview
 * Matches web frontend: web-frontend/src/hooks/useSalesPage.ts
 */
class SalesViewModel : ViewModel() {
    private val repository = DealRepository()
    
    private val _uiState = MutableStateFlow(SalesUiState())
    val uiState: StateFlow<SalesUiState> = _uiState.asStateFlow()
    
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
            
            when (val result = repository.getDeals(pageSize = 100)) {
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
     * Load pipelines and stages
     */
    fun loadPipelines() {
        viewModelScope.launch {
            android.util.Log.d("SalesViewModel", "📥 Loading pipelines...")
            when (val result = repository.getPipelines()) {
                is NetworkResult.Success -> {
                    val pipelines = result.data
                    android.util.Log.d("SalesViewModel", "✅ Loaded ${pipelines.size} pipelines")
                    _uiState.value = _uiState.value.copy(pipelines = pipelines)
                    
                    // Load default pipeline stages
                    val defaultPipeline = pipelines.firstOrNull { it.isDefault } ?: pipelines.firstOrNull()
                    android.util.Log.d("SalesViewModel", "Default pipeline: ${defaultPipeline?.name} (ID: ${defaultPipeline?.id})")
                    defaultPipeline?.let { pipeline ->
                        loadPipelineStages(pipeline.id)
                    }
                }
                is NetworkResult.Error -> {
                    android.util.Log.e("SalesViewModel", "❌ Error loading pipelines: ${result.message}")
                    // Silently fail - stages will be empty
                }
                is NetworkResult.Exception -> {
                    android.util.Log.e("SalesViewModel", "❌ Exception loading pipelines: ${result.exception.message}")
                    // Silently fail - stages will be empty
                }
            }
        }
    }
    
    /**
     * Load pipeline stages
     */
    fun loadPipelineStages(pipelineId: Int) {
        viewModelScope.launch {
            android.util.Log.d("SalesViewModel", "📥 Loading stages for pipeline $pipelineId...")
            when (val result = repository.getPipelineStages(pipelineId)) {
                is NetworkResult.Success -> {
                    android.util.Log.d("SalesViewModel", "✅ Loaded ${result.data.size} stages")
                    result.data.forEach { stage ->
                        android.util.Log.d("SalesViewModel", "  - Stage: ${stage.name} (ID: ${stage.id})")
                    }
                    _uiState.value = _uiState.value.copy(stages = result.data)
                }
                is NetworkResult.Error -> {
                    android.util.Log.e("SalesViewModel", "❌ Error loading stages: ${result.message}")
                    // Silently fail
                }
                is NetworkResult.Exception -> {
                    android.util.Log.e("SalesViewModel", "❌ Exception loading stages: ${result.exception.message}")
                    // Silently fail
                }
            }
        }
    }
    
    /**
     * Move deal to different stage
     * Matches web frontend: dealService.moveStage(dealId, { stage: stageId })
     */
    fun moveDealToStage(dealId: Int, stageId: Int, onSuccess: () -> Unit) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isMovingDeal = true, error = null)
            
            when (val result = repository.moveDealStage(dealId, stageId)) {
                is NetworkResult.Success -> {
                    // Reload deals to get updated stage
                    loadDeals(refresh = true)
                    _uiState.value = _uiState.value.copy(isMovingDeal = false)
                    onSuccess()
                }
                is NetworkResult.Error -> {
                    _uiState.value = _uiState.value.copy(
                        isMovingDeal = false,
                        error = result.message
                    )
                }
                is NetworkResult.Exception -> {
                    _uiState.value = _uiState.value.copy(
                        isMovingDeal = false,
                        error = result.exception.message ?: "Failed to move deal"
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
    fun createDeal(deal: too.good.crm.data.model.CreateDealRequest, onSuccess: () -> Unit) {
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
 * UI State for Sales Screen
 */
data class SalesUiState(
    val deals: List<DealListItem> = emptyList(),
    val pipelines: List<Pipeline> = emptyList(),
    val stages: List<PipelineStage> = emptyList(),
    val totalCount: Int = 0,
    val isLoading: Boolean = false,
    val isRefreshing: Boolean = false,
    val isMovingDeal: Boolean = false,
    val isCreating: Boolean = false,
    val error: String? = null,
    val searchQuery: String = ""
)
