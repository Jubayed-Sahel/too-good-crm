package too.good.crm.data.model

import com.google.gson.annotations.SerializedName

/**
 * Activity data model matching backend API
 * Endpoint: /api/activities/
 */
data class Activity(
    val id: Int,
    val organization: Int,
    @SerializedName("activity_type") val activityType: String, // call, email, meeting, note, task, telegram, system
    val title: String,
    val description: String?,
    @SerializedName("related_to_type") val relatedToType: String?, // lead, customer, deal, order
    @SerializedName("related_to_id") val relatedToId: Int?,
    @SerializedName("related_to_name") val relatedToName: String?,
    @SerializedName("performed_by") val performedBy: Int,
    @SerializedName("performed_by_name") val performedByName: String?,
    @SerializedName("performed_at") val performedAt: String,
    val duration: Int?, // Duration in minutes
    val outcome: String?,
    @SerializedName("follow_up_required") val followUpRequired: Boolean,
    @SerializedName("follow_up_date") val followUpDate: String?,
    val priority: String?, // low, medium, high, urgent
    val status: String?, // pending, completed, cancelled
    val notes: String?,
    val tags: List<String>?,
    @SerializedName("created_at") val createdAt: String,
    @SerializedName("updated_at") val updatedAt: String
)

/**
 * Lightweight activity model for lists
 */
data class ActivityListItem(
    val id: Int,
    @SerializedName("activity_type") val activityType: String,
    val title: String,
    val description: String?,
    @SerializedName("related_to_type") val relatedToType: String?,
    @SerializedName("related_to_name") val relatedToName: String?,
    @SerializedName("performed_by_name") val performedByName: String?,
    @SerializedName("performed_at") val performedAt: String,
    val priority: String?,
    val status: String?,
    @SerializedName("created_at") val createdAt: String
)

/**
 * Request for creating an activity
 */
data class CreateActivityRequest(
    val organization: Int? = null,
    @SerializedName("activity_type") val activityType: String,
    val title: String,
    val description: String? = null,
    @SerializedName("related_to_type") val relatedToType: String? = null,
    @SerializedName("related_to_id") val relatedToId: Int? = null,
    @SerializedName("performed_at") val performedAt: String,
    val duration: Int? = null,
    val outcome: String? = null,
    @SerializedName("follow_up_required") val followUpRequired: Boolean = false,
    @SerializedName("follow_up_date") val followUpDate: String? = null,
    val priority: String? = "medium",
    val status: String? = "completed",
    val notes: String? = null,
    val tags: List<String>? = null
)

/**
 * Response wrapping activities list
 */
data class ActivitiesListResponse(
    val count: Int,
    val next: String?,
    val previous: String?,
    val results: List<ActivityListItem>
)

/**
 * Response for single activity
 */
data class ActivityResponse(
    val activity: Activity
)

