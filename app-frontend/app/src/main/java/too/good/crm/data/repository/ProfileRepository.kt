package too.good.crm.data.repository

import too.good.crm.data.api.ApiClient
import too.good.crm.data.api.RoleSelectionApiService
import too.good.crm.data.api.SelectRoleRequest
import too.good.crm.data.model.*
import android.content.Context
import android.content.SharedPreferences

class ProfileRepository(context: Context) {
    private val apiService: RoleSelectionApiService = ApiClient.roleSelectionApiService
    private val prefs: SharedPreferences =
        context.getSharedPreferences("crm_prefs", Context.MODE_PRIVATE)

    companion object {
        private const val KEY_ACTIVE_PROFILE_ID = "active_profile_id"
        private const val KEY_USER_DATA = "user_data"
    }

    /**
     * Get all available profiles for current user
     * Filters employee profiles to only show those with an organization (assigned by vendor)
     */
    suspend fun getAvailableProfiles(): Result<List<UserProfile>> {
        return try {
            val response = apiService.getAvailableRoles()
            if (response.isSuccessful && response.body() != null) {
                val profiles = response.body()!!.profiles
                
                // Filter profiles: Employee profiles only show if they have an organization
                val filteredProfiles = profiles.filter { profile ->
                    if (profile.profileType == "employee") {
                        // Only show employee profiles with an organization (assigned by vendor)
                        profile.organization != null || profile.organizationId != null
                    } else {
                        // Vendor and customer profiles: Always show
                        true
                    }
                }
                
                Result.success(filteredProfiles)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to get profiles"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Switch to a different profile/role
     */
    suspend fun switchProfile(profileId: Int): Result<User> {
        return try {
            val response = apiService.selectRole(SelectRoleRequest(profileId))
            if (response.isSuccessful && response.body() != null) {
                val selectResponse = response.body()!!
                
                // Save active profile ID
                saveActiveProfileId(profileId)
                
                // Save updated user data
                saveUserData(selectResponse.user)
                
                Result.success(selectResponse.user)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to switch profile"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Get current active profile
     */
    suspend fun getCurrentProfile(): Result<UserProfile> {
        return try {
            val response = apiService.getCurrentRole()
            if (response.isSuccessful && response.body() != null) {
                val profile = response.body()!!.profile
                saveActiveProfileId(profile.id)
                Result.success(profile)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to get current profile"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Get saved active profile ID from preferences
     */
    fun getSavedActiveProfileId(): Int? {
        val profileId = prefs.getInt(KEY_ACTIVE_PROFILE_ID, -1)
        return if (profileId != -1) profileId else null
    }

    /**
     * Save active profile ID to preferences
     */
    private fun saveActiveProfileId(profileId: Int) {
        prefs.edit().putInt(KEY_ACTIVE_PROFILE_ID, profileId).apply()
    }

    /**
     * Save user data to preferences (for offline access)
     */
    private fun saveUserData(user: User) {
        // Save the primary profile ID
        user.primaryProfile?.let { saveActiveProfileId(it.id) }
    }
    
    /**
     * Get user profiles from current user endpoint (alternative to role selection API)
     * This can be used as a fallback or to get profiles directly from user object
     */
    suspend fun getProfilesFromUser(context: Context): Result<List<UserProfile>> {
        return try {
            val authRepository = AuthRepository(context)
            val userResult = authRepository.getCurrentUser()
            userResult.fold(
                onSuccess = { userResponse ->
                    val profiles = userResponse.user.profiles ?: emptyList()
                    // Filter employee profiles same way
                    val filteredProfiles = profiles.filter { profile ->
                        if (profile.profileType == "employee") {
                            profile.organization != null || profile.organizationId != null
                        } else {
                            true
                        }
                    }
                    Result.success(filteredProfiles)
                },
                onFailure = { error ->
                    Result.failure(error)
                }
            )
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}

