package too.good.crm.data.rbac

import android.content.Context
import android.util.Log
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import too.good.crm.data.repository.PermissionRepository

/**
 * Utility class to initialize permissions when app starts or user logs in
 */
object PermissionInitializer {
    private const val TAG = "PermissionInitializer"
    
    /**
     * Initialize permissions asynchronously
     * Should be called after login or app start if user is already logged in
     */
    fun initializeAsync(context: Context) {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val permissionRepo = PermissionRepository.getInstance()
                val result = permissionRepo.refreshPermissions()
                result.fold(
                    onSuccess = { (profile, permissions) ->
                        PermissionManager.initialize(profile, permissions)
                        Log.d(TAG, "Permissions initialized successfully: ${permissions.size} permissions")
                    },
                    onFailure = { error ->
                        Log.w(TAG, "Failed to initialize permissions: ${error.message}")
                    }
                )
            } catch (e: Exception) {
                Log.e(TAG, "Error initializing permissions", e)
            }
        }
    }
}
