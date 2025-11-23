package too.good.crm.data.api

import retrofit2.Response
import retrofit2.http.*
import too.good.crm.data.model.*
import com.google.gson.annotations.SerializedName

/**
 * API Service for role/profile selection
 * Handles switching between user profiles (vendor, employee, customer)
 */
interface RoleSelectionApiService {
    
    /**
     * Select a specific role/profile to use
     * @param request Contains the profile_id to switch to
     * @return Updated user data with new primary profile
     */
    @POST("auth/role-selection/select_role/")
    suspend fun selectRole(
        @Body request: SelectRoleRequest
    ): Response<SelectRoleResponse>
    
    /**
     * Get all available roles/profiles for the current user
     * @return List of all active profiles
     */
    @GET("auth/role-selection/available_roles/")
    suspend fun getAvailableRoles(): Response<AvailableRolesResponse>
    
    /**
     * Get the current active role/profile
     * @return Current primary profile
     */
    @GET("auth/role-selection/current_role/")
    suspend fun getCurrentRole(): Response<CurrentRoleResponse>
}

// Request/Response Data Classes following Kotlin best practices
// Using data classes for automatic equals(), hashCode(), toString()
// Using val for immutability
// Using @SerializedName for API field mapping

/**
 * Request body for profile selection
 */
data class SelectRoleRequest(
    @SerializedName("profile_id") 
    val profileId: Int
)

/**
 * Response from profile selection
 */
data class SelectRoleResponse(
    val message: String,
    val user: User,
    @SerializedName("active_profile") 
    val activeProfile: UserProfile
)

/**
 * Response containing all available profiles
 */
data class AvailableRolesResponse(
    val profiles: List<UserProfile>,
    val count: Int
)

/**
 * Response containing current active profile
 */
data class CurrentRoleResponse(
    val profile: UserProfile
)
