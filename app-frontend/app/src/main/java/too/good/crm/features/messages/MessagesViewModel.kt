package too.good.crm.features.messages

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import too.good.crm.data.NetworkResult
import too.good.crm.data.model.*
import too.good.crm.data.repository.MessageRepository

/**
 * ViewModel for Messages Screen
 * Handles conversations and messaging
 */
class MessagesViewModel : ViewModel() {
    private val repository = MessageRepository()
    
    private val _uiState = MutableStateFlow(MessagesUiState())
    val uiState: StateFlow<MessagesUiState> = _uiState.asStateFlow()
    
    init {
        loadConversations()
    }
    
    /**
     * Load all conversations
     */
    fun loadConversations(refresh: Boolean = false) {
        viewModelScope.launch {
            if (refresh) {
                _uiState.value = _uiState.value.copy(isRefreshing = true)
            } else {
                _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            }
            
            when (val result = repository.getConversations(pageSize = 50)) {
                is NetworkResult.Success -> {
                    _uiState.value = _uiState.value.copy(
                        conversations = result.data.results,
                        totalCount = result.data.count,
                        isLoading = false,
                        isRefreshing = false,
                        error = null
                    )
                }
                is NetworkResult.Error -> {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        isRefreshing = false,
                        error = result.message
                    )
                }
                is NetworkResult.Exception -> {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        isRefreshing = false,
                        error = result.exception.message ?: "Unknown error occurred"
                    )
                }
            }
        }
    }
    
    /**
     * Load messages for a conversation
     */
    fun loadMessages(conversationId: Int) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(
                isLoadingMessages = true,
                messagesError = null,
                selectedConversationId = conversationId
            )
            
            when (val result = repository.getMessages(conversationId, pageSize = 100)) {
                is NetworkResult.Success -> {
                    _uiState.value = _uiState.value.copy(
                        messages = result.data.results,
                        isLoadingMessages = false,
                        messagesError = null
                    )
                }
                is NetworkResult.Error -> {
                    _uiState.value = _uiState.value.copy(
                        isLoadingMessages = false,
                        messagesError = result.message
                    )
                }
                is NetworkResult.Exception -> {
                    _uiState.value = _uiState.value.copy(
                        isLoadingMessages = false,
                        messagesError = result.exception.message ?: "Failed to load messages"
                    )
                }
            }
        }
    }
    
    /**
     * Send a message
     */
    fun sendMessage(conversationId: Int, content: String, onSuccess: () -> Unit) {
        if (content.isBlank()) return
        
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isSending = true, messagesError = null)
            
            val request = CreateMessageRequest(
                conversation = conversationId,
                content = content,
                messageType = "text"
            )
            
            when (val result = repository.sendMessage(request)) {
                is NetworkResult.Success -> {
                    _uiState.value = _uiState.value.copy(isSending = false)
                    loadMessages(conversationId)
                    onSuccess()
                }
                is NetworkResult.Error -> {
                    _uiState.value = _uiState.value.copy(
                        isSending = false,
                        messagesError = result.message
                    )
                }
                is NetworkResult.Exception -> {
                    _uiState.value = _uiState.value.copy(
                        isSending = false,
                        messagesError = result.exception.message ?: "Failed to send message"
                    )
                }
            }
        }
    }
    
    /**
     * Create new conversation
     */
    fun createConversation(
        title: String?,
        conversationType: String,
        participantIds: List<Int>,
        onSuccess: (Conversation) -> Unit
    ) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isCreating = true, error = null)
            
            val request = CreateConversationRequest(
                title = title,
                conversationType = conversationType,
                participantIds = participantIds
            )
            
            when (val result = repository.createConversation(request)) {
                is NetworkResult.Success -> {
                    _uiState.value = _uiState.value.copy(isCreating = false)
                    loadConversations(refresh = true)
                    onSuccess(result.data)
                }
                is NetworkResult.Error -> {
                    _uiState.value = _uiState.value.copy(
                        isCreating = false,
                        error = result.message
                    )
                }
                is NetworkResult.Exception -> {
                    _uiState.value = _uiState.value.copy(
                        isCreating = false,
                        error = result.exception.message ?: "Failed to create conversation"
                    )
                }
            }
        }
    }
    
    /**
     * Archive conversation
     */
    fun archiveConversation(conversationId: Int) {
        viewModelScope.launch {
            when (val result = repository.archiveConversation(conversationId)) {
                is NetworkResult.Success -> {
                    loadConversations(refresh = true)
                }
                is NetworkResult.Error -> {
                    _uiState.value = _uiState.value.copy(error = result.message)
                }
                is NetworkResult.Exception -> {
                    _uiState.value = _uiState.value.copy(
                        error = result.exception.message ?: "Failed to archive conversation"
                    )
                }
            }
        }
    }
    
    /**
     * Pin conversation
     */
    fun pinConversation(conversationId: Int) {
        viewModelScope.launch {
            when (val result = repository.pinConversation(conversationId)) {
                is NetworkResult.Success -> {
                    loadConversations(refresh = true)
                }
                is NetworkResult.Error -> {
                    _uiState.value = _uiState.value.copy(error = result.message)
                }
                is NetworkResult.Exception -> {
                    _uiState.value = _uiState.value.copy(
                        error = result.exception.message ?: "Failed to pin conversation"
                    )
                }
            }
        }
    }
    
    /**
     * Mark all messages as read
     */
    fun markAllRead(conversationId: Int) {
        viewModelScope.launch {
            when (repository.markAllRead(conversationId)) {
                is NetworkResult.Success -> {
                    loadConversations(refresh = true)
                }
                is NetworkResult.Error, is NetworkResult.Exception -> {
                    // Silently fail
                }
            }
        }
    }
    
    /**
     * Search conversations
     */
    fun searchConversations(query: String) {
        if (query.isBlank()) {
            loadConversations()
            return
        }
        
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null, searchQuery = query)
            
            when (val result = repository.searchConversations(query)) {
                is NetworkResult.Success -> {
                    _uiState.value = _uiState.value.copy(
                        conversations = result.data.results,
                        totalCount = result.data.count,
                        isLoading = false,
                        error = null
                    )
                }
                is NetworkResult.Error -> {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = result.message
                    )
                }
                is NetworkResult.Exception -> {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = result.exception.message ?: "Unknown error occurred"
                    )
                }
            }
        }
    }
    
    /**
     * Clear error message
     */
    fun clearError() {
        _uiState.value = _uiState.value.copy(error = null, messagesError = null)
    }
    
    /**
     * Refresh conversations
     */
    fun refresh() {
        loadConversations(refresh = true)
    }
}

/**
 * UI State for Messages Screen
 */
data class MessagesUiState(
    val conversations: List<Conversation> = emptyList(),
    val messages: List<Message> = emptyList(),
    val selectedConversationId: Int? = null,
    val totalCount: Int = 0,
    val isLoading: Boolean = false,
    val isRefreshing: Boolean = false,
    val isLoadingMessages: Boolean = false,
    val isCreating: Boolean = false,
    val isSending: Boolean = false,
    val error: String? = null,
    val messagesError: String? = null,
    val searchQuery: String = ""
)

