package too.good.crm.features.messages

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import too.good.crm.data.NetworkResult
import too.good.crm.data.model.*
import too.good.crm.data.repository.MessageRepository

/**
 * ViewModel for Messages Screen
 * Handles conversations and messaging using simplified user-to-user structure
 */
class MessagesViewModel : ViewModel() {
    private val repository = MessageRepository()
    
    private val _uiState = MutableStateFlow(MessagesUiState())
    val uiState: StateFlow<MessagesUiState> = _uiState.asStateFlow()
    
    private var pollingJob: Job? = null
    private var currentChatUserId: Int? = null
    
    init {
        loadConversations()
        loadUnreadCount()
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
            
            when (val result = repository.getConversations()) {
                is NetworkResult.Success -> {
                    _uiState.value = _uiState.value.copy(
                        conversations = result.data,
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
     * Load messages with a specific user
     */
    fun loadMessages(userId: Int) {
        // Stop previous polling
        pollingJob?.cancel()
        currentChatUserId = userId
        
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(
                isLoadingMessages = true,
                messagesError = null,
                selectedUserId = userId
            )
            
            when (val result = repository.getMessagesWithUser(userId)) {
                is NetworkResult.Success -> {
                    val messages = result.data
                    val otherUser = messages.firstOrNull()?.let { message ->
                        if (message.sender.id == userId) message.sender else message.recipient
                    }
                    
                    _uiState.value = _uiState.value.copy(
                        messages = messages,
                        selectedUserName = otherUser?.let {
                            "${it.firstName ?: ""} ${it.lastName ?: ""}".trim().ifEmpty { it.email }
                        },
                        isLoadingMessages = false,
                        messagesError = null
                    )
                    
                    // Start polling
                    startPolling(userId)
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
     * Send a message to a user
     */
    fun sendMessage(recipientId: Int, content: String, onSuccess: () -> Unit = {}) {
        if (content.isBlank()) return
        
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isSending = true, messagesError = null)
            
            when (val result = repository.sendMessage(
                recipientId = recipientId,
                content = content
            )) {
                is NetworkResult.Success -> {
                    // Add message optimistically to current chat
                    if (currentChatUserId == recipientId) {
                        _uiState.value = _uiState.value.copy(
                            messages = _uiState.value.messages + result.data,
                            isSending = false
                        )
                    } else {
                        _uiState.value = _uiState.value.copy(isSending = false)
                    }
                    
                    // Refresh conversations list to update last message
                    loadConversations(refresh = true)
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
     * Load available recipients
     */
    fun loadRecipients() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoadingRecipients = true)
            
            when (val result = repository.getRecipients()) {
                is NetworkResult.Success -> {
                    _uiState.value = _uiState.value.copy(
                        recipients = result.data,
                        isLoadingRecipients = false
                    )
                }
                is NetworkResult.Error -> {
                    _uiState.value = _uiState.value.copy(
                        isLoadingRecipients = false,
                        error = result.message
                    )
                }
                is NetworkResult.Exception -> {
                    _uiState.value = _uiState.value.copy(
                        isLoadingRecipients = false,
                        error = result.exception.message ?: "Failed to load recipients"
                    )
                }
            }
        }
    }
    
    /**
     * Load unread message count
     */
    fun loadUnreadCount() {
        viewModelScope.launch {
            when (val result = repository.getUnreadCount()) {
                is NetworkResult.Success -> {
                    _uiState.value = _uiState.value.copy(
                        unreadCount = result.data.unreadCount
                    )
                }
                is NetworkResult.Error, is NetworkResult.Exception -> {
                    // Silently fail - not critical
                }
            }
        }
    }
    
    /**
     * Start polling for new messages
     */
    private fun startPolling(userId: Int) {
        pollingJob = viewModelScope.launch {
            while (true) {
                delay(5000) // Poll every 5 seconds
                
                if (currentChatUserId == userId) {
                    val result = repository.getMessagesWithUser(userId)
                    if (result is NetworkResult.Success) {
                        val currentMessages = _uiState.value.messages
                        if (result.data.size != currentMessages.size) {
                            _uiState.value = _uiState.value.copy(messages = result.data)
                        }
                    }
                } else {
                    break
                }
            }
        }
    }
    
    /**
     * Stop polling
     */
    fun stopPolling() {
        pollingJob?.cancel()
        pollingJob = null
        currentChatUserId = null
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
        loadUnreadCount()
    }
    
    override fun onCleared() {
        super.onCleared()
        stopPolling()
    }
}

/**
 * UI State for Messages Screen
 * Simplified to match user-to-user messaging structure
 */
data class MessagesUiState(
    val conversations: List<Conversation> = emptyList(),
    val messages: List<Message> = emptyList(),
    val recipients: List<MessageUser> = emptyList(),
    val selectedUserId: Int? = null,
    val selectedUserName: String? = null,
    val unreadCount: Int = 0,
    val isLoading: Boolean = false,
    val isRefreshing: Boolean = false,
    val isLoadingMessages: Boolean = false,
    val isLoadingRecipients: Boolean = false,
    val isSending: Boolean = false,
    val error: String? = null,
    val messagesError: String? = null,
    val searchQuery: String = ""
)

