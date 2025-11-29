package too.good.crm.features.login

import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import too.good.crm.data.repository.AuthRepository
import too.good.crm.data.UserSession
import too.good.crm.data.ActiveMode
import too.good.crm.data.api.NetworkUtils

sealed class LoginUiState {
    object Idle : LoginUiState()
    object Loading : LoginUiState()
    data class Success(val message: String) : LoginUiState()
    data class Error(val message: String) : LoginUiState()
}

class LoginViewModel(
    private val authRepository: AuthRepository,
    private val context: Context
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

        // Check network connectivity first
        if (!NetworkUtils.isNetworkAvailable(context)) {
            _uiState.value = LoginUiState.Error(
                "No internet connection.\n\n" +
                "Please check:\n" +
                "• WiFi or mobile data is enabled\n" +
                "• Device is connected to network\n" +
                "• Network has internet access"
            )
            return
        }

        viewModelScope.launch {
            _uiState.value = LoginUiState.Loading

            android.util.Log.d("LoginViewModel", "Attempting login for user: ${_username.value}")

            val result = authRepository.login(_username.value, _password.value)

            result.fold(
                onSuccess = { loginResponse ->
                    android.util.Log.d("LoginViewModel", "Login successful: token=${loginResponse.token}, user=${loginResponse.user.username}")
                    val user = loginResponse.user
                    val profiles = user.profiles ?: emptyList()
                    val primaryProfile = user.primaryProfile ?: profiles.find { it.isPrimary } ?: profiles.firstOrNull()
                    val hasCustomerProfile = profiles.any { it.profileType == "customer" }
                    val hasVendorProfile = profiles.any { it.profileType == "employee" || it.profileType == "vendor" }
                    val userRole = when {
                        hasCustomerProfile && hasVendorProfile -> too.good.crm.data.UserRole.BOTH
                        hasCustomerProfile -> too.good.crm.data.UserRole.CLIENT
                        hasVendorProfile -> too.good.crm.data.UserRole.VENDOR
                        else -> too.good.crm.data.UserRole.CLIENT
                    }
                    val activeMode = when (primaryProfile?.profileType) {
                        "vendor", "employee" -> ActiveMode.VENDOR
                        "customer" -> ActiveMode.CLIENT
                        else -> if (hasVendorProfile) ActiveMode.VENDOR else ActiveMode.CLIENT
                    }
                    if (primaryProfile != null) {
                        UserSession.currentProfile = too.good.crm.data.AppUserProfile(
                            id = user.id,
                            name = "${user.firstName} ${user.lastName}",
                            email = user.email,
                            role = userRole,
                            organizationId = primaryProfile.organizationId ?: 0,
                            organizationName = primaryProfile.organizationName ?: primaryProfile.organization?.name ?: "Unknown",
                            activeMode = activeMode
                        )
                        UserSession.activeMode = activeMode
                    }
                    _uiState.value = LoginUiState.Success("Login successful")
                    onSuccess()
                },
                onFailure = { error ->
                    android.util.Log.e("LoginViewModel", "Login failed: ${error.message}")
                    _uiState.value = LoginUiState.Error(error.message ?: "Login failed")
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
