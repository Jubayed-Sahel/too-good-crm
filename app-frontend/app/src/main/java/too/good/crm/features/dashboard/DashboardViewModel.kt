package too.good.crm.features.dashboard

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import too.good.crm.data.NetworkResult
import too.good.crm.data.repository.DashboardStatsRepository
import too.good.crm.data.model.DashboardStats

/**
 * UI State for Dashboard Screen
 */
data class DashboardUiState(
    val stats: DashboardStats? = null,
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
                    // Clean up error message - remove HTML if present
                    val cleanError = result.message
                        ?.replace(Regex("<[^>]*>"), "") // Remove HTML tags
                        ?.take(200) // Limit length
                        ?: "Failed to load dashboard stats"

                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        isRefreshing = false,
                        error = if (cleanError.contains("<!DOCTYPE", ignoreCase = true)) {
                            "Backend error: Please check if server is running and accessible"
                        } else {
                            cleanError
                        }
                    )
                }
                is NetworkResult.Exception -> {
                    val errorMsg = when {
                        result.exception.message?.contains("Unable to resolve host") == true ->
                            "Cannot reach server. Check your network and backend URL"
                        result.exception.message?.contains("Connection refused") == true ->
                            "Backend is not running. Start Django server with: python manage.py runserver 0.0.0.0:8000"
                        result.exception.message?.contains("timeout") == true ->
                            "Connection timeout. Check your network connection"
                        result.exception.message?.contains("Unauthorized") == true ->
                            "Please login again"
                        else -> result.exception.message ?: "Failed to load dashboard stats"
                    }

                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        isRefreshing = false,
                        error = errorMsg
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
     * Helper methods to extract stats from DashboardStats
     */
    fun getTotalCustomers(): Int = _uiState.value.stats?.totalCustomers ?: 0
    fun getTotalDeals(): Int = _uiState.value.stats?.totalDeals ?: 0
    fun getTotalRevenue(): Double = _uiState.value.stats?.totalRevenue ?: 0.0
    fun getTotalLeads(): Int = _uiState.value.stats?.totalLeads ?: 0
    fun getWonDealsCount(): Int = _uiState.value.stats?.wonDealsCount ?: 0
    fun getLostDealsCount(): Int = _uiState.value.stats?.lostDealsCount ?: 0
    fun getConversionRate(): Double = _uiState.value.stats?.conversionRate ?: 0.0
    fun getActiveDealsValue(): Double = _uiState.value.stats?.activeDealsValue ?: 0.0
}
