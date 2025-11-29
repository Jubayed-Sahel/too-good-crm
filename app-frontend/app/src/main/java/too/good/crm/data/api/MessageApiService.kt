package too.good.crm.data.api

import retrofit2.http.*
import too.good.crm.data.model.*

/**
 * Message and Conversation API Service
 * Endpoints for messaging functionality matching backend structure
 * Base: /api/messages/, /api/conversations/
 */
interface MessageApiService {
    
    // ========== Message Endpoints ==========
    
    /**
     * Send a message to another user
     * POST /api/messages/send/
     * 
     * Request body:
     * {
     *   "recipient_id": 123,
     *   "content": "Hello!",
     *   "subject": "Optional subject",
     *   "related_lead_id": 456,  // optional
     *   "related_deal_id": 789,  // optional
     *   "related_customer_id": 101,  // optional
     * }
     */
    @POST("messages/send/")
    suspend fun sendMessage(@Body request: SendMessageRequest): Message
    
    /**
     * Mark a message as read
     * POST /api/messages/{id}/mark_read/
     */
    @POST("messages/{id}/mark_read/")
    suspend fun markMessageRead(@Path("id") messageId: Int): Message
    
    /**
     * Get unread message count for current user
     * GET /api/messages/unread_count/
     */
    @GET("messages/unread_count/")
    suspend fun getUnreadCount(): UnreadCountResponse
    
    /**
     * Get list of users that current user can message
     * GET /api/messages/recipients/
     */
    @GET("messages/recipients/")
    suspend fun getRecipients(): List<MessageUser>
    
    /**
     * Get messages with a specific user
     * GET /api/messages/with_user/?user_id=123
     * 
     * Returns messages between current user and specified user
     * Also marks unread messages as read
     */
    @GET("messages/with_user/")
    suspend fun getMessagesWithUser(@Query("user_id") userId: Int): List<Message>
    
    // ========== Conversation Endpoints ==========
    
    /**
     * Get all conversations for current user
     * GET /api/conversations/
     * 
     * Returns list of conversations ordered by last_message_at
     */
    @GET("conversations/")
    suspend fun getConversations(): List<Conversation>
}

