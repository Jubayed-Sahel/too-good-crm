package too.good.crm.data.models

import com.google.gson.annotations.SerializedName

/**
 * Video Call Models for 8x8 Video (Jitsi) Integration
 * Mirrors the web frontend implementation for consistent API handling
 */

// Call Types
enum class CallType {
    @SerializedName("audio")
    AUDIO,
    @SerializedName("video")
    VIDEO
}

// Call Status
enum class CallStatus {
    @SerializedName("pending")
    PENDING,
    @SerializedName("ringing")
    RINGING,
    @SerializedName("active")
    ACTIVE,
    @SerializedName("completed")
    COMPLETED,
    @SerializedName("missed")
    MISSED,
    @SerializedName("rejected")
    REJECTED,
    @SerializedName("cancelled")
    CANCELLED,
    @SerializedName("failed")
    FAILED
}

// User Presence Status
enum class PresenceStatus {
    @SerializedName("online")
    ONLINE,
    @SerializedName("busy")
    BUSY,
    @SerializedName("away")
    AWAY,
    @SerializedName("offline")
    OFFLINE
}

/**
 * 8x8 Video URL Data
 * Contains JWT token and room information for Jitsi authentication
 */
data class VideoUrlData(
    @SerializedName("video_url")
    val videoUrl: String? = null,
    
    @SerializedName("jwt_token")
    val jwtToken: String? = null,
    
    @SerializedName("room_name")
    val roomName: String? = null,
    
    @SerializedName("app_id")
    val appId: String? = null,
    
    @SerializedName("server_domain")
    val serverDomain: String? = null,
    
    @SerializedName("error")
    val error: String? = null
)

/**
 * Video Call Session
 * Represents a video/audio call between users
 */
data class VideoCallSession(
    @SerializedName("id")
    val id: Int,
    
    @SerializedName("session_id")
    val sessionId: String,
    
    @SerializedName("room_name")
    val roomName: String,
    
    @SerializedName("call_type")
    val callType: CallType,
    
    @SerializedName("status")
    val status: CallStatus,
    
    @SerializedName("initiator")
    val initiator: Int,
    
    @SerializedName("initiator_name")
    val initiatorName: String,
    
    @SerializedName("recipient")
    val recipient: Int?,
    
    @SerializedName("recipient_name")
    val recipientName: String?,
    
    @SerializedName("participants")
    val participants: List<Int>,
    
    @SerializedName("started_at")
    val startedAt: String?,
    
    @SerializedName("ended_at")
    val endedAt: String?,
    
    @SerializedName("duration_seconds")
    val durationSeconds: Int?,
    
    @SerializedName("duration_formatted")
    val durationFormatted: String,
    
    @SerializedName("is_active")
    val isActive: Boolean,
    
    @SerializedName("participant_count")
    val participantCount: Int,
    
    @SerializedName("organization")
    val organization: Int?,
    
    @SerializedName("recording_url")
    val recordingUrl: String?,
    
    @SerializedName("notes")
    val notes: String,
    
    @SerializedName("jitsi_server")
    val jitsiServer: String,
    
    @SerializedName("jitsi_url")
    val jitsiUrl: VideoUrlData,
    
    @SerializedName("created_at")
    val createdAt: String,
    
    @SerializedName("updated_at")
    val updatedAt: String
)

/**
 * User Presence
 * Tracks online status and availability for calls
 */
data class UserPresence(
    @SerializedName("user")
    val userId: Int,
    
    @SerializedName("username")
    val username: String,
    
    @SerializedName("full_name")
    val fullName: String,
    
    @SerializedName("status")
    val status: PresenceStatus,
    
    @SerializedName("is_online")
    val isOnline: Boolean,
    
    @SerializedName("is_available")
    val isAvailable: Boolean,
    
    @SerializedName("last_seen")
    val lastSeen: String,
    
    @SerializedName("available_for_calls")
    val availableForCalls: Boolean,
    
    @SerializedName("status_message")
    val statusMessage: String,
    
    @SerializedName("current_call")
    val currentCall: Int?
)

/**
 * Online User (simplified for user list)
 */
data class OnlineUser(
    @SerializedName("id")
    val id: Int,
    
    @SerializedName("username")
    val username: String,
    
    @SerializedName("full_name")
    val fullName: String,
    
    @SerializedName("status")
    val status: String,
    
    @SerializedName("available_for_calls")
    val availableForCalls: Boolean,
    
    @SerializedName("status_message")
    val statusMessage: String,
    
    @SerializedName("current_call_id")
    val currentCallId: Int?
)

// ==================== API Request/Response Types ====================

/**
 * Request to initiate a video call
 */
data class InitiateCallRequest(
    @SerializedName("recipient_id")
    val recipientId: Int?,
    
    @SerializedName("call_type")
    val callType: CallType
)

/**
 * Request to initiate a video call by email
 */
data class InitiateCallByEmailRequest(
    @SerializedName("recipient_email")
    val recipientEmail: String,
    
    @SerializedName("call_type")
    val callType: String // "video" or "audio"
)

/**
 * Response from initiating a video call
 */
data class InitiateCallResponse(
    @SerializedName("message")
    val message: String,
    
    @SerializedName("call_session")
    val callSession: VideoCallSession
)

/**
 * Request to update call status (answer/reject/end)
 */
data class UpdateCallStatusRequest(
    @SerializedName("action")
    val action: String, // "answer", "reject", or "end"
    
    @SerializedName("status")
    val status: CallStatus? = null
)

/**
 * Response from updating call status
 */
data class UpdateCallStatusResponse(
    @SerializedName("message")
    val message: String,
    
    @SerializedName("call_session")
    val callSession: VideoCallSession
)

/**
 * Response for getting active call
 */
data class GetActiveCallResponse(
    @SerializedName("call_session")
    val callSession: VideoCallSession?
)

/**
 * Response for sending heartbeat
 */
data class SendHeartbeatResponse(
    @SerializedName("status")
    val status: String,
    
    @SerializedName("user_presence")
    val userPresence: UserPresence
)

/**
 * Response for getting online users
 */
data class GetOnlineUsersResponse(
    @SerializedName("users")
    val users: List<OnlineUser>,
    
    @SerializedName("count")
    val count: Int
)
