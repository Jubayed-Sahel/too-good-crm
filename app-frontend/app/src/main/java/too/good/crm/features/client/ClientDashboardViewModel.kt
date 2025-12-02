package too.good.crm.features.client

import android.content.Context
import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import too.good.crm.data.NetworkResult
import too.good.crm.data.model.OrderStats
import too.good.crm.data.model.VendorStats
import too.good.crm.data.repository.OrderRepository
import too.good.crm.data.repository.VendorRepository

/**
 * Client Dashboard ViewModel
 * Manages state and data for the client dashboard
 */
class ClientDashboardViewModel(private val context: Context) : ViewModel() {
    
    private val vendorRepository = VendorRepository()
    private val orderRepository = OrderRepository()
    
    private val _uiState = MutableStateFlow(ClientDashboardUiState())
    val uiState: StateFlow<ClientDashboardUiState> = _uiState.asStateFlow()
    
    /**
     * Load all dashboard data
     */
    fun loadDashboardData(refresh: Boolean = false) {
        if (_uiState.value.isLoading && !refresh) {
            Log.d(TAG, "Already loading, skipping...")
            return
        }
        
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(
                isLoading = true,
                error = null
            )
            
            try {
                // Load vendor stats
                val vendorStatsResult = vendorRepository.getVendorStats()
                
                // Load order stats
                val orderStatsResult = orderRepository.getOrderStats()
                
                // Process results
                when {
                    vendorStatsResult is NetworkResult.Success && orderStatsResult is NetworkResult.Success -> {
                        _uiState.value = _uiState.value.copy(
                            vendorStats = vendorStatsResult.data,
                            orderStats = orderStatsResult.data,
                            isLoading = false,
                            error = null
                        )
                        Log.d(TAG, "✅ Dashboard data loaded successfully")
                        Log.d(TAG, "Vendors: ${vendorStatsResult.data.totalVendors}, Orders: ${orderStatsResult.data.total}")
                    }
                    vendorStatsResult is NetworkResult.Error -> {
                        _uiState.value = _uiState.value.copy(
                            isLoading = false,
                            error = vendorStatsResult.message ?: "Failed to load vendor statistics"
                        )
                        Log.e(TAG, "❌ Error loading vendor stats: ${vendorStatsResult.message}")
                    }
                    orderStatsResult is NetworkResult.Error -> {
                        _uiState.value = _uiState.value.copy(
                            isLoading = false,
                            error = orderStatsResult.message ?: "Failed to load order statistics"
                        )
                        Log.e(TAG, "❌ Error loading order stats: ${orderStatsResult.message}")
                    }
                }
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = "Error loading dashboard: ${e.message}"
                )
                Log.e(TAG, "❌ Exception loading dashboard data", e)
            }
        }
    }
    
    /**
     * Refresh dashboard data
     */
    fun refresh() {
        Log.d(TAG, "🔄 Refreshing dashboard data...")
        loadDashboardData(refresh = true)
    }
    
    /**
     * Clear error state
     */
    fun clearError() {
        _uiState.value = _uiState.value.copy(error = null)
    }
    
    companion object {
        private const val TAG = "ClientDashboardVM"
    }
}

/**
 * UI State for Client Dashboard
 */
data class ClientDashboardUiState(
    val vendorStats: VendorStats? = null,
    val orderStats: OrderStats? = null,
    val isLoading: Boolean = false,
    val error: String? = null
) {
    /**
     * Check if data is available
     */
    val hasData: Boolean
        get() = vendorStats != null && orderStats != null
    
    /**
     * Check if dashboard is empty (no vendors and no orders)
     */
    val isEmpty: Boolean
        get() = vendorStats?.totalVendors == 0 && orderStats?.total == 0
}
