package too.good.crm.features.leads

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import too.good.crm.data.NetworkResult
import too.good.crm.data.model.*
import too.good.crm.data.repository.LeadRepository

/**
 * ViewModel for Leads Screen
 * Follows Android MVVM best practices with StateFlow
 */
class LeadsViewModel : ViewModel() {
    private val repository = LeadRepository()
    
    private val _uiState = MutableStateFlow(LeadsUiState())
    val uiState: StateFlow<LeadsUiState> = _uiState.asStateFlow()
    
    init {
        loadLeads()
    }
    
    /**
     * Load all leads
     */
    fun loadLeads(refresh: Boolean = false) {
        viewModelScope.launch {
            if (refresh) {
                _uiState.value = _uiState.value.copy(isRefreshing = true)
            } else {
                _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            }
            
            when (val result = repository.getLeads(pageSize = 50)) {
                is NetworkResult.Success -> {
                    _uiState.value = _uiState.value.copy(
                        leads = result.data.results,
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
     * Filter leads by status
     */
    fun filterByStatus(status: String?) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null, selectedStatus = status)
            
            when (val result = repository.getLeads(status = status, pageSize = 50)) {
                is NetworkResult.Success -> {
                    _uiState.value = _uiState.value.copy(
                        leads = result.data.results,
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
     * Filter leads by source
     */
    fun filterBySource(source: String?) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null, selectedSource = source)
            
            when (val result = repository.getLeads(source = source, pageSize = 50)) {
                is NetworkResult.Success -> {
                    _uiState.value = _uiState.value.copy(
                        leads = result.data.results,
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
     * Search leads
     */
    fun searchLeads(query: String) {
        if (query.isBlank()) {
            loadLeads()
            return
        }
        
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null, searchQuery = query)
            
            when (val result = repository.searchLeads(query)) {
                is NetworkResult.Success -> {
                    _uiState.value = _uiState.value.copy(
                        leads = result.data.results,
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
     * Apply advanced filters to leads
     */
    fun applyFilters(
        statuses: Set<String> = emptySet(),
        sources: Set<String> = emptySet(),
        leadScoreMin: Int? = null,
        leadScoreMax: Int? = null,
        qualificationStatus: String? = null,
        createdAfter: String? = null,
        createdBefore: String? = null
    ) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(
                isLoading = true,
                error = null,
                activeFilters = FilterState(
                    statuses = statuses,
                    sources = sources,
                    leadScoreMin = leadScoreMin,
                    leadScoreMax = leadScoreMax,
                    qualificationStatus = qualificationStatus,
                    createdAfter = createdAfter,
                    createdBefore = createdBefore
                )
            )
            
            // Build filter parameters
            val status = if (statuses.size == 1) statuses.first() else null
            val source = if (sources.size == 1) sources.first() else null
            
            when (val result = repository.getLeads(
                status = status,
                source = source,
                qualificationStatus = qualificationStatus,
                pageSize = 50
            )) {
                is NetworkResult.Success -> {
                    var filteredLeads = result.data.results
                    
                    // Apply client-side filters for multi-select and ranges
                    if (statuses.size > 1) {
                        filteredLeads = filteredLeads.filter { lead ->
                            lead.status in statuses
                        }
                    }
                    
                    if (sources.size > 1) {
                        filteredLeads = filteredLeads.filter { lead ->
                            lead.source in sources
                        }
                    }
                    
                    if (leadScoreMin != null || leadScoreMax != null) {
                        filteredLeads = filteredLeads.filter { lead ->
                            val score = lead.leadScore ?: 0
                            (leadScoreMin == null || score >= leadScoreMin) &&
                            (leadScoreMax == null || score <= leadScoreMax)
                        }
                    }
                    
                    if (createdAfter != null || createdBefore != null) {
                        filteredLeads = filteredLeads.filter { lead ->
                            val createdDate = lead.createdAt
                            (createdAfter == null || createdDate >= createdAfter) &&
                            (createdBefore == null || createdDate <= createdBefore)
                        }
                    }
                    
                    _uiState.value = _uiState.value.copy(
                        leads = filteredLeads,
                        totalCount = filteredLeads.size,
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
     * Clear all filters
     */
    fun clearFilters() {
        _uiState.value = _uiState.value.copy(activeFilters = FilterState())
        loadLeads()
    }
    
    /**
     * Create new lead
     */
    fun createLead(lead: CreateLeadRequest, onSuccess: () -> Unit) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isCreating = true, error = null)
            
            when (val result = repository.createLead(lead)) {
                is NetworkResult.Success -> {
                    _uiState.value = _uiState.value.copy(isCreating = false, error = null)
                    loadLeads(refresh = true)
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
                        error = result.exception.message ?: "Failed to create lead"
                    )
                }
            }
        }
    }
    
    /**
     * Convert lead to customer
     */
    fun convertLead(leadId: Int, onSuccess: () -> Unit) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(error = null)
            
            when (val result = repository.convertLead(leadId)) {
                is NetworkResult.Success -> {
                    loadLeads(refresh = true)
                    onSuccess()
                }
                is NetworkResult.Error -> {
                    _uiState.value = _uiState.value.copy(error = result.message)
                }
                is NetworkResult.Exception -> {
                    _uiState.value = _uiState.value.copy(
                        error = result.exception.message ?: "Failed to convert lead"
                    )
                }
            }
        }
    }
    
    /**
     * Delete lead
     */
    fun deleteLead(leadId: Int, onSuccess: () -> Unit) {
        viewModelScope.launch {
            when (val result = repository.deleteLead(leadId)) {
                is NetworkResult.Success -> {
                    loadLeads(refresh = true)
                    onSuccess()
                }
                is NetworkResult.Error -> {
                    _uiState.value = _uiState.value.copy(error = result.message)
                }
                is NetworkResult.Exception -> {
                    _uiState.value = _uiState.value.copy(
                        error = result.exception.message ?: "Failed to delete lead"
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
     * Refresh leads
     */
    fun refresh() {
        loadLeads(refresh = true)
    }
}

/**
 * UI State for Leads Screen
 */
data class LeadsUiState(
    val leads: List<LeadListItem> = emptyList(),
    val totalCount: Int = 0,
    val isLoading: Boolean = false,
    val isRefreshing: Boolean = false,
    val isCreating: Boolean = false,
    val error: String? = null,
    val searchQuery: String = "",
    val selectedStatus: String? = null,
    val selectedSource: String? = null,
    val selectedPriority: String? = null,
    val activeFilters: FilterState = FilterState()
)

/**
 * Filter State for Advanced Filtering
 */
data class FilterState(
    val statuses: Set<String> = emptySet(),
    val sources: Set<String> = emptySet(),
    val leadScoreMin: Int? = null,
    val leadScoreMax: Int? = null,
    val qualificationStatus: String? = null,
    val createdAfter: String? = null,
    val createdBefore: String? = null
) {
    fun hasActiveFilters(): Boolean {
        return statuses.isNotEmpty() ||
                sources.isNotEmpty() ||
                leadScoreMin != null ||
                leadScoreMax != null ||
                qualificationStatus != null ||
                createdAfter != null ||
                createdBefore != null
    }
    
    fun activeFilterCount(): Int {
        var count = 0
        if (statuses.isNotEmpty()) count++
        if (sources.isNotEmpty()) count++
        if (leadScoreMin != null || leadScoreMax != null) count++
        if (qualificationStatus != null) count++
        if (createdAfter != null || createdBefore != null) count++
        return count
    }
}

