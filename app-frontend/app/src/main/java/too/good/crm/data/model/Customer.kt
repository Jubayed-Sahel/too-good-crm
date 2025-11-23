package too.good.crm.data.model

import com.google.gson.annotations.SerializedName

data class Customer(
    val id: Int = 0,
    val code: String? = null,
    val name: String = "",
    @SerializedName("first_name")
    val firstName: String? = null,
    @SerializedName("last_name")
    val lastName: String? = null,
    @SerializedName("full_name")
    val fullName: String? = null,
    val email: String = "",
    val phone: String = "",
    val company: String? = null,
    @SerializedName("company_name")
    val companyName: String? = null,
    val organization: String? = null,  // Alias for company_name from backend
    @SerializedName("customer_type")
    val customerType: String? = null,
    val status: String? = "active",
    val address: String? = null,
    val city: String? = null,
    val state: String? = null,
    val country: String? = null,
    @SerializedName("postal_code")
    val postalCode: String? = null,
    @SerializedName("zip_code")
    val zipCode: String? = null,
    val website: String? = null,
    val notes: String? = null,
    @SerializedName("assigned_to")
    val assignedTo: Int? = null,
    @SerializedName("assigned_to_name")
    val assignedToName: String? = null,
    @SerializedName("total_value")
    val totalValue: Double? = 0.0,
    @SerializedName("user_id")
    val userId: Int? = null,
    @SerializedName("created_at")
    val createdAt: String? = null,
    @SerializedName("updated_at")
    val updatedAt: String? = null
)

data class CreateCustomerRequest(
    val name: String,
    @SerializedName("first_name")
    val firstName: String? = null,
    @SerializedName("last_name")
    val lastName: String? = null,
    val email: String,
    val phone: String,
    @SerializedName("company_name")
    val companyName: String? = null,
    @SerializedName("customer_type")
    val customerType: String = "individual",
    val status: String = "active",
    val address: String? = null,
    val city: String? = null,
    val state: String? = null,
    val country: String? = null,
    @SerializedName("postal_code")
    val postalCode: String? = null,
    val website: String? = null,
    val notes: String? = null
)

