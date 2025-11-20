package too.good.crm.features.dashboard

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import too.good.crm.data.api.DashboardStatsResponse
import too.good.crm.data.repository.DashboardStatsRepository

data class DashboardUiState(
    val stats: DashboardStatsResponse? = null,
    val isLoading: Boolean = false,
    val error: String? = null
)

class DashboardViewModel : ViewModel() {
    private val repository = DashboardStatsRepository()
    
    private val _uiState = MutableStateFlow(DashboardUiState())
    val uiState: StateFlow<DashboardUiState> = _uiState.asStateFlow()

    /**
     * Load dashboard statistics
     */
    fun loadStats(organizationId: Int? = null) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            repository.getDashboardStats(organizationId)
                .onSuccess { stats ->
                    _uiState.value = _uiState.value.copy(
                        stats = stats,
                        isLoading = false
                    )
                }
                .onFailure { error ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = error.message ?: "Failed to load dashboard stats"
                    )
                }
        }
    }

    /**
     * Refresh dashboard statistics
     */
    fun refreshStats(organizationId: Int? = null) {
        loadStats(organizationId)
    }
}

