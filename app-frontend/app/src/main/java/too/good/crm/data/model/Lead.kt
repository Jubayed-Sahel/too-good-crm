package too.good.crm.data.model

import com.google.gson.annotations.SerializedName

/**
 * Lead data model matching backend API
 * Endpoint: /api/leads/
 */
data class Lead(
    val id: Int,
    val organization: Int?,
    val code: String,
    val name: String,
    @SerializedName("organization_name") val organizationName: String?,
    @SerializedName("job_title") val jobTitle: String?,
    val email: String?,
    val phone: String?,
    val status: String, // new, contacted, qualified, proposal_sent, negotiation, won, lost
    val source: String?, // website, referral, social_media, cold_call, event, partner, other
    @SerializedName("qualification_status") val qualificationStatus: String?, // unqualified, qualifying, qualified, disqualified
    @SerializedName("assigned_to") val assignedTo: Employee?,
    @SerializedName("assigned_to_name") val assignedToName: String?,
    @SerializedName("lead_score") val leadScore: Int?,
    @SerializedName("estimated_value") val estimatedValue: String?,
    @SerializedName("is_converted") val isConverted: Boolean,
    @SerializedName("converted_at") val convertedAt: String?,
    @SerializedName("converted_by") val convertedBy: Int?,
    @SerializedName("converted_by_name") val convertedByName: String?,
    val tags: List<String>?,
    val notes: String?,
    val campaign: String?,
    val referrer: String?,
    val address: String?,
    val city: String?,
    val state: String?,
    @SerializedName("postal_code") val postalCode: String?,
    val country: String?,
    val stage: Int?,
    @SerializedName("stage_id") val stageId: Int?,
    @SerializedName("stage_name") val stageName: String?,
    @SerializedName("stage_history") val stageHistory: List<LeadStageHistory>?,
    @SerializedName("created_at") val createdAt: String,
    @SerializedName("updated_at") val updatedAt: String
)

/**
 * Lightweight lead model for lists
 */
data class LeadListItem(
    val id: Int,
    val code: String,
    val name: String,
    val email: String?,
    val phone: String?,
    @SerializedName("organization_name") val organizationName: String?,
    @SerializedName("job_title") val jobTitle: String?,
    val status: String,
    val source: String?,
    @SerializedName("qualification_status") val qualificationStatus: String?,
    @SerializedName("lead_score") val leadScore: Int?,
    @SerializedName("estimated_value") val estimatedValue: String?,
    @SerializedName("assigned_to_name") val assignedToName: String?,
    @SerializedName("is_converted") val isConverted: Boolean,
    @SerializedName("stage_id") val stageId: Int?,
    @SerializedName("stage_name") val stageName: String?,
    @SerializedName("created_at") val createdAt: String
)

/**
 * Lead stage history
 */
data class LeadStageHistory(
    val id: Int,
    val stage: Int,
    @SerializedName("stage_name") val stageName: String?,
    @SerializedName("previous_stage") val previousStage: Int?,
    @SerializedName("previous_stage_name") val previousStageName: String?,
    @SerializedName("changed_by") val changedBy: Int?,
    @SerializedName("changed_by_name") val changedByName: String?,
    val notes: String?,
    @SerializedName("created_at") val createdAt: String
)

/**
 * Request for creating a lead
 */
data class CreateLeadRequest(
    val organization: Int? = null,
    val name: String,
    @SerializedName("organization_name") val organizationName: String? = null,
    @SerializedName("job_title") val jobTitle: String? = null,
    val email: String? = null,
    val phone: String? = null,
    val source: String? = null,
    @SerializedName("qualification_status") val qualificationStatus: String? = null,
    @SerializedName("assigned_to_id") val assignedToId: Int? = null,
    @SerializedName("lead_score") val leadScore: Int? = null,
    @SerializedName("estimated_value") val estimatedValue: String? = null,
    val tags: List<String>? = null,
    val notes: String? = null,
    val campaign: String? = null,
    val referrer: String? = null,
    val address: String? = null,
    val city: String? = null,
    val state: String? = null,
    @SerializedName("postal_code") val postalCode: String? = null,
    val country: String? = null
)

/**
 * Response wrapping leads list
 */
data class LeadsListResponse(
    val count: Int,
    val next: String?,
    val previous: String?,
    val results: List<LeadListItem>
)

/**
 * Response for single lead
 */
data class LeadResponse(
    val lead: Lead
)

