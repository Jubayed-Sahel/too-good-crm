package too.good.crm.data.repository

import too.good.crm.data.NetworkResult
import too.good.crm.data.api.ApiClient
import too.good.crm.data.model.*
import too.good.crm.data.safeApiCall

/**
 * Message Repository
 * Handles all messaging-related data operations
 */
class MessageRepository {
    private val apiService = ApiClient.messageApiService
    
    // ========== Conversation Operations ==========
    
    /**
     * Get all conversations
     */
    suspend fun getConversations(
        page: Int? = null,
        pageSize: Int? = 20,
        conversationType: String? = null,
        isArchived: Boolean? = null,
        search: String? = null
    ): NetworkResult<ConversationsListResponse> = safeApiCall {
        apiService.getConversations(
            page = page,
            pageSize = pageSize,
            conversationType = conversationType,
            isArchived = isArchived,
            search = search
        )
    }
    
    /**
     * Get single conversation
     */
    suspend fun getConversation(id: Int): NetworkResult<Conversation> = safeApiCall {
        apiService.getConversation(id)
    }
    
    /**
     * Create new conversation
     */
    suspend fun createConversation(
        conversation: CreateConversationRequest
    ): NetworkResult<Conversation> = safeApiCall {
        apiService.createConversation(conversation)
    }
    
    /**
     * Archive conversation
     */
    suspend fun archiveConversation(id: Int): NetworkResult<Conversation> = safeApiCall {
        apiService.archiveConversation(id)
    }
    
    /**
     * Unarchive conversation
     */
    suspend fun unarchiveConversation(id: Int): NetworkResult<Conversation> = safeApiCall {
        apiService.unarchiveConversation(id)
    }
    
    /**
     * Pin conversation
     */
    suspend fun pinConversation(id: Int): NetworkResult<Conversation> = safeApiCall {
        apiService.pinConversation(id)
    }
    
    /**
     * Unpin conversation
     */
    suspend fun unpinConversation(id: Int): NetworkResult<Conversation> = safeApiCall {
        apiService.unpinConversation(id)
    }
    
    /**
     * Add participant to conversation
     */
    suspend fun addParticipant(conversationId: Int, userId: Int): NetworkResult<Conversation> = safeApiCall {
        apiService.addParticipant(conversationId, mapOf("user_id" to userId))
    }
    
    /**
     * Remove participant from conversation
     */
    suspend fun removeParticipant(conversationId: Int, userId: Int): NetworkResult<Conversation> = safeApiCall {
        apiService.removeParticipant(conversationId, mapOf("user_id" to userId))
    }
    
    // ========== Message Operations ==========
    
    /**
     * Get messages for a conversation
     */
    suspend fun getMessages(
        conversationId: Int,
        page: Int? = null,
        pageSize: Int? = 20
    ): NetworkResult<MessagesListResponse> = safeApiCall {
        apiService.getMessages(
            conversationId = conversationId,
            page = page,
            pageSize = pageSize
        )
    }
    
    /**
     * Get single message
     */
    suspend fun getMessage(id: Int): NetworkResult<Message> = safeApiCall {
        apiService.getMessage(id)
    }
    
    /**
     * Send a message
     */
    suspend fun sendMessage(message: CreateMessageRequest): NetworkResult<Message> = safeApiCall {
        apiService.sendMessage(message)
    }
    
    /**
     * Mark message as read
     */
    suspend fun markMessageRead(id: Int): NetworkResult<Message> = safeApiCall {
        apiService.markMessageRead(id)
    }
    
    /**
     * Mark all messages in conversation as read
     */
    suspend fun markAllRead(conversationId: Int): NetworkResult<Conversation> = safeApiCall {
        apiService.markAllRead(conversationId)
    }
    
    /**
     * Delete message
     */
    suspend fun deleteMessage(id: Int): NetworkResult<Unit> = safeApiCall {
        apiService.deleteMessage(id)
    }
    
    /**
     * Edit message
     */
    suspend fun editMessage(id: Int, content: String): NetworkResult<Message> = safeApiCall {
        apiService.editMessage(id, mapOf("content" to content))
    }
    
    /**
     * Get active conversations (not archived)
     */
    suspend fun getActiveConversations(): NetworkResult<ConversationsListResponse> {
        return getConversations(isArchived = false)
    }
    
    /**
     * Get archived conversations
     */
    suspend fun getArchivedConversations(): NetworkResult<ConversationsListResponse> {
        return getConversations(isArchived = true)
    }
    
    /**
     * Search conversations
     */
    suspend fun searchConversations(query: String): NetworkResult<ConversationsListResponse> {
        return getConversations(search = query)
    }
}

