package too.good.crm.data.model

import com.google.gson.annotations.SerializedName

/**
 * Employee data model matching backend API
 * Endpoint: /api/employees/
 */
data class Employee(
    val id: Int,
    val organization: Int?,
    val code: String,
    @SerializedName("first_name") val firstName: String,
    @SerializedName("last_name") val lastName: String,
    @SerializedName("full_name") val fullName: String?,
    val email: String?,
    val phone: String?,
    @SerializedName("profile_image") val profileImage: String?,
    val department: String?,
    @SerializedName("job_title") val jobTitle: String?,
    val role: Int?, // Role ID
    @SerializedName("role_name") val roleName: String?,
    @SerializedName("employment_type") val employmentType: String?, // full-time, part-time, contract, intern
    @SerializedName("employment_type_display") val employmentTypeDisplay: String?,
    @SerializedName("hire_date") val hireDate: String?,
    @SerializedName("termination_date") val terminationDate: String?,
    val status: String, // active, inactive, on-leave, terminated
    @SerializedName("status_display") val statusDisplay: String?,
    @SerializedName("emergency_contact") val emergencyContact: String?,
    val salary: String?,
    @SerializedName("commission_rate") val commissionRate: String?,
    val manager: EmployeeBasic?, // Nested manager info
    val address: String?,
    val city: String?,
    val state: String?,
    @SerializedName("postal_code") val postalCode: String?,
    val country: String?,
    @SerializedName("created_at") val createdAt: String,
    @SerializedName("updated_at") val updatedAt: String
)

/**
 * Basic employee info (used for nested references)
 */
data class EmployeeBasic(
    val id: Int,
    val code: String,
    @SerializedName("full_name") val fullName: String,
    val email: String?,
    val phone: String?,
    val department: String?,
    @SerializedName("job_title") val jobTitle: String?,
    @SerializedName("role_name") val roleName: String?,
    val status: String
)

/**
 * Employee list item (lightweight for lists)
 */
data class EmployeeListItem(
    val id: Int,
    val code: String,
    @SerializedName("full_name") val fullName: String,
    val email: String?,
    val phone: String?,
    val department: String?,
    @SerializedName("job_title") val jobTitle: String?,
    val role: Int?,
    @SerializedName("role_name") val roleName: String?,
    val status: String,
    @SerializedName("manager_name") val managerName: String?
)

/**
 * Employee list response
 */
data class EmployeesListResponse(
    val count: Int,
    val next: String?,
    val previous: String?,
    val results: List<EmployeeListItem>
)

/**
 * Request for creating/updating employee
 */
data class CreateEmployeeRequest(
    val organization: Int?,
    @SerializedName("user_id") val userId: Int?,
    @SerializedName("first_name") val firstName: String,
    @SerializedName("last_name") val lastName: String,
    val email: String?,
    val phone: String?,
    @SerializedName("profile_image") val profileImage: String?,
    val department: String?,
    @SerializedName("job_title") val jobTitle: String?,
    @SerializedName("role_id") val roleId: Int?,
    @SerializedName("employment_type") val employmentType: String?,
    @SerializedName("hire_date") val hireDate: String?,
    val status: String?,
    @SerializedName("emergency_contact") val emergencyContact: String?,
    val salary: String?,
    @SerializedName("commission_rate") val commissionRate: String?,
    @SerializedName("manager_id") val managerId: Int?,
    val address: String?,
    val city: String?,
    val state: String?,
    @SerializedName("zip_code") val zipCode: String?,
    val country: String?
)

