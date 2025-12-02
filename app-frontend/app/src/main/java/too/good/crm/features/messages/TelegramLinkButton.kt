package too.good.crm.features.messages

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.automirrored.filled.Send
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.foundation.border
import androidx.compose.ui.draw.clip
import kotlinx.coroutines.launch
import too.good.crm.data.NetworkResult
import too.good.crm.data.repository.TelegramRepository
import too.good.crm.ui.theme.DesignTokens

/**
 * Telegram Link Button Component
 * Shows phone verification UI for linking Telegram account
 */
@Composable
fun TelegramLinkButton(
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val clipboardManager = LocalClipboardManager.current
    val repository = remember { TelegramRepository() }
    val scope = rememberCoroutineScope()
    
    var isPhoneDialogOpen by remember { mutableStateOf(false) }
    var verificationInfo by remember { mutableStateOf<VerificationInfo?>(null) }
    var isLoading by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf<String?>(null) }
    
    // Show verification info if code was sent
    if (verificationInfo != null) {
        TelegramVerificationInfoCard(
            verificationInfo = verificationInfo!!,
            onVerifyNow = { url ->
                // Open verification URL in browser or deep link
                try {
                    val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
                    context.startActivity(intent)
                } catch (e: Exception) {
                    errorMessage = "Could not open verification link"
                }
            },
            onSendNewCode = {
                verificationInfo = null
                isPhoneDialogOpen = true
            },
            modifier = modifier
        )
    } else {
        // Initial state - show button to start verification
        Card(
            modifier = modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(
                containerColor = MaterialTheme.colorScheme.primaryContainer
            ),
            shape = RoundedCornerShape(12.dp)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Send,
                        contentDescription = null,
                        tint = DesignTokens.Colors.Primary
                    )
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = "Connect to Telegram Bot",
                            style = MaterialTheme.typography.titleSmall,
                            fontWeight = FontWeight.Bold,
                            color = DesignTokens.Colors.OnSurface
                        )
                        Text(
                            text = "Quick authentication or phone verification",
                            style = MaterialTheme.typography.bodySmall,
                            color = DesignTokens.Colors.OnSurfaceVariant
                        )
                    }
                }
                
                // Show auth code if generated
                var authCode by remember { mutableStateOf<String?>(null) }
                
                if (authCode != null) {
                    // Show code and instructions
                    Surface(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp),
                        color = DesignTokens.Colors.Success50,
                        border = androidx.compose.foundation.BorderStroke(2.dp, DesignTokens.Colors.Success)
                    ) {
                        Column(
                            modifier = Modifier.padding(16.dp),
                            verticalArrangement = Arrangement.spacedBy(12.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Icon(
                                imageVector = Icons.Default.CheckCircle,
                                contentDescription = null,
                                tint = DesignTokens.Colors.Success,
                                modifier = Modifier.size(48.dp)
                            )
                            Text(
                                text = "Authentication Code Generated!",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold,
                                color = DesignTokens.Colors.Success
                            )
                            
                            // Code display
                            Surface(
                                modifier = Modifier.fillMaxWidth(),
                                shape = RoundedCornerShape(8.dp),
                                color = DesignTokens.Colors.Background,
                                border = androidx.compose.foundation.BorderStroke(1.dp, DesignTokens.Colors.OutlineVariant)
                            ) {
                                Column(
                                    modifier = Modifier.padding(16.dp),
                                    horizontalAlignment = Alignment.CenterHorizontally,
                                    verticalArrangement = Arrangement.spacedBy(8.dp)
                                ) {
                                    Text(
                                        text = "Your Code",
                                        style = MaterialTheme.typography.labelSmall,
                                        color = DesignTokens.Colors.OnSurfaceVariant
                                    )
                                    Text(
                                        text = authCode ?: "",
                                        style = MaterialTheme.typography.displaySmall,
                                        fontWeight = FontWeight.Bold,
                                        letterSpacing = 4.sp,
                                        color = DesignTokens.Colors.OnSurface
                                    )
                                }
                            }
                            
                            Text(
                                text = "1. Open Telegram and find the bot\n2. Type: /start $authCode\n3. You'll be authenticated automatically!",
                                style = MaterialTheme.typography.bodyMedium,
                                textAlign = TextAlign.Center,
                                color = DesignTokens.Colors.OnSurfaceVariant
                            )
                            
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                OutlinedButton(
                                    onClick = {
                                        // Copy code to clipboard
                                        clipboardManager.setText(AnnotatedString(authCode ?: ""))
                                    },
                                    modifier = Modifier.weight(1f)
                                ) {
                                    Icon(Icons.Default.ContentCopy, contentDescription = null, modifier = Modifier.size(18.dp))
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Text("Copy Code")
                                }
                                Button(
                                    onClick = {
                                        // Open Telegram
                                        val botUsername = "LeadGrid_bot" // Default, or get from response
                                        try {
                                            val telegramIntent = Intent(Intent.ACTION_VIEW).apply {
                                                data = Uri.parse("tg://resolve?domain=${botUsername.removePrefix("@")}")
                                                setPackage("org.telegram.messenger")
                                                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                                            }
                                            context.startActivity(telegramIntent)
                                        } catch (e: Exception) {
                                            try {
                                                val httpsIntent = Intent(Intent.ACTION_VIEW, Uri.parse("https://t.me/$botUsername")).apply {
                                                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                                                }
                                                context.startActivity(httpsIntent)
                                            } catch (e2: Exception) {
                                                errorMessage = "Could not open Telegram. Please install Telegram app."
                                            }
                                        }
                                    },
                                    modifier = Modifier.weight(1f),
                                    colors = ButtonDefaults.buttonColors(containerColor = DesignTokens.Colors.Primary)
                                ) {
                                    Icon(Icons.Default.Send, contentDescription = null, modifier = Modifier.size(18.dp))
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Text("Open Bot")
                                }
                            }
                            
                            TextButton(
                                onClick = { authCode = null },
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Text("Generate New Code")
                            }
                        }
                    }
                } else {
                    // Direct auth link button (generates code)
                    Button(
                        onClick = {
                            scope.launch {
                                isLoading = true
                                errorMessage = null
                                
                                when (val result = repository.generateTelegramLink(null)) {
                                    is NetworkResult.Success -> {
                                        val code = result.data.auth_code
                                        if (code != null && code.isNotBlank()) {
                                            authCode = code
                                        } else {
                                            errorMessage = "Failed to generate authentication code"
                                        }
                                    }
                                    is NetworkResult.Error -> {
                                        errorMessage = result.message ?: "Failed to generate authentication code"
                                    }
                                    else -> {
                                        errorMessage = "An unexpected error occurred"
                                    }
                                }
                                isLoading = false
                            }
                        },
                        modifier = Modifier.fillMaxWidth(),
                        enabled = !isLoading,
                        colors = ButtonDefaults.buttonColors(
                            containerColor = DesignTokens.Colors.Primary
                        )
                    ) {
                        if (isLoading) {
                            CircularProgressIndicator(
                                modifier = Modifier.size(18.dp),
                                color = DesignTokens.Colors.OnPrimary,
                                strokeWidth = 2.dp
                            )
                        } else {
                            Icon(
                                imageVector = Icons.Default.Send,
                                contentDescription = null,
                                modifier = Modifier.size(18.dp)
                            )
                        }
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = if (isLoading) "Generating Code..." else "Get Authentication Code",
                            color = DesignTokens.Colors.OnPrimary
                        )
                    }
                }
                
                // Divider
                HorizontalDivider(
                    modifier = Modifier.padding(vertical = 8.dp),
                    color = DesignTokens.Colors.OutlineVariant
                )
                
                // Phone verification button (alternative method)
                OutlinedButton(
                    onClick = { isPhoneDialogOpen = true },
                    modifier = Modifier.fillMaxWidth(),
                    enabled = !isLoading
                ) {
                    Icon(
                        imageVector = Icons.Default.Phone,
                        contentDescription = null,
                        modifier = Modifier.size(18.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Verify via Phone Number")
                }
                
                Text(
                    text = "Or use phone verification as alternative method",
                    style = MaterialTheme.typography.labelSmall,
                    color = DesignTokens.Colors.OnSurfaceVariant,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.fillMaxWidth()
                )
            }
        }
    }
    
    // Phone number input dialog
    if (isPhoneDialogOpen) {
        PhoneVerificationDialog(
            onDismiss = { isPhoneDialogOpen = false },
            onCodeSent = { info ->
                verificationInfo = info
                isPhoneDialogOpen = false
            },
            repository = repository,
            isLoading = isLoading,
            onLoadingChanged = { isLoading = it },
            errorMessage = errorMessage,
            onErrorChanged = { errorMessage = it }
        )
    }
    
    // Error snackbar
    errorMessage?.let { error ->
        LaunchedEffect(error) {
            kotlinx.coroutines.delay(5000)
            errorMessage = null
        }
    }
}

/**
 * Verification Info Card
 * Displays verification code and link after SMS is sent
 */
@Composable
private fun TelegramVerificationInfoCard(
    verificationInfo: VerificationInfo,
    onVerifyNow: (String) -> Unit,
    onSendNewCode: () -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    
    Card(
        modifier = modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.tertiaryContainer
        ),
        shape = RoundedCornerShape(12.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.CheckCircle,
                    contentDescription = null,
                    tint = DesignTokens.Colors.Success
                )
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = "Verification Code Sent!",
                        style = MaterialTheme.typography.titleSmall,
                        fontWeight = FontWeight.Bold,
                        color = DesignTokens.Colors.OnSurface
                    )
                    Text(
                        text = "Code sent to ${verificationInfo.phoneNumber}",
                        style = MaterialTheme.typography.bodySmall,
                        color = DesignTokens.Colors.OnSurfaceVariant
                    )
                }
            }
            
            // Verification Code Display
            Surface(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(8.dp),
                color = MaterialTheme.colorScheme.surface
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Text(
                        text = "Verification Code",
                        style = MaterialTheme.typography.labelMedium,
                        fontWeight = FontWeight.SemiBold,
                        color = DesignTokens.Colors.OnSurface
                    )
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = verificationInfo.code,
                            style = MaterialTheme.typography.headlineSmall,
                            fontWeight = FontWeight.Bold,
                            letterSpacing = 4.sp,
                            modifier = Modifier
                                .weight(1f)
                                .background(
                                    MaterialTheme.colorScheme.surfaceVariant,
                                    RoundedCornerShape(8.dp)
                                )
                                .padding(vertical = 12.dp),
                            textAlign = TextAlign.Center,
                            color = DesignTokens.Colors.OnSurface
                        )
                        IconButton(
                            onClick = {
                                val clipboard = context.getSystemService(android.content.Context.CLIPBOARD_SERVICE) as android.content.ClipboardManager
                                val clip = android.content.ClipData.newPlainText("Verification Code", verificationInfo.code)
                                clipboard.setPrimaryClip(clip)
                            }
                        ) {
                            Icon(Icons.Default.ContentCopy, contentDescription = "Copy Code")
                        }
                    }
                }
            }
            
            // Verify Now Button
            Button(
                onClick = { onVerifyNow(verificationInfo.url) },
                modifier = Modifier.fillMaxWidth()
            ) {
                Icon(
                    imageVector = Icons.Default.CheckCircle,
                    contentDescription = null,
                    modifier = Modifier.size(18.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text("Click to Verify Telegram Account")
            }
            
            // Verification Link
            Surface(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(8.dp),
                color = MaterialTheme.colorScheme.surfaceVariant
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(12.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = verificationInfo.url,
                        style = MaterialTheme.typography.bodySmall,
                        modifier = Modifier.weight(1f),
                        maxLines = 2,
                        color = DesignTokens.Colors.OnSurfaceVariant
                    )
                    IconButton(
                        onClick = {
                            val clipboard = context.getSystemService(android.content.Context.CLIPBOARD_SERVICE) as android.content.ClipboardManager
                            val clip = android.content.ClipData.newPlainText("Verification Link", verificationInfo.url)
                            clipboard.setPrimaryClip(clip)
                        },
                        modifier = Modifier.size(32.dp)
                    ) {
                        Icon(
                            Icons.Default.ContentCopy,
                            contentDescription = "Copy Link",
                            modifier = Modifier.size(18.dp)
                        )
                    }
                }
            }
            
            Text(
                text = "Code expires in 15 minutes. You can also check your SMS for the verification link.",
                style = MaterialTheme.typography.bodySmall,
                color = DesignTokens.Colors.OnSurfaceVariant,
                textAlign = TextAlign.Center,
                modifier = Modifier.fillMaxWidth()
            )
            
            TextButton(
                onClick = onSendNewCode,
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("Send New Code")
            }
        }
    }
}

/**
 * Phone Verification Dialog
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun PhoneVerificationDialog(
    onDismiss: () -> Unit,
    onCodeSent: (VerificationInfo) -> Unit,
    repository: TelegramRepository,
    isLoading: Boolean,
    onLoadingChanged: (Boolean) -> Unit,
    errorMessage: String?,
    onErrorChanged: (String?) -> Unit
) {
    val scope = rememberCoroutineScope()
    var phoneNumber by remember { mutableStateOf("") }
    
    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Icon(Icons.Default.Phone, contentDescription = null)
                Text("Verify Phone Number")
            }
        },
        text = {
            Column(
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Text(
                    text = "Enter your phone number to receive a verification code via SMS. This will link your Telegram account to your CRM profile.",
                    style = MaterialTheme.typography.bodyMedium
                )
                
                OutlinedTextField(
                    value = phoneNumber,
                    onValueChange = { phoneNumber = it },
                    label = { Text("Phone Number") },
                    placeholder = { Text("+1234567890") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                    enabled = !isLoading,
                    leadingIcon = {
                        Icon(Icons.Default.Phone, contentDescription = null)
                    }
                )
                
                Text(
                    text = "Include country code (e.g., +1 for US/Canada, +44 for UK)",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                
                errorMessage?.let { error ->
                    Text(
                        text = error,
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.error
                    )
                }
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    val trimmedPhone = phoneNumber.trim()
                    
                    // Validate phone number format before sending
                    if (trimmedPhone.isBlank()) {
                        onErrorChanged("Please enter a phone number")
                        return@Button
                    }
                    
                    // Basic validation: should start with + or have country code
                    val digitsOnly = trimmedPhone.filter { it.isDigit() || it == '+' }
                    if (!digitsOnly.startsWith("+") && digitsOnly.length < 10) {
                        onErrorChanged("Phone number must include country code (e.g., +1 for US/Canada)")
                        return@Button
                    }
                    
                    scope.launch {
                        onLoadingChanged(true)
                        onErrorChanged(null)
                        
                        // Send the user-entered phone number to backend (dynamic)
                        when (val result = repository.sendVerificationCode(trimmedPhone)) {
                            is NetworkResult.Success -> {
                                val data = result.data
                                if (data.success && data.verification_code != null && data.verification_url != null) {
                                    // Backend returns normalized phone number and URL with that phone number
                                    onCodeSent(
                                        VerificationInfo(
                                            phoneNumber = data.phone_number ?: trimmedPhone,
                                            code = data.verification_code,
                                            url = data.verification_url // URL contains the dynamic phone number
                                        )
                                    )
                                } else {
                                    onErrorChanged(data.error ?: "Failed to send verification code")
                                }
                            }
                            is NetworkResult.Error -> {
                                onErrorChanged(result.message ?: "Failed to send verification code")
                            }
                            is NetworkResult.Exception -> {
                                onErrorChanged(result.exception.message ?: "An unexpected error occurred")
                            }
                        }
                        onLoadingChanged(false)
                    }
                },
                enabled = phoneNumber.isNotBlank() && !isLoading
            ) {
                if (isLoading) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(18.dp),
                        strokeWidth = 2.dp
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Sending...")
                } else {
                    Icon(Icons.Default.Send, contentDescription = null, modifier = Modifier.size(18.dp))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Send Code")
                }
            }
        },
        dismissButton = {
            TextButton(
                onClick = onDismiss,
                enabled = !isLoading
            ) {
                Text("Cancel")
            }
        }
    )
}

/**
 * Verification Info Data Class
 */
private data class VerificationInfo(
    val phoneNumber: String,
    val code: String,
    val url: String
)

