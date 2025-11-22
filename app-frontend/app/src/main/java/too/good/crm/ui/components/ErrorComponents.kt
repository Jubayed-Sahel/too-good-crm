package too.good.crm.ui.components

import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Error
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.WifiOff
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import too.good.crm.ui.theme.DesignTokens

/**
 * Error types for better UX messaging
 */
enum class ErrorType {
    NETWORK,
    SERVER,
    AUTHENTICATION,
    NOT_FOUND,
    GENERIC
}

/**
 * Full-screen error component with retry action
 * 
 * @param errorType Type of error for appropriate icon/message
 * @param title Error title (optional, will use default based on type)
 * @param message Error message
 * @param onRetry Callback when retry button is clicked (optional)
 * @param modifier Modifier for customization
 */
@Composable
fun ErrorScreen(
    errorType: ErrorType = ErrorType.GENERIC,
    title: String? = null,
    message: String,
    onRetry: (() -> Unit)? = null,
    modifier: Modifier = Modifier
) {
    val icon = when (errorType) {
        ErrorType.NETWORK -> Icons.Default.WifiOff
        else -> Icons.Default.Error
    }
    
    val defaultTitle = when (errorType) {
        ErrorType.NETWORK -> "No Connection"
        ErrorType.SERVER -> "Server Error"
        ErrorType.AUTHENTICATION -> "Authentication Failed"
        ErrorType.NOT_FOUND -> "Not Found"
        ErrorType.GENERIC -> "Something Went Wrong"
    }
    
    Box(
        modifier = modifier
            .fillMaxSize()
            .padding(DesignTokens.Spacing.Space6),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space4)
        ) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                modifier = Modifier.size(64.dp),
                tint = DesignTokens.Colors.Error
            )
            
            Text(
                text = title ?: defaultTitle,
                style = MaterialTheme.typography.headlineSmall,
                fontWeight = FontWeight.Bold,
                textAlign = TextAlign.Center
            )
            
            Text(
                text = message,
                style = MaterialTheme.typography.bodyMedium,
                color = DesignTokens.Colors.OnSurfaceVariant,
                textAlign = TextAlign.Center
            )
            
            if (onRetry != null) {
                Spacer(modifier = Modifier.height(DesignTokens.Spacing.Space4))
                
                Button(
                    onClick = onRetry,
                    colors = ButtonDefaults.buttonColors(
                        containerColor = DesignTokens.Colors.Primary
                    )
                ) {
                    Icon(
                        imageVector = Icons.Default.Refresh,
                        contentDescription = null,
                        modifier = Modifier.size(18.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Try Again")
                }
            }
        }
    }
}

/**
 * Compact error message card for inline display
 * 
 * @param message Error message to display
 * @param onDismiss Optional callback to dismiss the error
 * @param modifier Modifier for customization
 */
@Composable
fun ErrorCard(
    message: String,
    onDismiss: (() -> Unit)? = null,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier
            .fillMaxWidth()
            .padding(DesignTokens.Spacing.Space4),
        colors = CardDefaults.cardColors(
            containerColor = DesignTokens.Colors.ErrorLight
        )
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(DesignTokens.Spacing.Space4),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(
                modifier = Modifier.weight(1f),
                horizontalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space3),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    imageVector = Icons.Default.Error,
                    contentDescription = null,
                    tint = DesignTokens.Colors.Error,
                    modifier = Modifier.size(20.dp)
                )
                
                Text(
                    text = message,
                    style = MaterialTheme.typography.bodySmall,
                    color = DesignTokens.Colors.ErrorDark
                )
            }
            
            if (onDismiss != null) {
                IconButton(onClick = onDismiss) {
                    Icon(
                        imageVector = Icons.Default.Error,
                        contentDescription = "Dismiss",
                        tint = DesignTokens.Colors.Error,
                        modifier = Modifier.size(16.dp)
                    )
                }
            }
        }
    }
}

/**
 * Error dialog for modal error display
 * 
 * @param title Dialog title
 * @param message Error message
 * @param onDismiss Callback when dialog is dismissed
 * @param onConfirm Optional confirm action with custom label
 * @param confirmLabel Label for confirm button (default: "OK")
 */
@Composable
fun ErrorDialog(
    title: String,
    message: String,
    onDismiss: () -> Unit,
    onConfirm: (() -> Unit)? = null,
    confirmLabel: String = "OK"
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        icon = {
            Icon(
                imageVector = Icons.Default.Error,
                contentDescription = null,
                tint = DesignTokens.Colors.Error,
                modifier = Modifier.size(32.dp)
            )
        },
        title = {
            Text(
                text = title,
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold
            )
        },
        text = {
            Text(
                text = message,
                style = MaterialTheme.typography.bodyMedium
            )
        },
        confirmButton = {
            TextButton(onClick = onConfirm ?: onDismiss) {
                Text(confirmLabel)
            }
        },
        dismissButton = if (onConfirm != null) {
            {
                TextButton(onClick = onDismiss) {
                    Text("Cancel")
                }
            }
        } else null
    )
}

/**
 * Network error snackbar with retry action
 */
@Composable
fun ErrorSnackbar(
    snackbarHostState: SnackbarHostState,
    message: String,
    onRetry: (() -> Unit)? = null
) {
    SnackbarHost(
        hostState = snackbarHostState,
        snackbar = { data ->
            Snackbar(
                snackbarData = data,
                containerColor = DesignTokens.Colors.Error,
                contentColor = DesignTokens.Colors.White,
                actionColor = DesignTokens.Colors.White
            )
        }
    )
}

