package too.good.crm.features.settings

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material.icons.filled.VisibilityOff
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import too.good.crm.ui.theme.DesignTokens

@Composable
fun ChangePasswordDialog(
    isOpen: Boolean,
    passwordChangeState: PasswordChangeState,
    onDismiss: () -> Unit,
    onConfirm: (currentPassword: String, newPassword: String, confirmPassword: String) -> Unit,
    onResetState: () -> Unit
) {
    var currentPassword by remember { mutableStateOf("") }
    var newPassword by remember { mutableStateOf("") }
    var confirmPassword by remember { mutableStateOf("") }
    
    var showCurrentPassword by remember { mutableStateOf(false) }
    var showNewPassword by remember { mutableStateOf(false) }
    var showConfirmPassword by remember { mutableStateOf(false) }
    
    // Reset fields when dialog opens
    LaunchedEffect(isOpen) {
        if (isOpen) {
            currentPassword = ""
            newPassword = ""
            confirmPassword = ""
            showCurrentPassword = false
            showNewPassword = false
            showConfirmPassword = false
        }
    }
    
    // Handle success - auto close dialog after 1.5 seconds
    LaunchedEffect(passwordChangeState) {
        if (passwordChangeState is PasswordChangeState.Success) {
            kotlinx.coroutines.delay(1500)
            onDismiss()
            onResetState()
        }
    }
    
    if (isOpen) {
        AlertDialog(
            onDismissRequest = {
                if (passwordChangeState !is PasswordChangeState.Loading) {
                    onDismiss()
                    onResetState()
                }
            },
            title = {
                Text(
                    text = "Change Password",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold
                )
            },
            text = {
                Column(
                    modifier = Modifier.fillMaxWidth(),
                    verticalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space3)
                ) {
                    // Current Password
                    OutlinedTextField(
                        value = currentPassword,
                        onValueChange = { currentPassword = it },
                        label = { Text("Current Password") },
                        modifier = Modifier.fillMaxWidth(),
                        visualTransformation = if (showCurrentPassword) VisualTransformation.None else PasswordVisualTransformation(),
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
                        trailingIcon = {
                            IconButton(onClick = { showCurrentPassword = !showCurrentPassword }) {
                                Icon(
                                    imageVector = if (showCurrentPassword) Icons.Default.VisibilityOff else Icons.Default.Visibility,
                                    contentDescription = if (showCurrentPassword) "Hide password" else "Show password"
                                )
                            }
                        },
                        enabled = passwordChangeState !is PasswordChangeState.Loading,
                        singleLine = true
                    )
                    
                    // New Password
                    OutlinedTextField(
                        value = newPassword,
                        onValueChange = { newPassword = it },
                        label = { Text("New Password") },
                        modifier = Modifier.fillMaxWidth(),
                        visualTransformation = if (showNewPassword) VisualTransformation.None else PasswordVisualTransformation(),
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
                        trailingIcon = {
                            IconButton(onClick = { showNewPassword = !showNewPassword }) {
                                Icon(
                                    imageVector = if (showNewPassword) Icons.Default.VisibilityOff else Icons.Default.Visibility,
                                    contentDescription = if (showNewPassword) "Hide password" else "Show password"
                                )
                            }
                        },
                        enabled = passwordChangeState !is PasswordChangeState.Loading,
                        singleLine = true
                    )
                    
                    // Confirm Password
                    OutlinedTextField(
                        value = confirmPassword,
                        onValueChange = { confirmPassword = it },
                        label = { Text("Confirm New Password") },
                        modifier = Modifier.fillMaxWidth(),
                        visualTransformation = if (showConfirmPassword) VisualTransformation.None else PasswordVisualTransformation(),
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
                        trailingIcon = {
                            IconButton(onClick = { showConfirmPassword = !showConfirmPassword }) {
                                Icon(
                                    imageVector = if (showConfirmPassword) Icons.Default.VisibilityOff else Icons.Default.Visibility,
                                    contentDescription = if (showConfirmPassword) "Hide password" else "Show password"
                                )
                            }
                        },
                        enabled = passwordChangeState !is PasswordChangeState.Loading,
                        singleLine = true
                    )
                    
                    // Password requirements
                    Text(
                        text = "• Password must be at least 6 characters\n• New password must be different from current",
                        style = MaterialTheme.typography.bodySmall,
                        color = DesignTokens.Colors.OnSurfaceVariant,
                        fontSize = 11.sp
                    )
                    
                    // Show loading, error, or success state
                    when (passwordChangeState) {
                        is PasswordChangeState.Loading -> {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.Center,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                CircularProgressIndicator(
                                    modifier = Modifier.size(20.dp),
                                    strokeWidth = 2.dp
                                )
                                Spacer(modifier = Modifier.width(DesignTokens.Spacing.Space2))
                                Text(
                                    text = "Changing password...",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = DesignTokens.Colors.OnSurfaceVariant
                                )
                            }
                        }
                        is PasswordChangeState.Error -> {
                            Text(
                                text = passwordChangeState.message,
                                style = MaterialTheme.typography.bodySmall,
                                color = DesignTokens.Colors.Error,
                                fontWeight = FontWeight.Medium
                            )
                        }
                        is PasswordChangeState.Success -> {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.Center,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = "✓ ${passwordChangeState.message}",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = DesignTokens.Colors.Success,
                                    fontWeight = FontWeight.Medium
                                )
                            }
                        }
                        else -> {}
                    }
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        onConfirm(currentPassword, newPassword, confirmPassword)
                    },
                    enabled = passwordChangeState !is PasswordChangeState.Loading &&
                            currentPassword.isNotEmpty() &&
                            newPassword.isNotEmpty() &&
                            confirmPassword.isNotEmpty(),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = DesignTokens.Colors.Primary
                    )
                ) {
                    Text(
                        text = "Change Password",
                        style = MaterialTheme.typography.labelMedium
                    )
                }
            },
            dismissButton = {
                TextButton(
                    onClick = {
                        onDismiss()
                        onResetState()
                    },
                    enabled = passwordChangeState !is PasswordChangeState.Loading
                ) {
                    Text(
                        text = "Cancel",
                        style = MaterialTheme.typography.labelMedium
                    )
                }
            },
            containerColor = DesignTokens.Colors.White
        )
    }
}

