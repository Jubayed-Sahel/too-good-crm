package too.good.crm.data.model

import com.google.gson.annotations.SerializedName

/**
 * Vendor Model
 * Represents a vendor/supplier in the CRM system
 * Backend: crmApp/models/vendor.py
 * Endpoint: /api/vendors/
 */
data class Vendor(
    val id: Int,
    
    // Core Fields
    val code: String?,
    val name: String,
    
    @SerializedName("company_name")
    val companyName: String?,
    
    @SerializedName("vendor_type")
    val vendorType: String, // supplier, service_provider, contractor, consultant
    
    @SerializedName("vendor_type_display")
    val vendorTypeDisplay: String?,
    
    val status: String, // active, inactive, pending, blacklisted
    
    @SerializedName("status_display")
    val statusDisplay: String?,
    
    // Contact Information
    @SerializedName("contact_person")
    val contactPerson: String?,
    
    val email: String?,
    val phone: String?,
    val website: String?,
    
    // Business Details
    val industry: String?,
    
    @SerializedName("tax_id")
    val taxId: String?,
    
    val rating: Double?,
    
    @SerializedName("payment_terms")
    val paymentTerms: String?,
    
    @SerializedName("credit_limit")
    val creditLimit: Double?,
    
    // Address Information
    val address: String?,
    val city: String?,
    val state: String?,
    
    @SerializedName("zip_code")
    val zipCode: String?,
    
    val country: String?,
    
    // Relationships
    val organization: Int,
    
    @SerializedName("organization_name")
    val organizationName: String?,
    
    val user: Int?,
    
    @SerializedName("user_id")
    val userId: Int?,
    
    @SerializedName("user_profile")
    val userProfile: VendorUserProfile?,
    
    @SerializedName("assigned_employee")
    val assignedEmployee: Int?,
    
    @SerializedName("assigned_employee_name")
    val assignedEmployeeName: String?,
    
    // Metadata
    val notes: String?,
    
    @SerializedName("created_at")
    val createdAt: String,
    
    @SerializedName("updated_at")
    val updatedAt: String,
    
    // Computed Fields
    @SerializedName("total_orders")
    val totalOrders: Int?,
    
    @SerializedName("total_spent")
    val totalSpent: Double?,
    
    @SerializedName("last_order")
    val lastOrder: String?
)

/**
 * User Profile embedded in Vendor response
 */
data class VendorUserProfile(
    val id: Int,
    val email: String,
    
    @SerializedName("first_name")
    val firstName: String?,
    
    @SerializedName("last_name")
    val lastName: String?,
    
    @SerializedName("full_name")
    val fullName: String?
)

/**
 * Vendor Status Enum
 */
enum class VendorStatus(val value: String) {
    ACTIVE("active"),
    INACTIVE("inactive"),
    PENDING("pending"),
    BLACKLISTED("blacklisted");
    
    companion object {
        fun fromString(value: String): VendorStatus? {
            return values().find { it.value.equals(value, ignoreCase = true) }
        }
    }
}

/**
 * Vendor Type Enum
 */
enum class VendorType(val value: String) {
    SUPPLIER("supplier"),
    SERVICE_PROVIDER("service_provider"),
    CONTRACTOR("contractor"),
    CONSULTANT("consultant");
    
    companion object {
        fun fromString(value: String): VendorType? {
            return values().find { it.value.equals(value, ignoreCase = true) }
        }
    }
}

/**
 * Paginated Vendor List Response
 */
data class VendorListResponse(
    val count: Int,
    val next: String?,
    val previous: String?,
    val results: List<Vendor>
)

/**
 * Create Vendor Request
 */
data class CreateVendorRequest(
    val name: String,
    
    @SerializedName("company_name")
    val companyName: String? = null,
    
    @SerializedName("vendor_type")
    val vendorType: String,
    
    val status: String = "active",
    
    // Contact Information
    @SerializedName("contact_person")
    val contactPerson: String? = null,
    
    val email: String? = null,
    val phone: String? = null,
    val website: String? = null,
    
    // Business Details
    val industry: String? = null,
    
    @SerializedName("tax_id")
    val taxId: String? = null,
    
    val rating: Double? = null,
    
    @SerializedName("payment_terms")
    val paymentTerms: String? = null,
    
    @SerializedName("credit_limit")
    val creditLimit: Double? = null,
    
    // Address Information
    val address: String? = null,
    val city: String? = null,
    val state: String? = null,
    
    @SerializedName("zip_code")
    val zipCode: String? = null,
    
    val country: String? = null,
    
    // Relationships
    @SerializedName("assigned_employee")
    val assignedEmployee: Int? = null,
    
    // Metadata
    val notes: String? = null
)

/**
 * Update Vendor Request
 */
data class UpdateVendorRequest(
    val name: String? = null,
    
    @SerializedName("company_name")
    val companyName: String? = null,
    
    @SerializedName("vendor_type")
    val vendorType: String? = null,
    
    val status: String? = null,
    
    // Contact Information
    @SerializedName("contact_person")
    val contactPerson: String? = null,
    
    val email: String? = null,
    val phone: String? = null,
    val website: String? = null,
    
    // Business Details
    val industry: String? = null,
    
    @SerializedName("tax_id")
    val taxId: String? = null,
    
    val rating: Double? = null,
    
    @SerializedName("payment_terms")
    val paymentTerms: String? = null,
    
    @SerializedName("credit_limit")
    val creditLimit: Double? = null,
    
    // Address Information
    val address: String? = null,
    val city: String? = null,
    val state: String? = null,
    
    @SerializedName("zip_code")
    val zipCode: String? = null,
    
    val country: String? = null,
    
    // Relationships
    @SerializedName("assigned_employee")
    val assignedEmployee: Int? = null,
    
    // Metadata
    val notes: String? = null
)

/**
 * Vendor Statistics
 */
data class VendorStats(
    @SerializedName("total_vendors")
    val totalVendors: Int,
    
    @SerializedName("active_vendors")
    val activeVendors: Int,
    
    @SerializedName("inactive_vendors")
    val inactiveVendors: Int,
    
    @SerializedName("pending_vendors")
    val pendingVendors: Int,
    
    @SerializedName("total_orders")
    val totalOrders: Int,
    
    @SerializedName("total_spent")
    val totalSpent: Double
)
