package too.good.crm.features.team

import android.content.Context
import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import too.good.crm.data.models.Employee
import too.good.crm.data.models.InviteEmployeeResponse
import too.good.crm.data.repository.EmployeeRepository

/**
 * ViewModel for Team Screen
 * Manages employee data and operations
 */
class TeamViewModel(private val context: Context) : ViewModel() {
    
    private val employeeRepository = EmployeeRepository(context)
    
    private val _uiState = MutableStateFlow<TeamUiState>(TeamUiState.Loading)
    val uiState: StateFlow<TeamUiState> = _uiState.asStateFlow()
    
    private val _inviteState = MutableStateFlow<InviteEmployeeState>(InviteEmployeeState.Idle)
    val inviteState: StateFlow<InviteEmployeeState> = _inviteState.asStateFlow()
    
    private val _deleteState = MutableStateFlow<DeleteEmployeeState>(DeleteEmployeeState.Idle)
    val deleteState: StateFlow<DeleteEmployeeState> = _deleteState.asStateFlow()
    
    companion object {
        private const val TAG = "TeamViewModel"
    }
    
    init {
        loadEmployees()
    }
    
    /**
     * Load all employees
     */
    fun loadEmployees(
        organizationId: Int? = null,
        status: String? = null,
        department: String? = null,
        search: String? = null,
        refresh: Boolean = false
    ) {
        viewModelScope.launch {
            try {
                Log.d(TAG, "Loading employees")
                if (refresh) {
                    val currentState = _uiState.value
                    if (currentState is TeamUiState.Success) {
                        _uiState.value = currentState.copy(isRefreshing = true)
                    }
                } else {
                    _uiState.value = TeamUiState.Loading
                }
                
                val result = employeeRepository.getEmployees(
                    organizationId = organizationId,
                    status = status,
                    department = department,
                    search = search
                )
                
                result.fold(
                    onSuccess = { employees ->
                        Log.d(TAG, "Employees loaded successfully: ${employees.size}")
                        _uiState.value = TeamUiState.Success(employees, isRefreshing = false)
                    },
                    onFailure = { error ->
                        Log.e(TAG, "Failed to load employees", error)
                        _uiState.value = TeamUiState.Error(
                            error.message ?: "Failed to load employees"
                        )
                    }
                )
            } catch (e: Exception) {
                Log.e(TAG, "Error loading employees", e)
                _uiState.value = TeamUiState.Error(
                    e.message ?: "An error occurred"
                )
            }
        }
    }
    
    /**
     * Invite a new employee
     */
    fun inviteEmployee(
        email: String,
        firstName: String,
        lastName: String,
        phone: String? = null,
        department: String? = null,
        jobTitle: String? = null,
        roleId: Int? = null
    ) {
        viewModelScope.launch {
            try {
                Log.d(TAG, "Inviting employee: $email")
                
                // Validate inputs
                if (email.isEmpty()) {
                    _inviteState.value = InviteEmployeeState.Error("Email is required")
                    return@launch
                }
                if (firstName.isEmpty()) {
                    _inviteState.value = InviteEmployeeState.Error("First name is required")
                    return@launch
                }
                if (lastName.isEmpty()) {
                    _inviteState.value = InviteEmployeeState.Error("Last name is required")
                    return@launch
                }
                
                // Basic email validation
                if (!email.contains("@") || !email.contains(".")) {
                    _inviteState.value = InviteEmployeeState.Error("Invalid email format")
                    return@launch
                }
                
                _inviteState.value = InviteEmployeeState.Loading
                
                val result = employeeRepository.inviteEmployee(
                    email = email,
                    firstName = firstName,
                    lastName = lastName,
                    phone = phone,
                    department = department,
                    jobTitle = jobTitle,
                    roleId = roleId
                )
                
                result.fold(
                    onSuccess = { response ->
                        Log.d(TAG, "Employee invited successfully")
                        _inviteState.value = InviteEmployeeState.Success(response)
                        // Reload employees to show the new one
                        loadEmployees()
                    },
                    onFailure = { error ->
                        Log.e(TAG, "Failed to invite employee", error)
                        _inviteState.value = InviteEmployeeState.Error(
                            error.message ?: "Failed to invite employee"
                        )
                    }
                )
            } catch (e: Exception) {
                Log.e(TAG, "Error inviting employee", e)
                _inviteState.value = InviteEmployeeState.Error(
                    e.message ?: "An error occurred"
                )
            }
        }
    }
    
    /**
     * Delete an employee
     */
    fun deleteEmployee(id: Int, name: String) {
        viewModelScope.launch {
            try {
                Log.d(TAG, "Deleting employee: $id")
                _deleteState.value = DeleteEmployeeState.Loading(id)
                
                val result = employeeRepository.deleteEmployee(id)
                
                result.fold(
                    onSuccess = {
                        Log.d(TAG, "Employee deleted successfully")
                        _deleteState.value = DeleteEmployeeState.Success(id, name)
                        // Reload employees to remove the deleted one
                        loadEmployees()
                    },
                    onFailure = { error ->
                        Log.e(TAG, "Failed to delete employee", error)
                        _deleteState.value = DeleteEmployeeState.Error(
                            id,
                            error.message ?: "Failed to delete employee"
                        )
                    }
                )
            } catch (e: Exception) {
                Log.e(TAG, "Error deleting employee", e)
                _deleteState.value = DeleteEmployeeState.Error(
                    id,
                    e.message ?: "An error occurred"
                )
            }
        }
    }
    
    /**
     * Reset invite state
     */
    fun resetInviteState() {
        _inviteState.value = InviteEmployeeState.Idle
    }
    
    /**
     * Reset delete state
     */
    fun resetDeleteState() {
        _deleteState.value = DeleteEmployeeState.Idle
    }
    
    /**
     * Retry loading employees
     */
    fun retry() {
        loadEmployees()
    }
}

/**
 * UI State for Team Screen
 */
sealed class TeamUiState {
    object Loading : TeamUiState()
    data class Success(val employees: List<Employee>, val isRefreshing: Boolean = false) : TeamUiState()
    data class Error(val message: String) : TeamUiState()
}

/**
 * State for employee invitation
 */
sealed class InviteEmployeeState {
    object Idle : InviteEmployeeState()
    object Loading : InviteEmployeeState()
    data class Success(val response: InviteEmployeeResponse) : InviteEmployeeState()
    data class Error(val message: String) : InviteEmployeeState()
}

/**
 * State for employee deletion
 */
sealed class DeleteEmployeeState {
    object Idle : DeleteEmployeeState()
    data class Loading(val employeeId: Int) : DeleteEmployeeState()
    data class Success(val employeeId: Int, val employeeName: String) : DeleteEmployeeState()
    data class Error(val employeeId: Int, val message: String) : DeleteEmployeeState()
}

