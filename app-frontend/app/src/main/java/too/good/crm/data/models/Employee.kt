package too.good.crm.data.models

import com.google.gson.annotations.SerializedName

/**
 * Employee model matching backend EmployeeListSerializer
 * This is what the GET /api/employees/ endpoint returns
 * 
 * NOTE: Some fields may be null when fetched from list endpoint
 * but are present when fetching a single employee
 */
data class Employee(
    val id: Int,
    val code: String,
    @SerializedName("full_name")
    val fullName: String,
    val email: String,
    val phone: String? = null,
    val department: String? = null,
    @SerializedName("job_title")
    val jobTitle: String? = null,
    val role: Int? = null,
    @SerializedName("role_name")
    val roleName: String? = null,
    val status: String,
    @SerializedName("status_display")
    val statusDisplay: String? = null,
    @SerializedName("manager_name")
    val managerName: String? = null,
    // Additional fields that may be present in detail view
    @SerializedName("employment_type")
    val employmentType: String? = null,
    @SerializedName("employment_type_display")
    val employmentTypeDisplay: String? = null,
    @SerializedName("hire_date")
    val hireDate: String? = null,
    @SerializedName("emergency_contact")
    val emergencyContact: String? = null,
    val address: String? = null,
    val city: String? = null,
    val state: String? = null,
    @SerializedName("postal_code")
    val postalCode: String? = null,
    @SerializedName("zip_code")
    val zipCode: String? = null,
    val country: String? = null
) {
    // Computed properties for convenience
    val firstName: String
        get() = fullName.split(" ").firstOrNull() ?: fullName
    
    val lastName: String
        get() = fullName.split(" ").drop(1).joinToString(" ").takeIf { it.isNotEmpty() } ?: ""
    
    val initials: String
        get() {
            val parts = fullName.split(" ")
            return when {
                parts.size >= 2 -> "${parts[0].firstOrNull()?.uppercase() ?: ""}${parts[1].firstOrNull()?.uppercase() ?: ""}"
                parts.size == 1 -> "${parts[0].take(2).uppercase()}"
                else -> "??"
            }
        }
}

/**
 * Detailed Employee model for GET /api/employees/{id}/
 * Matches backend EmployeeSerializer (full detail)
 */
data class EmployeeDetail(
    val id: Int,
    val code: String,
    val organization: Int,
    val user: Int? = null,
    @SerializedName("user_profile")
    val userProfile: Int? = null,
    @SerializedName("first_name")
    val firstName: String,
    @SerializedName("last_name")
    val lastName: String,
    @SerializedName("full_name")
    val fullName: String,
    val email: String,
    val phone: String? = null,
    @SerializedName("profile_image")
    val profileImage: String? = null,
    val department: String? = null,
    @SerializedName("job_title")
    val jobTitle: String? = null,
    val role: Int? = null,
    @SerializedName("role_name")
    val roleName: String? = null,
    @SerializedName("employment_type")
    val employmentType: String = "full-time",
    @SerializedName("employment_type_display")
    val employmentTypeDisplay: String? = null,
    @SerializedName("hire_date")
    val hireDate: String? = null,
    @SerializedName("termination_date")
    val terminationDate: String? = null,
    val status: String = "active",
    @SerializedName("status_display")
    val statusDisplay: String? = null,
    @SerializedName("emergency_contact")
    val emergencyContact: String? = null,
    val salary: String? = null,
    @SerializedName("commission_rate")
    val commissionRate: String? = null,
    val manager: Int? = null,
    @SerializedName("manager_name")
    val managerName: String? = null,
    val address: String? = null,
    val city: String? = null,
    val state: String? = null,
    @SerializedName("postal_code")
    val postalCode: String? = null,
    @SerializedName("zip_code")
    val zipCode: String? = null,
    val country: String? = null,
    @SerializedName("created_at")
    val createdAt: String,
    @SerializedName("updated_at")
    val updatedAt: String
) {
    val initials: String
        get() = "${firstName.firstOrNull()?.uppercase() ?: ""}${lastName.firstOrNull()?.uppercase() ?: ""}"
}

/**
 * Request model for creating/inviting employee
 */
data class InviteEmployeeRequest(
    val email: String,
    @SerializedName("first_name")
    val firstName: String,
    @SerializedName("last_name")
    val lastName: String,
    val phone: String? = null,
    val department: String? = null,
    @SerializedName("job_title")
    val jobTitle: String? = null,
    @SerializedName("role_id")
    val roleId: Int? = null
)

/**
 * Response model for employee invitation
 * Returns detailed employee information
 */
data class InviteEmployeeResponse(
    val message: String,
    val employee: EmployeeDetail,
    @SerializedName("temporary_password")
    val temporaryPassword: String? = null,
    @SerializedName("user_created")
    val userCreated: Boolean,
    val note: String
)

/**
 * Request model for updating employee
 */
data class UpdateEmployeeRequest(
    @SerializedName("first_name")
    val firstName: String? = null,
    @SerializedName("last_name")
    val lastName: String? = null,
    val email: String? = null,
    val phone: String? = null,
    val department: String? = null,
    @SerializedName("job_title")
    val jobTitle: String? = null,
    val role: Int? = null,
    @SerializedName("employment_type")
    val employmentType: String? = null,
    val status: String? = null,
    @SerializedName("hire_date")
    val hireDate: String? = null,
    @SerializedName("emergency_contact")
    val emergencyContact: String? = null,
    val address: String? = null,
    val city: String? = null,
    val state: String? = null,
    @SerializedName("zip_code")
    val zipCode: String? = null,
    val country: String? = null
)
