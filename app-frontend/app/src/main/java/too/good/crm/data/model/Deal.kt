package too.good.crm.data.model

import com.google.gson.annotations.SerializedName

/**
 * Deal data model matching backend API
 * Endpoint: /api/deals/
 */
data class Deal(
    val id: Int,
    val organization: Int,
    val code: String,
    val title: String,
    val description: String?,
    val customer: Customer?,
    @SerializedName("customer_name") val customerName: String?,
    val value: String,
    val currency: String,
    val pipeline: Pipeline?,
    @SerializedName("pipeline_id") val pipelineId: Int?,
    val stage: String,  // Frontend-compatible: lead, qualified, proposal, negotiation, closed-won, closed-lost
    @SerializedName("stage_id") val stageId: Int?,
    @SerializedName("stage_name") val stageName: String?,
    @SerializedName("stage_obj") val stageObj: PipelineStage?,
    val probability: Int?,
    @SerializedName("expected_close_date") val expectedCloseDate: String?,
    @SerializedName("actual_close_date") val actualCloseDate: String?,
    @SerializedName("assigned_to") val assignedTo: Employee?,
    @SerializedName("assigned_to_name") val assignedToName: String?,
    val status: String, // open, won, lost, abandoned
    val priority: String, // low, medium, high, urgent
    @SerializedName("is_won") val isWon: Boolean,
    @SerializedName("is_lost") val isLost: Boolean,
    @SerializedName("loss_reason") val lossReason: String?,
    val tags: List<String>?,
    val notes: String?,
    @SerializedName("next_action") val nextAction: String?,
    @SerializedName("next_action_date") val nextActionDate: String?,
    @SerializedName("created_at") val createdAt: String,
    @SerializedName("updated_at") val updatedAt: String,
    @SerializedName("closed_at") val closedAt: String?
)

/**
 * Lightweight deal model for lists
 */
data class DealListItem(
    val id: Int,
    val code: String,
    val title: String,
    val customer: Int?,
    @SerializedName("customer_name") val customerName: String?,
    val value: String,
    val currency: String,
    val stage: String,
    @SerializedName("stage_id") val stageId: Int?,
    @SerializedName("stage_name") val stageName: String?,
    val probability: Int?,
    @SerializedName("expected_close_date") val expectedCloseDate: String?,
    @SerializedName("assigned_to") val assignedTo: Int?,
    @SerializedName("assigned_to_name") val assignedToName: String?,
    val status: String,
    val priority: String,
    @SerializedName("is_won") val isWon: Boolean,
    @SerializedName("is_lost") val isLost: Boolean,
    @SerializedName("created_at") val createdAt: String,
    @SerializedName("updated_at") val updatedAt: String
)

/**
 * Pipeline data model
 */
data class Pipeline(
    val id: Int,
    val organization: Int,
    val code: String,
    val name: String,
    val description: String?,
    @SerializedName("is_active") val isActive: Boolean,
    @SerializedName("is_default") val isDefault: Boolean,
    @SerializedName("created_at") val createdAt: String,
    @SerializedName("updated_at") val updatedAt: String,
    val stages: List<PipelineStage>?,
    @SerializedName("stage_count") val stageCount: Int?
)

/**
 * Pipeline stage data model
 */
data class PipelineStage(
    val id: Int,
    val pipeline: Int,
    val name: String,
    val description: String?,
    val order: Int,
    val probability: Int?,
    @SerializedName("is_active") val isActive: Boolean,
    @SerializedName("is_closed_won") val isClosedWon: Boolean,
    @SerializedName("is_closed_lost") val isClosedLost: Boolean,
    @SerializedName("auto_move_after_days") val autoMoveAfterDays: Int?,
    @SerializedName("created_at") val createdAt: String
)

/**
 * Request for creating a deal
 */
data class CreateDealRequest(
    val organization: Int? = null,
    val title: String,
    val description: String? = null,
    @SerializedName("customer_id") val customerId: Int,
    val value: String,
    val currency: String = "USD",
    @SerializedName("pipeline_id") val pipelineId: Int? = null,
    val probability: Int? = null,
    @SerializedName("expected_close_date") val expectedCloseDate: String? = null,
    @SerializedName("assigned_to_id") val assignedToId: Int? = null,
    val priority: String = "medium",
    val tags: List<String>? = null,
    val notes: String? = null,
    @SerializedName("next_action") val nextAction: String? = null,
    @SerializedName("next_action_date") val nextActionDate: String? = null
)

/**
 * Response wrapping deals list
 */
data class DealsListResponse(
    val count: Int,
    val next: String?,
    val previous: String?,
    val results: List<DealListItem>
)

/**
 * Response for single deal
 */
data class DealResponse(
    val deal: Deal
)

