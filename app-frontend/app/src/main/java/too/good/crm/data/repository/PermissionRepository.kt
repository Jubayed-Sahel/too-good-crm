package too.good.crm.data.repository

import android.util.Log
import too.good.crm.data.api.ApiClient
import too.good.crm.data.model.UserProfile

/**
 * Repository for fetching user permissions from backend
 * Matches web frontend logic: web-frontend/src/contexts/PermissionContext.tsx
 * 
 * Implementation:
 * - Vendors/Owners: Get wildcard permission ['*:*'] (no API call needed)
 * - Employees: Fetch permissions from /api/user-context/permissions/
 */
class PermissionRepository {
    
    companion object {
        private const val TAG = "PermissionRepository"
        
        @Volatile
        private var instance: PermissionRepository? = null
        
        fun getInstance(): PermissionRepository {
            return instance ?: synchronized(this) {
                instance ?: PermissionRepository().also { instance = it }
            }
        }
    }
    
    private val roleSelectionService = ApiClient.roleSelectionApiService
    private val userContextService = ApiClient.userContextApiService
    
    /**
     * Get current active profile
     */
    suspend fun getCurrentProfile(): Result<UserProfile> {
        return try {
            Log.d(TAG, "Fetching current profile")
            val response = roleSelectionService.getCurrentRole()
            
            if (response.isSuccessful && response.body() != null) {
                val profile = response.body()!!.profile
                Log.d(TAG, "Successfully fetched profile: ${profile.profileType}, org: ${profile.organizationId}")
                Result.success(profile)
            } else {
                val errorMsg = "Failed to get current profile: ${response.code()} - ${response.message()}"
                Log.e(TAG, errorMsg)
                Result.failure(Exception(errorMsg))
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error fetching current profile", e)
            Result.failure(e)
        }
    }
    
    /**
     * Get user permissions for a specific organization
     * Matches web frontend: fetches from /api/user-context/permissions/
     * 
     * @param organizationId Organization ID (required)
     * @return List of permissions in DOT notation: ["customer.read", "customer.create"]
     */
    suspend fun getUserPermissions(organizationId: Int): Result<List<String>> {
        return try {
            Log.d(TAG, "Fetching permissions for organization: $organizationId")
            val response = userContextService.getPermissions(organizationId)
            
            if (response.isSuccessful && response.body() != null) {
                val permissions = response.body()!!.permissions
                Log.d(TAG, "Successfully fetched ${permissions.size} permissions from API")
                Log.d(TAG, "Permissions: ${permissions.joinToString(", ")}")
                Result.success(permissions)
            } else {
                val errorMsg = "Failed to get permissions: ${response.code()} - ${response.message()}"
                Log.e(TAG, errorMsg)
                Result.failure(Exception(errorMsg))
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error fetching permissions", e)
            Result.failure(e)
        }
    }
    
    /**
     * Refresh profile and permissions from backend
     * Matches web frontend PermissionContext logic:
     * - Vendors: Set wildcard ['*:*'] without API call
     * - Employees: Fetch actual permissions from API
     * 
     * @return Pair of (UserProfile, List<String> permissions)
     */
    suspend fun refreshPermissions(): Result<Pair<UserProfile, List<String>>> {
        return try {
            val profileResult = getCurrentProfile()
            profileResult.fold(
                onSuccess = { profile ->
                    val profileType = profile.profileType?.lowercase() ?: ""
                    val organizationId = profile.organizationId
                    
                    val permissions = when {
                        // Vendors and Owners have full access (wildcard)
                        profileType == "vendor" || profileType == "owner" -> {
                            Log.d(TAG, "Profile is VENDOR/OWNER - granting wildcard permission")
                            listOf("*:*") // Wildcard = full access (matches web frontend)
                        }
                        
                        // Employees fetch actual permissions from API
                        profileType == "employee" && organizationId != null -> {
                            Log.d(TAG, "Profile is EMPLOYEE - fetching permissions from API")
                            val permResult = getUserPermissions(organizationId)
                            permResult.getOrElse {
                                Log.w(TAG, "Failed to fetch employee permissions, using empty list: ${it.message}")
                                emptyList()
                            }
                        }
                        
                        // Customers or others: no permissions (empty list)
                        else -> {
                            Log.d(TAG, "Profile is $profileType - no permissions")
                            emptyList()
                        }
                    }
                    
                    Log.d(TAG, "Refreshed permissions: ${permissions.size} permissions for $profileType")
                    Result.success(profile to permissions)
                },
                onFailure = { error ->
                    Log.e(TAG, "Failed to get profile for permission refresh", error)
                    Result.failure(error)
                }
            )
        } catch (e: Exception) {
            Log.e(TAG, "Error refreshing permissions", e)
            Result.failure(e)
        }
    }
}
