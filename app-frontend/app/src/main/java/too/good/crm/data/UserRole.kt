package too.good.crm.data

import android.content.Context
import android.content.SharedPreferences

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
    private var prefs: SharedPreferences? = null
    
    // Compose-observable state
    private val _currentProfileState = androidx.compose.runtime.mutableStateOf<AppUserProfile?>(null)
    val currentProfileState: androidx.compose.runtime.State<AppUserProfile?> = _currentProfileState

    private const val PREFS_NAME = "user_session_prefs"
    private const val KEY_USER_ID = "session_user_id"
    private const val KEY_USER_NAME = "session_user_name"
    private const val KEY_USER_EMAIL = "session_user_email"
    private const val KEY_USER_ROLE = "session_user_role"
    private const val KEY_ORG_ID = "session_org_id"
    private const val KEY_ORG_NAME = "session_org_name"
    private const val KEY_ACTIVE_MODE = "session_active_mode"

    fun initialize(context: Context) {
        prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        android.util.Log.d("UserSession", "SharedPreferences initialized")
    }

    var currentProfile: AppUserProfile?
        get() = _currentProfile
        set(value) {
            _currentProfile = value
            _currentProfileState.value = value
            _activeMode = value?.activeMode ?: ActiveMode.VENDOR
            android.util.Log.d("UserSession", "Profile set: userId=${value?.id}, name=${value?.name}, authenticated=${value != null}")
            
            // Persist to SharedPreferences
            if (value != null) {
                saveToPreferences(value)
            }
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
        _currentProfileState.value = null
        _activeMode = ActiveMode.VENDOR
        clearPreferences()
        android.util.Log.d("UserSession", "Session cleared")
    }

    /**
     * Restore session from SharedPreferences
     * Should be called on app start
     */
    fun restoreSession() {
        android.util.Log.d("UserSession", "=== RESTORING SESSION ===")
        android.util.Log.d("UserSession", "prefs initialized: ${prefs != null}")
        
        if (prefs == null) {
            android.util.Log.e("UserSession", "SharedPreferences is null! Call initialize() first")
            return
        }
        
        prefs?.let { preferences ->
            val userId = preferences.getInt(KEY_USER_ID, -1)
            android.util.Log.d("UserSession", "Loaded userId from prefs: $userId")
            
            if (userId != -1) {
                val name = preferences.getString(KEY_USER_NAME, "") ?: ""
                val email = preferences.getString(KEY_USER_EMAIL, "") ?: ""
                val roleStr = preferences.getString(KEY_USER_ROLE, "CLIENT") ?: "CLIENT"
                val orgId = preferences.getInt(KEY_ORG_ID, 0)
                val orgName = preferences.getString(KEY_ORG_NAME, "") ?: ""
                val activeModeStr = preferences.getString(KEY_ACTIVE_MODE, "VENDOR") ?: "VENDOR"

                android.util.Log.d("UserSession", "Loaded from prefs - name: $name, email: $email, role: $roleStr, orgId: $orgId, mode: $activeModeStr")

                val role = try { UserRole.valueOf(roleStr) } catch (e: Exception) { 
                    android.util.Log.w("UserSession", "Invalid role: $roleStr, defaulting to CLIENT")
                    UserRole.CLIENT 
                }
                val activeMode = try { ActiveMode.valueOf(activeModeStr) } catch (e: Exception) { 
                    android.util.Log.w("UserSession", "Invalid activeMode: $activeModeStr, defaulting to VENDOR")
                    ActiveMode.VENDOR 
                }

                _currentProfile = AppUserProfile(
                    id = userId,
                    name = name,
                    email = email,
                    role = role,
                    organizationId = orgId,
                    organizationName = orgName,
                    activeMode = activeMode
                )
                _currentProfileState.value = _currentProfile
                _activeMode = activeMode

                android.util.Log.d("UserSession", "✅ Session restored successfully: userId=$userId, name=$name, email=$email")
                android.util.Log.d("UserSession", "_currentProfile is now: ${_currentProfile?.id}")
                android.util.Log.d("UserSession", "_currentProfileState.value is now: ${_currentProfileState.value?.id}")
            } else {
                android.util.Log.d("UserSession", "❌ No saved session found (userId was -1)")
            }
        }
    }

    private fun saveToPreferences(profile: AppUserProfile) {
        prefs?.edit()?.apply {
            putInt(KEY_USER_ID, profile.id)
            putString(KEY_USER_NAME, profile.name)
            putString(KEY_USER_EMAIL, profile.email)
            putString(KEY_USER_ROLE, profile.role.name)
            putInt(KEY_ORG_ID, profile.organizationId)
            putString(KEY_ORG_NAME, profile.organizationName)
            putString(KEY_ACTIVE_MODE, profile.activeMode.name)
            apply()
        }
        android.util.Log.d("UserSession", "Session saved to preferences")
    }

    private fun clearPreferences() {
        prefs?.edit()?.clear()?.apply()
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

