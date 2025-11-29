package too.good.crm.data.model

import com.google.gson.annotations.SerializedName

/**
 * Message data model matching backend API
 * Endpoint: /api/messages/
 * Simple user-to-user messaging model
 */
data class Message(
    val id: Int,
    val sender: MessageUser,
    val recipient: MessageUser,
    val content: String,
    val subject: String?,
    @SerializedName("message_type") val messageType: String = "text",
    @SerializedName("is_read") val isRead: Boolean,
    @SerializedName("read_at") val readAt: String?,
    val organization: Int?,
    @SerializedName("related_lead") val relatedLead: Int?,
    @SerializedName("related_deal") val relatedDeal: Int?,
    @SerializedName("related_customer") val relatedCustomer: Int?,
    val attachments: List<Any>? = null,
    @SerializedName("created_at") val createdAt: String,
    @SerializedName("updated_at") val updatedAt: String
)

/**
 * User information in message
 */
data class MessageUser(
    val id: Int,
    val email: String,
    @SerializedName("first_name") val firstName: String?,
    @SerializedName("last_name") val lastName: String?
) {
    fun getDisplayName(): String {
        val name = listOfNotNull(firstName, lastName).joinToString(" ").trim()
        return name.ifBlank { email.substringBefore("@") }
    }
}

/**
 * Conversation data model (simplified for direct messaging)
 */
data class Conversation(
    val id: Int,
    val participant1: MessageUser,
    val participant2: MessageUser,
    @SerializedName("other_participant") val otherParticipant: MessageUser,
    @SerializedName("last_message") val lastMessage: Message?,
    @SerializedName("last_message_at") val lastMessageAt: String?,
    @SerializedName("unread_count") val unreadCount: Int,
    val organization: Int?
)

/**
 * Request for sending a message
 */
data class SendMessageRequest(
    @SerializedName("recipient_id") val recipientId: Int,
    val content: String,
    val subject: String? = null,
    @SerializedName("related_lead_id") val relatedLeadId: Int? = null,
    @SerializedName("related_deal_id") val relatedDealId: Int? = null,
    @SerializedName("related_customer_id") val relatedCustomerId: Int? = null,
    val attachments: List<Any>? = null
)

/**
 * Response for unread count
 */
data class UnreadCountResponse(
    @SerializedName("unread_count") val unreadCount: Int
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

