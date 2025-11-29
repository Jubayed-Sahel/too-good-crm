package too.good.crm.utils

import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.launch
import too.good.crm.data.UserSession
import too.good.crm.data.repository.AuthRepository

/**
 * Centralized logout handler to ensure consistent logout behavior across all screens
 */
object LogoutHandler {
    
    /**
     * Performs complete logout:
     * 1. Calls backend logout API
     * 2. Clears UserSession
     * 3. Clears local storage
     * 4. Navigates to login screen
     * 
     * @param scope CoroutineScope for async operations
     * @param authRepository AuthRepository instance
     * @param onComplete Callback to navigate to login after logout completes
     */
    fun performLogout(
        scope: CoroutineScope,
        authRepository: AuthRepository,
        onComplete: () -> Unit
    ) {
        scope.launch {
            try {
                // Call backend logout API to invalidate token
                authRepository.logout()
            } catch (e: Exception) {
                // Log error but continue with local logout
                println("⚠️ Logout API failed: ${e.message}, but continuing with local logout")
            } finally {
                // Always clear local session data
                UserSession.clearSession()
                
                // Navigate to login screen
                onComplete()
            }
        }
    }
    
    /**
     * Quick logout for emergency situations (no async operations)
     * Use this only when coroutine scope is not available
     */
    fun performQuickLogout(onComplete: () -> Unit) {
        // Clear local session data immediately
        UserSession.clearSession()
        
        // Navigate to login screen
        onComplete()
    }
}

