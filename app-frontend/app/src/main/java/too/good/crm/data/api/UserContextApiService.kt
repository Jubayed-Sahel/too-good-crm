package too.good.crm.data.api

import retrofit2.Response
import retrofit2.http.*
import com.google.gson.annotations.SerializedName

/**
 * API Service for user context and permissions
 * Matches web frontend: web-frontend/src/services/rbac.service.ts
 * 
 * Backend endpoint: /api/user-context/permissions/
 * Returns permissions in DOT notation: ["customer.read", "customer.create"]
 */
interface UserContextApiService {
    
    /**
     * Get user's permissions for a specific organization
     * Matches web frontend: GET /api/user-context/permissions/?organization={orgId}
     * 
     * @param organizationId Organization ID (required)
     * @return UserPermissionsResponse with permissions array
     */
    @GET("user-context/permissions/")
    suspend fun getPermissions(
        @Query("organization") organizationId: Int
    ): Response<UserPermissionsResponse>
}

/**
 * Response from /api/user-context/permissions/
 * Matches backend: shared-backend/crmApp/viewsets/user_context.py
 * 
 * Format:
 * {
 *   "organization_id": 1,
 *   "organization_name": "My Org",
 *   "is_owner": false,
 *   "is_employee": true,
 *   "role": "Support",
 *   "role_id": 5,
 *   "permissions": ["customer.read", "customer.create", "deal.read"],  // DOT notation
 *   "grouped_permissions": {
 *     "customer": ["read", "create"],
 *     "deal": ["read"]
 *   }
 * }
 */
data class UserPermissionsResponse(
    @SerializedName("organization_id")
    val organizationId: Int,
    
    @SerializedName("organization_name")
    val organizationName: String? = null,
    
    @SerializedName("is_owner")
    val isOwner: Boolean = false,
    
    @SerializedName("is_employee")
    val isEmployee: Boolean = false,
    
    val role: String? = null,
    
    @SerializedName("role_id")
    val roleId: Int? = null,
    
    /**
     * Permissions array in DOT notation: ["customer.read", "customer.create"]
     * Web frontend uses this format
     * Backend returns this format from PermissionChecker.get_all_permissions()
     */
    val permissions: List<String> = emptyList(),
    
    @SerializedName("grouped_permissions")
    val groupedPermissions: Map<String, List<String>> = emptyMap()
)

