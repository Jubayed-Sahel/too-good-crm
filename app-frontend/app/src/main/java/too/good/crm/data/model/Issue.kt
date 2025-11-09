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
    @SerializedName("vendor") val vendorId: Int? = null,
    @SerializedName("vendor_name") val vendorName: String? = null,
    @SerializedName("order") val orderId: Int? = null,
    @SerializedName("assigned_to") val assignedToId: Int? = null,
    @SerializedName("assigned_to_name") val assignedToName: String? = null,
    @SerializedName("created_by") val createdById: Int? = null,
    @SerializedName("created_by_name") val createdByName: String? = null,
    @SerializedName("raised_by_customer") val raisedByCustomerId: Int? = null,
    @SerializedName("raised_by_customer_name") val raisedByCustomerName: String? = null,
    @SerializedName("is_client_issue") val isClientIssue: Boolean = false,
    @SerializedName("resolved_at") val resolvedAt: String? = null,
    @SerializedName("resolved_by") val resolvedById: Int? = null,
    @SerializedName("resolved_by_name") val resolvedByName: String? = null,
    @SerializedName("resolution_notes") val resolutionNotes: String? = null,
    @SerializedName("linear_issue_id") val linearIssueId: String? = null,
    @SerializedName("linear_issue_url") val linearIssueUrl: String? = null,
    @SerializedName("synced_to_linear") val syncedToLinear: Boolean = false,
    @SerializedName("created_at") val createdAt: String,
    @SerializedName("updated_at") val updatedAt: String
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
    @SerializedName("message") val message: String,
    @SerializedName("issue") val issue: Issue,
    @SerializedName("linear_data") val linearData: LinearData? = null
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

