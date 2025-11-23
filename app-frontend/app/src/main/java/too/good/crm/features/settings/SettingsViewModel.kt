package too.good.crm.features.settings

import android.content.Context
import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import too.good.crm.data.model.User
import too.good.crm.data.repository.UserRepository

/**
 * ViewModel for Settings Screen
 * Manages user profile data and password changes
 */
class SettingsViewModel(private val context: Context) : ViewModel() {
    
    private val userRepository = UserRepository(context)
    
    private val _uiState = MutableStateFlow<SettingsUiState>(SettingsUiState.Loading)
    val uiState: StateFlow<SettingsUiState> = _uiState.asStateFlow()
    
    private val _passwordChangeState = MutableStateFlow<PasswordChangeState>(PasswordChangeState.Idle)
    val passwordChangeState: StateFlow<PasswordChangeState> = _passwordChangeState.asStateFlow()
    
    companion object {
        private const val TAG = "SettingsViewModel"
    }
    
    init {
        loadUserProfile()
    }
    
    /**
     * Load user profile from API
     */
    fun loadUserProfile() {
        viewModelScope.launch {
            try {
                Log.d(TAG, "Loading user profile")
                _uiState.value = SettingsUiState.Loading
                
                val result = userRepository.getCurrentUser()
                result.fold(
                    onSuccess = { user ->
                        Log.d(TAG, "User profile loaded successfully")
                        _uiState.value = SettingsUiState.Success(user)
                    },
                    onFailure = { error ->
                        Log.e(TAG, "Failed to load user profile", error)
                        _uiState.value = SettingsUiState.Error(
                            error.message ?: "Failed to load profile"
                        )
                    }
                )
            } catch (e: Exception) {
                Log.e(TAG, "Error loading user profile", e)
                _uiState.value = SettingsUiState.Error(
                    e.message ?: "An error occurred"
                )
            }
        }
    }
    
    /**
     * Change user password
     */
    fun changePassword(currentPassword: String, newPassword: String, confirmPassword: String) {
        viewModelScope.launch {
            try {
                Log.d(TAG, "Attempting to change password")
                
                // Validate passwords
                if (currentPassword.isEmpty()) {
                    _passwordChangeState.value = PasswordChangeState.Error("Current password is required")
                    return@launch
                }
                
                if (newPassword.isEmpty()) {
                    _passwordChangeState.value = PasswordChangeState.Error("New password is required")
                    return@launch
                }
                
                if (newPassword.length < 6) {
                    _passwordChangeState.value = PasswordChangeState.Error("Password must be at least 6 characters")
                    return@launch
                }
                
                if (newPassword != confirmPassword) {
                    _passwordChangeState.value = PasswordChangeState.Error("Passwords don't match")
                    return@launch
                }
                
                if (currentPassword == newPassword) {
                    _passwordChangeState.value = PasswordChangeState.Error("New password must be different from current password")
                    return@launch
                }
                
                _passwordChangeState.value = PasswordChangeState.Loading
                
                val result = userRepository.changePassword(currentPassword, newPassword)
                result.fold(
                    onSuccess = { message ->
                        Log.d(TAG, "Password changed successfully")
                        _passwordChangeState.value = PasswordChangeState.Success(message)
                    },
                    onFailure = { error ->
                        Log.e(TAG, "Failed to change password", error)
                        _passwordChangeState.value = PasswordChangeState.Error(
                            error.message ?: "Failed to change password"
                        )
                    }
                )
            } catch (e: Exception) {
                Log.e(TAG, "Error changing password", e)
                _passwordChangeState.value = PasswordChangeState.Error(
                    e.message ?: "An error occurred"
                )
            }
        }
    }
    
    /**
     * Reset password change state
     */
    fun resetPasswordChangeState() {
        _passwordChangeState.value = PasswordChangeState.Idle
    }
    
    /**
     * Retry loading user profile
     */
    fun retry() {
        loadUserProfile()
    }
}

/**
 * UI State for Settings Screen
 */
sealed class SettingsUiState {
    object Loading : SettingsUiState()
    data class Success(val user: User) : SettingsUiState()
    data class Error(val message: String) : SettingsUiState()
}

/**
 * State for password change operation
 */
sealed class PasswordChangeState {
    object Idle : PasswordChangeState()
    object Loading : PasswordChangeState()
    data class Success(val message: String) : PasswordChangeState()
    data class Error(val message: String) : PasswordChangeState()
}

