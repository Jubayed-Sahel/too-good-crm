package too.good.crm.features.sales

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import too.good.crm.data.NetworkResult
import too.good.crm.data.repository.DashboardStatsRepository

/**
 * ViewModel for Sales Screen
 * Displays sales analytics and reports
 */
class SalesViewModel : ViewModel() {
    private val repository = DashboardStatsRepository()
    
    private val _uiState = MutableStateFlow(SalesUiState())
    val uiState: StateFlow<SalesUiState> = _uiState.asStateFlow()
    
    init {
        loadDashboardStats()
        loadRevenueData()
    }
    
    /**
     * Load dashboard statistics
     */
    fun loadDashboardStats() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            
            when (val result = repository.getDashboardStats()) {
                is NetworkResult.Success -> {
                    _uiState.value = _uiState.value.copy(
                        stats = result.data,
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
     * Load revenue data by period
     */
    fun loadRevenueData(period: String = "month", limit: Int = 12) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoadingRevenue = true, revenueError = null)
            
            when (val result = repository.getRevenueByPeriod(period, limit)) {
                is NetworkResult.Success -> {
                    _uiState.value = _uiState.value.copy(
                        revenueData = result.data,
                        isLoadingRevenue = false,
                        revenueError = null
                    )
                }
                is NetworkResult.Error -> {
                    _uiState.value = _uiState.value.copy(
                        isLoadingRevenue = false,
                        revenueError = result.message
                    )
                }
                is NetworkResult.Exception -> {
                    _uiState.value = _uiState.value.copy(
                        isLoadingRevenue = false,
                        revenueError = result.exception.message ?: "Failed to load revenue data"
                    )
                }
            }
        }
    }
    
    /**
     * Change period filter
     */
    fun changePeriod(period: String) {
        _uiState.value = _uiState.value.copy(selectedPeriod = period)
        loadRevenueData(period)
    }
    
    /**
     * Refresh all data
     */
    fun refresh() {
        loadDashboardStats()
        loadRevenueData(_uiState.value.selectedPeriod)
    }
    
    /**
     * Clear errors
     */
    fun clearError() {
        _uiState.value = _uiState.value.copy(error = null, revenueError = null)
    }
    
    /**
     * Helper methods to extract stats from Map
     */
    fun getTotalRevenue(): Double = _uiState.value.stats?.get("total_revenue") as? Double ?: 0.0
    fun getTotalDeals(): Int = _uiState.value.stats?.get("total_deals") as? Int ?: 0
    fun getWonDeals(): Int = _uiState.value.stats?.get("won_deals") as? Int ?: 0
    fun getWinRate(): Double {
        val total = getTotalDeals()
        val won = getWonDeals()
        return if (total > 0) (won.toDouble() / total) * 100 else 0.0
    }
}

/**
 * UI State for Sales Screen
 */
data class SalesUiState(
    val stats: Map<String, Any>? = null,
    val revenueData: Map<String, Any>? = null,
    val isLoading: Boolean = false,
    val isLoadingRevenue: Boolean = false,
    val error: String? = null,
    val revenueError: String? = null,
    val selectedPeriod: String = "month"
)
