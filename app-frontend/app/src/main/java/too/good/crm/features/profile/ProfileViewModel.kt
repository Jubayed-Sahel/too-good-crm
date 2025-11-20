package too.good.crm.features.profile

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import too.good.crm.data.model.User
import too.good.crm.data.model.UserProfile
import too.good.crm.data.repository.ProfileRepository
import android.content.Context

data class ProfileUiState(
    val profiles: List<UserProfile> = emptyList(),
    val activeProfile: UserProfile? = null,
    val isLoading: Boolean = false,
    val error: String? = null,
    val isSwitching: Boolean = false
)

class ProfileViewModel(context: Context) : ViewModel() {
    private val repository = ProfileRepository(context)
    private val context = context
    
    private val _uiState = MutableStateFlow(ProfileUiState())
    val uiState: StateFlow<ProfileUiState> = _uiState.asStateFlow()

    // Don't auto-load on init - let screens control when to load
    // This prevents unnecessary API calls if user is not logged in

    /**
     * Load all available profiles for current user
     * Filters employee profiles to only show those with an organization
     * Falls back to getting profiles from user object if role selection API fails
     */
    fun loadProfiles() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            
            // Try role selection API first
            repository.getAvailableProfiles()
                .onSuccess { profiles ->
                    // Find active profile (primary profile or first available)
                    val activeProfile = profiles.find { it.isPrimary } 
                        ?: profiles.firstOrNull()
                    
                    _uiState.value = _uiState.value.copy(
                        profiles = profiles,
                        activeProfile = activeProfile,
                        isLoading = false
                    )
                }
                .onFailure { error ->
                    // Fallback: Try to get profiles from user object
                    repository.getProfilesFromUser(context)
                        .onSuccess { profiles ->
                            val activeProfile = profiles.find { it.isPrimary } 
                                ?: profiles.firstOrNull()
                            
                            _uiState.value = _uiState.value.copy(
                                profiles = profiles,
                                activeProfile = activeProfile,
                                isLoading = false
                            )
                        }
                        .onFailure { fallbackError ->
                            _uiState.value = _uiState.value.copy(
                                isLoading = false,
                                error = error.message ?: "Failed to load profiles"
                            )
                        }
                }
        }
    }

    /**
     * Switch to a different profile
     */
    fun switchProfile(profileId: Int, onSuccess: (User) -> Unit, onError: (String) -> Unit) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isSwitching = true, error = null)
            repository.switchProfile(profileId)
                .onSuccess { user ->
                    // Refresh profiles list from updated user data
                    val updatedProfiles = user.profiles ?: emptyList()
                    
                    // Get the new active profile (should be primary after switch)
                    val newActiveProfile = user.primaryProfile 
                        ?: updatedProfiles.find { it.id == profileId }
                        ?: updatedProfiles.find { it.isPrimary }
                        ?: updatedProfiles.firstOrNull()
                    
                    // Update state with new profiles and active profile
                    _uiState.value = _uiState.value.copy(
                        profiles = updatedProfiles,
                        activeProfile = newActiveProfile,
                        isSwitching = false
                    )
                    onSuccess(user)
                }
                .onFailure { error ->
                    _uiState.value = _uiState.value.copy(
                        isSwitching = false,
                        error = error.message ?: "Failed to switch profile"
                    )
                    onError(error.message ?: "Failed to switch profile")
                }
        }
    }

    /**
     * Refresh profiles
     */
    fun refreshProfiles() {
        loadProfiles()
    }

    /**
     * Get employee profiles (only those with organization)
     */
    fun getEmployeeProfiles(): List<UserProfile> {
        return _uiState.value.profiles.filter { 
            it.profileType == "employee" && (it.organization != null || it.organizationId != null)
        }
    }

    /**
     * Get vendor profiles
     */
    fun getVendorProfiles(): List<UserProfile> {
        return _uiState.value.profiles.filter { 
            it.profileType == "vendor"
        }
    }

    /**
     * Get customer profiles
     */
    fun getCustomerProfiles(): List<UserProfile> {
        return _uiState.value.profiles.filter { 
            it.profileType == "customer"
        }
    }
}

