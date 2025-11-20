package too.good.crm.data.api

import com.google.gson.annotations.SerializedName
import retrofit2.Response
import retrofit2.http.*
import too.good.crm.data.model.*

interface RoleSelectionApiService {
    /**
     * Get all available roles/profiles for current user
     */
    @GET("auth/role-selection/available_roles/")
    suspend fun getAvailableRoles(): Response<AvailableRolesResponse>

    /**
     * Select a specific role/profile
     */
    @POST("auth/role-selection/select_role/")
    suspend fun selectRole(@Body request: SelectRoleRequest): Response<SelectRoleResponse>

    /**
     * Get current active role/profile
     */
    @GET("auth/role-selection/current_role/")
    suspend fun getCurrentRole(): Response<CurrentRoleResponse>
}

// Request/Response Models
data class SelectRoleRequest(
    @SerializedName("profile_id")
    val profileId: Int
)

data class AvailableRolesResponse(
    @SerializedName("profiles")
    val profiles: List<UserProfile>,
    @SerializedName("count")
    val count: Int
)

data class SelectRoleResponse(
    @SerializedName("message")
    val message: String,
    @SerializedName("user")
    val user: User,
    @SerializedName("active_profile")
    val activeProfile: UserProfile
)

data class CurrentRoleResponse(
    @SerializedName("profile")
    val profile: UserProfile
)

