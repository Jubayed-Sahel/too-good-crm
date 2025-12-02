package too.good.crm.data.api

import okhttp3.RequestBody
import okhttp3.ResponseBody
import retrofit2.Response
import retrofit2.http.*

/**
 * Gemini AI API Service
 * Handles AI Assistant API calls to backend
 */
interface GeminiApiService {
    
    /**
     * Check Gemini service status
     * GET /api/gemini/status/
     */
    @GET("gemini/status/")
    suspend fun checkStatus(): Response<GeminiStatusResponse>
    
    /**
     * Stream chat with Gemini AI
     * POST /api/gemini/chat/
     * 
     * Note: This endpoint streams responses, so we need to handle it differently
     * The actual streaming will be handled in the repository with OkHttp directly
     */
    @POST("gemini/chat/")
    suspend fun chat(@Body request: GeminiChatRequest): Response<ResponseBody>
    
    /**
     * Get conversation history
     * GET /api/gemini/conversations/{conversation_id}/
     */
    @GET("gemini/conversations/{conversation_id}/")
    suspend fun getConversation(
        @Path("conversation_id") conversationId: String
    ): Response<GeminiConversationResponse>
    
    /**
     * Clear conversation history
     * DELETE /api/gemini/conversations/{conversation_id}/
     */
    @DELETE("gemini/conversations/{conversation_id}/")
    suspend fun clearConversation(
        @Path("conversation_id") conversationId: String
    ): Response<Unit>
}

/**
 * Request body for Gemini chat
 */
data class GeminiChatRequest(
    val message: String,
    val conversation_id: String? = null,
    val history: List<GeminiMessage>? = null
)

/**
 * Gemini message
 */
data class GeminiMessage(
    val role: String, // "user" or "assistant"
    val content: String
)

/**
 * Status response from Gemini service
 */
data class GeminiStatusResponse(
    val available: Boolean,
    val model: String?,
    val mcp_enabled: Boolean?,
    val tools_available: List<String>?
)

/**
 * Conversation response from Gemini service
 */
data class GeminiConversationResponse(
    val conversation_id: String,
    val user_id: Int,
    val organization_id: Int?,
    val messages: List<GeminiConversationMessage>,
    val created_at: String,
    val updated_at: String
)

/**
 * Stored conversation message
 */
data class GeminiConversationMessage(
    val role: String,
    val content: String,
    val timestamp: String
)

/**
 * Streaming event types from SSE
 */
sealed class GeminiStreamEvent {
    data class Connected(val conversationId: String) : GeminiStreamEvent()
    data class Message(val content: String) : GeminiStreamEvent()
    data class Completed(val conversationId: String) : GeminiStreamEvent()
    data class Error(val error: String) : GeminiStreamEvent()
}
