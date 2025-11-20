package too.good.crm.data.models

import com.google.gson.annotations.SerializedName

/**
 * Employee model matching backend Employee model
 */
data class Employee(
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
    val employmentType: String = "full-time", // full-time, part-time, contract, intern
    @SerializedName("employment_type_display")
    val employmentTypeDisplay: String? = null,
    @SerializedName("hire_date")
    val hireDate: String? = null,
    @SerializedName("termination_date")
    val terminationDate: String? = null,
    val status: String = "active", // active, inactive, on-leave, terminated
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
    val fullName: String
        get() = "$firstName $lastName"
    
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
 */
data class InviteEmployeeResponse(
    val message: String,
    val employee: Employee,
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
