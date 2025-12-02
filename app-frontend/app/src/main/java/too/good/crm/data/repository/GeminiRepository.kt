package too.good.crm.data.repository

import android.content.Context
import android.util.Log
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.flow.flowOn
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import too.good.crm.data.BackendUrlManager
import too.good.crm.data.NetworkResult
import too.good.crm.data.api.ApiClient
import too.good.crm.data.api.*
import too.good.crm.data.safeApiCall
import java.io.BufferedReader
import java.util.UUID
import java.util.concurrent.TimeUnit

/**
 * Gemini AI Repository
 * Handles all AI Assistant operations including streaming chat
 */
class GeminiRepository(private val context: Context? = null) {
    private val apiService = ApiClient.geminiApiService
    
    companion object {
        private const val TAG = "GeminiRepository"
    }
    
    /**
     * Check if Gemini service is available
     */
    suspend fun checkStatus(): NetworkResult<GeminiStatusResponse> = safeApiCall {
        apiService.checkStatus().body()!!
    }
    
    /**
     * Stream chat responses from Gemini AI
     * Uses Server-Sent Events (SSE) to receive streaming responses
     * 
     * @param message User message
     * @param conversationId Optional conversation ID (will be generated if not provided)
     * @param history Optional conversation history
     * @return Flow of streaming events
     */
    fun streamChat(
        message: String,
        conversationId: String? = null,
        history: List<GeminiMessage>? = null
    ): Flow<GeminiStreamEvent> = flow {
        val finalConversationId = conversationId ?: UUID.randomUUID().toString()
        
        try {
            // Create request body
            val requestBody = JSONObject().apply {
                put("message", message)
                put("conversation_id", finalConversationId)
                history?.let {
                    val historyArray = org.json.JSONArray()
                    it.forEach { msg ->
                        historyArray.put(JSONObject().apply {
                            put("role", msg.role)
                            put("content", msg.content)
                        })
                    }
                    put("history", historyArray)
                }
            }.toString()
            
            // Create OkHttp client for streaming
            val client = OkHttpClient.Builder()
                .connectTimeout(30, TimeUnit.SECONDS)
                .readTimeout(60, TimeUnit.SECONDS)
                .writeTimeout(30, TimeUnit.SECONDS)
                .build()
            
            // Get base URL from BackendUrlManager (dynamic) or BuildConfig (fallback)
            val baseUrl = if (context != null) {
                BackendUrlManager.getBackendUrl(context)
            } else {
                too.good.crm.BuildConfig.BACKEND_URL
            }
            val authToken = ApiClient.getAuthToken()
            
            // Create request
            val request = Request.Builder()
                .url("${baseUrl}gemini/chat/")
                .post(requestBody.toRequestBody("application/json".toMediaType()))
                .apply {
                    authToken?.let { header("Authorization", "Token $it") }
                }
                .build()
            
            Log.d(TAG, "Starting SSE stream for conversation: $finalConversationId")
            
            // Execute request and process stream
            client.newCall(request).execute().use { response ->
                if (!response.isSuccessful) {
                    val errorBody = response.body?.string() ?: "Unknown error"
                    Log.e(TAG, "SSE request failed: ${response.code} - $errorBody")
                    emit(GeminiStreamEvent.Error("Request failed: ${response.code}"))
                    return@flow
                }
                
                val source = response.body?.source()
                if (source == null) {
                    Log.e(TAG, "Response body is null")
                    emit(GeminiStreamEvent.Error("Response body is null"))
                    return@flow
                }
                
                // Read SSE stream line by line
                val reader = source.inputStream().bufferedReader()
                var line: String?
                
                while (reader.readLine().also { line = it } != null) {
                    val currentLine = line ?: continue
                    
                    // SSE format: "data: {...}\n\n"
                    if (currentLine.startsWith("data: ")) {
                        val jsonData = currentLine.substring(6) // Remove "data: " prefix
                        
                        try {
                            val json = JSONObject(jsonData)
                            val type = json.getString("type")
                            
                            when (type) {
                                "connected" -> {
                                    val convId = json.getString("conversation_id")
                                    Log.d(TAG, "SSE Connected: $convId")
                                    emit(GeminiStreamEvent.Connected(convId))
                                }
                                "message" -> {
                                    val content = json.getString("content")
                                    emit(GeminiStreamEvent.Message(content))
                                }
                                "completed" -> {
                                    val convId = json.getString("conversation_id")
                                    Log.d(TAG, "SSE Completed: $convId")
                                    emit(GeminiStreamEvent.Completed(convId))
                                }
                                else -> {
                                    Log.w(TAG, "Unknown SSE event type: $type")
                                }
                            }
                        } catch (e: Exception) {
                            Log.e(TAG, "Error parsing SSE data: $jsonData", e)
                            // Continue reading, don't break the stream
                        }
                    }
                }
                
                reader.close()
            }
            
        } catch (e: Exception) {
            Log.e(TAG, "Error in stream chat", e)
            emit(GeminiStreamEvent.Error(e.message ?: "Unknown error"))
        }
    }.flowOn(Dispatchers.IO)
    
    /**
     * Get conversation history
     */
    suspend fun getConversation(conversationId: String): NetworkResult<GeminiConversationResponse> = safeApiCall {
        apiService.getConversation(conversationId).body()!!
    }
    
    /**
     * Clear conversation history
     */
    suspend fun clearConversation(conversationId: String): NetworkResult<Unit> = safeApiCall {
        apiService.clearConversation(conversationId)
    }
}
