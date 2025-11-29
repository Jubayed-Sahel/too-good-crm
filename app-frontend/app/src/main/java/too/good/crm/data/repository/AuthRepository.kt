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
                val errorMessage = when (response.code()) {
                    401 -> "Invalid username or password"
                    403 -> "Access denied"
                    404 -> "Server endpoint not found"
                    500 -> "Server error. Please try again later"
                    else -> response.message() ?: "Login failed"
                }
                Result.failure(Exception(errorMessage))
            }
        } catch (e: java.net.ConnectException) {
            Result.failure(Exception(
                "Cannot connect to server. Please verify:\n\n" +
                "1. Backend is running: python manage.py runserver 0.0.0.0:8000\n" +
                "2. For Emulator: Use 10.0.2.2:8000 (currently set)\n" +
                "3. For Physical Device: Check IP in ApiClient.kt\n" +
                "4. Firewall allows port 8000\n\n" +
                "Error: ${e.message}"
            ))
        } catch (e: java.net.SocketTimeoutException) {
            Result.failure(Exception(
                "Connection timeout after 15 seconds.\n\n" +
                "Possible causes:\n" +
                "1. Backend server is not running\n" +
                "2. Wrong IP address configured\n" +
                "3. Firewall blocking connection\n" +
                "4. Network is unstable\n\n" +
                "Quick Fix:\n" +
                "• Start backend: python manage.py runserver 0.0.0.0:8000\n" +
                "• For Emulator: Use 10.0.2.2:8000 in gradle.properties\n" +
                "• For Device: Use your PC's IP (e.g., 192.168.x.x:8000)\n" +
                "• Check firewall allows port 8000"
            ))
        } catch (e: java.net.UnknownHostException) {
            Result.failure(Exception(
                "Cannot resolve server address.\n\n" +
                "Please verify:\n" +
                "1. IP address in ApiClient.kt is correct\n" +
                "2. For Emulator: Use 10.0.2.2:8000\n" +
                "3. For Device: Use your PC's IP (e.g., 192.168.x.x:8000)\n" +
                "4. Internet/WiFi connection is active\n\n" +
                "Error: ${e.message}"
            ))
        } catch (e: javax.net.ssl.SSLException) {
            Result.failure(Exception(
                "SSL/Security error. If using HTTPS:\n" +
                "• Ensure certificate is valid\n" +
                "• Try using HTTP for local development\n\n" +
                "Error: ${e.message}"
            ))
        } catch (e: Exception) {
            val errorMessage = when {
                e.message?.contains("Failed to connect", ignoreCase = true) == true -> {
                    "Connection failed. Backend server not reachable.\n\n" +
                    "Start backend: python manage.py runserver 0.0.0.0:8000\n" +
                    "Then retry login.\n\n" +
                    "Error: ${e.message}"
                }
                e.message?.contains("timeout", ignoreCase = true) == true -> {
                    "Request timed out. Server may be slow or offline.\n\n" +
                    "• Check backend is running\n" +
                    "• Verify network connection\n" +
                    "• Try again in a moment"
                }
                e.message?.contains("ECONNREFUSED", ignoreCase = true) == true -> {
                    "Connection refused. Server not accepting connections.\n\n" +
                    "Make sure backend is running on port 8000:\n" +
                    "python manage.py runserver 0.0.0.0:8000"
                }
                else -> "Login failed: ${e.message ?: e.javaClass.simpleName}"
            }
            Result.failure(Exception(errorMessage))
        }
    }

    suspend fun register(
        username: String,
        email: String,
        password: String,
        passwordConfirm: String,
        firstName: String,
        lastName: String,
        phoneNumber: String? = null
    ): Result<RegisterResponse> {
        return try {
            val response = apiService.register(
                RegisterRequest(username, email, password, passwordConfirm, firstName, lastName, phoneNumber)
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
        } catch (e: java.net.SocketTimeoutException) {
            Result.failure(Exception("Connection timeout. Please check your network and try again."))
        } catch (e: java.net.ConnectException) {
            Result.failure(Exception("Cannot connect to server. Please ensure backend is running."))
        } catch (e: Exception) {
            Result.failure(Exception(e.message ?: "Registration failed"))
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
                val userResponse = response.body()!!
                // Update saved user info
                saveUserInfo(userResponse.user)
                Result.success(userResponse)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to get user"))
            }
        } catch (e: java.net.SocketTimeoutException) {
            Result.failure(Exception("Connection timeout. Unable to fetch user data."))
        } catch (e: java.net.ConnectException) {
            Result.failure(Exception("Cannot connect to server. Please check connection."))
        } catch (e: Exception) {
            Result.failure(Exception(e.message ?: "Failed to get user data"))
        }
    }

    /**
     * Refresh user data from backend (same as getCurrentUser but with explicit naming)
     */
    suspend fun refreshUser(): Result<User> {
        return try {
            val response = apiService.getCurrentUser()
            if (response.isSuccessful && response.body() != null) {
                val userResponse = response.body()!!
                // Update saved user info
                saveUserInfo(userResponse.user)
                Result.success(userResponse.user)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to refresh user"))
            }
        } catch (e: java.net.SocketTimeoutException) {
            Result.failure(Exception("Timeout refreshing user data. Using cached data."))
        } catch (e: java.net.ConnectException) {
            Result.failure(Exception("Cannot connect to server. Using cached data."))
        } catch (e: Exception) {
            Result.failure(Exception(e.message ?: "Failed to refresh user data"))
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

