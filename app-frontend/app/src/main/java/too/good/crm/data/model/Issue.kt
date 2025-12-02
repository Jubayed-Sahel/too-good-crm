package too.good.crm.data.model

import com.google.gson.annotations.SerializedName

data class Issue(
    @SerializedName("id") val id: Int,
    @SerializedName("issue_number") val issueNumber: String,
    @SerializedName("title") val title: String,
    @SerializedName("description") val description: String,
    @SerializedName("priority") val priority: String, // low, medium, high, urgent
    @SerializedName("status") val status: String, // open, in_progress, resolved, closed
    @SerializedName("category") val category: String,
    @SerializedName("organization") val organizationId: Int,
    @SerializedName("organization_name") val organizationName: String? = null,
    @SerializedName("vendor") val vendor: IssueVendor? = null,
    @SerializedName("order") val order: IssueOrder? = null,
    @SerializedName("assigned_to") val assignedTo: IssueEmployee? = null,
    @SerializedName("resolved_by") val resolvedBy: IssueEmployee? = null,
    @SerializedName("raised_by_customer") val raisedByCustomerId: Int? = null,
    @SerializedName("raised_by_customer_name") val raisedByCustomerName: String? = null,
    @SerializedName("is_client_issue") val isClientIssue: Boolean = false,
    @SerializedName("created_by") val createdById: Int? = null,
    @SerializedName("resolved_at") val resolvedAt: String? = null,
    @SerializedName("resolution_notes") val resolutionNotes: String? = null,
    @SerializedName("linear_issue_id") val linearIssueId: String? = null,
    @SerializedName("linear_issue_url") val linearIssueUrl: String? = null,
    @SerializedName("synced_to_linear") val syncedToLinear: Boolean = false,
    @SerializedName("created_at") val createdAt: String,
    @SerializedName("updated_at") val updatedAt: String,
    @SerializedName("comments") val comments: List<IssueComment>? = null
) {
    // Convenience properties for backward compatibility
    val vendorId: Int? get() = vendor?.id
    val vendorName: String? get() = vendor?.name
    val orderId: Int? get() = order?.id
    val assignedToId: Int? get() = assignedTo?.id
    val assignedToName: String? get() = assignedTo?.fullName
    val resolvedById: Int? get() = resolvedBy?.id
    val resolvedByName: String? get() = resolvedBy?.fullName
}

data class IssueVendor(
    @SerializedName("id") val id: Int,
    @SerializedName("name") val name: String,
    @SerializedName("company_name") val companyName: String? = null,
    @SerializedName("email") val email: String? = null,
    @SerializedName("phone") val phone: String? = null,
    @SerializedName("vendor_type") val vendorType: String? = null,
    @SerializedName("status") val status: String? = null
)

data class IssueOrder(
    @SerializedName("id") val id: Int,
    @SerializedName("order_number") val orderNumber: String
)

data class IssueEmployee(
    @SerializedName("id") val id: Int,
    @SerializedName("full_name") val fullName: String,
    @SerializedName("email") val email: String? = null
)

data class IssueComment(
    @SerializedName("id") val id: Int,
    @SerializedName("author_name") val authorName: String,
    @SerializedName("content") val content: String,
    @SerializedName("created_at") val createdAt: String,
    @SerializedName("synced_to_linear") val syncedToLinear: Boolean = false,
    @SerializedName("linear_comment_id") val linearCommentId: String? = null
)

data class CreateIssueRequest(
    @SerializedName("organization") val organizationId: Int,
    @SerializedName("title") val title: String,
    @SerializedName("description") val description: String,
    @SerializedName("priority") val priority: String = "medium",
    @SerializedName("category") val category: String = "general",
    @SerializedName("vendor") val vendorId: Int? = null,
    @SerializedName("order") val orderId: Int? = null
)

data class IssueResponse(
    @SerializedName("message") val message: String? = null,
    @SerializedName("issue") val issue: Issue? = null,
    @SerializedName("linear_data") val linearData: LinearData? = null,
    @SerializedName("linear_synced") val linearSynced: Boolean = false,
    @SerializedName("linear_url") val linearUrl: String? = null
)

data class LinearData(
    @SerializedName("id") val id: String,
    @SerializedName("identifier") val identifier: String,
    @SerializedName("url") val url: String,
    @SerializedName("title") val title: String,
    @SerializedName("state") val state: String?
)

data class UpdateIssueStatusRequest(
    @SerializedName("status") val status: String
)

data class UpdateIssuePriorityRequest(
    @SerializedName("priority") val priority: String
)

data class AssignIssueRequest(
    @SerializedName("assigned_to") val assignedToId: Int
)

data class AddCommentRequest(
    @SerializedName("comment") val comment: String
)

data class ResolveIssueRequest(
    @SerializedName("resolution_notes") val resolutionNotes: String
)

data class IssuesListResponse(
    @SerializedName("count") val count: Int,
    @SerializedName("results") val results: List<Issue>
)

