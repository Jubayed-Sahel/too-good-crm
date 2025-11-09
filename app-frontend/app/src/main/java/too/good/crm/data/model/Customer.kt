package too.good.crm.data.model

import com.google.gson.annotations.SerializedName

data class Customer(
    val id: Int = 0,
    val code: String = "",
    val name: String,
    @SerializedName("first_name")
    val firstName: String = "",
    @SerializedName("last_name")
    val lastName: String = "",
    @SerializedName("full_name")
    val fullName: String = "",
    val email: String,
    val phone: String,
    val company: String = "",
    @SerializedName("company_name")
    val companyName: String = "",
    @SerializedName("customer_type")
    val customerType: String = "individual",
    val status: String = "active",
    val address: String = "",
    val city: String = "",
    val state: String = "",
    val country: String = "",
    @SerializedName("postal_code")
    val postalCode: String = "",
    @SerializedName("zip_code")
    val zipCode: String = "",
    val website: String = "",
    val notes: String = "",
    @SerializedName("assigned_to")
    val assignedTo: Int? = null,
    @SerializedName("assigned_to_name")
    val assignedToName: String? = null,
    @SerializedName("total_value")
    val totalValue: Double = 0.0,
    @SerializedName("user_id")
    val userId: Int? = null,
    @SerializedName("created_at")
    val createdAt: String = "",
    @SerializedName("updated_at")
    val updatedAt: String = ""
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

data class CustomerResponse(
    val success: Boolean,
    val data: Customer? = null,
    val message: String? = null
)

data class CustomersListResponse(
    val success: Boolean,
    val data: List<Customer> = emptyList(),
    val message: String? = null
)
