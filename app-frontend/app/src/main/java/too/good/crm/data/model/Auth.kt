package too.good.crm.data.model

import com.google.gson.annotations.SerializedName

// Login Request/Response
data class LoginRequest(
    @SerializedName("username")
    val username: String,
    @SerializedName("password")
    val password: String
)

data class LoginResponse(
    @SerializedName("token")
    val token: String,
    @SerializedName("user")
    val user: User,
    @SerializedName("access")
    val accessToken: String? = null,
    @SerializedName("refresh")
    val refreshToken: String? = null
)

// Register Request/Response
data class RegisterRequest(
    @SerializedName("username")
    val username: String,
    @SerializedName("email")
    val email: String,
    @SerializedName("password")
    val password: String,
    @SerializedName("first_name")
    val firstName: String,
    @SerializedName("last_name")
    val lastName: String,
    @SerializedName("phone_number")
    val phoneNumber: String? = null
)

data class RegisterResponse(
    @SerializedName("token")
    val token: String,
    @SerializedName("user")
    val user: User,
    @SerializedName("message")
    val message: String? = null
)

// Logout Response
data class LogoutResponse(
    @SerializedName("message")
    val message: String
)

// User Response
data class UserResponse(
    @SerializedName("user")
    val user: User
)

// Change Password Request
data class ChangePasswordRequest(
    @SerializedName("old_password")
    val oldPassword: String,
    @SerializedName("new_password")
    val newPassword: String
)

// Generic Message Response
data class MessageResponse(
    @SerializedName("message")
    val message: String,
    @SerializedName("status")
    val status: String? = null
)

// User Model
data class User(
    @SerializedName("id")
    val id: Int,
    @SerializedName("username")
    val username: String,
    @SerializedName("email")
    val email: String,
    @SerializedName("first_name")
    val firstName: String,
    @SerializedName("last_name")
    val lastName: String,
    @SerializedName("is_active")
    val isActive: Boolean = true,
    @SerializedName("profiles")
    val profiles: List<UserProfile>? = null
)

// User Profile Model
data class UserProfile(
    @SerializedName("id")
    val id: Int,
    @SerializedName("profile_type")
    val profileType: String, // "customer", "employee", "vendor"
    @SerializedName("organization_id")
    val organizationId: Int,
    @SerializedName("organization_name")
    val organizationName: String? = null,
    @SerializedName("role")
    val role: String? = null,
    @SerializedName("permissions")
    val permissions: List<String>? = null
)

