package too.good.crm.features.messages

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.Send
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import too.good.crm.data.UserSession
import too.good.crm.data.model.Message
import too.good.crm.ui.theme.DesignTokens
import java.text.SimpleDateFormat
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ChatScreen(
    userId: Int,
    viewModel: MessagesViewModel = androidx.lifecycle.viewmodel.compose.viewModel(),
    onNavigateBack: () -> Unit
) {
    val uiState by viewModel.uiState.collectAsState()
    val listState = rememberLazyListState()
    var messageText by remember { mutableStateOf("") }

    // Load messages when screen appears
    LaunchedEffect(userId) {
        viewModel.loadMessages(userId)
    }

    // Cleanup polling when leaving
    DisposableEffect(Unit) {
        onDispose {
            viewModel.stopPolling()
        }
    }

    // Auto-scroll to bottom when new messages arrive
    LaunchedEffect(uiState.messages.size) {
        if (uiState.messages.isNotEmpty()) {
            listState.animateScrollToItem(uiState.messages.size - 1)
        }
    }

    val chatTitle = uiState.selectedUserName ?: "Chat"

    Scaffold(
        modifier = Modifier.imePadding(),
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = chatTitle,
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.SemiBold,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = "Back"
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = DesignTokens.Colors.Surface
                )
            )
        },
        bottomBar = {
            Surface(
                modifier = Modifier.fillMaxWidth(),
                color = DesignTokens.Colors.Surface,
                shadowElevation = 8.dp
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    verticalAlignment = Alignment.Bottom,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    OutlinedTextField(
                        value = messageText,
                        onValueChange = { messageText = it },
                        modifier = Modifier.weight(1f),
                        placeholder = { Text("Type a message...") },
                        shape = RoundedCornerShape(24.dp),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedContainerColor = DesignTokens.Colors.Background,
                            unfocusedContainerColor = DesignTokens.Colors.Background
                        ),
                        maxLines = 4
                    )
                    
                    IconButton(
                        onClick = {
                            if (messageText.isNotBlank() && !uiState.isSending) {
                                viewModel.sendMessage(
                                    recipientId = userId,
                                    content = messageText.trim(),
                                    onSuccess = {
                                        messageText = ""
                                    }
                                )
                            }
                        },
                        enabled = messageText.isNotBlank() && !uiState.isSending,
                        modifier = Modifier
                            .size(48.dp)
                            .background(
                                color = if (messageText.isNotBlank() && !uiState.isSending)
                                    DesignTokens.Colors.Primary
                                else
                                    DesignTokens.Colors.OutlineVariant,
                                shape = RoundedCornerShape(24.dp)
                            )
                    ) {
                        if (uiState.isSending) {
                            CircularProgressIndicator(
                                modifier = Modifier.size(24.dp),
                                color = DesignTokens.Colors.OnPrimary,
                                strokeWidth = 2.dp
                            )
                        } else {
                            Icon(
                                imageVector = Icons.AutoMirrored.Filled.Send,
                                contentDescription = "Send",
                                tint = if (messageText.isNotBlank())
                                    DesignTokens.Colors.OnPrimary
                                else
                                    DesignTokens.Colors.OnSurfaceVariant
                            )
                        }
                    }
                }
            }
        }
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(DesignTokens.Colors.Background)
                .padding(paddingValues)
        ) {
            when {
                uiState.isLoadingMessages && uiState.messages.isEmpty() -> {
                    Box(
                        modifier = Modifier.fillMaxSize(),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.spacedBy(16.dp)
                        ) {
                            CircularProgressIndicator()
                            Text(
                                text = "Loading messages...",
                                style = MaterialTheme.typography.bodyMedium,
                                color = DesignTokens.Colors.OnSurfaceVariant
                            )
                        }
                    }
                }
                uiState.messagesError != null && uiState.messages.isEmpty() -> {
                    Box(
                        modifier = Modifier.fillMaxSize(),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.spacedBy(16.dp),
                            modifier = Modifier.padding(32.dp)
                        ) {
                            Text(
                                text = uiState.messagesError ?: "Failed to load messages",
                                style = MaterialTheme.typography.bodyMedium,
                                color = DesignTokens.Colors.Error
                            )
                            Button(
                                onClick = { viewModel.loadMessages(userId) }
                            ) {
                                Text("Retry")
                            }
                        }
                    }
                }
                uiState.messages.isEmpty() -> {
                    Box(
                        modifier = Modifier.fillMaxSize(),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.spacedBy(8.dp),
                            modifier = Modifier.padding(32.dp)
                        ) {
                            Text(
                                text = "No messages yet",
                                style = MaterialTheme.typography.titleMedium,
                                color = DesignTokens.Colors.OnSurfaceVariant
                            )
                            Text(
                                text = "Start the conversation by sending a message",
                                style = MaterialTheme.typography.bodySmall,
                                color = DesignTokens.Colors.OnSurfaceVariant
                            )
                        }
                    }
                }
                else -> {
                    LazyColumn(
                        state = listState,
                        modifier = Modifier.fillMaxSize(),
                        contentPadding = PaddingValues(16.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        items(uiState.messages) { message ->
                            MessageBubble(message = message)
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun MessageBubble(message: Message) {
    val isOwnMessage = message.sender.id == UserSession.userId
    
    Column(
        modifier = Modifier.fillMaxWidth(),
        horizontalAlignment = if (isOwnMessage) Alignment.End else Alignment.Start
    ) {
        Surface(
            modifier = Modifier.widthIn(max = 280.dp),
            shape = RoundedCornerShape(
                topStart = 16.dp,
                topEnd = 16.dp,
                bottomStart = if (isOwnMessage) 16.dp else 4.dp,
                bottomEnd = if (isOwnMessage) 4.dp else 16.dp
            ),
            color = if (isOwnMessage)
                DesignTokens.Colors.Primary
            else
                DesignTokens.Colors.Surface,
            shadowElevation = 1.dp
        ) {
            Column(
                modifier = Modifier.padding(12.dp)
            ) {
                if (!isOwnMessage) {
                    val senderName = "${message.sender.firstName ?: ""} ${message.sender.lastName ?: ""}".trim()
                        .ifEmpty { message.sender.email }
                    Text(
                        text = senderName,
                        style = MaterialTheme.typography.labelSmall,
                        fontWeight = FontWeight.SemiBold,
                        color = DesignTokens.Colors.Primary,
                        modifier = Modifier.padding(bottom = 4.dp)
                    )
                }
                
                Text(
                    text = message.content,
                    style = MaterialTheme.typography.bodyMedium,
                    color = if (isOwnMessage)
                        DesignTokens.Colors.OnPrimary
                    else
                        DesignTokens.Colors.OnSurface
                )
                
                Spacer(modifier = Modifier.height(4.dp))
                
                Row(
                    horizontalArrangement = Arrangement.spacedBy(4.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = formatMessageTime(message.createdAt),
                        style = MaterialTheme.typography.labelSmall,
                        fontSize = 10.sp,
                        color = if (isOwnMessage)
                            DesignTokens.Colors.OnPrimary.copy(alpha = 0.7f)
                        else
                            DesignTokens.Colors.OnSurfaceVariant
                    )
                    
                    if (isOwnMessage && message.isRead) {
                        Text(
                            text = "• Read",
                            style = MaterialTheme.typography.labelSmall,
                            fontSize = 10.sp,
                            color = DesignTokens.Colors.OnPrimary.copy(alpha = 0.7f)
                        )
                    }
                }
            }
        }
    }
}

private fun formatMessageTime(timestamp: String): String {
    return try {
        val sdf = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.getDefault())
        val date = sdf.parse(timestamp) ?: return timestamp
        
        val now = Date()
        val diffInMillis = now.time - date.time
        val diffInHours = diffInMillis / (1000 * 60 * 60)
        
        if (diffInHours < 24) {
            // Show time for today
            val timeFormat = SimpleDateFormat("h:mm a", Locale.getDefault())
            timeFormat.format(date)
        } else {
            // Show date and time for older messages
            val dateFormat = SimpleDateFormat("MMM d, h:mm a", Locale.getDefault())
            dateFormat.format(date)
        }
    } catch (e: Exception) {
        timestamp
    }
}
