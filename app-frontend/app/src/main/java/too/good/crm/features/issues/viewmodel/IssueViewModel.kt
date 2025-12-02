package too.good.crm.features.issues.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import too.good.crm.data.model.Issue
import too.good.crm.data.model.IssueResponse
import too.good.crm.data.repository.IssueRepository
import too.good.crm.data.UserRole
import too.good.crm.data.ActiveMode
import too.good.crm.data.UserSession

sealed class IssueUiState {
    object Loading : IssueUiState()
    data class Success(val issues: List<Issue>) : IssueUiState()
    data class Error(val message: String) : IssueUiState()
}

sealed class IssueDetailUiState {
    object Loading : IssueDetailUiState()
    data class Success(val issue: Issue) : IssueDetailUiState()
    data class Error(val message: String) : IssueDetailUiState()
}

class IssueViewModel : ViewModel() {
    private val repository: IssueRepository = IssueRepository()

    private val _uiState = MutableStateFlow<IssueUiState>(IssueUiState.Loading)
    val uiState: StateFlow<IssueUiState> = _uiState.asStateFlow()

    private val _detailUiState = MutableStateFlow<IssueDetailUiState>(IssueDetailUiState.Loading)
    val detailUiState: StateFlow<IssueDetailUiState> = _detailUiState.asStateFlow()

    private val _statusFilter = MutableStateFlow<String?>(null)
    val statusFilter: StateFlow<String?> = _statusFilter.asStateFlow()

    private val _priorityFilter = MutableStateFlow<String?>(null)
    val priorityFilter: StateFlow<String?> = _priorityFilter.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    private val _createIssueSuccess = MutableStateFlow<IssueResponse?>(null)
    val createIssueSuccess: StateFlow<IssueResponse?> = _createIssueSuccess.asStateFlow()

    private val _errorMessage = MutableStateFlow<String?>(null)
    val errorMessage: StateFlow<String?> = _errorMessage.asStateFlow()

    fun isCustomer(): Boolean {
        return UserSession.activeMode == ActiveMode.CLIENT
    }

    fun isVendorOrEmployee(): Boolean {
        return UserSession.activeMode == ActiveMode.VENDOR
    }

    // Customer functions
    fun createIssue(
        organizationId: Int,
        title: String,
        description: String,
        priority: String,
        category: String,
        vendorId: Int? = null,
        orderId: Int? = null
    ) {
        viewModelScope.launch {
            _isLoading.value = true
            _errorMessage.value = null

            val result = repository.createIssue(
                organizationId, title, description, priority, category, vendorId, orderId
            )

            result.fold(
                onSuccess = { response ->
                    _createIssueSuccess.value = response
                    _isLoading.value = false
                },
                onFailure = { error ->
                    _errorMessage.value = error.message ?: "Failed to create issue"
                    _isLoading.value = false
                }
            )
        }
    }

    fun syncToLinear(issueId: Int, onComplete: (Boolean, String?) -> Unit) {
        viewModelScope.launch {
            val result = repository.syncToLinear(issueId)
            result.fold(
                onSuccess = { response ->
                    // Reload issue details to get updated sync status
                    loadIssueDetails(issueId)
                    onComplete(true, response.linearUrl)
                },
                onFailure = { error ->
                    onComplete(false, error.message)
                }
            )
        }
    }

    fun deleteIssue(issueId: Int, onComplete: (Boolean, String?) -> Unit) {
        viewModelScope.launch {
            val result = repository.deleteIssue(issueId)
            result.fold(
                onSuccess = {
                    onComplete(true, null)
                },
                onFailure = { error ->
                    onComplete(false, error.message)
                }
            )
        }
    }

    fun loadIssueDetails(issueId: Int) {
        viewModelScope.launch {
            _detailUiState.value = IssueDetailUiState.Loading

            val result = if (isCustomer()) {
                repository.getIssueDetails(issueId)
            } else {
                repository.getIssue(issueId)
            }

            result.fold(
                onSuccess = { issue ->
                    _detailUiState.value = IssueDetailUiState.Success(issue)
                },
                onFailure = { error ->
                    _detailUiState.value = IssueDetailUiState.Error(
                        error.message ?: "Failed to load issue"
                    )
                }
            )
        }
    }

    fun addComment(issueId: Int, comment: String) {
        viewModelScope.launch {
            _isLoading.value = true
            _errorMessage.value = null

            val result = repository.addComment(issueId, comment)

            result.fold(
                onSuccess = { response ->
                    // Reload issue details
                    loadIssueDetails(issueId)
                    _isLoading.value = false
                },
                onFailure = { error ->
                    _errorMessage.value = error.message ?: "Failed to add comment"
                    _isLoading.value = false
                }
            )
        }
    }

    // Customer functions
    fun loadCustomerIssues() {
        viewModelScope.launch {
            try {
                _uiState.value = IssueUiState.Loading

                repository.getCustomerIssues(
                    status = _statusFilter.value,
                    priority = _priorityFilter.value
                ).collect { issues ->
                    android.util.Log.d("IssueViewModel", "Collected ${issues.size} issues in ViewModel")
                    issues.forEachIndexed { index, issue ->
                        android.util.Log.d("IssueViewModel", "  Issue $index: ID=${issue.id}, Title=${issue.title}")
                    }
                    _uiState.value = IssueUiState.Success(issues)
                }
            } catch (e: Exception) {
                android.util.Log.e("IssueViewModel", "Error loading customer issues", e)
                _uiState.value = IssueUiState.Error(e.message ?: "Failed to load issues")
            }
        }
    }

    // Vendor/Employee functions
    fun loadAllIssues() {
        viewModelScope.launch {
            try {
                _uiState.value = IssueUiState.Loading

                repository.getAllIssues(
                    status = _statusFilter.value,
                    priority = _priorityFilter.value,
                    isClientIssue = true // Only show client-raised issues
                ).collect { issues ->
                    _uiState.value = IssueUiState.Success(issues)
                }
            } catch (e: Exception) {
                _uiState.value = IssueUiState.Error(e.message ?: "Failed to load issues")
            }
        }
    }

    fun setStatusFilter(status: String?) {
        _statusFilter.value = status
        loadAllIssues()
    }

    fun setPriorityFilter(priority: String?) {
        _priorityFilter.value = priority
        loadAllIssues()
    }

    fun updateIssueStatus(issueId: Int, status: String) {
        viewModelScope.launch {
            _isLoading.value = true
            _errorMessage.value = null

            val result = repository.updateIssueStatus(issueId, status)

            result.fold(
                onSuccess = { issue ->
                    // Reload issue details
                    loadIssueDetails(issueId)
                    _isLoading.value = false
                },
                onFailure = { error ->
                    _errorMessage.value = error.message ?: "Failed to update status"
                    _isLoading.value = false
                }
            )
        }
    }

    fun updateIssuePriority(issueId: Int, priority: String) {
        viewModelScope.launch {
            _isLoading.value = true
            _errorMessage.value = null

            val result = repository.updateIssuePriority(issueId, priority)

            result.fold(
                onSuccess = { issue ->
                    loadIssueDetails(issueId)
                    _isLoading.value = false
                },
                onFailure = { error ->
                    _errorMessage.value = error.message ?: "Failed to update priority"
                    _isLoading.value = false
                }
            )
        }
    }

    fun assignIssue(issueId: Int, assignedToId: Int) {
        viewModelScope.launch {
            _isLoading.value = true
            _errorMessage.value = null

            val result = repository.assignIssue(issueId, assignedToId)

            result.fold(
                onSuccess = { issue ->
                    loadIssueDetails(issueId)
                    _isLoading.value = false
                },
                onFailure = { error ->
                    _errorMessage.value = error.message ?: "Failed to assign issue"
                    _isLoading.value = false
                }
            )
        }
    }

    fun resolveIssue(issueId: Int, resolutionNotes: String) {
        viewModelScope.launch {
            _isLoading.value = true
            _errorMessage.value = null

            val result = repository.resolveIssue(issueId, resolutionNotes)

            result.fold(
                onSuccess = { issue ->
                    loadIssueDetails(issueId)
                    _isLoading.value = false
                },
                onFailure = { error ->
                    _errorMessage.value = error.message ?: "Failed to resolve issue"
                    _isLoading.value = false
                }
            )
        }
    }

    fun clearError() {
        _errorMessage.value = null
    }

    fun clearCreateSuccess() {
        _createIssueSuccess.value = null
    }
}

