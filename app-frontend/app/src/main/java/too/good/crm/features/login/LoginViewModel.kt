package too.good.crm.features.login

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import too.good.crm.data.repository.AuthRepository
import too.good.crm.data.UserSession
import too.good.crm.data.ActiveMode

sealed class LoginUiState {
    object Idle : LoginUiState()
    object Loading : LoginUiState()
    data class Success(val message: String) : LoginUiState()
    data class Error(val message: String) : LoginUiState()
}

class LoginViewModel(
    private val authRepository: AuthRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow<LoginUiState>(LoginUiState.Idle)
    val uiState: StateFlow<LoginUiState> = _uiState.asStateFlow()

    private val _username = MutableStateFlow("")
    val username: StateFlow<String> = _username.asStateFlow()

    private val _password = MutableStateFlow("")
    val password: StateFlow<String> = _password.asStateFlow()

    fun onUsernameChange(value: String) {
        _username.value = value
    }

    fun onPasswordChange(value: String) {
        _password.value = value
    }

    fun login(onSuccess: () -> Unit) {
        if (_username.value.isBlank() || _password.value.isBlank()) {
            _uiState.value = LoginUiState.Error("Please enter username and password")
            return
        }

        viewModelScope.launch {
            _uiState.value = LoginUiState.Loading

            val result = authRepository.login(_username.value, _password.value)

            result.fold(
                onSuccess = { loginResponse ->
                    // Convert User to AppUserProfile
                    val user = loginResponse.user
                    val profiles = user.profiles ?: emptyList()

                    // Determine user role based on profiles
                    val hasCustomerProfile = profiles.any { it.profileType == "customer" }
                    val hasVendorProfile = profiles.any {
                        it.profileType == "employee" || it.profileType == "vendor"
                    }

                    val userRole = when {
                        hasCustomerProfile && hasVendorProfile -> too.good.crm.data.UserRole.BOTH
                        hasCustomerProfile -> too.good.crm.data.UserRole.CLIENT
                        hasVendorProfile -> too.good.crm.data.UserRole.VENDOR
                        else -> too.good.crm.data.UserRole.CLIENT // Default to client
                    }

                    // Get the primary profile
                    val primaryProfile = when {
                        hasVendorProfile -> profiles.firstOrNull {
                            it.profileType == "employee" || it.profileType == "vendor"
                        }
                        else -> profiles.firstOrNull { it.profileType == "customer" }
                    } ?: profiles.firstOrNull()

                    if (primaryProfile != null) {
                        // Set user session with AppUserProfile
                        UserSession.currentProfile = too.good.crm.data.AppUserProfile(
                            id = user.id,
                            name = "${user.firstName} ${user.lastName}",
                            email = user.email,
                            role = userRole,
                            organizationId = primaryProfile.organizationId,
                            organizationName = primaryProfile.organizationName ?: "Unknown",
                            activeMode = if (userRole == too.good.crm.data.UserRole.VENDOR ||
                                            userRole == too.good.crm.data.UserRole.BOTH)
                                        ActiveMode.VENDOR
                                        else ActiveMode.CLIENT
                        )
                    }

                    _uiState.value = LoginUiState.Success("Login successful")
                    onSuccess()
                },
                onFailure = { error ->
                    _uiState.value = LoginUiState.Error(
                        error.message ?: "Login failed"
                    )
                }
            )
        }
    }

    fun clearError() {
        if (_uiState.value is LoginUiState.Error) {
            _uiState.value = LoginUiState.Idle
        }
    }
}

