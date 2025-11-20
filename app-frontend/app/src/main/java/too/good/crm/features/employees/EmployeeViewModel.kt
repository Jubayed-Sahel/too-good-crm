package too.good.crm.features.employees

import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import too.good.crm.data.api.ApiClient
import too.good.crm.data.models.Employee
import too.good.crm.data.models.InviteEmployeeRequest
import too.good.crm.data.models.UpdateEmployeeRequest

/**
 * ViewModel for Employee Management
 */
class EmployeeViewModel(private val context: Context) : ViewModel() {

    data class EmployeeUiState(
        val employees: List<Employee> = emptyList(),
        val selectedEmployee: Employee? = null,
        val departments: List<String> = emptyList(),
        val isLoading: Boolean = false,
        val error: String? = null,
        val successMessage: String? = null
    )

    private val _uiState = MutableStateFlow(EmployeeUiState())
    val uiState: StateFlow<EmployeeUiState> = _uiState.asStateFlow()

    private val api = ApiClient.employeeApiService

    /**
     * Load all employees
     */
    fun loadEmployees(
        organizationId: Int? = null,
        status: String? = null,
        department: String? = null,
        search: String? = null
    ) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            try {
                val employees = api.getEmployees(
                    organization = organizationId,
                    status = status,
                    department = department,
                    search = search
                )
                _uiState.value = _uiState.value.copy(
                    employees = employees,
                    isLoading = false
                )
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    error = e.message ?: "Failed to load employees",
                    isLoading = false
                )
            }
        }
    }

    /**
     * Load single employee by ID
     */
    fun loadEmployee(id: Int) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            try {
                val employee = api.getEmployee(id)
                _uiState.value = _uiState.value.copy(
                    selectedEmployee = employee,
                    isLoading = false
                )
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    error = e.message ?: "Failed to load employee",
                    isLoading = false
                )
            }
        }
    }

    /**
     * Load departments
     */
    fun loadDepartments() {
        viewModelScope.launch {
            try {
                val departments = api.getDepartments()
                _uiState.value = _uiState.value.copy(departments = departments)
            } catch (e: Exception) {
                // Silently fail, not critical
            }
        }
    }

    /**
     * Invite new employee
     */
    fun inviteEmployee(
        email: String,
        firstName: String,
        lastName: String,
        phone: String? = null,
        department: String? = null,
        jobTitle: String? = null,
        roleId: Int? = null,
        onSuccess: (String?) -> Unit = {},
        onError: (String) -> Unit = {}
    ) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            try {
                val request = InviteEmployeeRequest(
                    email = email,
                    firstName = firstName,
                    lastName = lastName,
                    phone = phone,
                    department = department,
                    jobTitle = jobTitle,
                    roleId = roleId
                )
                val response = api.inviteEmployee(request)
                _uiState.value = _uiState.value.copy(
                    successMessage = response.message,
                    isLoading = false
                )
                onSuccess(response.temporaryPassword)
            } catch (e: Exception) {
                val errorMsg = e.message ?: "Failed to invite employee"
                _uiState.value = _uiState.value.copy(
                    error = errorMsg,
                    isLoading = false
                )
                onError(errorMsg)
            }
        }
    }

    /**
     * Update employee
     */
    fun updateEmployee(
        id: Int,
        firstName: String? = null,
        lastName: String? = null,
        email: String? = null,
        phone: String? = null,
        department: String? = null,
        jobTitle: String? = null,
        role: Int? = null,
        employmentType: String? = null,
        status: String? = null,
        hireDate: String? = null,
        emergencyContact: String? = null,
        address: String? = null,
        city: String? = null,
        state: String? = null,
        zipCode: String? = null,
        country: String? = null,
        onSuccess: () -> Unit = {},
        onError: (String) -> Unit = {}
    ) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            try {
                val request = UpdateEmployeeRequest(
                    firstName = firstName,
                    lastName = lastName,
                    email = email,
                    phone = phone,
                    department = department,
                    jobTitle = jobTitle,
                    role = role,
                    employmentType = employmentType,
                    status = status,
                    hireDate = hireDate,
                    emergencyContact = emergencyContact,
                    address = address,
                    city = city,
                    state = state,
                    zipCode = zipCode,
                    country = country
                )
                val updatedEmployee = api.updateEmployee(id, request)
                _uiState.value = _uiState.value.copy(
                    selectedEmployee = updatedEmployee,
                    successMessage = "Employee updated successfully",
                    isLoading = false
                )
                onSuccess()
            } catch (e: Exception) {
                val errorMsg = e.message ?: "Failed to update employee"
                _uiState.value = _uiState.value.copy(
                    error = errorMsg,
                    isLoading = false
                )
                onError(errorMsg)
            }
        }
    }

    /**
     * Delete employee
     */
    fun deleteEmployee(
        id: Int,
        onSuccess: () -> Unit = {},
        onError: (String) -> Unit = {}
    ) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            try {
                api.deleteEmployee(id)
                _uiState.value = _uiState.value.copy(
                    successMessage = "Employee deleted successfully",
                    isLoading = false
                )
                onSuccess()
            } catch (e: Exception) {
                val errorMsg = e.message ?: "Failed to delete employee"
                _uiState.value = _uiState.value.copy(
                    error = errorMsg,
                    isLoading = false
                )
                onError(errorMsg)
            }
        }
    }

    /**
     * Clear error/success messages
     */
    fun clearMessages() {
        _uiState.value = _uiState.value.copy(error = null, successMessage = null)
    }
}
