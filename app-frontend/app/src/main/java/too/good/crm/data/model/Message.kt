package too.good.crm.data.model

import com.google.gson.annotations.SerializedName

/**
 * Message data model matching backend API
 * Endpoint: /api/messages/
 */
data class Message(
    val id: Int,
    val conversation: Int,
    val sender: Int,
    @SerializedName("sender_name") val senderName: String?,
    @SerializedName("sender_email") val senderEmail: String?,
    val content: String,
    @SerializedName("message_type") val messageType: String, // text, file, image, system
    @SerializedName("is_read") val isRead: Boolean,
    @SerializedName("read_at") val readAt: String?,
    val attachments: List<MessageAttachment>?,
    @SerializedName("replied_to") val repliedTo: Int?,
    @SerializedName("is_edited") val isEdited: Boolean,
    @SerializedName("edited_at") val editedAt: String?,
    @SerializedName("created_at") val createdAt: String,
    @SerializedName("updated_at") val updatedAt: String
)

/**
 * Conversation data model
 */
data class Conversation(
    val id: Int,
    val organization: Int,
    val title: String?,
    @SerializedName("conversation_type") val conversationType: String, // direct, group, channel
    val participants: List<ConversationParticipant>?,
    @SerializedName("created_by") val createdBy: Int,
    @SerializedName("created_by_name") val createdByName: String?,
    @SerializedName("last_message") val lastMessage: Message?,
    @SerializedName("unread_count") val unreadCount: Int,
    @SerializedName("is_archived") val isArchived: Boolean,
    @SerializedName("is_pinned") val isPinned: Boolean,
    @SerializedName("created_at") val createdAt: String,
    @SerializedName("updated_at") val updatedAt: String
)

/**
 * Conversation participant
 */
data class ConversationParticipant(
    val id: Int,
    val user: Int,
    @SerializedName("user_name") val userName: String?,
    @SerializedName("user_email") val userEmail: String?,
    @SerializedName("joined_at") val joinedAt: String,
    @SerializedName("is_admin") val isAdmin: Boolean
)

/**
 * Message attachment
 */
data class MessageAttachment(
    val id: Int,
    val file: String,
    @SerializedName("file_name") val fileName: String,
    @SerializedName("file_size") val fileSize: Long,
    @SerializedName("file_type") val fileType: String,
    @SerializedName("uploaded_at") val uploadedAt: String
)

/**
 * Request for creating a message
 */
data class CreateMessageRequest(
    val conversation: Int,
    val content: String,
    @SerializedName("message_type") val messageType: String = "text",
    @SerializedName("replied_to") val repliedTo: Int? = null
)

/**
 * Request for creating a conversation
 */
data class CreateConversationRequest(
    val organization: Int? = null,
    val title: String? = null,
    @SerializedName("conversation_type") val conversationType: String,
    @SerializedName("participant_ids") val participantIds: List<Int>
)

/**
 * Response wrapping messages list
 */
data class MessagesListResponse(
    val count: Int,
    val next: String?,
    val previous: String?,
    val results: List<Message>
)

/**
 * Response wrapping conversations list
 */
data class ConversationsListResponse(
    val count: Int,
    val next: String?,
    val previous: String?,
    val results: List<Conversation>
)

