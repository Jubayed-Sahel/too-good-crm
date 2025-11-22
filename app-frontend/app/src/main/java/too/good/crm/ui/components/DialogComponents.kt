package too.good.crm.ui.components

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Dialog
import too.good.crm.ui.theme.DesignTokens

/**
 * Confirmation dialog with customizable title, message, and actions
 * 
 * @param title Dialog title
 * @param message Dialog message
 * @param confirmText Text for confirm button (default: "Confirm")
 * @param cancelText Text for cancel button (default: "Cancel")
 * @param onConfirm Callback when confirmed
 * @param onDismiss Callback when dismissed
 * @param icon Optional icon to display
 * @param destructive Whether this is a destructive action (changes button color)
 */
@Composable
fun ConfirmationDialog(
    title: String,
    message: String,
    confirmText: String = "Confirm",
    cancelText: String = "Cancel",
    onConfirm: () -> Unit,
    onDismiss: () -> Unit,
    icon: ImageVector? = null,
    destructive: Boolean = false
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        icon = if (icon != null) {
            {
                Icon(
                    imageVector = icon,
                    contentDescription = null,
                    modifier = Modifier.size(32.dp),
                    tint = if (destructive) DesignTokens.Colors.Error 
                           else DesignTokens.Colors.Primary
                )
            }
        } else null,
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
            Button(
                onClick = {
                    onConfirm()
                    onDismiss()
                },
                colors = if (destructive) {
                    ButtonDefaults.buttonColors(
                        containerColor = DesignTokens.Colors.Error
                    )
                } else {
                    ButtonDefaults.buttonColors()
                }
            ) {
                Text(confirmText)
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text(cancelText)
            }
        }
    )
}

/**
 * Info dialog for displaying information to the user
 * 
 * @param title Dialog title
 * @param message Dialog message
 * @param onDismiss Callback when dismissed
 */
@Composable
fun InfoDialog(
    title: String,
    message: String,
    onDismiss: () -> Unit
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        icon = {
            Icon(
                imageVector = Icons.Default.Info,
                contentDescription = null,
                modifier = Modifier.size(32.dp),
                tint = DesignTokens.Colors.Info
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
            TextButton(onClick = onDismiss) {
                Text("OK")
            }
        }
    )
}

/**
 * Success dialog with checkmark icon
 * 
 * @param title Success title
 * @param message Success message
 * @param onDismiss Callback when dismissed
 */
@Composable
fun SuccessDialog(
    title: String,
    message: String,
    onDismiss: () -> Unit
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        icon = {
            Icon(
                imageVector = Icons.Default.CheckCircle,
                contentDescription = null,
                modifier = Modifier.size(48.dp),
                tint = DesignTokens.Colors.Success
            )
        },
        title = {
            Text(
                text = title,
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold,
                textAlign = TextAlign.Center
            )
        },
        text = {
            Text(
                text = message,
                style = MaterialTheme.typography.bodyMedium,
                textAlign = TextAlign.Center
            )
        },
        confirmButton = {
            Button(
                onClick = onDismiss,
                colors = ButtonDefaults.buttonColors(
                    containerColor = DesignTokens.Colors.Success
                )
            ) {
                Text("Great!")
            }
        }
    )
}

/**
 * Custom dialog container for more complex content
 * 
 * @param onDismiss Callback when dismissed
 * @param content Dialog content
 */
@Composable
fun CustomDialog(
    onDismiss: () -> Unit,
    content: @Composable () -> Unit
) {
    Dialog(onDismissRequest = onDismiss) {
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(DesignTokens.Spacing.Space4),
            colors = CardDefaults.cardColors(
                containerColor = DesignTokens.Colors.Surface
            ),
            elevation = CardDefaults.cardElevation(defaultElevation = 8.dp)
        ) {
            content()
        }
    }
}

/**
 * Bottom sheet dialog for more content
 * 
 * @param onDismiss Callback when dismissed
 * @param title Optional title
 * @param content Sheet content
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun BottomSheetDialog(
    onDismiss: () -> Unit,
    title: String? = null,
    content: @Composable ColumnScope.() -> Unit
) {
    val sheetState = rememberModalBottomSheetState()
    
    ModalBottomSheet(
        onDismissRequest = onDismiss,
        sheetState = sheetState,
        containerColor = DesignTokens.Colors.Surface
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(DesignTokens.Spacing.Space5)
        ) {
            if (title != null) {
                Text(
                    text = title,
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(bottom = DesignTokens.Spacing.Space4)
                )
            }
            
            content()
        }
    }
}

/**
 * Input dialog for getting text input from user
 * 
 * @param title Dialog title
 * @param hint Hint text for input field
 * @param initialValue Initial value for input field
 * @param onConfirm Callback with input value when confirmed
 * @param onDismiss Callback when dismissed
 */
@Composable
fun InputDialog(
    title: String,
    hint: String,
    initialValue: String = "",
    onConfirm: (String) -> Unit,
    onDismiss: () -> Unit
) {
    var text by remember { mutableStateOf(initialValue) }
    
    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Text(
                text = title,
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold
            )
        },
        text = {
            OutlinedTextField(
                value = text,
                onValueChange = { text = it },
                label = { Text(hint) },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true
            )
        },
        confirmButton = {
            Button(
                onClick = { onConfirm(text) },
                enabled = text.isNotBlank()
            ) {
                Text("Confirm")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel")
            }
        }
    )
}

