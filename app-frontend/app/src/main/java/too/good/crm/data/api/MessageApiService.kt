package too.good.crm.data.api

import retrofit2.http.*
import too.good.crm.data.model.*

/**
 * Message and Conversation API Service
 * Endpoints for messaging functionality
 * Base: /api/messages/, /api/conversations/
 */
interface MessageApiService {
    
    // ========== Conversation Endpoints ==========
    
    /**
     * Get all conversations
     * GET /api/conversations/
     */
    @GET("conversations/")
    suspend fun getConversations(
        @Query("page") page: Int? = null,
        @Query("page_size") pageSize: Int? = null,
        @Query("conversation_type") conversationType: String? = null,
        @Query("is_archived") isArchived: Boolean? = null,
        @Query("search") search: String? = null
    ): ConversationsListResponse
    
    /**
     * Get single conversation with details
     * GET /api/conversations/{id}/
     */
    @GET("conversations/{id}/")
    suspend fun getConversation(@Path("id") id: Int): Conversation
    
    /**
     * Create new conversation
     * POST /api/conversations/
     */
    @POST("conversations/")
    suspend fun createConversation(@Body conversation: CreateConversationRequest): Conversation
    
    /**
     * Archive conversation
     * POST /api/conversations/{id}/archive/
     */
    @POST("conversations/{id}/archive/")
    suspend fun archiveConversation(@Path("id") id: Int): Conversation
    
    /**
     * Unarchive conversation
     * POST /api/conversations/{id}/unarchive/")
     */
    suspend fun unarchiveConversation(@Path("id") id: Int): Conversation
    
    /**
     * Pin conversation
     * POST /api/conversations/{id}/pin/
     */
    @POST("conversations/{id}/pin/")
    suspend fun pinConversation(@Path("id") id: Int): Conversation
    
    /**
     * Unpin conversation
     * POST /api/conversations/{id}/unpin/
     */
    @POST("conversations/{id}/unpin/")
    suspend fun unpinConversation(@Path("id") id: Int): Conversation
    
    /**
     * Add participant to conversation
     * POST /api/conversations/{id}/add_participant/
     */
    @POST("conversations/{id}/add_participant/")
    suspend fun addParticipant(
        @Path("id") id: Int,
        @Body body: Map<String, Int> // {"user_id": 123}
    ): Conversation
    
    /**
     * Remove participant from conversation
     * POST /api/conversations/{id}/remove_participant/
     */
    @POST("conversations/{id}/remove_participant/")
    suspend fun removeParticipant(
        @Path("id") id: Int,
        @Body body: Map<String, Int> // {"user_id": 123}
    ): Conversation
    
    // ========== Message Endpoints ==========
    
    /**
     * Get messages for a conversation
     * GET /api/messages/?conversation={conversation_id}
     */
    @GET("messages/")
    suspend fun getMessages(
        @Query("conversation") conversationId: Int,
        @Query("page") page: Int? = null,
        @Query("page_size") pageSize: Int? = null
    ): MessagesListResponse
    
    /**
     * Get single message
     * GET /api/messages/{id}/
     */
    @GET("messages/{id}/")
    suspend fun getMessage(@Path("id") id: Int): Message
    
    /**
     * Send a message
     * POST /api/messages/
     */
    @POST("messages/")
    suspend fun sendMessage(@Body message: CreateMessageRequest): Message
    
    /**
     * Mark message as read
     * POST /api/messages/{id}/mark_read/
     */
    @POST("messages/{id}/mark_read/")
    suspend fun markMessageRead(@Path("id") id: Int): Message
    
    /**
     * Mark all messages in conversation as read
     * POST /api/conversations/{id}/mark_all_read/
     */
    @POST("conversations/{id}/mark_all_read/")
    suspend fun markAllRead(@Path("id") conversationId: Int): Conversation
    
    /**
     * Delete message
     * DELETE /api/messages/{id}/
     */
    @DELETE("messages/{id}/")
    suspend fun deleteMessage(@Path("id") id: Int)
    
    /**
     * Edit message
     * PATCH /api/messages/{id}/
     */
    @PATCH("messages/{id}/")
    suspend fun editMessage(
        @Path("id") id: Int,
        @Body body: Map<String, String> // {"content": "edited text"}
    ): Message
}

