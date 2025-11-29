package too.good.crm.features.activities

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import too.good.crm.data.NetworkResult
import too.good.crm.data.model.*
import too.good.crm.data.repository.ActivityRepository

/**
 * ViewModel for Activities Screen
 * Tracks calls, meetings, emails, and other activities
 */
class ActivitiesViewModel : ViewModel() {
    private val repository = ActivityRepository()
    
    private val _uiState = MutableStateFlow(ActivitiesUiState())
    val uiState: StateFlow<ActivitiesUiState> = _uiState.asStateFlow()
    
    init {
        loadActivities()
    }
    
    /**
     * Load all activities
     */
    fun loadActivities(refresh: Boolean = false) {
        viewModelScope.launch {
            if (refresh) {
                _uiState.value = _uiState.value.copy(isRefreshing = true)
            } else {
                _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            }
            
            when (val result = repository.getActivities(pageSize = 50)) {
                is NetworkResult.Success -> {
                    _uiState.value = _uiState.value.copy(
                        activities = result.data.results,
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
     * Load upcoming activities
     */
    fun loadUpcoming() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            
            when (val result = repository.getActivities(status = "pending", pageSize = 50)) {
                is NetworkResult.Success -> {
                    _uiState.value = _uiState.value.copy(
                        activities = result.data.results,
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
     * Load overdue activities
     */
    fun loadOverdue() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            
            when (val result = repository.getActivities(status = "overdue", pageSize = 50)) {
                is NetworkResult.Success -> {
                    _uiState.value = _uiState.value.copy(
                        activities = result.data.results,
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
     * Filter activities by type
     */
    fun filterByType(activityType: String?) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(
                isLoading = true,
                error = null,
                selectedType = activityType
            )
            
            when (val result = repository.getActivities(activityType = activityType, pageSize = 50)) {
                is NetworkResult.Success -> {
                    _uiState.value = _uiState.value.copy(
                        activities = result.data.results,
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
     * Create new activity
     */
    fun createActivity(activity: CreateActivityRequest, onSuccess: () -> Unit) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isCreating = true, error = null)
            
            when (val result = repository.createActivity(activity)) {
                is NetworkResult.Success -> {
                    _uiState.value = _uiState.value.copy(isCreating = false, error = null)
                    loadActivities(refresh = true)
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
                        error = result.exception.message ?: "Failed to create activity"
                    )
                }
            }
        }
    }
    
    /**
     * Complete activity
     */
    fun completeActivity(activityId: Int, onSuccess: () -> Unit) {
        viewModelScope.launch {
            when (val result = repository.completeActivity(activityId)) {
                is NetworkResult.Success -> {
                    loadActivities(refresh = true)
                    onSuccess()
                }
                is NetworkResult.Error -> {
                    _uiState.value = _uiState.value.copy(error = result.message)
                }
                is NetworkResult.Exception -> {
                    _uiState.value = _uiState.value.copy(
                        error = result.exception.message ?: "Failed to complete activity"
                    )
                }
            }
        }
    }
    
    /**
     * Cancel activity
     */
    fun cancelActivity(activityId: Int, onSuccess: () -> Unit) {
        viewModelScope.launch {
            when (val result = repository.cancelActivity(activityId)) {
                is NetworkResult.Success -> {
                    loadActivities(refresh = true)
                    onSuccess()
                }
                is NetworkResult.Error -> {
                    _uiState.value = _uiState.value.copy(error = result.message)
                }
                is NetworkResult.Exception -> {
                    _uiState.value = _uiState.value.copy(
                        error = result.exception.message ?: "Failed to cancel activity"
                    )
                }
            }
        }
    }
    
    /**
     * Delete activity
     */
    fun deleteActivity(activityId: Int, onSuccess: () -> Unit) {
        viewModelScope.launch {
            when (val result = repository.deleteActivity(activityId)) {
                is NetworkResult.Success -> {
                    loadActivities(refresh = true)
                    onSuccess()
                }
                is NetworkResult.Error -> {
                    _uiState.value = _uiState.value.copy(error = result.message)
                }
                is NetworkResult.Exception -> {
                    _uiState.value = _uiState.value.copy(
                        error = result.exception.message ?: "Failed to delete activity"
                    )
                }
            }
        }
    }
    
    /**
     * Search activities
     */
    fun searchActivities(query: String) {
        if (query.isBlank()) {
            loadActivities()
            return
        }
        
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null, searchQuery = query)
            
            when (val result = repository.searchActivities(query)) {
                is NetworkResult.Success -> {
                    _uiState.value = _uiState.value.copy(
                        activities = result.data.results,
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
     * Clear error message
     */
    fun clearError() {
        _uiState.value = _uiState.value.copy(error = null)
    }
    
    /**
     * Refresh activities
     */
    fun refresh() {
        loadActivities(refresh = true)
    }
}

/**
 * UI State for Activities Screen
 */
data class ActivitiesUiState(
    val activities: List<ActivityListItem> = emptyList(),
    val totalCount: Int = 0,
    val isLoading: Boolean = false,
    val isRefreshing: Boolean = false,
    val isCreating: Boolean = false,
    val error: String? = null,
    val searchQuery: String = "",
    val selectedType: String? = null,
    val selectedStatus: String? = null
)

