package too.good.crm.features.employees

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.ContentCopy
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import too.good.crm.ui.theme.DesignTokens

data class InviteEmployeeData(
    val email: String,
    val firstName: String,
    val lastName: String,
    val phone: String,
    val department: String,
    val jobTitle: String
)

data class InviteEmployeeResponse(
    val temporaryPassword: String?,
    val message: String
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun InviteEmployeeDialog(
    onDismiss: () -> Unit,
    onInviteEmployee: (InviteEmployeeData) -> Unit,
    isInviting: Boolean,
    error: String?,
    inviteResponse: InviteEmployeeResponse? = null
) {
    var email by remember { mutableStateOf("") }
    var firstName by remember { mutableStateOf("") }
    var lastName by remember { mutableStateOf("") }
    var phone by remember { mutableStateOf("") }
    var department by remember { mutableStateOf("") }
    var jobTitle by remember { mutableStateOf("") }

    var emailError by remember { mutableStateOf(false) }
    var firstNameError by remember { mutableStateOf(false) }
    var lastNameError by remember { mutableStateOf(false) }

    val clipboardManager = LocalClipboardManager.current
    var passwordCopied by remember { mutableStateOf(false) }

    // Reset form when dialog opens
    LaunchedEffect(Unit) {
        email = ""
        firstName = ""
        lastName = ""
        phone = ""
        department = ""
        jobTitle = ""
        emailError = false
        firstNameError = false
        lastNameError = false
        passwordCopied = false
    }

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Surface(
            modifier = Modifier
                .fillMaxWidth(0.95f)
                .fillMaxHeight(0.9f),
            shape = RoundedCornerShape(DesignTokens.Radius.Large),
            color = DesignTokens.Colors.Surface
        ) {
            Column(
                modifier = Modifier.fillMaxSize()
            ) {
                // Header
                Surface(
                    color = DesignTokens.Colors.Primary,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(DesignTokens.Spacing.Space4),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Invite New Employee",
                            style = MaterialTheme.typography.titleLarge,
                            fontWeight = FontWeight.Bold,
                            color = DesignTokens.Colors.OnPrimary
                        )
                        IconButton(onClick = onDismiss) {
                            Icon(
                                Icons.Default.Close,
                                contentDescription = "Close",
                                tint = DesignTokens.Colors.OnPrimary
                            )
                        }
                    }
                }

                // Form Content
                Column(
                    modifier = Modifier
                        .weight(1f)
                        .verticalScroll(rememberScrollState())
                        .padding(DesignTokens.Spacing.Space4),
                    verticalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space3)
                ) {
                    // Show success with temporary password OR form
                    if (inviteResponse != null) {
                        // Success State
                        Surface(
                            color = Color(0xFFDFF2E1),
                            shape = RoundedCornerShape(DesignTokens.Radius.Medium),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Row(
                                modifier = Modifier.padding(DesignTokens.Spacing.Space3),
                                horizontalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space2),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Icon(
                                    Icons.Default.CheckCircle,
                                    contentDescription = null,
                                    tint = Color(0xFF388E3C)
                                )
                                Column {
                                    Text(
                                        text = "Employee Invited Successfully!",
                                        style = MaterialTheme.typography.titleSmall,
                                        fontWeight = FontWeight.Bold,
                                        color = Color(0xFF1B5E20)
                                    )
                                    Text(
                                        text = inviteResponse.message,
                                        style = MaterialTheme.typography.bodyMedium,
                                        color = Color(0xFF2E7D32)
                                    )
                                }
                            }
                        }

                        inviteResponse.temporaryPassword?.let { password ->
                            Spacer(modifier = Modifier.height(DesignTokens.Spacing.Space2))

                            // Temporary Password Section
                            Surface(
                                color = Color(0xFFF3E5F5),
                                shape = RoundedCornerShape(DesignTokens.Radius.Medium),
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Column(
                                    modifier = Modifier.padding(DesignTokens.Spacing.Space3),
                                    verticalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space2)
                                ) {
                                    Text(
                                        text = "Temporary Password",
                                        style = MaterialTheme.typography.titleSmall,
                                        fontWeight = FontWeight.Bold,
                                        color = Color(0xFF4A148C)
                                    )
                                    Text(
                                        text = "Share this password with the employee securely. They should change it after first login.",
                                        style = MaterialTheme.typography.bodySmall,
                                        color = Color(0xFF6A1B9A)
                                    )

                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space2),
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Surface(
                                            modifier = Modifier.weight(1f),
                                            color = Color.White,
                                            shape = RoundedCornerShape(DesignTokens.Radius.Small)
                                        ) {
                                            Text(
                                                text = password,
                                                modifier = Modifier.padding(DesignTokens.Spacing.Space3),
                                                style = MaterialTheme.typography.bodyLarge,
                                                fontFamily = FontFamily.Monospace,
                                                fontWeight = FontWeight.Bold,
                                                color = Color(0xFF4A148C)
                                            )
                                        }
                                        Button(
                                            onClick = {
                                                clipboardManager.setText(AnnotatedString(password))
                                                passwordCopied = true
                                            },
                                            colors = ButtonDefaults.buttonColors(
                                                containerColor = if (passwordCopied) Color(0xFF4CAF50) else Color(0xFF9C27B0)
                                            )
                                        ) {
                                            Icon(
                                                if (passwordCopied) Icons.Default.CheckCircle else Icons.Default.ContentCopy,
                                                contentDescription = if (passwordCopied) "Copied" else "Copy",
                                                modifier = Modifier.size(18.dp)
                                            )
                                            Spacer(modifier = Modifier.width(4.dp))
                                            Text(if (passwordCopied) "Copied" else "Copy")
                                        }
                                    }
                                }
                            }

                            Spacer(modifier = Modifier.height(DesignTokens.Spacing.Space2))

                            // Warning
                            Surface(
                                color = Color(0xFFFFF3E0),
                                shape = RoundedCornerShape(DesignTokens.Radius.Small),
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Text(
                                    text = "⚠️ Important: This password will not be shown again. Make sure to copy and share it with the employee.",
                                    modifier = Modifier.padding(DesignTokens.Spacing.Space3),
                                    style = MaterialTheme.typography.bodySmall,
                                    color = Color(0xFFE65100)
                                )
                            }
                        } ?: run {
                            // Existing user added (no password)
                            Spacer(modifier = Modifier.height(DesignTokens.Spacing.Space2))

                            Surface(
                                color = Color(0xFFE3F2FD),
                                shape = RoundedCornerShape(DesignTokens.Radius.Medium),
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Column(
                                    modifier = Modifier.padding(DesignTokens.Spacing.Space3)
                                ) {
                                    Text(
                                        text = "Existing User Added",
                                        style = MaterialTheme.typography.titleSmall,
                                        fontWeight = FontWeight.Bold,
                                        color = Color(0xFF0D47A1)
                                    )
                                    Text(
                                        text = "This user already had an account. They can log in with their existing credentials and will now see your organization in their account.",
                                        style = MaterialTheme.typography.bodyMedium,
                                        color = Color(0xFF1565C0)
                                    )
                                }
                            }
                        }
                    } else {
                        // Form State
                        // Error message
                        error?.let {
                            Surface(
                                color = DesignTokens.Colors.ErrorLight,
                                shape = RoundedCornerShape(DesignTokens.Radius.Medium),
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Text(
                                    text = it,
                                    color = DesignTokens.Colors.ErrorDark,
                                    modifier = Modifier.padding(DesignTokens.Spacing.Space3),
                                    style = MaterialTheme.typography.bodyMedium
                                )
                            }
                        }

                        // Contact Information
                        Text(
                            text = "Contact Information",
                            style = MaterialTheme.typography.titleSmall,
                            fontWeight = FontWeight.SemiBold,
                            color = DesignTokens.Colors.OnSurface
                        )

                        OutlinedTextField(
                            value = email,
                            onValueChange = {
                                email = it
                                emailError = it.isBlank() || !android.util.Patterns.EMAIL_ADDRESS.matcher(it).matches()
                            },
                            label = { Text("Email *") },
                            placeholder = { Text("employee@example.com") },
                            modifier = Modifier.fillMaxWidth(),
                            isError = emailError,
                            supportingText = if (emailError) {
                                { Text("Valid email is required") }
                            } else null,
                            singleLine = true,
                            shape = RoundedCornerShape(DesignTokens.Radius.Medium)
                        )

                        Row(
                            horizontalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space2)
                        ) {
                            OutlinedTextField(
                                value = firstName,
                                onValueChange = {
                                    firstName = it
                                    firstNameError = it.isBlank()
                                },
                                label = { Text("First Name *") },
                                placeholder = { Text("John") },
                                modifier = Modifier.weight(1f),
                                isError = firstNameError,
                                supportingText = if (firstNameError) {
                                    { Text("Required") }
                                } else null,
                                singleLine = true,
                                shape = RoundedCornerShape(DesignTokens.Radius.Medium)
                            )
                            OutlinedTextField(
                                value = lastName,
                                onValueChange = {
                                    lastName = it
                                    lastNameError = it.isBlank()
                                },
                                label = { Text("Last Name *") },
                                placeholder = { Text("Doe") },
                                modifier = Modifier.weight(1f),
                                isError = lastNameError,
                                supportingText = if (lastNameError) {
                                    { Text("Required") }
                                } else null,
                                singleLine = true,
                                shape = RoundedCornerShape(DesignTokens.Radius.Medium)
                            )
                        }

                        OutlinedTextField(
                            value = phone,
                            onValueChange = { phone = it },
                            label = { Text("Phone") },
                            placeholder = { Text("+1-555-0123") },
                            modifier = Modifier.fillMaxWidth(),
                            singleLine = true,
                            shape = RoundedCornerShape(DesignTokens.Radius.Medium)
                        )

                        HorizontalDivider(modifier = Modifier.padding(vertical = DesignTokens.Spacing.Space2))

                        // Job Information
                        Text(
                            text = "Job Information",
                            style = MaterialTheme.typography.titleSmall,
                            fontWeight = FontWeight.SemiBold,
                            color = DesignTokens.Colors.OnSurface
                        )

                        Row(
                            horizontalArrangement = Arrangement.spacedBy(DesignTokens.Spacing.Space2)
                        ) {
                            OutlinedTextField(
                                value = department,
                                onValueChange = { department = it },
                                label = { Text("Department") },
                                placeholder = { Text("Sales") },
                                modifier = Modifier.weight(1f),
                                singleLine = true,
                                shape = RoundedCornerShape(DesignTokens.Radius.Medium)
                            )
                            OutlinedTextField(
                                value = jobTitle,
                                onValueChange = { jobTitle = it },
                                label = { Text("Job Title") },
                                placeholder = { Text("Sales Rep") },
                                modifier = Modifier.weight(1f),
                                singleLine = true,
                                shape = RoundedCornerShape(DesignTokens.Radius.Medium)
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(DesignTokens.Spacing.Space4))
                }

                // Footer Buttons
                HorizontalDivider()
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(DesignTokens.Spacing.Space4),
                    horizontalArrangement = if (inviteResponse != null) {
                        Arrangement.Center
                    } else {
                        Arrangement.spacedBy(DesignTokens.Spacing.Space2, Alignment.End)
                    }
                ) {
                    if (inviteResponse != null) {
                        Button(
                            onClick = onDismiss,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text("Done")
                        }
                    } else {
                        TextButton(onClick = onDismiss) {
                            Text("Cancel")
                        }
                        Button(
                            onClick = {
                                // Validate
                                emailError = email.isBlank() || !android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches()
                                firstNameError = firstName.isBlank()
                                lastNameError = lastName.isBlank()

                                if (!emailError && !firstNameError && !lastNameError) {
                                    onInviteEmployee(
                                        InviteEmployeeData(
                                            email = email,
                                            firstName = firstName,
                                            lastName = lastName,
                                            phone = phone,
                                            department = department,
                                            jobTitle = jobTitle
                                        )
                                    )
                                }
                            },
                            enabled = !isInviting
                        ) {
                            if (isInviting) {
                                CircularProgressIndicator(
                                    modifier = Modifier.size(20.dp),
                                    color = DesignTokens.Colors.OnPrimary,
                                    strokeWidth = 2.dp
                                )
                                Spacer(modifier = Modifier.width(DesignTokens.Spacing.Space2))
                            }
                            Text("Send Invitation")
                        }
                    }
                }
            }
        }
    }
}

