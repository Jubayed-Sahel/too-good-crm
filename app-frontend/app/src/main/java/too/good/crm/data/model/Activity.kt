package too.good.crm.data.model

import com.google.gson.annotations.SerializedName

/**
 * Activity Model
 * Represents a tracked activity (call, email, telegram, meeting, note, task)
 * Backend: crmApp/models/activity.py
 * Endpoint: /api/activities/
 */
data class Activity(
    val id: Int,
    
    // Core Fields
    @SerializedName("activity_type")
    val activityType: String, // call, email, telegram, meeting, note, task
    
    @SerializedName("activity_type_display")
    val activityTypeDisplay: String?,
    
    val title: String,
    val description: String?,
    
    // Relationship Fields (specific FKs)
    val customer: Int?,
    
    @SerializedName("customer_name")
    val customerName: String?,
    
    val lead: Int?,
    
    @SerializedName("lead_name")
    val leadName: String?,
    
    val deal: Int?,
    
    @SerializedName("deal_name")
    val dealName: String?,
    
    // Assignment Fields
    @SerializedName("assigned_to")
    val assignedTo: Int?,
    
    @SerializedName("assigned_to_name")
    val assignedToName: String?,
    
    @SerializedName("created_by")
    val createdBy: Int,
    
    @SerializedName("created_by_name")
    val createdByName: String?,
    
    // Status
    val status: String, // scheduled, in_progress, completed, cancelled
    
    @SerializedName("status_display")
    val statusDisplay: String?,
    
    // Temporal Fields
    @SerializedName("scheduled_at")
    val scheduledAt: String?,
    
    @SerializedName("completed_at")
    val completedAt: String?,
    
    @SerializedName("created_at")
    val createdAt: String,
    
    @SerializedName("updated_at")
    val updatedAt: String,
    
    // Duration
    @SerializedName("duration_minutes")
    val durationMinutes: Int?,
    
    // Call-specific Fields
    @SerializedName("phone_number")
    val phoneNumber: String?,
    
    @SerializedName("call_duration")
    val callDuration: Int?,
    
    @SerializedName("call_recording_url")
    val callRecordingUrl: String?,
    
    // Email-specific Fields
    @SerializedName("email_subject")
    val emailSubject: String?,
    
    @SerializedName("email_body")
    val emailBody: String?,
    
    @SerializedName("email_to")
    val emailTo: String?,
    
    @SerializedName("email_from")
    val emailFrom: String?,
    
    @SerializedName("email_attachments")
    val emailAttachments: List<Map<String, Any>>?,
    
    // Telegram-specific Fields
    @SerializedName("telegram_username")
    val telegramUsername: String?,
    
    @SerializedName("telegram_message")
    val telegramMessage: String?,
    
    @SerializedName("telegram_chat_id")
    val telegramChatId: String?,
    
    // Meeting-specific Fields
    @SerializedName("meeting_location")
    val meetingLocation: String?,
    
    @SerializedName("meeting_url")
    val meetingUrl: String?,
    
    @SerializedName("video_call_room")
    val videoCallRoom: String?,
    
    @SerializedName("video_call_url")
    val videoCallUrl: String?,
    
    val attendees: List<Map<String, Any>>?,
    
    // Task-specific Fields
    @SerializedName("task_priority")
    val taskPriority: String?,
    
    @SerializedName("task_due_date")
    val taskDueDate: String?,
    
    // Note-specific Fields
    @SerializedName("is_pinned")
    val isPinned: Boolean?,
    
    // Metadata
    val tags: List<String>?,
    val attachments: List<Map<String, Any>>?,
    
    @SerializedName("organization")
    val organization: Int
)

/**
 * Lightweight Activity for list views
 */
data class ActivityListItem(
    val id: Int,
    @SerializedName("activity_type")
    val activityType: String,
    @SerializedName("activity_type_display")
    val activityTypeDisplay: String?,
    val title: String,
    val description: String?,
    val status: String,
    @SerializedName("status_display")
    val statusDisplay: String?,
    @SerializedName("scheduled_at")
    val scheduledAt: String?,
    @SerializedName("customer_name")
    val customerName: String?,
    @SerializedName("assigned_to_name")
    val assignedToName: String?,
    @SerializedName("created_at")
    val createdAt: String
)

/**
 * Request for creating an activity
 */
data class CreateActivityRequest(
    @SerializedName("activity_type")
    val activityType: String,
    val title: String,
    val description: String? = null,
    val customer: Int? = null,
    val lead: Int? = null,
    val deal: Int? = null,
    @SerializedName("assigned_to")
    val assignedTo: Int? = null,
    val status: String = "scheduled", // scheduled, in_progress, completed, cancelled
    @SerializedName("scheduled_at")
    val scheduledAt: String? = null,
    @SerializedName("duration_minutes")
    val durationMinutes: Int? = null,
    
    // Call-specific
    @SerializedName("phone_number")
    val phoneNumber: String? = null,
    @SerializedName("call_duration")
    val callDuration: Int? = null,
    @SerializedName("call_recording_url")
    val callRecordingUrl: String? = null,
    
    // Email-specific
    @SerializedName("email_subject")
    val emailSubject: String? = null,
    @SerializedName("email_body")
    val emailBody: String? = null,
    @SerializedName("email_to")
    val emailTo: String? = null,
    @SerializedName("email_from")
    val emailFrom: String? = null,
    @SerializedName("email_attachments")
    val emailAttachments: List<Map<String, Any>>? = null,
    
    // Telegram-specific
    @SerializedName("telegram_username")
    val telegramUsername: String? = null,
    @SerializedName("telegram_message")
    val telegramMessage: String? = null,
    @SerializedName("telegram_chat_id")
    val telegramChatId: String? = null,
    
    // Meeting-specific
    @SerializedName("meeting_location")
    val meetingLocation: String? = null,
    @SerializedName("meeting_url")
    val meetingUrl: String? = null,
    @SerializedName("video_call_room")
    val videoCallRoom: String? = null,
    @SerializedName("video_call_url")
    val videoCallUrl: String? = null,
    val attendees: List<Map<String, Any>>? = null,
    
    // Task-specific
    @SerializedName("task_priority")
    val taskPriority: String? = null,
    @SerializedName("task_due_date")
    val taskDueDate: String? = null,
    
    // Note-specific
    @SerializedName("is_pinned")
    val isPinned: Boolean? = null,
    
    // Metadata
    val tags: List<String>? = null,
    val attachments: List<Map<String, Any>>? = null
)

/**
 * Response wrapping activities list (paginated)
 */
data class ActivitiesListResponse(
    val count: Int,
    val next: String?,
    val previous: String?,
    val results: List<ActivityListItem>
)

