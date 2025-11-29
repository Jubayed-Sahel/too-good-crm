package too.good.crm.features.messages

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import too.good.crm.data.model.MessageUser
import too.good.crm.ui.theme.DesignTokens

/**
 * Dialog for starting a new conversation
 * Allows user to select a recipient and optionally compose an initial message
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun NewMessageDialog(
    recipients: List<MessageUser>,
    isLoading: Boolean,
    onDismiss: () -> Unit,
    onSelectRecipient: (MessageUser) -> Unit
) {
    var searchQuery by remember { mutableStateOf("") }
    
    // Filter recipients by search query
    val filteredRecipients = remember(recipients, searchQuery) {
        if (searchQuery.isEmpty()) {
            recipients
        } else {
            recipients.filter { user ->
                val name = "${user.firstName ?: ""} ${user.lastName ?: ""}".trim()
                val email = user.email
                name.contains(searchQuery, ignoreCase = true) ||
                email.contains(searchQuery, ignoreCase = true)
            }
        }
    }
    
    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(
            usePlatformDefaultWidth = false,
            dismissOnBackPress = true,
            dismissOnClickOutside = true
        )
    ) {
        Surface(
            modifier = Modifier
                .fillMaxWidth(0.9f)
                .fillMaxHeight(0.8f),
            shape = RoundedCornerShape(16.dp),
            color = DesignTokens.Colors.Surface,
            tonalElevation = 6.dp
        ) {
            Column(
                modifier = Modifier.fillMaxSize()
            ) {
                // Header
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "New Message",
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold,
                        color = DesignTokens.Colors.OnSurface
                    )
                    IconButton(onClick = onDismiss) {
                        Icon(
                            Icons.Default.Close,
                            contentDescription = "Close",
                            tint = DesignTokens.Colors.OnSurfaceVariant
                        )
                    }
                }
                
                Divider(color = DesignTokens.Colors.OutlineVariant)
                
                // Search bar
                OutlinedTextField(
                    value = searchQuery,
                    onValueChange = { searchQuery = it },
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    placeholder = { Text("Search recipients...") },
                    leadingIcon = {
                        Icon(Icons.Default.Search, contentDescription = "Search")
                    },
                    trailingIcon = {
                        if (searchQuery.isNotEmpty()) {
                            IconButton(onClick = { searchQuery = "" }) {
                                Icon(Icons.Default.Close, contentDescription = "Clear")
                            }
                        }
                    },
                    shape = RoundedCornerShape(12.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedContainerColor = DesignTokens.Colors.Background,
                        unfocusedContainerColor = DesignTokens.Colors.Background
                    ),
                    singleLine = true
                )
                
                // Recipients list
                when {
                    isLoading -> {
                        Box(
                            modifier = Modifier
                                .fillMaxSize()
                                .padding(32.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Column(
                                horizontalAlignment = Alignment.CenterHorizontally,
                                verticalArrangement = Arrangement.spacedBy(16.dp)
                            ) {
                                CircularProgressIndicator(
                                    color = DesignTokens.Colors.Primary
                                )
                                Text(
                                    text = "Loading recipients...",
                                    style = MaterialTheme.typography.bodyMedium,
                                    color = DesignTokens.Colors.OnSurfaceVariant
                                )
                            }
                        }
                    }
                    filteredRecipients.isEmpty() -> {
                        Box(
                            modifier = Modifier
                                .fillMaxSize()
                                .padding(32.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Column(
                                horizontalAlignment = Alignment.CenterHorizontally,
                                verticalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                Text(
                                    text = if (searchQuery.isEmpty()) 
                                        "No recipients available" 
                                    else 
                                        "No recipients found",
                                    style = MaterialTheme.typography.titleMedium,
                                    color = DesignTokens.Colors.OnSurfaceVariant
                                )
                                Text(
                                    text = if (searchQuery.isEmpty()) 
                                        "No users available to message" 
                                    else 
                                        "Try a different search term",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = DesignTokens.Colors.OnSurfaceVariant
                                )
                            }
                        }
                    }
                    else -> {
                        LazyColumn(
                            modifier = Modifier.fillMaxSize(),
                            contentPadding = PaddingValues(vertical = 8.dp)
                        ) {
                            items(filteredRecipients) { recipient ->
                                RecipientItem(
                                    recipient = recipient,
                                    onClick = {
                                        onSelectRecipient(recipient)
                                        onDismiss()
                                    }
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun RecipientItem(
    recipient: MessageUser,
    onClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
            .padding(horizontal = 16.dp, vertical = 12.dp),
        horizontalArrangement = Arrangement.spacedBy(12.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        // Avatar
        Box(
            modifier = Modifier
                .size(48.dp)
                .clip(CircleShape)
                .background(DesignTokens.Colors.Primary.copy(alpha = 0.1f)),
            contentAlignment = Alignment.Center
        ) {
            val displayName = "${recipient.firstName ?: ""} ${recipient.lastName ?: ""}".trim()
                .ifEmpty { recipient.email }
            val initial = displayName.firstOrNull()?.uppercaseChar()?.toString() ?: "?"
            Text(
                text = initial,
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = DesignTokens.Colors.Primary
            )
        }
        
        // User info
        Column(
            modifier = Modifier.weight(1f)
        ) {
            val displayName = "${recipient.firstName ?: ""} ${recipient.lastName ?: ""}".trim()
            if (displayName.isNotEmpty()) {
                Text(
                    text = displayName,
                    style = MaterialTheme.typography.titleSmall,
                    fontWeight = FontWeight.SemiBold,
                    color = DesignTokens.Colors.OnSurface
                )
            }
            Text(
                text = recipient.email,
                style = MaterialTheme.typography.bodySmall,
                color = DesignTokens.Colors.OnSurfaceVariant
            )
        }
    }
}
