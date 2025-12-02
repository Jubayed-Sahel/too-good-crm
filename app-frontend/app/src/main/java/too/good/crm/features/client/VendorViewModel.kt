package too.good.crm.features.client

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import too.good.crm.data.NetworkResult
import too.good.crm.data.model.*
import too.good.crm.data.repository.VendorRepository

/**
 * ViewModel for My Vendors Screen
 * Manages vendor relationships and partnerships
 */
class VendorViewModel : ViewModel() {
    private val repository = VendorRepository()
    
    private val _uiState = MutableStateFlow(VendorUiState())
    val uiState: StateFlow<VendorUiState> = _uiState.asStateFlow()
    
    init {
        loadVendors()
        loadStats()
    }
    
    /**
     * Load all vendors
     */
    fun loadVendors(refresh: Boolean = false) {
        viewModelScope.launch {
            if (refresh) {
                _uiState.value = _uiState.value.copy(isRefreshing = true)
            } else {
                _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            }
            
            when (val result = repository.getVendors(pageSize = 50)) {
                is NetworkResult.Success -> {
                    _uiState.value = _uiState.value.copy(
                        vendors = result.data.results,
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
     * Load vendor statistics
     */
    fun loadStats() {
        viewModelScope.launch {
            when (val result = repository.getVendorStats()) {
                is NetworkResult.Success -> {
                    _uiState.value = _uiState.value.copy(
                        stats = result.data
                    )
                }
                is NetworkResult.Error -> {
                    // Silently fail for stats
                }
                is NetworkResult.Exception -> {
                    // Silently fail for stats
                }
            }
        }
    }
    
    /**
     * Filter vendors by status
     */
    fun filterByStatus(status: String?) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(
                isLoading = true,
                error = null,
                selectedStatus = status
            )
            
            when (val result = repository.getVendors(status = status, pageSize = 50)) {
                is NetworkResult.Success -> {
                    _uiState.value = _uiState.value.copy(
                        vendors = result.data.results,
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
     * Filter vendors by type
     */
    fun filterByType(vendorType: String?) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(
                isLoading = true,
                error = null,
                selectedType = vendorType
            )
            
            when (val result = repository.getVendors(vendorType = vendorType, pageSize = 50)) {
                is NetworkResult.Success -> {
                    _uiState.value = _uiState.value.copy(
                        vendors = result.data.results,
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
     * Search vendors
     */
    fun searchVendors(query: String) {
        if (query.isBlank()) {
            loadVendors()
            return
        }
        
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null, searchQuery = query)
            
            when (val result = repository.searchVendors(query)) {
                is NetworkResult.Success -> {
                    _uiState.value = _uiState.value.copy(
                        vendors = result.data.results,
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
     * Get single vendor
     */
    fun getVendor(id: Int, onSuccess: (Vendor) -> Unit) {
        viewModelScope.launch {
            when (val result = repository.getVendor(id)) {
                is NetworkResult.Success -> {
                    onSuccess(result.data)
                }
                is NetworkResult.Error -> {
                    _uiState.value = _uiState.value.copy(error = result.message)
                }
                is NetworkResult.Exception -> {
                    _uiState.value = _uiState.value.copy(
                        error = result.exception.message ?: "Failed to load vendor"
                    )
                }
            }
        }
    }
    
    /**
     * Create new vendor
     */
    fun createVendor(vendor: CreateVendorRequest, onSuccess: () -> Unit) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isCreating = true, error = null)
            
            when (val result = repository.createVendor(vendor)) {
                is NetworkResult.Success -> {
                    _uiState.value = _uiState.value.copy(isCreating = false, error = null)
                    loadVendors(refresh = true)
                    loadStats()
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
                        error = result.exception.message ?: "Failed to create vendor"
                    )
                }
            }
        }
    }
    
    /**
     * Update vendor
     */
    fun updateVendor(id: Int, vendor: CreateVendorRequest, onSuccess: () -> Unit) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(error = null)
            
            when (val result = repository.updateVendor(id, vendor)) {
                is NetworkResult.Success -> {
                    loadVendors(refresh = true)
                    loadStats()
                    onSuccess()
                }
                is NetworkResult.Error -> {
                    _uiState.value = _uiState.value.copy(error = result.message)
                }
                is NetworkResult.Exception -> {
                    _uiState.value = _uiState.value.copy(
                        error = result.exception.message ?: "Failed to update vendor"
                    )
                }
            }
        }
    }
    
    /**
     * Delete vendor
     */
    fun deleteVendor(id: Int, onSuccess: () -> Unit) {
        viewModelScope.launch {
            when (val result = repository.deleteVendor(id)) {
                is NetworkResult.Success -> {
                    loadVendors(refresh = true)
                    loadStats()
                    onSuccess()
                }
                is NetworkResult.Error -> {
                    _uiState.value = _uiState.value.copy(error = result.message)
                }
                is NetworkResult.Exception -> {
                    _uiState.value = _uiState.value.copy(
                        error = result.exception.message ?: "Failed to delete vendor"
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
     * Refresh vendors
     */
    fun refresh() {
        loadVendors(refresh = true)
        loadStats()
    }
}

/**
 * UI State for My Vendors Screen
 */
data class VendorUiState(
    val vendors: List<Vendor> = emptyList(),
    val stats: VendorStats? = null,
    val totalCount: Int = 0,
    val isLoading: Boolean = false,
    val isRefreshing: Boolean = false,
    val isCreating: Boolean = false,
    val error: String? = null,
    val searchQuery: String = "",
    val selectedStatus: String? = null,
    val selectedType: String? = null
)
