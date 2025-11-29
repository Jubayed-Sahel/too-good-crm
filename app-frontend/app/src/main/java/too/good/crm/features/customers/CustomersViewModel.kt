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
    val successMessage: String? = null,
    val showDeleteConfirmDialog: Boolean = false,
    val customerToDelete: Customer? = null,
    val isDeletingCustomer: Boolean = false
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

            try {
                repository.getCustomers()
                    .onSuccess { apiCustomers ->
                        // Convert API customers to UI customers
                        val customers = apiCustomers.mapNotNull { 
                            try {
                                it.toUiCustomer()
                            } catch (e: Exception) {
                                // Skip customers with invalid data
                                null
                            }
                        }
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
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = "Error loading customers: ${e.message}"
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
        jobTitle: String = "",
        customerType: String = "individual",
        address: String = "",
        city: String = "",
        state: String = "",
        country: String = "",
        postalCode: String = "",
        website: String = "",
        industry: String = "",
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
                jobTitle = jobTitle.ifBlank { null },
                customerType = customerType,
                status = "active",
                address = address.ifBlank { null },
                city = city.ifBlank { null },
                state = state.ifBlank { null },
                country = country.ifBlank { null },
                postalCode = postalCode.ifBlank { null },
                website = website.ifBlank { null },
                industry = industry.ifBlank { null },
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

    fun showDeleteConfirmDialog(customer: Customer) {
        _uiState.value = _uiState.value.copy(
            showDeleteConfirmDialog = true,
            customerToDelete = customer
        )
    }
    
    /**
     * Update existing customer
     * Uses PATCH method for partial updates
     */
    fun updateCustomer(
        customerId: Int,
        name: String,
        email: String,
        phone: String,
        firstName: String = "",
        lastName: String = "",
        companyName: String = "",
        jobTitle: String = "",
        customerType: String = "individual",
        status: String = "active",
        address: String = "",
        city: String = "",
        state: String = "",
        country: String = "",
        postalCode: String = "",
        website: String = "",
        industry: String = "",
        notes: String = ""
    ) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            
            val request = CreateCustomerRequest(
                name = name,
                firstName = firstName.ifBlank { null },
                lastName = lastName.ifBlank { null },
                email = email,
                phone = phone,
                companyName = companyName.ifBlank { null },
                jobTitle = jobTitle.ifBlank { null },
                customerType = customerType,
                status = status,
                address = address.ifBlank { null },
                city = city.ifBlank { null },
                state = state.ifBlank { null },
                country = country.ifBlank { null },
                postalCode = postalCode.ifBlank { null },
                website = website.ifBlank { null },
                industry = industry.ifBlank { null },
                notes = notes.ifBlank { null }
            )
            
            repository.patchCustomer(customerId, request)
                .onSuccess { updatedApiCustomer ->
                    val updatedCustomer = updatedApiCustomer.toUiCustomer()
                    _uiState.value = _uiState.value.copy(
                        customers = _uiState.value.customers.map { 
                            if (it.id == updatedCustomer.id) updatedCustomer else it 
                        },
                        isLoading = false,
                        successMessage = "Customer updated successfully"
                    )
                    // Reload to ensure consistency with server
                    loadCustomers()
                }
                .onFailure { error ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = error.message ?: "Failed to update customer"
                    )
                }
        }
    }

    fun hideDeleteConfirmDialog() {
        _uiState.value = _uiState.value.copy(
            showDeleteConfirmDialog = false,
            customerToDelete = null
        )
    }

    fun deleteCustomer() {
        val customer = _uiState.value.customerToDelete ?: return
        
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isDeletingCustomer = true, error = null)
            
            // Parse customer ID from string
            val customerId = customer.id.toIntOrNull()
            if (customerId == null) {
                _uiState.value = _uiState.value.copy(
                    isDeletingCustomer = false,
                    error = "Invalid customer ID"
                )
                return@launch
            }
            
            repository.deleteCustomer(customerId)
                .onSuccess {
                    _uiState.value = _uiState.value.copy(
                        customers = _uiState.value.customers.filter { it.id != customer.id },
                        isDeletingCustomer = false,
                        showDeleteConfirmDialog = false,
                        customerToDelete = null,
                        successMessage = "Customer deleted successfully"
                    )
                }
                .onFailure { error ->
                    _uiState.value = _uiState.value.copy(
                        isDeletingCustomer = false,
                        showDeleteConfirmDialog = false,
                        customerToDelete = null,
                        error = error.message ?: "Failed to delete customer"
                    )
                }
        }
    }

    // Convert API Customer to UI Customer
    private fun ApiCustomer.toUiCustomer(): Customer {
        return Customer(
            id = this.id.toString(),
            name = this.fullName?.takeIf { it.isNotBlank() } 
                ?: this.name.takeIf { it.isNotBlank() } 
                ?: "Unknown",
            email = this.email?.takeIf { it.isNotBlank() } ?: "",
            phone = this.phone?.takeIf { it.isNotBlank() } ?: "",
            company = this.companyName?.takeIf { it.isNotBlank() } 
                ?: this.company?.takeIf { it.isNotBlank() } 
                ?: this.organization?.takeIf { it.isNotBlank() } 
                ?: "",
            status = when (this.status?.lowercase() ?: "active") {
                "active" -> CustomerStatus.ACTIVE
                "inactive" -> CustomerStatus.INACTIVE
                "prospect", "pending" -> CustomerStatus.PENDING
                else -> CustomerStatus.ACTIVE
            },
            value = this.totalValue ?: 0.0,
            createdDate = this.createdAt ?: "",
            lastContact = this.updatedAt ?: "",
            industry = "",
            website = this.website ?: "",
            userId = this.userId
        )
    }
}
