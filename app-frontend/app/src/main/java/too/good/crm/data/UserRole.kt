package too.good.crm.data

enum class UserRole {
    VENDOR,
    CLIENT,
    BOTH
}

enum class ActiveMode {
    VENDOR,
    CLIENT
}

data class AppUserProfile(
    val id: Int,
    val name: String,
    val email: String,
    val role: UserRole,
    val organizationId: Int,
    val organizationName: String,
    val activeMode: ActiveMode = if (role == UserRole.VENDOR) ActiveMode.VENDOR else ActiveMode.CLIENT
)

object UserSession {
    private var _currentProfile: AppUserProfile? = null
    private var _activeMode: ActiveMode = ActiveMode.VENDOR
    
    // Compose-observable state
    private val _currentProfileState = androidx.compose.runtime.mutableStateOf<AppUserProfile?>(null)
    val currentProfileState: androidx.compose.runtime.State<AppUserProfile?> = _currentProfileState

    var currentProfile: AppUserProfile?
        get() = _currentProfile
        set(value) {
            _currentProfile = value
            _currentProfileState.value = value
            _activeMode = value?.activeMode ?: ActiveMode.VENDOR
            android.util.Log.d("UserSession", "Profile set: userId=${value?.id}, name=${value?.name}, authenticated=${value != null}")
        }

    var activeMode: ActiveMode
        get() = _activeMode
        set(value) {
            _activeMode = value
        }
    
    /**
     * Check if user is authenticated
     */
    val isAuthenticated: Boolean
        get() = _currentProfile != null
    
    /**
     * Get current user ID
     */
    val userId: Int?
        get() = _currentProfile?.id

    fun canSwitchMode(): Boolean {
        return _currentProfile?.role == UserRole.BOTH
    }

    fun switchMode() {
        if (canSwitchMode()) {
            _activeMode = if (_activeMode == ActiveMode.VENDOR) {
                ActiveMode.CLIENT
            } else {
                ActiveMode.VENDOR
            }

            // Update current profile with new mode
            _currentProfile = _currentProfile?.copy(activeMode = _activeMode)
        }
    }

    /**
     * Clear the current user session
     * This should be called on logout
     */
    fun clearSession() {
        _currentProfile = null
        _activeMode = ActiveMode.VENDOR
    }

    // Sample user with both roles for testing
    fun initializeSampleUser() {
        _currentProfile = AppUserProfile(
            id = 1,
            name = "John Doe",
            email = "john.doe@company.com",
            role = UserRole.BOTH,
            organizationId = 1,
            organizationName = "Sample Company",
            activeMode = ActiveMode.VENDOR
        )
        _activeMode = ActiveMode.VENDOR
    }
}

