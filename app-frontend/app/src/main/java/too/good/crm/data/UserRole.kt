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

data class UserProfile(
    val id: String,
    val name: String,
    val email: String,
    val role: UserRole,
    val activeMode: ActiveMode = if (role == UserRole.VENDOR) ActiveMode.VENDOR else ActiveMode.CLIENT
)

object UserSession {
    // In a real app, this would be managed by a ViewModel with proper state management
    private var _currentUser: UserProfile? = null
    private var _activeMode: ActiveMode = ActiveMode.VENDOR

    var currentUser: UserProfile?
        get() = _currentUser
        set(value) {
            _currentUser = value
            _activeMode = value?.activeMode ?: ActiveMode.VENDOR
        }

    var activeMode: ActiveMode
        get() = _activeMode
        set(value) {
            _activeMode = value
        }

    fun canSwitchMode(): Boolean {
        return currentUser?.role == UserRole.BOTH
    }

    fun switchMode() {
        if (canSwitchMode()) {
            _activeMode = if (_activeMode == ActiveMode.VENDOR) {
                ActiveMode.CLIENT
            } else {
                ActiveMode.VENDOR
            }
        }
    }

    // Sample user with both roles
    fun getSampleUser(): UserProfile {
        return UserProfile(
            id = "1",
            name = "John Doe",
            email = "john.doe@company.com",
            role = UserRole.BOTH,
            activeMode = ActiveMode.VENDOR
        )
    }
}

