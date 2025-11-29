package too.good.crm.features.messaging.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import too.good.crm.data.NetworkResult
import too.good.crm.data.model.Conversation
import too.good.crm.data.model.Message
import too.good.crm.data.model.MessageUser
import too.good.crm.data.repository.MessageRepository

/**
 * UI State for Conversations List
 */
sealed class ConversationsUiState {
    object Loading : ConversationsUiState()
    data class Success(val conversations: List<Conversation>) : ConversationsUiState()
    data class Error(val message: String) : ConversationsUiState()
}

/**
 * UI State for Chat with a specific user
 */
sealed class ChatUiState {
    object Loading : ChatUiState()
    data class Success(
        val messages: List<Message>,
        val otherUser: MessageUser?
    ) : ChatUiState()
    data class Error(val message: String) : ChatUiState()
}

/**
 * ViewModel for managing messaging functionality
 * Handles conversations list, individual chats, and message operations
 */
class MessagingViewModel : ViewModel() {
    private val repository = MessageRepository()
    
    // Conversations list state
    private val _conversationsUiState = MutableStateFlow<ConversationsUiState>(ConversationsUiState.Loading)
    val conversationsUiState: StateFlow<ConversationsUiState> = _conversationsUiState.asStateFlow()
    
    // Chat state
    private val _chatUiState = MutableStateFlow<ChatUiState>(ChatUiState.Loading)
    val chatUiState: StateFlow<ChatUiState> = _chatUiState.asStateFlow()
    
    // Available recipients
    private val _recipients = MutableStateFlow<List<MessageUser>>(emptyList())
    val recipients: StateFlow<List<MessageUser>> = _recipients.asStateFlow()
    
    // Unread count
    private val _unreadCount = MutableStateFlow(0)
    val unreadCount: StateFlow<Int> = _unreadCount.asStateFlow()
    
    // Loading states
    private val _isSendingMessage = MutableStateFlow(false)
    val isSendingMessage: StateFlow<Boolean> = _isSendingMessage.asStateFlow()
    
    private val _isLoadingRecipients = MutableStateFlow(false)
    val isLoadingRecipients: StateFlow<Boolean> = _isLoadingRecipients.asStateFlow()
    
    // Error messages
    private val _errorMessage = MutableStateFlow<String?>(null)
    val errorMessage: StateFlow<String?> = _errorMessage.asStateFlow()
    
    // Current chat user ID for polling
    private var currentChatUserId: Int? = null
    private var pollingJob: Job? = null
    
    /**
     * Load all conversations for current user
     */
    fun loadConversations() {
        viewModelScope.launch {
            _conversationsUiState.value = ConversationsUiState.Loading
            
            when (val result = repository.getConversations()) {
                is NetworkResult.Success -> {
                    _conversationsUiState.value = ConversationsUiState.Success(result.data)
                }
                is NetworkResult.Error -> {
                    _conversationsUiState.value = ConversationsUiState.Error(
                        result.message ?: "Failed to load conversations"
                    )
                }
                is NetworkResult.Exception -> {
                    _conversationsUiState.value = ConversationsUiState.Error(
                        result.exception.message ?: "Failed to load conversations"
                    )
                }
            }
        }
    }
    
    /**
     * Load messages with a specific user
     * Also starts polling for new messages
     */
    fun loadChatWithUser(userId: Int, userName: String? = null) {
        // Cancel previous polling
        pollingJob?.cancel()
        currentChatUserId = userId
        
        viewModelScope.launch {
            _chatUiState.value = ChatUiState.Loading
            
            when (val result = repository.getMessagesWithUser(userId)) {
                is NetworkResult.Success -> {
                    val messages = result.data
                    // Create MessageUser from conversation if available
                    val otherUser = messages.firstOrNull()?.let { message ->
                        if (message.sender.id == userId) message.sender else message.recipient
                    }
                    
                    _chatUiState.value = ChatUiState.Success(
                        messages = messages,
                        otherUser = otherUser
                    )
                    
                    // Start polling for new messages
                    startPolling(userId)
                }
                is NetworkResult.Error -> {
                    _chatUiState.value = ChatUiState.Error(
                        result.message ?: "Failed to load messages"
                    )
                }
                is NetworkResult.Exception -> {
                    _chatUiState.value = ChatUiState.Error(
                        result.exception.message ?: "Failed to load messages"
                    )
                }
            }
        }
    }
    
    /**
     * Send a message to a user
     */
    fun sendMessage(
        recipientId: Int,
        content: String,
        subject: String? = null,
        relatedLeadId: Int? = null,
        relatedDealId: Int? = null,
        relatedCustomerId: Int? = null,
        onSuccess: () -> Unit = {}
    ) {
        if (content.isBlank()) {
            _errorMessage.value = "Message cannot be empty"
            return
        }
        
        viewModelScope.launch {
            _isSendingMessage.value = true
            _errorMessage.value = null
            
            when (val result = repository.sendMessage(
                recipientId = recipientId,
                content = content,
                subject = subject,
                relatedLeadId = relatedLeadId,
                relatedDealId = relatedDealId,
                relatedCustomerId = relatedCustomerId
            )) {
                is NetworkResult.Success -> {
                    val newMessage = result.data
                    // Add message to current chat if we're viewing this conversation
                    if (currentChatUserId == recipientId) {
                        val currentState = _chatUiState.value
                        if (currentState is ChatUiState.Success) {
                            _chatUiState.value = currentState.copy(
                                messages = currentState.messages + newMessage
                            )
                        }
                    }
                    
                    _isSendingMessage.value = false
                    onSuccess()
                }
                is NetworkResult.Error -> {
                    _errorMessage.value = result.message ?: "Failed to send message"
                    _isSendingMessage.value = false
                }
                is NetworkResult.Exception -> {
                    _errorMessage.value = result.exception.message ?: "Failed to send message"
                    _isSendingMessage.value = false
                }
            }
        }
    }
    
    /**
     * Mark a message as read
     */
    fun markMessageRead(messageId: Int) {
        viewModelScope.launch {
            repository.markMessageRead(messageId)
            // Silently update - don't need to handle errors here
        }
    }
    
    /**
     * Load unread message count
     */
    fun loadUnreadCount() {
        viewModelScope.launch {
            when (val result = repository.getUnreadCount()) {
                is NetworkResult.Success -> {
                    _unreadCount.value = result.data.unreadCount
                }
                is NetworkResult.Error -> {
                    // Silently fail - not critical
                }
                is NetworkResult.Exception -> {
                    // Silently fail - not critical
                }
            }
        }
    }
    
    /**
     * Load available recipients (users we can message)
     */
    fun loadRecipients() {
        viewModelScope.launch {
            _isLoadingRecipients.value = true
            
            when (val result = repository.getRecipients()) {
                is NetworkResult.Success -> {
                    _recipients.value = result.data
                    _isLoadingRecipients.value = false
                }
                is NetworkResult.Error -> {
                    _errorMessage.value = result.message ?: "Failed to load recipients"
                    _isLoadingRecipients.value = false
                }
                is NetworkResult.Exception -> {
                    _errorMessage.value = result.exception.message ?: "Failed to load recipients"
                    _isLoadingRecipients.value = false
                }
            }
        }
    }
    
    /**
     * Start polling for new messages in current chat
     * Polls every 5 seconds
     */
    private fun startPolling(userId: Int) {
        pollingJob = viewModelScope.launch {
            while (true) {
                delay(5000) // Poll every 5 seconds
                
                // Only poll if we're still viewing this chat
                if (currentChatUserId == userId) {
                    when (val result = repository.getMessagesWithUser(userId)) {
                        is NetworkResult.Success -> {
                            val messages = result.data
                            val currentState = _chatUiState.value
                            if (currentState is ChatUiState.Success) {
                                // Only update if there are new messages
                                if (messages.size != currentState.messages.size) {
                                    _chatUiState.value = currentState.copy(messages = messages)
                                }
                            }
                        }
                        is NetworkResult.Error -> {
                            // Silently fail - don't interrupt user experience
                        }
                        is NetworkResult.Exception -> {
                            // Silently fail - don't interrupt user experience
                        }
                    }
                } else {
                    break // Exit polling if we've moved to a different chat
                }
            }
        }
    }
    
    /**
     * Stop polling when leaving a chat
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
        _errorMessage.value = null
    }
    
    override fun onCleared() {
        super.onCleared()
        stopPolling()
    }
}
