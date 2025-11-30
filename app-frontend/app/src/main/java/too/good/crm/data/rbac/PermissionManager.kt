package too.good.crm.data.rbac

import android.util.Log
import too.good.crm.data.model.UserProfile

/**
 * RBAC Permission Manager for Android
 * 
 * Implements Role-Based Access Control following backend patterns:
 * - Vendors: Full access to their organization
 * - Employees: Permissions based on assigned roles
 * - Customers: Limited read access
 * 
 * Permission format: "resource:action" (e.g., "customer:update", "deal:read")
 * Resources are SINGULAR (customer, not customers)
 * Actions are CRUD (read, create, update, delete)
 */
object PermissionManager {
    private const val TAG = "PermissionManager"
    
    private var cachedPermissions: Set<String> = emptySet()
    private var cachedProfile: UserProfile? = null
    private var isVendor: Boolean = false
    private var isEmployee: Boolean = false
    private var isCustomer: Boolean = false
    private var organizationId: Int? = null
    
    /**
     * Initialize permission manager with user profile and permissions
     */
    fun initialize(profile: UserProfile?, permissions: List<String>?) {
        cachedProfile = profile
        cachedPermissions = permissions?.toSet() ?: emptySet()
        
        // Determine user role
        val profileType = profile?.profileType?.lowercase() ?: ""
        isVendor = profileType == "vendor"
        isEmployee = profileType == "employee"
        isCustomer = profileType == "customer"
        organizationId = profile?.organizationId
        
        Log.d(TAG, "Permission Manager initialized:")
        Log.d(TAG, "  - Profile Type: $profileType")
        Log.d(TAG, "  - Organization ID: $organizationId")
        Log.d(TAG, "  - Is Vendor: $isVendor")
        Log.d(TAG, "  - Is Employee: $isEmployee")
        Log.d(TAG, "  - Permissions Count: ${cachedPermissions.size}")
        Log.d(TAG, "  - Permissions: ${cachedPermissions.joinToString(", ")}")
    }
    
    /**
     * Clear cached permissions (on logout)
     */
    fun clear() {
        cachedPermissions = emptySet()
        cachedProfile = null
        isVendor = false
        isEmployee = false
        isCustomer = false
        organizationId = null
        Log.d(TAG, "Permission Manager cleared")
    }
    
    /**
     * Check if user has permission for a resource and action
     * 
     * Authorization hierarchy (matches web frontend and backend):
     * 1. Superusers/Staff: Full access everywhere (handled by backend)
     * 2. Vendors/Owners: Full access to their organization (return true immediately)
     * 3. Employees: Check explicit permissions from API
     * 4. Customers: Limited access
     * 
     * Matches web frontend: web-frontend/src/utils/permissions.ts::hasPermission()
     * 
     * @param resource Resource name (e.g., "customer", "deal", "lead")
     * @param action Action name (e.g., "read", "create", "update", "delete")
     * @return true if user has permission, false otherwise
     */
    fun hasPermission(resource: String, action: String): Boolean {
        // Normalize resource to singular form (customer not customers)
        val normalizedResource = normalizeResource(resource)
        
        // Normalize action to standard CRUD format
        val normalizedAction = normalizeAction(action)
        
        // VENDOR/OWNER CHECK - Vendors have ALL permissions in their organization
        // Matches web frontend: if (isVendor || isOwner) return true
        if (isVendor) {
            Log.v(TAG, "Permission GRANTED (vendor): $normalizedResource:$normalizedAction")
            return true
        }
        
        // For employees and others, check explicit permissions
        if (isEmployee || isCustomer) {
            // Check for wildcard permission (matches web frontend)
            // Backend returns "*:*" for vendors, but we check it here too for safety
            if (cachedPermissions.contains("*:*")) {
                Log.v(TAG, "Permission GRANTED (wildcard): $normalizedResource:$normalizedAction")
                return true
            }
            
            // Check permissions in both formats:
            // 1. DOT notation: "customer.read" (from /api/user-context/permissions/)
            // 2. COLON notation: "customer:read" (for consistency)
            val dotPermission = "$normalizedResource.$normalizedAction"
            val colonPermission = "$normalizedResource:$normalizedAction"
            
            // Check for resource wildcard (both formats)
            val resourceWildcardDot = "$normalizedResource.*"
            val resourceWildcardColon = "$normalizedResource:*"
            
            val hasPermission = when {
                cachedPermissions.contains(dotPermission) -> true
                cachedPermissions.contains(colonPermission) -> true
                cachedPermissions.contains(resourceWildcardDot) -> true
                cachedPermissions.contains(resourceWildcardColon) -> true
                else -> false
            }
            
            if (hasPermission) {
                Log.v(TAG, "Permission GRANTED (explicit): $normalizedResource:$normalizedAction")
            } else {
                Log.v(TAG, "Permission DENIED: $normalizedResource:$normalizedAction")
                Log.v(TAG, "  Available permissions: ${cachedPermissions.joinToString(", ")}")
            }
            
            return hasPermission
        }
        
        // Unknown profile type - deny access
        Log.w(TAG, "Permission DENIED: Unknown profile type")
        return false
    }
    
    /**
     * Check if user can access resource (read permission)
     */
    fun canRead(resource: String): Boolean = hasPermission(resource, "read")
    
    /**
     * Check if user can create resource
     */
    fun canCreate(resource: String): Boolean = hasPermission(resource, "create")
    
    /**
     * Check if user can update resource
     */
    fun canUpdate(resource: String): Boolean = hasPermission(resource, "update")
    
    /**
     * Check if user can delete resource
     */
    fun canDelete(resource: String): Boolean = hasPermission(resource, "delete")
    
    /**
     * Normalize resource name to singular form
     * Backend uses singular: customer, not customers
     */
    private fun normalizeResource(resource: String): String {
        return when {
            resource.endsWith("s") && resource.length > 1 -> {
                val singular = resource.dropLast(1)
                // Handle special cases
                when (singular) {
                    "analytic", "setting", "new" -> resource // Keep plural
                    else -> singular
                }
            }
            else -> resource
        }
    }
    
    /**
     * Normalize action to standard CRUD format
     * Backend uses: read, create, update, delete
     */
    private fun normalizeAction(action: String): String {
        return when (action.lowercase()) {
            "view", "read" -> "read"
            "create", "add", "new" -> "create"
            "edit", "update", "modify", "change" -> "update"
            "delete", "remove" -> "delete"
            else -> action.lowercase()
        }
    }
    
    /**
     * Get current organization ID
     */
    fun getOrganizationId(): Int? = organizationId
    
    /**
     * Check if user is vendor
     */
    fun isVendor(): Boolean = isVendor
    
    /**
     * Check if user is employee
     */
    fun isEmployee(): Boolean = isEmployee
    
    /**
     * Check if user is customer
     */
    fun isCustomer(): Boolean = isCustomer
    
    /**
     * Get all cached permissions
     */
    fun getPermissions(): Set<String> = cachedPermissions.toSet()
}
