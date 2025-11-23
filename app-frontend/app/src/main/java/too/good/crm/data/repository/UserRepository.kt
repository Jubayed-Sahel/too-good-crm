package too.good.crm.data.repository

import android.content.Context
import android.util.Log
import too.good.crm.data.api.ApiClient
import too.good.crm.data.model.*

/**
 * Repository for User-related API operations
 * Handles profile management and password changes
 */
class UserRepository(context: Context) {
    
    private val apiClient = ApiClient.getInstance(context)
    private val authService = apiClient.authApiService
    
    companion object {
        private const val TAG = "UserRepository"
    }
    
    /**
     * Get current user profile
     * GET /api/users/me/
     */
    suspend fun getCurrentUser(): Result<User> {
        return try {
            Log.d(TAG, "Fetching current user profile")
            val response = authService.getCurrentUser()
            
            if (response.isSuccessful) {
                val userResponse = response.body()
                if (userResponse != null) {
                    Log.d(TAG, "Successfully fetched user: ${userResponse.user.email}")
                    Result.success(userResponse.user)
                } else {
                    Log.e(TAG, "Response body is null")
                    Result.failure(Exception("Empty response"))
                }
            } else {
                val errorMsg = "Failed to fetch user: ${response.code()} - ${response.message()}"
                Log.e(TAG, errorMsg)
                Result.failure(Exception(errorMsg))
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error fetching user", e)
            Result.failure(e)
        }
    }
    
    /**
     * Update user profile
     * PATCH /api/users/me/
     * 
     * Note: Backend might not have a PATCH endpoint for /users/me/
     * This is a placeholder for future implementation
     */
    suspend fun updateProfile(
        firstName: String? = null,
        lastName: String? = null,
        phone: String? = null
    ): Result<User> {
        return try {
            Log.d(TAG, "Updating user profile")
            
            // Build update map with only non-null values
            val updates = mutableMapOf<String, Any>()
            firstName?.let { updates["first_name"] = it }
            lastName?.let { updates["last_name"] = it }
            phone?.let { updates["phone"] = it }
            
            if (updates.isEmpty()) {
                return Result.failure(Exception("No fields to update"))
            }
            
            // TODO: Backend needs to add PATCH /api/users/me/ endpoint
            // For now, return a not implemented error
            Log.w(TAG, "Update profile not implemented in backend yet")
            Result.failure(Exception("Profile update not available yet"))
            
        } catch (e: Exception) {
            Log.e(TAG, "Error updating profile", e)
            Result.failure(e)
        }
    }
    
    /**
     * Change user password
     * POST /api/auth/change-password/
     */
    suspend fun changePassword(
        oldPassword: String,
        newPassword: String
    ): Result<String> {
        return try {
            Log.d(TAG, "Changing password")
            val request = ChangePasswordRequest(
                oldPassword = oldPassword,
                newPassword = newPassword
            )
            
            val response = authService.changePassword(request)
            
            if (response.isSuccessful) {
                val messageResponse = response.body()
                val message = messageResponse?.message ?: "Password changed successfully"
                Log.d(TAG, "Password changed successfully")
                Result.success(message)
            } else {
                val errorMsg = when (response.code()) {
                    400 -> "Invalid password format or passwords don't match"
                    401 -> "Current password is incorrect"
                    else -> "Failed to change password: ${response.message()}"
                }
                Log.e(TAG, "Change password failed: ${response.code()}")
                Result.failure(Exception(errorMsg))
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error changing password", e)
            Result.failure(e)
        }
    }
}

