package too.good.crm.data.model

import com.google.gson.annotations.SerializedName
import com.google.gson.*
import java.lang.reflect.Type

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
    @SerializedName("password_confirm")
    val passwordConfirm: String,  // Required by backend
    @SerializedName("first_name")
    val firstName: String,
    @SerializedName("last_name")
    val lastName: String,
    @SerializedName("phone")
    val phone: String? = null  // Backend uses 'phone' not 'phone_number'
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
    val profiles: List<UserProfile>? = null,
    @SerializedName("primary_profile")
    val primaryProfile: UserProfile? = null
)

// Organization Model (for employee profiles)
data class Organization(
    @SerializedName("id")
    val id: Int,
    @SerializedName("name")
    val name: String
)

// Role Model (for employee profiles)
data class ProfileRole(
    @SerializedName("id")
    val id: Int,
    @SerializedName("name")
    val name: String,
    @SerializedName("permissions")
    val permissions: List<String>? = null
)

// User Profile Model (Matching Web App Structure)
data class UserProfile(
    @SerializedName("id")
    val id: Int,
    @SerializedName("profile_type")
    val profileType: String, // "customer", "employee", "vendor"
    @SerializedName("organization_id")
    val organizationId: Int? = null,
    @SerializedName("organization_name")
    val organizationName: String? = null,
    @SerializedName("organization")
    val organization: Organization? = null, // Can be ID (number) or object - handled by custom deserializer
    @SerializedName("role")
    val role: String? = null,
    @SerializedName("roles")
    val roles: List<ProfileRole>? = null,
    @SerializedName("permissions")
    val permissions: List<String>? = null,
    @SerializedName("is_primary")
    val isPrimary: Boolean = false,
    @SerializedName("profile_type_display")
    val profileTypeDisplay: String? = null
) {
    companion object {
        /**
         * Custom deserializer for UserProfile that handles organization being either:
         * - A number (ID) - converts to null (we use organization_id instead)
         * - An object (Organization) - deserializes normally
         * - null - remains null
         */
        class UserProfileDeserializer : JsonDeserializer<UserProfile> {
            override fun deserialize(
                json: JsonElement?,
                typeOfT: Type?,
                context: JsonDeserializationContext
            ): UserProfile {
                if (json == null || !json.isJsonObject) {
                    throw JsonParseException("Expected JsonObject for UserProfile")
                }
                
                val jsonObject = json.asJsonObject
                
                // Handle organization field specially - it can be a number or an object
                val organizationElement = jsonObject.get("organization")
                var organization: Organization? = null
                
                if (organizationElement != null && !organizationElement.isJsonNull) {
                    when {
                        organizationElement.isJsonObject -> {
                            // It's an object, deserialize normally using context
                            organization = context.deserialize(organizationElement, Organization::class.java)
                        }
                        organizationElement.isJsonPrimitive && organizationElement.asJsonPrimitive.isNumber -> {
                            // It's a number (ID), ignore it - we'll use organization_id instead
                            // Don't set organization, it will remain null
                        }
                        // If it's null or other type, organization remains null
                    }
                }
                
                // Extract all fields manually
                val id = jsonObject.get("id").asInt
                val profileType = jsonObject.get("profile_type").asString
                val organizationId = if (jsonObject.has("organization_id") && !jsonObject.get("organization_id").isJsonNull) {
                    jsonObject.get("organization_id").asInt
                } else null
                val organizationName = if (jsonObject.has("organization_name") && !jsonObject.get("organization_name").isJsonNull) {
                    jsonObject.get("organization_name").asString
                } else null
                val role = if (jsonObject.has("role") && !jsonObject.get("role").isJsonNull) {
                    jsonObject.get("role").asString
                } else null
                val roles = if (jsonObject.has("roles") && !jsonObject.get("roles").isJsonNull) {
                    context.deserialize<List<ProfileRole>>(jsonObject.get("roles"), object : com.google.gson.reflect.TypeToken<List<ProfileRole>>() {}.type)
                } else null
                val permissions = if (jsonObject.has("permissions") && !jsonObject.get("permissions").isJsonNull) {
                    context.deserialize<List<String>>(jsonObject.get("permissions"), object : com.google.gson.reflect.TypeToken<List<String>>() {}.type)
                } else null
                val isPrimary = if (jsonObject.has("is_primary") && !jsonObject.get("is_primary").isJsonNull) {
                    jsonObject.get("is_primary").asBoolean
                } else false
                val profileTypeDisplay = if (jsonObject.has("profile_type_display") && !jsonObject.get("profile_type_display").isJsonNull) {
                    jsonObject.get("profile_type_display").asString
                } else null

                // Return new UserProfile instance with properly handled organization
                return UserProfile(
                    id = id,
                    profileType = profileType,
                    organizationId = organizationId,
                    organizationName = organizationName,
                    organization = organization,
                    role = role,
                    roles = roles,
                    permissions = permissions,
                    isPrimary = isPrimary,
                    profileTypeDisplay = profileTypeDisplay
                )
            }
        }
    }
}

