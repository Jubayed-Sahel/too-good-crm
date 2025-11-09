package too.good.crm.data.repository

import too.good.crm.data.api.ApiClient
import too.good.crm.data.api.AuthApiService
import too.good.crm.data.model.*
import android.content.Context
import android.content.SharedPreferences

class AuthRepository(context: Context) {

    private val apiService: AuthApiService = ApiClient.authApiService
    private val prefs: SharedPreferences =
        context.getSharedPreferences("crm_prefs", Context.MODE_PRIVATE)

    companion object {
        private const val KEY_AUTH_TOKEN = "auth_token"
        private const val KEY_USER_ID = "user_id"
        private const val KEY_USERNAME = "username"
        private const val KEY_EMAIL = "email"
        private const val KEY_FIRST_NAME = "first_name"
        private const val KEY_LAST_NAME = "last_name"
    }

    suspend fun login(username: String, password: String): Result<LoginResponse> {
        return try {
            val response = apiService.login(LoginRequest(username, password))
            if (response.isSuccessful && response.body() != null) {
                val loginResponse = response.body()!!

                // Save token and user info
                saveAuthToken(loginResponse.token)
                saveUserInfo(loginResponse.user)

                // Set token in ApiClient
                ApiClient.setAuthToken(loginResponse.token)

                Result.success(loginResponse)
            } else {
                Result.failure(Exception(response.message() ?: "Login failed"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun register(
        username: String,
        email: String,
        password: String,
        firstName: String,
        lastName: String,
        phoneNumber: String? = null
    ): Result<RegisterResponse> {
        return try {
            val response = apiService.register(
                RegisterRequest(username, email, password, firstName, lastName, phoneNumber)
            )
            if (response.isSuccessful && response.body() != null) {
                val registerResponse = response.body()!!

                // Save token and user info
                saveAuthToken(registerResponse.token)
                saveUserInfo(registerResponse.user)

                // Set token in ApiClient
                ApiClient.setAuthToken(registerResponse.token)

                Result.success(registerResponse)
            } else {
                Result.failure(Exception(response.message() ?: "Registration failed"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun logout(): Result<LogoutResponse> {
        return try {
            val response = apiService.logout()

            // Clear local data regardless of API response
            clearAuthData()

            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.success(LogoutResponse("Logged out locally"))
            }
        } catch (e: Exception) {
            // Clear local data even if API call fails
            clearAuthData()
            Result.success(LogoutResponse("Logged out locally"))
        }
    }

    suspend fun getCurrentUser(): Result<UserResponse> {
        return try {
            val response = apiService.getCurrentUser()
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to get user"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    fun isLoggedIn(): Boolean {
        return getAuthToken() != null
    }

    fun getAuthToken(): String? {
        return prefs.getString(KEY_AUTH_TOKEN, null)
    }

    fun getUserId(): Int {
        return prefs.getInt(KEY_USER_ID, -1)
    }

    fun getUsername(): String? {
        return prefs.getString(KEY_USERNAME, null)
    }

    private fun saveAuthToken(token: String) {
        prefs.edit().putString(KEY_AUTH_TOKEN, token).apply()
    }

    private fun saveUserInfo(user: User) {
        prefs.edit().apply {
            putInt(KEY_USER_ID, user.id)
            putString(KEY_USERNAME, user.username)
            putString(KEY_EMAIL, user.email)
            putString(KEY_FIRST_NAME, user.firstName)
            putString(KEY_LAST_NAME, user.lastName)
            apply()
        }
    }

    private fun clearAuthData() {
        prefs.edit().clear().apply()
        ApiClient.setAuthToken("")
    }

    fun initializeSession() {
        // Load token from preferences and set it in ApiClient
        getAuthToken()?.let { token ->
            ApiClient.setAuthToken(token)
        }
    }
}

