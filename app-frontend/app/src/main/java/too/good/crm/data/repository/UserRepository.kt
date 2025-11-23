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
    
    private val authService = ApiClient.authApiService
    
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
     * PUT/PATCH /api/users/update_profile/
     */
    suspend fun updateProfile(
        firstName: String? = null,
        lastName: String? = null,
        phone: String? = null,
        title: String? = null,
        department: String? = null,
        bio: String? = null,
        location: String? = null,
        timezone: String? = null,
        language: String? = null
    ): Result<User> {
        return try {
            Log.d(TAG, "Updating user profile")
            
            // Build update map with only non-null values
            val updates = mutableMapOf<String, Any>()
            firstName?.let { updates["first_name"] = it }
            lastName?.let { updates["last_name"] = it }
            phone?.let { updates["phone"] = it }
            title?.let { updates["title"] = it }
            department?.let { updates["department"] = it }
            bio?.let { updates["bio"] = it }
            location?.let { updates["location"] = it }
            timezone?.let { updates["timezone"] = it }
            language?.let { updates["language"] = it }
            
            if (updates.isEmpty()) {
                return Result.failure(Exception("No fields to update"))
            }
            
            Log.d(TAG, "Updating fields: ${updates.keys}")
            val response = authService.updateProfile(updates)
            
            if (response.isSuccessful) {
                val user = response.body()
                if (user != null) {
                    Log.d(TAG, "Profile updated successfully")
                    Result.success(user)
                } else {
                    Log.e(TAG, "Update response body is null")
                    Result.failure(Exception("Empty response"))
                }
            } else {
                val errorMsg = "Failed to update profile: ${response.code()} - ${response.message()}"
                Log.e(TAG, errorMsg)
                Result.failure(Exception(errorMsg))
            }
            
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

