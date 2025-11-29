package too.good.crm.data.repository

import too.good.crm.data.NetworkResult
import too.good.crm.data.api.ApiClient
import too.good.crm.data.model.*
import too.good.crm.data.safeApiCall

/**
 * Message Repository
 * Handles all messaging-related data operations
 * Simplified to match backend user-to-user messaging structure
 */
class MessageRepository {
    private val apiService = ApiClient.messageApiService
    
    // ========== Message Operations ==========
    
    /**
     * Send a message to another user
     * 
     * @param recipientId User ID of message recipient
     * @param content Message content
     * @param subject Optional subject line
     * @param relatedLeadId Optional related lead
     * @param relatedDealId Optional related deal
     * @param relatedCustomerId Optional related customer
     */
    suspend fun sendMessage(
        recipientId: Int,
        content: String,
        subject: String? = null,
        relatedLeadId: Int? = null,
        relatedDealId: Int? = null,
        relatedCustomerId: Int? = null
    ): NetworkResult<Message> = safeApiCall {
        apiService.sendMessage(
            SendMessageRequest(
                recipientId = recipientId,
                content = content,
                subject = subject,
                relatedLeadId = relatedLeadId,
                relatedDealId = relatedDealId,
                relatedCustomerId = relatedCustomerId
            )
        )
    }
    
    /**
     * Mark a message as read
     * 
     * @param messageId ID of the message to mark as read
     */
    suspend fun markMessageRead(messageId: Int): NetworkResult<Message> = safeApiCall {
        apiService.markMessageRead(messageId)
    }
    
    /**
     * Get unread message count for current user
     */
    suspend fun getUnreadCount(): NetworkResult<UnreadCountResponse> = safeApiCall {
        apiService.getUnreadCount()
    }
    
    /**
     * Get list of users that current user can message
     * Returns users from the same organization
     */
    suspend fun getRecipients(): NetworkResult<List<MessageUser>> = safeApiCall {
        apiService.getRecipients()
    }
    
    /**
     * Get messages with a specific user
     * Also marks unread messages from that user as read
     * 
     * @param userId ID of the other user
     */
    suspend fun getMessagesWithUser(userId: Int): NetworkResult<List<Message>> = safeApiCall {
        apiService.getMessagesWithUser(userId)
    }
    
    // ========== Conversation Operations ==========
    
    /**
     * Get all conversations for current user
     * Returns list of conversations ordered by last message time
     */
    suspend fun getConversations(): NetworkResult<List<Conversation>> = safeApiCall {
        apiService.getConversations()
    }
}

