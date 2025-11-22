package too.good.crm.features.dashboard

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import too.good.crm.data.NetworkResult
import too.good.crm.data.repository.DashboardStatsRepository

/**
 * UI State for Dashboard Screen
 */
data class DashboardUiState(
    val stats: Map<String, Any>? = null,
    val isLoading: Boolean = false,
    val isRefreshing: Boolean = false,
    val error: String? = null
)

/**
 * ViewModel for Dashboard Screen
 * Displays overview statistics and metrics
 */
class DashboardViewModel : ViewModel() {
    private val repository = DashboardStatsRepository()
    
    private val _uiState = MutableStateFlow(DashboardUiState())
    val uiState: StateFlow<DashboardUiState> = _uiState.asStateFlow()

    init {
        loadStats()
    }

    /**
     * Load dashboard statistics
     */
    fun loadStats(refresh: Boolean = false) {
        viewModelScope.launch {
            if (refresh) {
                _uiState.value = _uiState.value.copy(isRefreshing = true)
            } else {
                _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            }
            
            when (val result = repository.getDashboardStats()) {
                is NetworkResult.Success -> {
                    _uiState.value = _uiState.value.copy(
                        stats = result.data,
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
                        error = result.exception.message ?: "Failed to load dashboard stats"
                    )
                }
            }
        }
    }

    /**
     * Refresh dashboard statistics
     */
    fun refresh() {
        loadStats(refresh = true)
    }
    
    /**
     * Clear error message
     */
    fun clearError() {
        _uiState.value = _uiState.value.copy(error = null)
    }
    
    /**
     * Helper methods to extract stats from Map
     */
    fun getTotalCustomers(): Int = _uiState.value.stats?.get("total_customers") as? Int ?: 0
    fun getTotalDeals(): Int = _uiState.value.stats?.get("total_deals") as? Int ?: 0
    fun getTotalRevenue(): Double = _uiState.value.stats?.get("total_revenue") as? Double ?: 0.0
    fun getActiveLeads(): Int = _uiState.value.stats?.get("active_leads") as? Int ?: 0
    fun getWonDeals(): Int = _uiState.value.stats?.get("won_deals") as? Int ?: 0
    fun getPendingTasks(): Int = _uiState.value.stats?.get("pending_tasks") as? Int ?: 0
}
