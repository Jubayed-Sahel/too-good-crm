package too.good.crm.features.messages

import android.app.Application
import android.content.Context
import android.speech.tts.TextToSpeech
import android.speech.tts.UtteranceProgressListener
import android.util.Log
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import too.good.crm.data.NetworkResult
import too.good.crm.data.api.GeminiMessage
import too.good.crm.data.api.GeminiStreamEvent
import too.good.crm.data.repository.GeminiRepository
import java.util.*

/**
 * ViewModel for AI Assistant (Gemini) Chat
 */
class AIAssistantViewModel(application: Application) : AndroidViewModel(application) {
    
    private val context: Context = application.applicationContext
    
    private val repository = GeminiRepository()
    
    // UI State
    private val _uiState = MutableStateFlow(AIAssistantUiState())
    val uiState: StateFlow<AIAssistantUiState> = _uiState.asStateFlow()
    
    // Text-to-Speech
    private var textToSpeech: TextToSpeech? = null
    private var ttsInitialized = false
    
    companion object {
        private const val TAG = "AIAssistantViewModel"
    }
    
    init {
        checkStatus()
        initializeTextToSpeech()
    }
    
    /**
     * Initialize Text-to-Speech engine
     */
    private fun initializeTextToSpeech() {
        textToSpeech = TextToSpeech(getApplication()) { status ->
            if (status == TextToSpeech.SUCCESS) {
                val result = textToSpeech?.setLanguage(Locale.US)
                ttsInitialized = result != TextToSpeech.LANG_MISSING_DATA && 
                                result != TextToSpeech.LANG_NOT_SUPPORTED
                
                if (ttsInitialized) {
                    Log.d(TAG, "TextToSpeech initialized successfully")
                    _uiState.update { it.copy(ttsAvailable = true) }
                    
                    // Set listener for speaking state
                    textToSpeech?.setOnUtteranceProgressListener(object : UtteranceProgressListener() {
                        override fun onStart(utteranceId: String?) {
                            _uiState.update { 
                                it.copy(
                                    isSpeaking = true,
                                    shouldPauseSpeechRecognition = true
                                )
                            }
                        }
                        
                        override fun onDone(utteranceId: String?) {
                            _uiState.update { 
                                it.copy(
                                    isSpeaking = false,
                                    shouldPauseSpeechRecognition = false,
                                    speakingMessageId = null
                                )
                            }
                        }
                        
                        override fun onError(utteranceId: String?) {
                            _uiState.update { 
                                it.copy(
                                    isSpeaking = false,
                                    shouldPauseSpeechRecognition = false,
                                    speakingMessageId = null
                                )
                            }
                            Log.e(TAG, "TTS error for utterance: $utteranceId")
                        }
                    })
                } else {
                    Log.e(TAG, "TextToSpeech initialization failed: language not supported")
                }
            } else {
                Log.e(TAG, "TextToSpeech initialization failed with status: $status")
            }
        }
    }
    
    /**
     * Check Gemini service status
     */
    fun checkStatus() {
        viewModelScope.launch {
            _uiState.update { it.copy(isCheckingStatus = true) }
            
            when (val result = repository.checkStatus()) {
                is NetworkResult.Success -> {
                    _uiState.update {
                        it.copy(
                            isCheckingStatus = false,
                            isServiceAvailable = result.data.available,
                            error = if (!result.data.available) "AI Assistant is currently unavailable" else null
                        )
                    }
                }
                is NetworkResult.Error -> {
                    _uiState.update {
                        it.copy(
                            isCheckingStatus = false,
                            isServiceAvailable = false,
                            error = result.message
                        )
                    }
                }
                else -> {
                    // Handle any other cases
                    _uiState.update {
                        it.copy(
                            isCheckingStatus = false,
                            isServiceAvailable = false,
                            error = "Unknown error occurred"
                        )
                    }
                }
            }
        }
    }
    
    /**
     * Send message and receive streaming response
     */
    fun sendMessage(content: String) {
        if (content.isBlank()) return
        
        val userMessage = ChatMessage(
            id = UUID.randomUUID().toString(),
            role = "user",
            content = content.trim(),
            timestamp = Date()
        )
        
        // Add user message
        _uiState.update {
            it.copy(
                messages = it.messages + userMessage,
                isLoading = true,
                error = null
            )
        }
        
        // Create assistant message placeholder
        val assistantMessageId = UUID.randomUUID().toString()
        val assistantMessage = ChatMessage(
            id = assistantMessageId,
            role = "assistant",
            content = "",
            timestamp = Date(),
            isStreaming = true
        )
        
        _uiState.update {
            it.copy(messages = it.messages + assistantMessage)
        }
        
        // Prepare conversation history for context
        val history = _uiState.value.messages
            .filter { !it.isStreaming }
            .takeLast(10) // Last 10 messages for context
            .map { GeminiMessage(role = it.role, content = it.content) }
        
        viewModelScope.launch {
            try {
                var fullResponse = ""
                
                repository.streamChat(
                    message = content,
                    conversationId = _uiState.value.conversationId,
                    history = history
                ).collect { event ->
                    when (event) {
                        is GeminiStreamEvent.Connected -> {
                            Log.d(TAG, "Connected to AI Assistant: ${event.conversationId}")
                            _uiState.update { it.copy(conversationId = event.conversationId) }
                        }
                        
                        is GeminiStreamEvent.Message -> {
                            fullResponse += event.content
                            // Update the streaming message
                            _uiState.update { state ->
                                state.copy(
                                    messages = state.messages.map { msg ->
                                        if (msg.id == assistantMessageId) {
                                            msg.copy(content = fullResponse)
                                        } else msg
                                    }
                                )
                            }
                        }
                        
                        is GeminiStreamEvent.Completed -> {
                            Log.d(TAG, "AI Assistant response completed")
                            // Finalize the message
                            _uiState.update { state ->
                                state.copy(
                                    messages = state.messages.map { msg ->
                                        if (msg.id == assistantMessageId) {
                                            msg.copy(isStreaming = false)
                                        } else msg
                                    },
                                    isLoading = false
                                )
                            }
                            
                            // Auto-speak if enabled
                            if (_uiState.value.autoSpeakEnabled && fullResponse.isNotBlank()) {
                                speak(fullResponse, assistantMessageId)
                            }
                        }
                        
                        is GeminiStreamEvent.Error -> {
                            Log.e(TAG, "AI Assistant error: ${event.error}")
                            _uiState.update { state ->
                                state.copy(
                                    messages = state.messages.filter { it.id != assistantMessageId },
                                    isLoading = false,
                                    error = event.error
                                )
                            }
                        }
                    }
                }
            } catch (e: Exception) {
                Log.e(TAG, "Error sending message", e)
                _uiState.update { state ->
                    state.copy(
                        messages = state.messages.filter { it.id != assistantMessageId },
                        isLoading = false,
                        error = e.message ?: "Failed to send message"
                    )
                }
            }
        }
    }
    
    /**
     * Clear chat history
     */
    fun clearChat() {
        _uiState.update {
            it.copy(
                messages = emptyList(),
                conversationId = null,
                error = null
            )
        }
    }
    
    /**
     * Toggle auto-speak feature
     */
    fun toggleAutoSpeak() {
        _uiState.update { it.copy(autoSpeakEnabled = !it.autoSpeakEnabled) }
    }
    
    /**
     * Toggle continuous listening feature
     */
    fun toggleContinuousListening() {
        _uiState.update { it.copy(continuousListeningEnabled = !it.continuousListeningEnabled) }
    }
    
    /**
     * Speak text using TTS
     */
    fun speak(text: String, messageId: String? = null) {
        if (!ttsInitialized || textToSpeech == null) {
            Log.w(TAG, "TTS not initialized, cannot speak")
            return
        }
        
        // Cancel any ongoing speech
        textToSpeech?.stop()
        
        // Notify that speech recognition should pause and track the message
        _uiState.update { 
            it.copy(
                shouldPauseSpeechRecognition = true,
                speakingMessageId = messageId
            )
        }
        
        // Speak with unique ID
        val utteranceId = UUID.randomUUID().toString()
        textToSpeech?.speak(text, TextToSpeech.QUEUE_FLUSH, null, utteranceId)
    }
    
    /**
     * Stop speaking
     */
    fun stopSpeaking() {
        textToSpeech?.stop()
        _uiState.update { 
            it.copy(
                isSpeaking = false,
                shouldPauseSpeechRecognition = false,
                speakingMessageId = null
            )
        }
    }
    
    override fun onCleared() {
        super.onCleared()
        textToSpeech?.stop()
        textToSpeech?.shutdown()
    }
}

/**
 * UI State for AI Assistant
 */
data class AIAssistantUiState(
    val messages: List<ChatMessage> = emptyList(),
    val isLoading: Boolean = false,
    val isCheckingStatus: Boolean = false,
    val isServiceAvailable: Boolean = false,
    val conversationId: String? = null,
    val error: String? = null,
    val autoSpeakEnabled: Boolean = true, // Auto-speak enabled by default
    val ttsAvailable: Boolean = false,
    val isSpeaking: Boolean = false,
    val continuousListeningEnabled: Boolean = false,
    val shouldPauseSpeechRecognition: Boolean = false,
    val speakingMessageId: String? = null // Track which message is being spoken
)

/**
 * Chat message model
 */
data class ChatMessage(
    val id: String,
    val role: String, // "user" or "assistant"
    val content: String,
    val timestamp: Date,
    val isStreaming: Boolean = false
)
