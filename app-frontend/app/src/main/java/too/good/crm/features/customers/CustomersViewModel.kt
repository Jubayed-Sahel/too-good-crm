package too.good.crm.features.customers

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import too.good.crm.data.model.CreateCustomerRequest
import too.good.crm.data.model.Customer as ApiCustomer
import too.good.crm.data.repository.CustomerRepository

data class CustomersUiState(
    val customers: List<Customer> = emptyList(),
    val isLoading: Boolean = false,
    val error: String? = null,
    val showAddCustomerDialog: Boolean = false,
    val isCreatingCustomer: Boolean = false,
    val successMessage: String? = null
)

class CustomersViewModel : ViewModel() {

    private val repository = CustomerRepository.getInstance()

    private val _uiState = MutableStateFlow(CustomersUiState())
    val uiState: StateFlow<CustomersUiState> = _uiState.asStateFlow()

    init {
        loadCustomers()
    }

    fun loadCustomers() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)

            repository.getCustomers()
                .onSuccess { apiCustomers ->
                    // Convert API customers to UI customers
                    val customers = apiCustomers.map { it.toUiCustomer() }
                    _uiState.value = _uiState.value.copy(
                        customers = customers,
                        isLoading = false
                    )
                }
                .onFailure { error ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = error.message ?: "Failed to load customers"
                    )
                }
        }
    }

    fun showAddCustomerDialog() {
        _uiState.value = _uiState.value.copy(showAddCustomerDialog = true)
    }

    fun hideAddCustomerDialog() {
        _uiState.value = _uiState.value.copy(showAddCustomerDialog = false, error = null)
    }

    fun createCustomer(
        name: String,
        email: String,
        phone: String,
        firstName: String = "",
        lastName: String = "",
        companyName: String = "",
        customerType: String = "individual",
        address: String = "",
        city: String = "",
        state: String = "",
        country: String = "",
        postalCode: String = "",
        website: String = "",
        notes: String = ""
    ) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isCreatingCustomer = true, error = null)

            val request = CreateCustomerRequest(
                name = name,
                firstName = firstName.ifBlank { null },
                lastName = lastName.ifBlank { null },
                email = email,
                phone = phone,
                companyName = companyName.ifBlank { null },
                customerType = customerType,
                status = "active",
                address = address.ifBlank { null },
                city = city.ifBlank { null },
                state = state.ifBlank { null },
                country = country.ifBlank { null },
                postalCode = postalCode.ifBlank { null },
                website = website.ifBlank { null },
                notes = notes.ifBlank { null }
            )

            repository.createCustomer(request)
                .onSuccess { newApiCustomer ->
                    val newCustomer = newApiCustomer.toUiCustomer()
                    _uiState.value = _uiState.value.copy(
                        customers = _uiState.value.customers + newCustomer,
                        isCreatingCustomer = false,
                        showAddCustomerDialog = false,
                        successMessage = "Customer created successfully"
                    )
                    // Reload to get fresh data from server
                    loadCustomers()
                }
                .onFailure { error ->
                    _uiState.value = _uiState.value.copy(
                        isCreatingCustomer = false,
                        error = error.message ?: "Failed to create customer"
                    )
                }
        }
    }

    fun clearSuccessMessage() {
        _uiState.value = _uiState.value.copy(successMessage = null)
    }

    fun clearError() {
        _uiState.value = _uiState.value.copy(error = null)
    }

    // Convert API Customer to UI Customer
    private fun ApiCustomer.toUiCustomer(): Customer {
        return Customer(
            id = this.id.toString(),
            name = this.fullName.ifBlank { this.name },
            email = this.email,
            phone = this.phone,
            company = this.companyName.ifBlank { this.company },
            status = when (this.status.lowercase()) {
                "active" -> CustomerStatus.ACTIVE
                "inactive" -> CustomerStatus.INACTIVE
                "prospect", "pending" -> CustomerStatus.PENDING
                else -> CustomerStatus.ACTIVE
            },
            value = this.totalValue,
            createdDate = this.createdAt,
            lastContact = this.updatedAt,
            industry = "",
            website = this.website
        )
    }
}
